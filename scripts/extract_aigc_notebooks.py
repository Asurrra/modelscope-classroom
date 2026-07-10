#!/usr/bin/env python3
"""
Extract content from AIGC-tutorial/notebook/*.ipynb files
and generate data-notebooks-aigc.js for the learning web app.
"""

import json
import os
import re

NOTEBOOK_DIR = '/Users/asura/IdeaProjects/github/modelscope-classroom/AIGC-tutorial/notebook'
OUTPUT_FILE = '/Users/asura/Desktop/modelscope-learning-plan/js/data-notebooks-aigc.js'

# Metadata for each notebook
NOTEBOOKS = [
    {
        'file': 'DiT_ImageNet_Demo.ipynb',
        'id': 'nb-aigc-dit-demo',
        'title': 'DiT 图像生成演示',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['DiT', 'ImageNet', '扩散模型'],
    },
    {
        'file': 'SiT_ImageNet_Demo.ipynb',
        'id': 'nb-aigc-sit-demo',
        'title': 'SiT 流扩散模型演示',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['SiT', 'ODE', 'SDE'],
    },
    {
        'file': 'UViT_ImageNet_demo.ipynb',
        'id': 'nb-aigc-uvit-demo',
        'title': 'U-ViT 图像生成演示',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['U-ViT', 'DPM-Solver'],
    },
    {
        'file': 'ViT-BestPractice.ipynb',
        'id': 'nb-aigc-vit-bestpractice',
        'title': 'ViT 图像分类最佳实践',
        'difficulty': '中级',
        'duration': '2h',
        'keywords': ['ViT', 'Patch', '位置编码'],
    },
    {
        'file': 'ViViT-BestPractice.ipynb',
        'id': 'nb-aigc-vivit-bestpractice',
        'title': 'ViViT 视频分类最佳实践',
        'difficulty': '中级',
        'duration': '3h',
        'keywords': ['ViViT', '视频分类', 'Tubelet'],
    },
    {
        'file': 'ViViT-demo.ipynb',
        'id': 'nb-aigc-vivit-demo',
        'title': 'ViViT 视频分类(英文版)',
        'difficulty': '中级',
        'duration': '3h',
        'keywords': ['ViViT', 'Video', 'Classification'],
    },
    {
        'file': 'Latte-BestPractice.ipynb',
        'id': 'nb-aigc-latte',
        'title': 'Latte 文生视频配置',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['Latte', '文生视频'],
    },
    {
        'file': 'Omnigen_demo.ipynb',
        'id': 'nb-aigc-omnigen',
        'title': 'OmniGen 多模态生成演示',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['OmniGen', '多模态'],
    },
    {
        'file': 'patch-BestPractice.ipynb',
        'id': 'nb-aigc-patch',
        'title': '图像Patch提取与可视化',
        'difficulty': '入门',
        'duration': '1.5h',
        'keywords': ['Patch', '图像预处理'],
    },
    {
        'file': 'comfyui_modelscope.ipynb',
        'id': 'nb-aigc-comfyui',
        'title': 'ComfyUI 节点部署指南',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['ComfyUI', '文生图'],
    },
    {
        'file': 'comfyui_manager_animatediff.ipynb',
        'id': 'nb-aigc-comfyui-animatediff',
        'title': 'ComfyUI + AnimateDiff',
        'difficulty': '中级',
        'duration': '1.5h',
        'keywords': ['AnimateDiff', '动画'],
    },
    {
        'file': 'sd-webui最佳实践.ipynb',
        'id': 'nb-aigc-sd-webui',
        'title': 'SD WebUI 快速启动',
        'difficulty': '中级',
        'duration': '1h',
        'keywords': ['Stable Diffusion', 'WebUI'],
    },
]


def extract_notebook_content(filepath):
    """Extract markdown and code cells from a .ipynb file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        notebook = json.load(f)

    cells = notebook.get('cells', [])
    parts = []

    for cell in cells:
        cell_type = cell.get('cell_type', '')
        source = cell.get('source', [])
        # source is a list of strings, join them
        content = ''.join(source)

        if not content.strip():
            continue

        if cell_type == 'markdown':
            parts.append(content)
        elif cell_type == 'code':
            parts.append(f'```python\n{content}\n```')

    return '\n\n'.join(parts)


def rewrite_image_paths(content, notebook_file):
    """Rewrite relative image paths to absolute paths based on notebook directory."""
    notebook_dir = 'AIGC-tutorial/notebook'

    # Handle ![alt](relative_path)
    def replace_md_img(match):
        alt = match.group(1)
        path = match.group(2)
        if path.startswith(('http://', 'https://', '/')):
            return match.group(0)
        # Rewrite relative path
        new_path = f'{notebook_dir}/{path}'
        return f'![{alt}]({new_path})'

    content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_md_img, content)

    # Handle <img src="relative_path">
    def replace_html_img(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        if path.startswith(('http://', 'https://', '/')):
            return match.group(0)
        new_path = f'{notebook_dir}/{path}'
        return f'{prefix}{new_path}{suffix}'

    content = re.sub(r'(<img[^>]*src=["\'])([^"\']+)(["\'])', replace_html_img, content)

    return content


def escape_template_string(content):
    """Escape backticks and ${ for JavaScript template strings."""
    # Escape backslashes first
    content = content.replace('\\', '\\\\')
    # Escape backticks
    content = content.replace('`', '\\`')
    # Escape ${
    content = content.replace('${', '\\${')
    return content


def generate_js():
    """Generate the JavaScript data file."""
    chapters = []

    for nb in NOTEBOOKS:
        filepath = os.path.join(NOTEBOOK_DIR, nb['file'])
        if not os.path.exists(filepath):
            print(f"WARNING: {filepath} not found, skipping.")
            continue

        print(f"Processing: {nb['file']}...")
        content = extract_notebook_content(filepath)
        content = rewrite_image_paths(content, nb['file'])
        escaped_content = escape_template_string(content)

        keywords_str = json.dumps(nb['keywords'], ensure_ascii=False)

        chapter = f"""    {{
      id: '{nb['id']}',
      title: '{nb['title']}',
      file: 'AIGC-tutorial/notebook/{nb['file']}',
      difficulty: '{nb['difficulty']}',
      duration: '{nb['duration']}',
      week: 8,
      phase: 2,
      keywords: {keywords_str},
      content: `{escaped_content}`
    }}"""
        chapters.append(chapter)

    chapters_str = ',\n'.join(chapters)

    js_content = f"""window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({{
  module: 'AIGC-实践篇',
  chapters: [
{chapters_str}
  ]
}});
"""

    # Ensure output directory exists
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
