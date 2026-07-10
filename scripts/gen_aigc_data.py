#!/usr/bin/env python3
"""Generate /Users/asura/Desktop/modelscope-learning-plan/js/data-aigc.js"""
import os
import re

SRC_DIR = "/Users/asura/IdeaProjects/github/modelscope-classroom/AIGC-tutorial"
OUT_FILE = "/Users/asura/Desktop/modelscope-learning-plan/js/data-aigc.js"
BASE_URL = "file:///Users/asura/IdeaProjects/github/modelscope-classroom/AIGC-tutorial/"

CHAPTER_META = {
    "基于Transformers，diffusion技术解析+实战.md": {
        "id": "aigc-transformers-diffusion",
        "title": "基于Transformers，diffusion技术解析+实战",
        "difficulty": "中级",
        "duration": "6h",
        "week": 8,
        "phase": 2,
        "keywords": ["ViT", "Vision Transformer", "Diffusion", "DiT", "扩散模型"],
    }
}


def rewrite_images(text: str, base_url: str) -> str:
    def repl_md(m):
        alt = m.group(1)
        path = m.group(2).strip()
        if path.startswith(("http://", "https://", "file://", "data:")):
            return m.group(0)
        if path.startswith("./"):
            path = path[2:]
        return f"![{alt}]({base_url}{path})"

    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", repl_md, text)

    def repl_html(m):
        prefix = m.group(1)
        path = m.group(2)
        suffix = m.group(3)
        if path.startswith(("http://", "https://", "file://", "data:")):
            return m.group(0)
        if path.startswith("./"):
            path = path[2:]
        return f"{prefix}{base_url}{path}{suffix}"

    text = re.sub(r'(<img[^>]+src=")([^"]+)(")', repl_html, text)
    return text


def escape_template(text: str) -> str:
    text = text.replace("\\", "\\\\")
    text = text.replace("`", "\\`")
    text = text.replace("${", "\\${")
    return text


def main():
    chapters = []
    md_files = sorted([f for f in os.listdir(SRC_DIR) if f.endswith(".md")])
    for fname in md_files:
        meta = CHAPTER_META.get(fname)
        if not meta:
            meta = {
                "id": "aigc-" + re.sub(r"[^a-z0-9]+", "-", fname.lower().replace(".md", "")).strip("-"),
                "title": fname.replace(".md", ""),
                "difficulty": "中级",
                "duration": "3h",
                "week": 8,
                "phase": 2,
                "keywords": [],
            }
        path = os.path.join(SRC_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        content = rewrite_images(content, BASE_URL)
        content_escaped = escape_template(content)

        chapters.append({
            "meta": meta,
            "file_rel": f"AIGC-tutorial/{fname}",
            "content": content_escaped,
        })

    lines = []
    lines.append("window.LEARNING_DATA = window.LEARNING_DATA || [];")
    lines.append("window.LEARNING_DATA.push({")
    lines.append("  module: 'AIGC-tutorial',")
    lines.append("  chapters: [")
    for i, ch in enumerate(chapters):
        m = ch["meta"]
        kw_json = ", ".join(f"'{k}'" for k in m["keywords"])
        lines.append("    {")
        lines.append(f"      id: '{m['id']}',")
        lines.append(f"      title: '{m['title']}',")
        lines.append(f"      file: '{ch['file_rel']}',")
        lines.append(f"      difficulty: '{m['difficulty']}',")
        lines.append(f"      duration: '{m['duration']}',")
        lines.append(f"      week: {m['week']},")
        lines.append(f"      phase: {m['phase']},")
        lines.append(f"      keywords: [{kw_json}],")
        lines.append("      content: `" + ch["content"] + "`")
        lines.append("    }" + ("," if i < len(chapters) - 1 else ""))
    lines.append("  ]")
    lines.append("});")
    lines.append("")

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Wrote {OUT_FILE} with {len(chapters)} chapters")


if __name__ == "__main__":
    main()
