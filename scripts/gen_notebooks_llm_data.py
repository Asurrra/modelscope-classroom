#!/usr/bin/env python3
"""
提取 LLM-tutorial/notebook/ 下的 .ipynb 文件内容，生成 data-notebooks-llm.js
"""

import json
import os
import re

BASE_DIR = '/Users/asura/IdeaProjects/github/modelscope-classroom'
OUTPUT_FILE = '/Users/asura/Desktop/modelscope-learning-plan/js/data-notebooks-llm.js'

# 文件元数据列表
NOTEBOOKS = [
    {
        'file': 'LLM-tutorial/notebook/OpenRLHF.ipynb',
        'id': 'nb-llm-openrlhf',
        'title': 'OpenRLHF 强化学习实战',
        'difficulty': '高级',
        'duration': '2h',
        'week': 10,
        'phase': 3,
        'keywords': ['OpenRLHF', 'PPO', 'RLHF'],
    },
    {
        'file': 'LLM-tutorial/notebook/OpenVino-llm-chatbot.ipynb',
        'id': 'nb-llm-openvino',
        'title': 'OpenVINO 推理优化',
        'difficulty': '中级',
        'duration': '2h',
        'week': 7,
        'phase': 2,
        'keywords': ['OpenVINO', '模型压缩'],
    },
    {
        'file': 'LLM-tutorial/notebook/RAG+Rerank+Llamaindex.ipynb',
        'id': 'nb-llm-rag-llamaindex',
        'title': 'RAG + Rerank 实战',
        'difficulty': '中级',
        'duration': '2h',
        'week': 7,
        'phase': 2,
        'keywords': ['RAG', 'Rerank', 'LlamaIndex'],
    },
    {
        'file': 'LLM-tutorial/notebook/RAGFlow.ipynb',
        'id': 'nb-llm-ragflow',
        'title': 'RAGFlow 框架部署',
        'difficulty': '中级',
        'duration': '1.5h',
        'week': 7,
        'phase': 2,
        'keywords': ['RAGFlow', 'Docker', 'RAG'],
    },
    {
        'file': 'LLM-tutorial/notebook/VLMEvalKit多模态模型评估.ipynb',
        'id': 'nb-llm-vlmevalkit',
        'title': '多模态模型评估实战',
        'difficulty': '中级',
        'duration': '1.5h',
        'week': 7,
        'phase': 2,
        'keywords': ['VLMEvalKit', 'EvalScope'],
    },
    {
        'file': 'LLM-tutorial/notebook/dify.ipynb',
        'id': 'nb-llm-dify',
        'title': 'Dify RAG+Agent 框架',
        'difficulty': '中级',
        'duration': '2h',
        'week': 13,
        'phase': 4,
        'keywords': ['Dify', 'Agent', '知识库'],
    },
    {
        'file': 'LLM-tutorial/notebook/llama-factory.ipynb',
        'id': 'nb-llm-llama-factory',
        'title': 'LLaMA-Factory 微调实战',
        'difficulty': '中级',
        'duration': '2h',
        'week': 6,
        'phase': 2,
        'keywords': ['LLaMA-Factory', 'LoRA'],
    },
    {
        'file': 'LLM-tutorial/notebook/llamacpp+qwen3vl+gguf.ipynb',
        'id': 'nb-llm-llamacpp',
        'title': 'llama.cpp 本地推理',
        'difficulty': '中级',
        'duration': '2h',
        'week': 7,
        'phase': 2,
        'keywords': ['llama.cpp', 'GGUF', '多模态'],
    },
    {
        'file': 'LLM-tutorial/notebook/nexa.ipynb',
        'id': 'nb-llm-nexa',
        'title': 'Nexa SDK 端侧推理',
        'difficulty': '中级',
        'duration': '1.5h',
        'week': 7,
        'phase': 2,
        'keywords': ['Nexa', 'GGUF', '端侧'],
    },
    {
        'file': 'LLM-tutorial/notebook/unsloth.ipynb',
        'id': 'nb-llm-unsloth',
        'title': 'Unsloth 高效微调',
        'difficulty': '中级',
        'duration': '2h',
        'week': 6,
        'phase': 2,
        'keywords': ['Unsloth', 'LoRA', '量化'],
    },
    {
        'file': 'LLM-tutorial/notebook/vllm.ipynb',
        'id': 'nb-llm-vllm',
        'title': 'vLLM 推理加速实战',
        'difficulty': '中级',
        'duration': '2h',
        'week': 7,
        'phase': 2,
        'keywords': ['vLLM', 'PagedAttention'],
    },
    {
        'file': 'LLM-tutorial/notebook/全流程知乎数据集训练.ipynb',
        'id': 'nb-llm-zhihu-train',
        'title': '知乎数据集全流程训练',
        'difficulty': '中级',
        'duration': '3h',
        'week': 8,
        'phase': 2,
        'keywords': ['数据清洗', 'LoRA', '评测'],
    },
    {
        'file': 'LLM-tutorial/notebook/训练.ipynb',
        'id': 'nb-llm-quick-train',
        'title': '10步快速训练入门',
        'difficulty': '入门',
        'duration': '1h',
        'week': 6,
        'phase': 2,
        'keywords': ['Qwen', 'LoRA', '快速入门'],
    },
    {
        'file': 'LLM-tutorial/R.10分钟改变大模型自我认知.ipynb',
        'id': 'nb-llm-self-cognition',
        'title': '10分钟改变大模型自我认知',
        'difficulty': '入门',
        'duration': '1h',
        'week': 6,
        'phase': 2,
        'keywords': ['自我认知', '微调', '快速入门'],
    },
]


def extract_notebook_content(filepath):
    """从 .ipynb 文件中提取 markdown 和代码内容"""
    with open(filepath, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    cells = nb.get('cells', [])
    parts = []

    for cell in cells:
        cell_type = cell.get('cell_type', '')
        source = cell.get('source', [])
        if not source:
            continue

        text = ''.join(source)
        if not text.strip():
            continue

        if cell_type == 'markdown':
            parts.append(text)
        elif cell_type == 'code':
            parts.append(f'```python\n{text}\n```')

    return '\n\n'.join(parts)


def escape_template_string(s):
    """转义模板字符串中的特殊字符：反引号和 ${"""
    # 转义反引号
    s = s.replace('\\', '\\\\')
    s = s.replace('`', '\\`')
    # 转义 ${
    s = s.replace('${', '\\${')
    return s


def rewrite_image_paths(content, notebook_file):
    """将 markdown 中的相对图片路径重写为基于仓库的路径"""
    notebook_dir = os.path.dirname(notebook_file)

    def replace_img(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        # 跳过已经是绝对路径或 URL 的
        if path.startswith(('http://', 'https://', '/')):
            return match.group(0)
        # 计算相对于仓库根目录的路径
        abs_path = os.path.normpath(os.path.join(notebook_dir, path))
        return f'{prefix}{abs_path}{suffix}'

    # 匹配 markdown 图片 ![alt](path) 和 HTML img src
    content = re.sub(r'(!\[[^\]]*\]\()([^)]+)(\))', replace_img, content)
    content = re.sub(r'(src=["\'])([^"\']+)(["\'])', replace_img, content)
    return content


def generate_js():
    """生成 JavaScript 数据文件"""
    chapters = []

    for nb_meta in NOTEBOOKS:
        filepath = os.path.join(BASE_DIR, nb_meta['file'])
        print(f"Processing: {nb_meta['file']}...")

        try:
            content = extract_notebook_content(filepath)
            content = rewrite_image_paths(content, nb_meta['file'])
            content = escape_template_string(content)
        except Exception as e:
            print(f"  ERROR: {e}")
            content = f"# {nb_meta['title']}\\n\\n内容提取失败: {str(e)}"

        keywords_str = ', '.join(f"'{kw}'" for kw in nb_meta['keywords'])

        chapter = f"""    {{
      id: '{nb_meta['id']}',
      title: '{nb_meta['title']}',
      file: '{nb_meta['file']}',
      difficulty: '{nb_meta['difficulty']}',
      duration: '{nb_meta['duration']}',
      week: {nb_meta['week']},
      phase: {nb_meta['phase']},
      keywords: [{keywords_str}],
      content: `{content}`
    }}"""
        chapters.append(chapter)

    chapters_str = ',\n'.join(chapters)

    js_content = f"""window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({{
  module: 'LLM-实践篇',
  chapters: [
{chapters_str}
  ]
}});
"""

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\nGenerated: {OUTPUT_FILE}")
    print(f"Total chapters: {len(chapters)}")
    # Print file size
    size = os.path.getsize(OUTPUT_FILE)
    if size > 1024 * 1024:
        print(f"File size: {size / 1024 / 1024:.1f} MB")
    else:
        print(f"File size: {size / 1024:.1f} KB")


if __name__ == '__main__':
    generate_js()
