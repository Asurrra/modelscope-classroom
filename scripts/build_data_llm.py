#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build /Users/asura/Desktop/modelscope-learning-plan/js/data-llm.js
from MD files in /Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/
"""

import os
import re
import json

SRC_DIR = "/Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial"
OUT_FILE = "/Users/asura/Desktop/modelscope-learning-plan/js/data-llm.js"
ABS_RES_PREFIX = "file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/"

CHAPTERS = [
    ("A.深度学习入门介绍.md", "llm-a-deep-learning", "A. 深度学习入门介绍",
     "入门", "3h", 1, 1,
     ["深度学习", "神经网络", "机器学习基础", "反向传播", "激活函数"]),
    ("B.魔搭社区和LLM大模型基础知识.md", "llm-b-llm-basics", "B. 魔搭社区和LLM大模型基础知识",
     "入门", "3h", 2, 1,
     ["魔搭社区", "ModelScope", "LLM", "大语言模型", "模型生态"]),
    ("C.提示词工程-prompt engineering.md", "llm-c-prompt-engineering", "C. 提示词工程 Prompt Engineering",
     "入门", "3h", 2, 1,
     ["Prompt", "提示词工程", "Few-shot", "Chain-of-Thought", "指令设计"]),
    ("D.Transformer结构.md", "llm-d-transformer", "D. Transformer 结构",
     "中级", "4h", 4, 2,
     ["Transformer", "Self-Attention", "多头注意力", "位置编码", "Encoder-Decoder"]),
    ("E.技术选型.md", "llm-e-tech-selection", "E. 技术选型",
     "中级", "2h", 3, 1,
     ["技术选型", "模型选择", "训练框架", "推理框架", "部署方案"]),
    ("F.数据预处理.md", "llm-f-data-preprocessing", "F. 数据预处理",
     "中级", "3h", 5, 2,
     ["数据预处理", "数据清洗", "Tokenizer", "数据集构建", "数据增强"]),
    ("G.量化.md", "llm-g-quantization", "G. 量化",
     "中级", "2h", 5, 2,
     ["量化", "INT8", "INT4", "GPTQ", "AWQ"]),
    ("H.训练.md", "llm-h-training", "H. 训练",
     "中级", "4h", 6, 2,
     ["模型训练", "微调", "LoRA", "全参数训练", "分布式训练"]),
    ("I.LLM和多模态模型高效推理实践.md", "llm-i-inference", "I. LLM 和多模态模型高效推理实践",
     "中级", "4h", 7, 2,
     ["推理优化", "vLLM", "多模态", "KV Cache", "推理加速"]),
    ("J.部署.md", "llm-j-deployment", "J. 部署",
     "中级", "3h", 7, 2,
     ["模型部署", "服务化", "API", "Docker", "生产环境"]),
    ("K.大模型自动评估理论和实战--LLM Automatic Evaluation.md", "llm-k-evaluation",
     "K. 大模型自动评估理论和实战 LLM Automatic Evaluation",
     "中级", "3h", 7, 2,
     ["评估", "Benchmark", "Automatic Evaluation", "MMLU", "评测指标"]),
    ("L.LISA微调技术解析.md", "llm-l-lisa", "L. LISA 微调技术解析",
     "高级", "3h", 12, 3,
     ["LISA", "微调技术", "层采样", "高效微调", "LoRA对比"]),
    ("M.人类偏好对齐训练.md", "llm-m-alignment", "M. 人类偏好对齐训练",
     "高级", "5h", 9, 3,
     ["RLHF", "DPO", "偏好对齐", "奖励模型", "对齐训练"]),
    ("N.量化技术解析.md", "llm-n-quantization-deep", "N. 量化技术解析",
     "高级", "4h", 10, 3,
     ["量化原理", "GPTQ", "AWQ", "SmoothQuant", "低比特量化"]),
    ("O.Modelscope-Agent-AgentFabric微调最佳实践.md", "llm-o-agent-fabric",
     "O. ModelScope-Agent AgentFabric 微调最佳实践",
     "高级", "5h", 13, 4,
     ["Agent", "AgentFabric", "工具调用", "Agent微调", "最佳实践"]),
    ("P.PlayGround:训练一个古文翻译腔机器人.md", "llm-p-playground",
     "P. PlayGround：训练一个古文翻译腔机器人",
     "中级", "5h", 8, 2,
     ["实战项目", "古文翻译", "微调实战", "数据构建", "PlayGround"]),
    ("Q.从OpenAI-O1看大模型的复杂推理能力.md", "llm-q-reasoning",
     "Q. 从 OpenAI O1 看大模型的复杂推理能力",
     "高级", "3h", 12, 3,
     ["OpenAI O1", "复杂推理", "推理能力", "思维链", "Reasoning"]),
    ("S.PPO和GRPO.md", "llm-s-ppo-grpo", "S. PPO 和 GRPO",
     "高级", "4h", 10, 3,
     ["PPO", "GRPO", "强化学习", "策略优化", "RLHF算法"]),
]


def rewrite_image_paths(content: str) -> str:
    def repl_md(m):
        alt = m.group(1)
        path = m.group(2)
        if path.startswith("./"):
            path = path[2:]
        if path.startswith("resources/"):
            return f"![{alt}]({ABS_RES_PREFIX}{path})"
        return m.group(0)

    content = re.sub(r"!\[([^\]]*)\]\((\.?/?resources/[^)]+)\)", repl_md, content)

    def repl_html(m):
        prefix = m.group(1)
        path = m.group(2)
        suffix = m.group(3)
        if path.startswith("./"):
            path = path[2:]
        if path.startswith("resources/"):
            return f'{prefix}{ABS_RES_PREFIX}{path}{suffix}'
        return m.group(0)

    content = re.sub(
        r'(<img[^>]*\bsrc=")(\.?/?resources/[^"]+)(")',
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
    parts.append("  module: 'LLM-tutorial',")
    parts.append("  chapters: [")

    for i, (fname, cid, title, diff, dur, week, phase, kws) in enumerate(CHAPTERS):
        fpath = os.path.join(SRC_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            raw = f.read()
        rewritten = rewrite_image_paths(raw)
        escaped = escape_template(rewritten)

        rel_file = f"LLM-tutorial/{fname}"
        kws_json = json.dumps(kws, ensure_ascii=False)

        parts.append("    {")
        parts.append(f"      id: {json.dumps(cid)},")
        parts.append(f"      title: {json.dumps(title, ensure_ascii=False)},")
        parts.append(f"      file: {json.dumps(rel_file, ensure_ascii=False)},")
        parts.append(f"      difficulty: {json.dumps(diff, ensure_ascii=False)},")
        parts.append(f"      duration: {json.dumps(dur)},")
        parts.append(f"      week: {week},")
        parts.append(f"      phase: {phase},")
        parts.append(f"      keywords: {kws_json},")
        parts.append("      content: `" + escaped + "`")
        if i < len(CHAPTERS) - 1:
            parts.append("    },")
        else:
            parts.append("    }")

    parts.append("  ]")
    parts.append("});")

    out = "\n".join(parts) + "\n"

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(out)

    size = os.path.getsize(OUT_FILE)
    print(f"Wrote {OUT_FILE} ({size} bytes, {len(CHAPTERS)} chapters)")


if __name__ == "__main__":
    build()
