#!/bin/bash

# ModelScope Classroom 网页教程启动脚本

# 检测 Python 命令（python3 优先）
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

# 如果没有找到 Python，提示用户
if [ -z "$PYTHON_CMD" ]; then
    echo "❗ 未检测到 Python 环境"
    echo "👉 你可以直接在浏览器中打开 index.html 使用基础功能"
    echo "   路径: $(cd "$(dirname "$0")" && pwd)/index.html"
    exit 0
fi

echo "✅ 检测到 Python: $($PYTHON_CMD --version)"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 检测 flask 是否已安装，未安装则自动安装依赖
if ! $PYTHON_CMD -c "import flask" &> /dev/null; then
    echo "📦 Flask 未安装，正在安装依赖..."
    $PYTHON_CMD -m pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请手动执行: $PYTHON_CMD -m pip install -r requirements.txt"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

# 启动服务
echo "🚀 启动服务..."
echo "📡 访问地址: http://localhost:5678"
$PYTHON_CMD server.py
