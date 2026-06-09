# AI测试用例生成器

基于UI测试用例生成规范的前端应用，支持上传需求文档（docx/doc格式），AI智能生成测试用例。

## 功能特性

- 📄 支持上传docx和doc格式的需求文档
- 🤖 AI智能分析文档内容生成测试用例
- 📝 支持多种测试类型：功能测试、UI测试、兼容性测试、边界测试、异常测试、交互测试
- 📊 统计和筛选功能
- 📥 支持下载CSV和JSON格式
- 📋 一键复制到剪贴板

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
cd test_generation_ui
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

```bash
cd test_generation_ui/backend

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
# .\venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务器
python server.py
```

## 访问应用

打开浏览器访问: http://localhost:5000

## 使用说明

1. **上传文档**：点击"选择文件"按钮，上传需求文档（支持docx和doc格式）
2. **配置选项**：选择要生成的测试用例类型和优先级
3. **生成用例**：点击"AI生成测试用例"按钮
4. **查看结果**：查看生成的测试用例，可进行筛选和搜索
5. **下载用例**：支持下载CSV或JSON格式，也可以直接复制到剪贴板

## 测试用例类型

- **功能测试**：验证功能模块的正常流程
- **UI测试**：检查界面布局、样式、视觉一致性
- **兼容性测试**：测试在不同系统和设备上的表现
- **边界测试**：测试输入边界、极端情况
- **异常测试**：测试错误处理、网络异常等
- **交互测试**：测试用户交互、动画效果等

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Python Flask
- **文档解析**：python-docx
- **API**：RESTful API

## 项目结构

```
test_generation_ui/
├── frontend/           # 前端文件
│   ├── index.html      # 主页面
│   ├── styles.css     # 样式文件
│   └── app.js         # 前端逻辑
├── backend/           # 后端文件
│   ├── server.py     # Flask服务器
│   ├── docx_parser.py # 文档解析器
│   └── requirements.txt # Python依赖
├── start.sh          # 启动脚本
└── README.md         # 说明文档
```

## 注意事项

- 确保Python版本 >= 3.7
- 首次运行需要安装依赖
- 服务器默认运行在5000端口
- 前端纯前端模式也可以独立运行（会使用模拟数据）

## License

MIT License
