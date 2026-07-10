#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build /Users/asura/Desktop/modelscope-learning-plan/js/data-blogs.js
from MD files in /Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/
"""

import os
import re
import json

SRC_ROOT = "/Users/asura/IdeaProjects/github/modelscope-classroom"
BLOGS_ROOT = os.path.join(SRC_ROOT, "Blogs")
OUT_FILE = "/Users/asura/Desktop/modelscope-learning-plan/js/data-blogs.js"

# 每个子目录一个条目
ENTRIES = [
    # ========= Articles ========= (高级 / 2h)
    {
        "dir": "Articles/All2All-Survey",
        "file": "report.md",
        "id": "blog-articles-all2all-survey",
        "category": "articles",
        "keywords": ["统一模型", "多模态", "VLM", "Diffusion", "图像理解与生成"],
    },
    {
        "dir": "Articles/Deep-Research-Survey",
        "file": "report.md",
        "id": "blog-articles-deep-research-survey",
        "category": "articles",
        "keywords": ["Deep Research", "Agent", "前沿架构", "深度研究", "AI Search"],
    },
    {
        "dir": "Articles/Ulysses_Ring_Attention",
        "file": "report.md",
        "id": "blog-articles-ulysses-ring-attention",
        "category": "articles",
        "keywords": ["Ring Attention", "Ulysses", "长序列", "序列并行", "Attention"],
    },
    # ========= DailyPaper ========= (中级 / 1h)
    {
        "dir": "DailyPaper/Agent_Lightning_zh",
        "file": "report.md",
        "id": "blog-daily-agent-lightning",
        "category": "daily",
        "keywords": ["Agent Lightning", "强化学习", "AI Agents", "RL", "MDP"],
    },
    {
        "dir": "DailyPaper/DINOv3_zh",
        "file": "report.md",
        "id": "blog-daily-dinov3",
        "category": "daily",
        "keywords": ["DINOv3", "自监督学习", "视觉基础模型", "SSL", "Gram Anchoring"],
    },
    {
        "dir": "DailyPaper/Dynamic_Fine_Tuning_zh",
        "file": "report.md",
        "id": "blog-daily-dynamic-fine-tuning-zh",
        "category": "daily",
        "keywords": ["DFT", "Dynamic Fine-Tuning", "数学推理", "微调", "LLM"],
    },
    {
        "dir": "DailyPaper/Intern-S1_Tech_Report",
        "file": "report.md",
        "id": "blog-daily-intern-s1",
        "category": "daily",
        "keywords": ["Intern-S1", "科学多模态", "大推理模型", "InternLM", "技术报告"],
    },
    {
        "dir": "DailyPaper/LongCat_report_zh",
        "file": "report.md",
        "id": "blog-daily-longcat",
        "category": "daily",
        "keywords": ["LongCat-Flash", "技术报告", "大模型", "美团", "MoE"],
    },
    {
        "dir": "DailyPaper/M3_Agent_zh",
        "file": "report.md",
        "id": "blog-daily-m3-agent",
        "category": "daily",
        "keywords": ["M3-Agent", "长期记忆", "多模态智能体", "Agent", "Memory"],
    },
    {
        "dir": "DailyPaper/Memento_zh",
        "file": "report.md",
        "id": "blog-daily-memento",
        "category": "daily",
        "keywords": ["Memento", "自适应", "LLM Agents", "免微调", "Memory"],
    },
    {
        "dir": "DailyPaper/OS_Agents_zh",
        "file": "report.md",
        "id": "blog-daily-os-agents",
        "category": "daily",
        "keywords": ["OS Agents", "操作系统代理", "GUI Agent", "智能体", "综述"],
    },
    {
        "dir": "DailyPaper/Qwen-Image_Tech_Report",
        "file": "report.md",
        "id": "blog-daily-qwen-image",
        "category": "daily",
        "keywords": ["Qwen-Image", "图像生成", "文本渲染", "图像编辑", "通义千问"],
    },
    {
        "dir": "DailyPaper/Survey_Agent_Self-Evolving_zh",
        "file": "report.md",
        "id": "blog-daily-survey-self-evolving",
        "category": "daily",
        "keywords": ["自演进", "Agent", "综述", "Self-Evolving", "智能体进化"],
    },
    {
        "dir": "DailyPaper/dft_dynamic_fine_tuning",
        "file": "report.md",
        "id": "blog-daily-dft-en",
        "category": "daily",
        "keywords": ["DFT", "Dynamic Fine-Tuning", "Mathematical Reasoning", "LLM", "Fine-Tuning"],
    },
    {
        "dir": "DailyPaper/dft_dynamic_fine_tuning_zh",
        "file": "report.md",
        "id": "blog-daily-dft-zh",
        "category": "daily",
        "keywords": ["DFT", "动态微调", "数学推理", "大模型", "微调技术"],
    },
    {
        "dir": "DailyPaper/transformers_report",
        "file": "report.md",
        "id": "blog-daily-transformers-report",
        "category": "daily",
        "keywords": ["Transformer", "Self-Attention", "Analysis Report", "Architecture", "NLP"],
    },
]


def extract_title(md_text: str) -> str:
    """提取第一个 # 标题"""
    for line in md_text.splitlines():
        line = line.strip()
        if line.startswith("# "):
            title = line[2:].strip()
            # 去除 markdown 加粗符号 **xxx**
            title = re.sub(r"\*\*(.+?)\*\*", r"\1", title)
            title = title.strip("*").strip()
            return title
    return "(untitled)"


def rewrite_image_paths(content: str, file_dir_abs: str) -> str:
    """将相对图片路径重写为基于文件所在目录的绝对路径 file:/// URL"""
    abs_prefix = "file://" + file_dir_abs.rstrip("/") + "/"

    def repl_md(m):
        alt = m.group(1)
        path = m.group(2)
        # 已是绝对/网络/data URL 则跳过
        if re.match(r"^(https?:|file:|data:|/)", path):
            return m.group(0)
        if path.startswith("./"):
            path = path[2:]
        return f"![{alt}]({abs_prefix}{path})"

    content = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", repl_md, content)

    def repl_html(m):
        prefix = m.group(1)
        path = m.group(2)
        suffix = m.group(3)
        if re.match(r"^(https?:|file:|data:|/)", path):
            return m.group(0)
        if path.startswith("./"):
            path = path[2:]
        return f"{prefix}{abs_prefix}{path}{suffix}"

    content = re.sub(
        r'(<img[^>]*\bsrc=")([^"]+)(")',
        repl_html, content, flags=re.IGNORECASE
    )
    return content


def escape_template(content: str) -> str:
    content = content.replace("\\", "\\\\")
    content = content.replace("`", "\\`")
    content = content.replace("${", "\\${")
    return content


def build():
    parts = []
    parts.append("// Auto-generated. Do not edit by hand.")
    parts.append("window.LEARNING_DATA = window.LEARNING_DATA || [];")
    parts.append("window.LEARNING_DATA.push({")
    parts.append("  module: '前沿论文',")
    parts.append("  chapters: [")

    n = len(ENTRIES)
    for i, e in enumerate(ENTRIES):
        rel_dir = e["dir"]
        fname = e["file"]
        cid = e["id"]
        category = e["category"]
        kws = e["keywords"]

        abs_dir = os.path.join(BLOGS_ROOT, rel_dir)
        fpath = os.path.join(abs_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            raw = f.read()

        title = extract_title(raw)
        rewritten = rewrite_image_paths(raw, abs_dir)
        escaped = escape_template(rewritten)

        rel_file = f"Blogs/{rel_dir}/{fname}"
        if category == "articles":
            difficulty = "高级"
            duration = "2h"
        else:
            difficulty = "中级"
            duration = "1h"

        kws_json = json.dumps(kws, ensure_ascii=False)

        parts.append("    {")
        parts.append(f"      id: {json.dumps(cid)},")
        parts.append(f"      title: {json.dumps(title, ensure_ascii=False)},")
        parts.append(f"      file: {json.dumps(rel_file, ensure_ascii=False)},")
        parts.append(f"      difficulty: {json.dumps(difficulty, ensure_ascii=False)},")
        parts.append(f"      duration: {json.dumps(duration)},")
        parts.append("      week: 16,")
        parts.append("      phase: 4,")
        parts.append(f"      keywords: {kws_json},")
        parts.append("      content: `" + escaped + "`")
        parts.append("    }," if i < n - 1 else "    }")

    parts.append("  ]")
    parts.append("});")

    out = "\n".join(parts) + "\n"

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(out)

    size = os.path.getsize(OUT_FILE)
    print(f"Wrote {OUT_FILE} ({size} bytes, {n} chapters)")


if __name__ == "__main__":
    build()
