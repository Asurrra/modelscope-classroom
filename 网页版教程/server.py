#!/usr/bin/env python3
"""ModelScope Learning Plan - Local Python Service"""
import sys
import os
import json
import subprocess
import tempfile
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# 项目根目录（网页版教程的上级目录）
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 配置静态文件目录，让 http://localhost:5678/index.html 直接访问教程
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # 允许跨域（file:// 协议需要）


# ---------------------------------------------------------------------------
# 测验数据加载
# ---------------------------------------------------------------------------
quiz_data = {}


def load_quiz_data():
    """启动时从 js/quiz-data.js 加载测验数据到内存。"""
    quiz_file = os.path.join(os.path.dirname(__file__), 'js', 'quiz-data.js')
    if os.path.exists(quiz_file):
        try:
            with open(quiz_file, 'r', encoding='utf-8') as f:
                content = f.read()
            # 定位 window.QUIZ_DATA = { 的起始位置
            marker = 'window.QUIZ_DATA = '
            start = content.find(marker)
            if start == -1:
                print("加载测验数据失败：未找到 window.QUIZ_DATA")
                return
            json_start = start + len(marker)
            # 找到这个对象的结束位置（匹配大括号）
            depth = 0
            json_end = json_start
            for i in range(json_start, len(content)):
                if content[i] == '{':
                    depth += 1
                elif content[i] == '}':
                    depth -= 1
                    if depth == 0:
                        json_end = i + 1
                        break
            json_str = content[json_start:json_end]
            quiz_data.update(json.loads(json_str))
            print(f"已加载测验数据：{len(quiz_data)} 个章节")
        except Exception as e:
            print(f"加载测验数据失败：{e}")


# ---------------------------------------------------------------------------
# 安全黑名单
# ---------------------------------------------------------------------------
BLACKLIST = [
    'os.system', 'os.popen', 'os.exec',
    'subprocess', 'shutil.rmtree',
    '__import__', 'eval(', 'exec(',
    'open(', 'file(',  # 限制文件操作
    'socket',
    'ctypes',
]


def is_safe(code):
    """检查代码是否包含黑名单中的不安全操作。"""
    code_lower = code.lower()
    for pattern in BLACKLIST:
        if pattern.lower() in code_lower:
            return False
    return True


# ---------------------------------------------------------------------------
# 路由
# ---------------------------------------------------------------------------
@app.route('/')
def index():
    """根路径返回教程主页。"""
    return app.send_static_file('index.html')


@app.route('/repo/<path:filepath>')
def serve_repo_file(filepath):
    """代理项目根目录下的资源文件（图片等），供 HTTP 模式下加载。"""
    full_path = os.path.join(PROJECT_ROOT, filepath)
    if os.path.isfile(full_path):
        directory = os.path.dirname(full_path)
        filename = os.path.basename(full_path)
        return send_from_directory(directory, filename)
    return '', 404


@app.route('/api/health')
def health():
    """健康检查端点。"""
    return jsonify({"status": "ok", "version": "1.0"})


@app.route('/api/run', methods=['POST'])
def run_code():
    """执行 Python 代码并返回结果。"""
    data = request.get_json() or {}
    code = data.get('code', '')
    timeout = min(data.get('timeout', 10), 30)  # 最大30秒

    # 安全检查
    if not is_safe(code):
        return jsonify({
            "stdout": "",
            "stderr": "代码包含不安全的操作，已被拒绝执行",
            "exit_code": -1,
        })

    # 执行代码
    try:
        result = subprocess.run(
            [sys.executable, '-c', code],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=tempfile.gettempdir(),
        )
        return jsonify({
            "stdout": result.stdout[:10240],  # 限制10KB
            "stderr": result.stderr[:10240],
            "exit_code": result.returncode,
        })
    except subprocess.TimeoutExpired:
        return jsonify({
            "stdout": "",
            "stderr": f"执行超时（{timeout}秒）",
            "exit_code": -1,
        })
    except Exception as e:
        return jsonify({"stdout": "", "stderr": str(e), "exit_code": -1})


@app.route('/api/quiz/<chapter_id>')
def get_quiz(chapter_id):
    """根据章节 ID 返回对应的测验题数据。"""
    quiz = quiz_data.get(chapter_id)
    if quiz:
        return jsonify(quiz)
    return jsonify({"questions": []}), 404


# ---------------------------------------------------------------------------
# 启动入口
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    load_quiz_data()
    print("ModelScope 学习服务启动在 http://localhost:5678")
    print("按 Ctrl+C 停止")
    app.run(host='127.0.0.1', port=5678, debug=False)
