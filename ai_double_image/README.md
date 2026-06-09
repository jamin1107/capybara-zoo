# AI双图融合

一个美观的AI图片融合应用，支持本地图片上传和多种AI大模型API。

## 功能特性

- 📱 响应式移动端UI设计
- 🖼️ 支持本地图片文件上传
- 🎨 模拟融合效果（无需API）
- 🔌 支持OpenAI DALL-E API
- 🔌 支持Stability AI Stable Diffusion API
- ⚡ 实时进度显示
- 💾 融合结果保存

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置API密钥（可选）

**方式一：环境变量**
```bash
export OPENAI_API_KEY=your_openai_key_here
export STABILITY_API_KEY=your_stability_key_here
```

**方式二：通过前端配置**
在前端页面配置API密钥。

### 3. 启动服务器

```bash
cd backend
python server.py
```

### 4. 访问应用

打开浏览器访问：`http://localhost:3000`

## 使用说明

### 基本使用（模拟模式）

1. 点击第一张图片卡片，选择本地图片
2. 点击第二张图片卡片，选择本地图片
3. 点击"✨ 开始魔法融合"
4. 等待融合完成
5. 点击"保持到本地"保存结果

### 使用真实AI API

#### OpenAI DALL-E

1. 确保已配置OpenAI API密钥
2. 在融合时选择`openai`模式
3. 输入融合提示词（可选）

#### Stability AI Stable Diffusion

1. 确保已配置Stability AI API密钥
2. 在融合时选择`stability`模式
3. 输入融合提示词（可选）

## API接口

### POST /api/fuse

融合两张图片

**请求参数：**
- `image1`: 第一张图片文件
- `image2`: 第二张图片文件
- `prompt`: 融合提示词（可选）
- `api_type`: API类型（`simulate`/`openai`/`stability`）

**响应：**
```json
{
  "success": true,
  "resultImage": "data:image/png;base64,..."
}
```

### POST /api/config

配置API密钥

**请求参数：**
```json
{
  "openai_key": "sk-...",
  "stability_key": "sk-..."
}
```

## 项目结构

```
ai_double_image/
├── index.html          # 前端页面
├── styles.css          # 样式文件
├── app.js              # 前端逻辑
├── README.md           # 说明文档
└── backend/
    ├── server.py       # Flask后端服务器
    ├── requirements.txt # Python依赖
    ├── uploads/        # 上传图片目录
    └── results/        # 融合结果目录
```

## 注意事项

1. 模拟模式仅供演示，不会调用真实AI
2. 使用真实API需要相应的API密钥
3. 图片文件大小建议不超过10MB
4. 支持的图片格式：JPG、PNG、GIF等

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Python 3, Flask
- **AI API**: OpenAI DALL-E, Stability AI
- **图像处理**: Pillow
