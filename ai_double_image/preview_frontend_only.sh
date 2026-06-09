#!/bin/bash

echo "===================================="
echo "  AI双图融合 - 纯前端预览模式"
echo "===================================="
echo ""
echo "此模式不需要安装任何后端依赖"
echo "使用模拟融合功能，可以完整测试UI交互"
echo ""

cd "$(dirname "$0")"

echo "正在启动前端预览服务器..."
echo ""
echo "服务器将在 http://localhost:8080 启动"
echo "按 Ctrl+C 停止服务器"
echo ""
echo "注意：此模式使用模拟融合（无需后端）"
echo ""

python3 -m http.server 8080
