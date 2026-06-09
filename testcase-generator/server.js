const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3007;

const BASE_DIR = path.resolve(__dirname);
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads');
const REPORTS_DIR = path.join(BASE_DIR, 'reports');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(BASE_DIR, 'frontend')));

const upload = multer({ dest: UPLOADS_DIR });

const OLLAMA_API = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const OLLAMA_MODEL = 'ep-20260423193522-j2jzx';
const API_KEY = 'cf333074-4754-4774-9505-b0dd8244661a';

const SYSTEM_PROMPT = `你是一名资深测试工程师，擅长从需求文档和UI图中提炼测试用例。

**任务**：根据用户提供的需求文档和UI截图，生成结构化的测试用例。

**输出格式要求**：
1. 生成JSON数组格式的测试用例
2. 每个测试用例包含以下字段：
   - id: 用例编号（如 TC001）
   - module: 功能模块
   - title: 用例标题
   - preconditions: 前置条件
   - steps: 测试步骤
   - expected: 预期结果
   - priority: 优先级（P0/P1/P2/P3）
   - notes: 备注

3. 按以下分类生成测试用例：
   - 正向用例：正常流程
   - 反向用例：异常/边界情况
   - 边界值用例：边界条件测试
   - UI测试用例：界面交互

4. 只输出JSON数组，不要其他文字说明`;

// LLM调用函数
async function callLLM(prompt, retries = 3, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`正在请求火山引擎API (第${attempt}次尝试)...`);

            const response = await fetch(OLLAMA_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    input: prompt
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误响应:', errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            let content = '';

            if (data.output && Array.isArray(data.output)) {
                const message = data.output.find(o => o.type === 'message');
                if (message && message.content && Array.isArray(message.content)) {
                    const textContent = message.content.find(c => c.type === 'output_text');
                    if (textContent && textContent.text) {
                        content = textContent.text;
                    }
                }
            }

            if (!content) {
                console.log('响应结构不完整');
                return '';
            }

            return content;
        } catch (error) {
            console.error(`API调用失败 (第${attempt}次):`, error.message);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`API调用失败，已重试${retries}次`);
}

// 解析docx文件
async function parseDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath }, {
            encoding: 'utf-8'
        });
        return result.value;
    } catch (error) {
        console.error('解析docx失败:', error);
        throw error;
    }
}

// 生成测试用例
async function generateTestCases(docContent, imageCount) {
    const prompt = `## 需求文档内容

${docContent}

## UI图片数量: ${imageCount}张

请根据以上需求文档和UI截图信息，生成完整的测试用例。
要求：
1. 覆盖所有功能点
2. 包含正向、反向、边界值用例
3. 测试步骤要详细
4. 输出完整的JSON数组`;

    console.log('正在调用大模型生成测试用例...');
    const response = await callLLM(prompt);
    return response;
}

// 生成xlsx文件
function generateXlsx(testCases, fileName) {
    const wsData = [
        ['用例编号', '功能模块', '用例标题', '前置条件', '测试步骤', '预期结果', '优先级', '备注']
    ];

    testCases.forEach(tc => {
        wsData.push([
            tc.id || '',
            tc.module || '',
            tc.title || '',
            tc.preconditions || '',
            tc.steps || '',
            tc.expected || '',
            tc.priority || 'P1',
            tc.notes || ''
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '测试用例');

    const colWidths = [
        { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 25 },
        { wch: 40 }, { wch: 30 }, { wch: 10 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    const outputPath = path.join(REPORTS_DIR, fileName);
    XLSX.writeFile(wb, outputPath);
    return outputPath;
}

// API路由
app.post('/api/generate-testcases', upload.array('images', 10), async (req, res) => {
    try {
        const { docx } = req.files || {};
        let docContent = req.body.content || '';

        if (docx && docx.length > 0) {
            docContent = await parseDocx(docx[0].path);
            fs.unlinkSync(docx[0].path);
        }

        if (!docContent) {
            return res.status(400).json({ error: '请提供需求文档内容' });
        }

        const imageCount = req.files ? req.files.filter(f => !f.originalname.endsWith('.docx')).length : 0;
        console.log(`文档内容长度: ${docContent.length}, 图片数量: ${imageCount}`);

        const llmResponse = await generateTestCases(docContent, imageCount);
        console.log('LLM返回内容长度:', llmResponse.length);

        let jsonStr = llmResponse.trim();
        jsonStr = jsonStr.replace(/```json\s*/gi, '');
        jsonStr = jsonStr.replace(/```\s*/gi, '');

        const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        let testCases = JSON.parse(jsonStr);
        if (!Array.isArray(testCases)) {
            testCases = [testCases];
        }

        const timestamp = Date.now();
        const fileName = `测试用例_${timestamp}.xlsx`;
        const filePath = generateXlsx(testCases, fileName);

        res.json({
            success: true,
            filePath: `/reports/${fileName}`,
            fileName: fileName,
            testCaseCount: testCases.length
        });

    } catch (error) {
        console.error('生成测试用例失败:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use('/reports', express.static(REPORTS_DIR));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`测试用例生成服务已启动: http://localhost:${PORT}`);
    console.log(`局域网访问: http://0.0.0.0:${PORT}`);
});