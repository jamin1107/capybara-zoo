import os
import json
import uuid
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import docx_parser

app = Flask(__name__, static_folder='../frontend')
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'docx', 'doc', 'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def load_ai_config():
    config_path = 'config.json'
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/api/generate', methods=['POST'])
def generate_test_cases():
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有上传文件'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '没有选择文件'
            }), 400

        if file and allowed_file(file.filename):
            original_filename = file.filename
            filename = secure_filename(original_filename)
            if not filename:
                filename = 'unnamed_file'
            if '.' not in filename:
                ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else ''
                filename = f"file.{ext}" if ext else "unnamed_file.docx"
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(filepath)

            try:
                file_ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else ''
                if not file_ext:
                    return jsonify({
                        'success': False,
                        'error': '无法确定文件格式'
                    }), 400
                if file_ext == 'pdf':
                    content = docx_parser.extract_text_from_pdf(filepath)
                elif file_ext in ('docx', 'doc'):
                    content = docx_parser.extract_text_from_docx(filepath)
                else:
                    return jsonify({
                        'success': False,
                        'error': f'不支持的文件格式: .{file_ext}'
                    }), 400
                print(f"提取的文档内容长度: {len(content)} 字符")

                ai_config = load_ai_config()

                if ai_config and ai_config.get('api_key') and ai_config.get('api_key') != 'YOUR_API_KEY_HERE':
                    test_cases = generate_with_ai(content, ai_config)
                else:
                    test_cases = generate_test_cases_advanced(content)

                os.remove(filepath)

                return jsonify({
                    'success': True,
                    'test_cases': test_cases,
                    'document_content': content[:500]
                })

            except Exception as e:
                print(f"文档处理错误: {str(e)}")
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({
                    'success': False,
                    'error': f'文档处理失败: {str(e)}'
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': '不支持的文件格式'
            }), 400

    except Exception as e:
        print(f"生成测试用例错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_with_ai(content, ai_config):
    prompt = '''基于需求文档、PRD 或接口文档自动生成结构化测试用例文档。默认采用通用测试用例设计策略（正向、反向、边界值、等价类等）；当用户提到参考 Excel/Word 模板时从 assets 加载模板，提到接口/性能/功能等专用标准时从 references 加载对应说明。适用于从各类文档设计功能、接口、性能及自动化候选用例。
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

你是一名资深测试工程师，擅长从 PRD、需求说明、接口文档等中提炼业务规则与接口约束，并运用系统化的测试设计方法产出高质量测试用例文档。

**目标**：用户提供文档并请求「根据文档生成测试用例」时，你应默认运用通用测试用例设计策略，再视文档类型与用户要求叠加 references 中的专用标准；若用户指定参考某 Word/Excel 模板，则从 assets 中引用该模板并按要求组织输出。

***

## 一、何时触发本 Skill

当用户出现类似表述时优先使用本 Skill：

- 「请根据下面这份 PRD 生成测试用例」
- 「根据这份接口文档，帮我设计接口测试用例」
- 「从这段需求说明里整理出测试用例」
- 「按你熟悉的写法写一份测试用例」

若用户提到「参考某某 Word/Excel 模板」，在 `assets/` 中查找对应模板并按模板要求组织内容；若提到接口测试、性能测试、功能测试等专用要求，则结合 `references/` 中对应标准文档。

***

## 二、输入处理与文档理解

1. **获取原始文档**\
   用户提供的需求文档可能是以下任意格式：
   - **docx格式**（Microsoft Word 2007+）：使用zipfile和xml.etree解析document.xml提取文本内容
   - **doc格式**（Microsoft Word 97-2003）：调用antiword工具转换为纯文本，或使用python-docx库尝试读取
   - **PDF格式**：使用pdfminer或PyPDF2提取文本内容
   - **纯文本/TXT格式**：直接读取文件内容
   - **Markdown格式**：直接读取文件内容
   解析优先级：
   1. 先根据文件扩展名判断格式类型
   2. docx格式优先使用zipfile+xml解析（无需额外依赖）
   3. doc格式尝试使用antiword（命令行工具）或python-docx库
   4. PDF格式使用pdfminer.six或PyPDF2
   5. 若均无法解析，提示用户提供纯文本内容或截图文字
   你需要先将文档转换为纯文本格式，再进行后续的文档理解与分析。
2. **识别文档类型与结构**\
   判断文档主体是：业务/功能需求、接口说明、性能/SLA 指标，或混合型。从中提取：功能模块、关键流程与场景、接口列表（路径、方法、参数、返回、错误码）、约束与边界、性能与安全要求等。
3. **记录关键约束**\
   对必填/可选、取值范围/长度/格式、状态流转、权限与角色、错误码、性能指标等建立清晰清单，供后续设计用例使用。

***

## 三、默认测试用例设计策略（必须默认运用）

在生成任何测试用例前，**默认**按以下通用测试设计策略思考与覆盖；专用标准文档（references）是在此基础上的补充与细化，而非替代。

### 3.1 正向测试用例（正常流程）

- **含义**：在合法、合理的前置条件下，按文档规定的正常路径执行，验证系统行为符合需求/接口约定。
- **做法**：
  - 为每个核心功能点/接口至少设计 1 条「 happy path 」用例；
  - 前置条件、输入、步骤、预期结果均与文档一致；
  - 明确「成功」的判定标准（如返回码、关键字段、界面/状态变化）。

### 3.2 反向 / 异常测试用例（负向用例）

- **含义**：使用非法输入、错误操作、异常状态或违反约束的条件，验证系统能正确拒绝、提示或返回约定错误，且不产生副作用。
- **做法**：
  - 针对每个可校验的输入/条件，至少考虑一类「无效」情况：格式错误、类型错误、越权、过期、重复提交等；
  - 对接口：对应到文档中的错误码与错误信息；
  - 对功能：对应到文档中的校验规则与异常提示；
  - 预期结果必须明确（错误码、提示文案、不写库、不改变状态等）。

### 3.3 边界值用例设计

- **含义**：在输入或条件的边界附近设计用例（最小值、最大值、刚好超界、空值、长度临界等），暴露 off-by-one、截断、溢出等问题。
- **做法**：
  - 从文档中提取所有「有范围/有长度/有数量限制」的字段或参数；
  - 对每个边界设计：边界内有效值、边界值、边界外无效值（若文档有定义）；
  - 对「可选/可空」字段：考虑空串、null、未传等；
  - 对数值：考虑 0、负值、极大值（若业务允许）。

### 3.4 等价类划分（在适用时使用）

- **含义**：将输入域划分为若干等价类，从每类中选取代表值设计用例，在保证覆盖的前提下减少冗余。
- **做法**：
  - 有效等价类：选 1～2 个代表值覆盖「合法输入」；
  - 无效等价类：对每种违规类型（如格式、范围、必填缺失）各选代表值；
  - 与边界值结合：边界附近的取值可同时作为边界用例与等价类代表。

### 3.5 状态与流程相关策略（当文档涉及状态机、多步骤流程时）

- **含义**：针对状态流转、角色切换、多步骤业务流程设计用例，避免遗漏中间状态或非法跳转。
- **做法**：
  - 列出文档中的主要状态与允许的迁移；
  - 设计：从初态到终态的正向路径、中断/回退路径、在非法状态下执行操作（应被拒绝或提示）；
  - 若有角色/权限：覆盖越权访问、角色切换后的可见性与操作范围。

### 3.6 场景法 / 用户场景（对功能类文档）

- **含义**：以真实用户场景或业务故事为线索，串联多个功能点，形成端到端或跨模块用例。
- **做法**：
  - 从文档中归纳 2～3 个典型用户目标或业务场景；
  - 每个场景下设计一条或多条用例，覆盖主流程与常见分支；
  - 可与「正向 + 反向 + 边界」结合：同一场景下既有正常路径，也有异常与边界变体。

***

## 四、参考资源与输出格式的约定

- **references/**\
  存放各测试类型的**输出要求与设计标准**（无模板格式）：
  - 接口测试：`references/api-testcases-standard.md`
  - 性能测试：`references/performance-testcases-standard.md`
  - 功能测试：`references/functional-testcases-standard.md`
  - 自动化候选用例：`references/automation-testcases-standard.md`
  根据文档内容与用户表述，**在默认策略基础上**加载对应标准，按其中对「覆盖维度、字段要求、表述方式」的说明组织用例内容。
- **assets/**\
  存放用户提供的 **Word/Excel 模板文件**。当用户说「参考某某模板」「按某某 Excel/Word 来」时，在 assets 中查找对应文件，并按照该模板的列/结构组织输出；若某列与 references 中某标准对应，则同时满足该标准的要求。
- **格式与列名**\
  SKILL 本身规定具体表格列名表格样式：
  - 默认运用第三节的通用测试用例设计策略；
  - 具体列名、顺序与排版严格按照：用例标ID、标题、前置条件、测试步骤、预期结果、优先级 、备注、结果；

***

## 五、工作流小结

1. **理解输入**：解析文档类型与内容，提取模块、接口、约束、性能与安全要点。
2. **默认策略**：按第三节对正向、反向、边界值、等价类、状态/场景等策略系统化生成用例思路。
3. **叠加专用标准**：按文档与用户需求，加载 references 中接口/性能/功能/自动化标准并遵循其输出要求。
4. **模板适配**：若用户指定参考某 Word/Excel 模板，从 assets 引用该模板并据此组织列与格式。
5. **输出与自检**：输出结构化测试用例文档，并自检是否覆盖主要需求点、关键异常与边界，以及类型与优先级是否标注清楚。

***

始终以「默认运用通用测试设计策略 + 按需引用专用标准与模板」为原则，保证覆盖清晰、可执行、易维护。


''' + f"""
## 需求文档内容

{content[:10000]}

请生成CSV格式的测试用例，CSV格式要求：
- 表头：用例ID,标题,前置条件,测试步骤,预期结果,优先级,备注,结果
- 每行一条用例，用逗号分隔
- 测试步骤和预期结果中的换行用<br>标记
- 只返回CSV内容，不要其他内容

【重要】必须根据上述需求文档的具体内容生成用例：
1. 标题要包含具体功能名称和参数，步骤要包含具体操作
2. 必须充分覆盖需求中的每个功能点、每个触发条件、每个边界情况
3. 每个校验规则、每个错误提示、每个状态流转都要有独立用例
4. 正向、反向、边界、异常等每种类型都要有足够的用例
5. 不要省略任何测试点，要尽可能完整全面地生成测试用例
6. expected（预期结果）字段不能为空，必须填写每一步对应的具体预期结果"""

    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {ai_config['api_key']}"
        }

        payload = {
            'model': ai_config.get('model'),
            'input': prompt
        }

        api_endpoint = ai_config.get('api_endpoint', '/responses')
        api_base = ai_config.get('api_base', 'https://ark.cn-beijing.volces.com/api/v3')

        print(f"正在调用豆包AI API: {api_base}{api_endpoint}")

        response = requests.post(
            f"{api_base}{api_endpoint}",
            headers=headers,
            json=payload,
            timeout=120
        )

        print(f"API响应状态码: {response.status_code}")
        print(f"API响应内容前500字符: {response.text[:500]}")

        if response.status_code == 200:
            result = response.json()
            print(f"API响应成功")

            ai_content = extract_ai_response(result)

            test_cases = parse_csv_response(ai_content)
            if test_cases:
                print(f"成功解析CSV，共 {len(test_cases)} 条用例")
                return normalize_test_cases(test_cases)
            else:
                print(f"CSV解析失败，原始内容: {ai_content[:500]}")
                return generate_test_cases_advanced(content)
        else:
            print(f"AI API错误: {response.status_code} - {response.text}")
            return generate_test_cases_advanced(content)

    except Exception as e:
        print(f"AI调用错误: {str(e)}")
        return generate_test_cases_advanced(content)

def normalize_test_cases(test_cases):
    """将AI返回的中文字段名映射为英文字段名"""
    field_mapping = {
        'ID': 'id',
        '用例ID': 'id',
        '标题': 'scenario',
        '测试场景': 'scenario',
        '前置条件': 'preconditions',
        '测试步骤': 'steps',
        '步骤': 'steps',
        '预期结果': 'expected',
        '结果': 'expected',
        '优先级': 'priority',
        '优先级别': 'priority',
        '备注': 'notes',
        '说明': 'notes',
        '测试类型': 'notes'
    }

    normalized = []
    for tc in test_cases:
        new_tc = {}
        for key, value in tc.items():
            normalized_key = field_mapping.get(key, key)
            new_tc[normalized_key] = value
        if 'result' not in new_tc:
            new_tc['result'] = '待测试'
        normalized.append(new_tc)
    return normalized

def parse_csv_response(csv_text):
    """解析CSV格式的AI响应，转换为JSON数组"""
    try:
        lines = csv_text.strip().split('\n')
        if len(lines) < 2:
            return []

        header = [h.strip() for h in lines[0].split(',')]
        test_cases = []

        for line in lines[1:]:
            if not line.strip():
                continue
            values = []
            current = ''
            in_quotes = False
            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                elif char == ',' and not in_quotes:
                    values.append(current.strip())
                    current = ''
                else:
                    current += char
            values.append(current.strip())

            if len(values) >= len(header):
                tc = {}
                for i, h in enumerate(header):
                    if i < len(values):
                        tc[h] = values[i]
                if tc:
                    tc['id'] = tc.get('用例ID', tc.get('ID', tc.get('id', '')))
                    tc['scenario'] = tc.get('标题', tc.get('测试场景', tc.get('scenario', '')))
                    tc['preconditions'] = tc.get('前置条件', tc.get('preconditions', ''))
                    tc['steps'] = tc.get('测试步骤', tc.get('步骤', tc.get('steps', '')))
                    tc['expected'] = tc.get('预期结果', tc.get('结果', tc.get('expected', '')))
                    tc['priority'] = tc.get('优先级', tc.get('优先级别', tc.get('priority', '')))
                    tc['notes'] = tc.get('备注', tc.get('说明', tc.get('测试类型', tc.get('notes', ''))))
                    tc['result'] = tc.get('结果', tc.get('result', '待测试'))
                    if not tc.get('result'):
                        tc['result'] = '待测试'
                    test_cases.append(tc)

        return test_cases
    except Exception as e:
        print(f"解析CSV失败: {str(e)}")
        return []

def extract_ai_response(result):
    """从豆包API响应中提取文本内容"""
    try:
        if not isinstance(result, dict):
            return str(result)

        output = result.get('output', [])

        if not isinstance(output, list) or len(output) == 0:
            return str(result)

        for item in output:
            if not isinstance(item, dict):
                continue
            if item.get('type') == 'message':
                content_list = item.get('content', [])
                if not isinstance(content_list, list):
                    continue
                for content_item in content_list:
                    if not isinstance(content_item, dict):
                        continue
                    if content_item.get('type') == 'output_text':
                        return content_item.get('text', '')

        return str(result)
    except Exception as e:
        print(f"提取响应内容失败: {str(e)}")
        return str(result)

def generate_test_cases_advanced(content):
    keywords = {
        '功能': ['功能', '模块', '页面', '按钮', '输入', '点击', '提交', '保存', '删除', '编辑', '查询', '搜索', '登录', '注册', '上传', '下载', '支付'],
        'UI': ['界面', '布局', '显示', '样式', '颜色', '字体', '大小', '位置', '对齐', '间距', '图标', '图片', '视频'],
        '兼容性': ['安卓', 'iOS', '手机', '平板', '屏幕', '分辨率', '浏览器', '系统', '微信', 'Safari', 'Chrome'],
        '边界': ['最大', '最小', '边界', '临界', '极端', '为空', '超长', '特殊字符', '空格', 'HTML', '脚本'],
        '异常': ['错误', '异常', '失败', '网络', '超时', '中断', '断开', '异常情况', '闪退', '卡顿'],
        '交互': ['交互', '动画', '切换', '弹窗', '提示', '反馈', 'hover', '点击', '滑动', '下拉', '刷新']
    }

    test_cases = []
    test_id = 1

    if any(kw in content for kw in keywords['功能']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '主要功能流程测试',
                'preconditions': '用户已登录，环境正常',
                'steps': '1. 进入功能模块\n2. 执行核心操作\n3. 验证结果',
                'expected': '1. 功能正常执行\n2. 结果符合预期\n3. 数据正确处理',
                'priority': '高',
                'notes': '功能测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': '次要功能流程测试',
                'preconditions': '用户已登录',
                'steps': '1. 进入相关功能\n2. 执行辅助操作\n3. 验证结果',
                'expected': '1. 功能正常执行\n2. 操作流畅\n3. 结果准确',
                'priority': '中',
                'notes': '功能测试'
            }
        ])
        test_id += 2

    if any(kw in content for kw in keywords['UI']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '页面UI布局检查',
                'preconditions': '在目标页面',
                'steps': '1. 检查页面整体布局\n2. 检查元素位置\n3. 检查间距和对齐',
                'expected': '1. 布局符合设计要求\n2. 元素位置正确\n3. 间距均匀对齐整齐',
                'priority': '中',
                'notes': 'UI测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': '视觉样式一致性检查',
                'preconditions': '在目标页面',
                'steps': '1. 检查主色调使用\n2. 检查辅助色使用\n3. 检查字体样式',
                'expected': '1. 主色调统一\n2. 辅助色使用合理\n3. 字体样式统一',
                'priority': '中',
                'notes': 'UI测试'
            },
            {
                'id': f'TC-{test_id+2:03d}',
                'scenario': '响应式布局测试',
                'preconditions': '在不同屏幕尺寸',
                'steps': '1. 在不同分辨率测试\n2. 检查元素自适应\n3. 验证布局合理性',
                'expected': '1. 布局自适应正常\n2. 无元素重叠或错位\n3. 整体效果良好',
                'priority': '中',
                'notes': 'UI测试'
            }
        ])
        test_id += 3

    if any(kw in content for kw in keywords['兼容性']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '安卓系统兼容性测试',
                'preconditions': '使用安卓设备',
                'steps': '1. 在安卓系统测试功能\n2. 检查UI显示\n3. 验证交互效果',
                'expected': '1. 功能正常工作\n2. UI显示符合设计\n3. 交互流畅无异常',
                'priority': '高',
                'notes': '兼容性测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': 'iOS系统兼容性测试',
                'preconditions': '使用iOS设备',
                'steps': '1. 在iOS系统测试功能\n2. 检查UI显示\n3. 验证交互效果',
                'expected': '1. 功能正常工作\n2. UI显示符合设计\n3. 交互流畅无异常',
                'priority': '高',
                'notes': '兼容性测试'
            },
            {
                'id': f'TC-{test_id+2:03d}',
                'scenario': '小屏幕设备适配测试',
                'preconditions': '使用小屏幕手机',
                'steps': '1. 在小屏幕设备测试\n2. 检查元素显示\n3. 验证交互区域',
                'expected': '1. 页面正常显示\n2. 无内容截断\n3. 交互区域可操作',
                'priority': '中',
                'notes': '兼容性测试'
            },
            {
                'id': f'TC-{test_id+3:03d}',
                'scenario': '大屏幕设备适配测试',
                'preconditions': '使用大屏幕设备',
                'steps': '1. 在大屏幕设备测试\n2. 检查布局展示\n3. 检查元素间距',
                'expected': '1. 页面正常显示\n2. 布局合理\n3. 间距适当',
                'priority': '中',
                'notes': '兼容性测试'
            }
        ])
        test_id += 4

    if any(kw in content for kw in keywords['边界']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '最大输入长度边界测试',
                'preconditions': '在输入页面',
                'steps': '1. 输入达到最大长度\n2. 尝试继续输入\n3. 检查限制效果',
                'expected': '1. 最大长度输入成功\n2. 超出部分被截断\n3. 有长度提示',
                'priority': '中',
                'notes': '边界测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': '空输入边界测试',
                'preconditions': '在输入页面',
                'steps': '1. 不输入任何内容\n2. 点击提交按钮\n3. 观察错误提示',
                'expected': '1. 有必填提示\n2. 提示信息友好\n3. 可正常重新输入',
                'priority': '中',
                'notes': '边界测试'
            },
            {
                'id': f'TC-{test_id+2:03d}',
                'scenario': '特殊字符输入测试',
                'preconditions': '在输入页面',
                'steps': '1. 输入特殊字符\n2. 检查输入显示\n3. 验证保存结果',
                'expected': '1. 特殊字符正常输入\n2. 显示无乱码\n3. 保存结果正确',
                'priority': '中',
                'notes': '边界测试'
            }
        ])
        test_id += 3

    if any(kw in content for kw in keywords['异常']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '网络异常处理测试',
                'preconditions': '断开网络连接',
                'steps': '1. 尝试执行操作\n2. 观察错误提示\n3. 恢复网络重试',
                'expected': '1. 有网络异常提示\n2. 提示信息友好\n3. 恢复后可重试',
                'priority': '高',
                'notes': '异常测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': '操作失败异常测试',
                'preconditions': '模拟操作失败场景',
                'steps': '1. 执行操作\n2. 模拟失败情况\n3. 观察错误处理',
                'expected': '1. 有错误提示\n2. 提示信息清晰\n3. 可正常重试或返回',
                'priority': '高',
                'notes': '异常测试'
            },
            {
                'id': f'TC-{test_id+2:03d}',
                'scenario': '超时处理测试',
                'preconditions': '网络缓慢或服务器响应慢',
                'steps': '1. 执行需要长时间的操作\n2. 观察超时处理\n3. 检查超时提示',
                'expected': '1. 有超时检测\n2. 提示信息友好\n3. 可正常重试',
                'priority': '中',
                'notes': '异常测试'
            }
        ])
        test_id += 3

    if any(kw in content for kw in keywords['交互']):
        test_cases.extend([
            {
                'id': f'TC-{test_id:03d}',
                'scenario': '按钮点击交互测试',
                'preconditions': '在目标页面',
                'steps': '1. 点击按钮\n2. 观察交互反馈\n3. 检查功能响应',
                'expected': '1. 有视觉反馈\n2. 交互响应及时\n3. 功能正常执行',
                'priority': '高',
                'notes': '交互测试'
            },
            {
                'id': f'TC-{test_id+1:03d}',
                'scenario': '页面切换动画测试',
                'preconditions': '在目标页面',
                'steps': '1. 执行页面切换\n2. 观察动画效果\n3. 检查流畅度',
                'expected': '1. 动画流畅\n2. 无卡顿\n3. 切换自然',
                'priority': '中',
                'notes': '交互测试'
            },
            {
                'id': f'TC-{test_id+2:03d}',
                'scenario': '弹窗交互测试',
                'preconditions': '在目标页面',
                'steps': '1. 触发弹窗出现\n2. 检查弹窗显示\n3. 测试关闭弹窗',
                'expected': '1. 弹窗正常弹出\n2. 内容显示完整\n3. 关闭功能正常',
                'priority': '中',
                'notes': '交互测试'
            }
        ])
        test_id += 3

    if not test_cases:
        test_cases = [
            {
                'id': 'TC-001',
                'scenario': '基础功能测试',
                'preconditions': '文档已上传',
                'steps': '1. 解析文档内容\n2. 识别功能需求\n3. 生成测试用例',
                'expected': '1. 文档解析成功\n2. 功能识别准确\n3. 用例生成完整',
                'priority': '高',
                'notes': '功能测试'
            }
        ]

    return test_cases

if __name__ == '__main__':
    ai_config = load_ai_config()
    model_name = ai_config.get('model', '未知') if ai_config else '未配置'
    print('🚀 启动AI测试用例生成器...')
    print('📄 请访问: http://localhost:5001')
    print(f'🤖 使用模型: {model_name}')
    app.run(host='0.0.0.0', port=5001, debug=False)
