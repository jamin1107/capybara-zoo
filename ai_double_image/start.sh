#!/bin/bash

echo "===================================="
echo "    AI双图融合应用启动"
echo "===================================="
echo ""

cd "$(dirname "$0")/backend"

echo "检查Python环境..."
python3 --version

echo ""
echo "正在安装依赖（如果需要）..."
pip3 install -q flask flask-cors pillow requests

echo ""
echo "正在启动服务器..."
echo ""
echo "服务器将在 http://localhost:3000 启动"
echo "按 Ctrl+C 停止服务器"
echo ""

python3 server.py
