#!/bin/bash

echo "🚀 AI测试用例生成器启动脚本"
echo "================================"

cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

echo "📥 安装依赖..."
source venv/bin/activate
pip install -r requirements.txt -q

echo ""
echo "✅ 启动服务器..."
echo "🌐 请访问: http://localhost:5000"
echo "按 Ctrl+C 停止服务器"
echo ""

python server.py
