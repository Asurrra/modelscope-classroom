# 🎓 ModelScope Classroom - 交互式学习网页应用

> 基于 ModelScope Classroom 教程内容打造的纯静态单页学习应用，支持离线阅读、在线运行 Python 代码、知识点测验和学习进度追踪。

---

## 📖 1. 项目简介

本项目将 ModelScope Classroom 的 **175 篇教程内容**（Markdown + Jupyter Notebook + Blogs）压缩为 **4 周精华学习路径**（78 篇必修 + 97 篇可选），并以交互式网页形式呈现。

**核心目标**：让大模型学习者在浏览器中即可完成「阅读 → 实践 → 测验 → 复盘」的闭环学习。

**核心特性**：
- 🔌 零外部 CDN 依赖，**完全离线可用**
- 🐍 Python 代码**在线运行**（可选 Flask 服务）
- 📝 78 章节 × **289 道知识点测验**
- 📊 自动学习**进度追踪**（localStorage 持久化）
- 🌗 暗色 / 亮色**主题切换**
- 🎯 **知识点导航**（面试 / 工作重点导向）

---

## ✨ 2. 功能特性

### 🟢 基础功能（无需 Python 服务，浏览器直接打开即可使用）

- 📚 全部 **175 篇教程**在线阅读（MD + Notebook + Blogs）
- 🗓️ **4 周精华学习路径**规划（78 必修 + 97 可选）
- 🎯 **知识点导航**：聚焦面试 / 工作重点
- 📈 **自动进度追踪**
  - 点击文章 → 状态变为「学习中」
  - 滚到底部停留 3 秒 → 状态变为「已完成」
- 🌗 **暗色 / 亮色主题**一键切换
- 🔍 **全文搜索**（覆盖所有章节标题与内容）
- ⏱️ **学习计时**（累计学习时长持久化）
- 📝 **知识点测验**（本地数据，无需服务端）

### 🐍 Python 增强功能（需启动 Flask 服务）

- ▶️ **Python 代码在线运行**（安全沙箱，30 秒超时）
- 🌐 通过 Flask 提供静态文件服务（解决 `file://` 协议跨域问题）

---

## 🚀 3. 快速开始

### 模式一：纯静态模式（✅ 推荐新手）

直接用浏览器打开 `index.html` 即可：

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

✅ 所有 **基础功能** 立即可用，无需任何环境配置。

### 模式二：Python 增强模式（🔓 解锁代码运行）

```bash
# 1. 一键启动（推荐）
./start.sh

# 或手动启动：
# 安装 Python 依赖
pip install -r requirements.txt

# 启动本地服务
python server.py

# 浏览器访问
# http://localhost:5678
```

🔓 解锁 **Python 代码在线运行** 功能。

---

## ✅ 4. 功能验证

### 🩺 验证服务状态

```bash
curl http://localhost:5678/api/health
# 预期: {"status":"ok","version":"1.0"}
```

### ▶️ 验证代码运行

```bash
curl -X POST http://localhost:5678/api/run \
  -H 'Content-Type: application/json' \
  -d '{"code":"print(1+1)"}'
# 预期: {"stdout":"2\n","stderr":"","exit_code":0}
```

### 📝 验证测验数据

```bash
curl http://localhost:5678/api/quiz/llm-a-deep-learning
# 预期: 返回该章节题目 JSON
```

### 🖥️ 页面功能验证

| 功能 | 验证步骤 |
|------|----------|
| **Code Runner** | 找到含 Python 代码块的章节，点击绿色 ▶️ Run 按钮 |
| **Quiz** | 滚到文章底部，点击「📝 知识点测验」按钮 |
| **进度追踪** | 点击任意文章，确认侧栏状态变为「学习中」 |
| **主题切换** | 点击顶部主题切换按钮，确认配色立即切换 |

---

## 🏗️ 5. 技术架构

- **前端**：纯 HTML / CSS / JS，**零框架依赖**，零外部 CDN
- **数据存储**：`localStorage`（学习进度、笔记、主题偏好、累计时长）
- **后端（可选）**：Flask + flask-cors，监听端口 `5678`
- **代码沙箱**：
  - `subprocess` 进程隔离执行
  - 危险操作黑名单过滤（`os.system` / `subprocess` / `open` 等）
  - **30 秒** 执行超时
  - **10 KB** 输出长度限制
- **优雅降级**：Python 服务不可用时，前端自动隐藏 Run 按钮等增强功能，基础功能不受影响

### 📂 文件结构

```
网页版教程/
├── index.html          # 主页面入口
├── server.py           # Flask 本地 Python 服务 (130 行, 端口 5678)
├── requirements.txt    # Python 依赖 (flask>=3.0, flask-cors>=4.0)
├── start.sh            # 一键启动脚本
├── css/
│   └── style.css       # 样式表
├── js/
│   ├── app.js          # 主逻辑
│   ├── markdown.js     # Markdown 渲染器
│   ├── key-points.js   # 知识点数据
│   ├── quiz-data.js    # 测验数据 (78 章节 289 题)
│   └── data-*.js       # 各模块内容数据
└── scripts/            # 构建脚本
```

---

## 🔌 6. API 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | `GET` | 健康检查，返回服务状态与版本 |
| `/api/run` | `POST` | 执行 Python 代码，body: `{"code": "...", "timeout": 10}` |
| `/api/quiz/<chapter_id>` | `GET` | 获取指定章节的测验数据 |

---

## ⚠️ 7. 注意事项

- 🔒 **代码沙箱安全**：禁止 `os.system` / `subprocess` / `open` 等危险操作
- 🏠 **仅绑定 localhost**（`127.0.0.1`），不对外暴露
- 📦 **输出限制**：stdout / stderr 各 10 KB
- ⏰ **超时控制**：默认 10 秒，最大 30 秒
- 🚫 不要将本服务直接部署到公网，沙箱仅适用于本地学习场景

---

## 💡 8. 学习建议

1. 📅 **循序渐进**：建议按 4 周精华路径推进，避免一上来就跳读
2. 🎯 **善用导航**：知识点导航专为面试 / 工作场景设计，可快速定位重点
3. 📝 **章节测验**：每完成一章立即做测验，及时巩固薄弱点
4. 🐍 **动手实践**：尝试修改代码块中的参数并重新运行，加深理解
5. 🌙 **保护视力**：长时间学习建议切换到暗色主题
6. 📊 **追踪进度**：定期查看学习时长与完成率，保持节奏

---

> 📌 **Happy Learning!** 愿你在大模型的世界里学有所得。 🚀
