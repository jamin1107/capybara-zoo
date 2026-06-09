# 飞书测试管理系统 - 前端启动脚本

echo "======================================"
echo "  飞书测试管理系统 - 前端"
echo "======================================"

# 检查Node.js
echo "[1/4] 检查Node.js环境..."
node --version || { echo "错误: 需要Node.js"; exit 1; }

# 安装依赖
echo "[2/4] 安装前端依赖..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# 启动开发服务器
echo "[3/4] 启动前端服务..."
echo "======================================"
echo "前端已启动！"
echo "访问地址: http://localhost:3000"
echo "======================================"
echo ""

npm run dev