#!/bin/bash

# 飞书测试管理系统 - 一键部署脚本

echo "======================================"
echo "  飞书测试管理系统 部署脚本"
echo "======================================"

# 检查Python版本
echo "[1/5] 检查Python环境..."
python3 --version || { echo "错误: 需要Python3"; exit 1; }

# 创建虚拟环境
echo "[2/5] 创建虚拟环境..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 安装依赖
echo "[3/5] 安装Python依赖..."
pip install --upgrade pip -q
pip install flask flask-cors python-dotenv requests -q

# 检查.env配置
echo "[4/5] 检查配置文件..."
if [ ! -f ".env" ]; then
    echo "错误: .env配置文件不存在"
    echo "请先复制.env.example为.env并配置"
    exit 1
fi

# 启动服务
echo "[5/5] 启动后端服务..."
echo "======================================"
echo "后端服务已启动！"
echo "访问地址: http://localhost:5000"
echo "API文档: http://localhost:5000/api"
echo "======================================"
echo "按 Ctrl+C 停止服务"
echo ""

python app.py