#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基于知识点数据 (key-points.js) 预生成测验题。

读取  : /Users/asura/Desktop/modelscope-learning-plan/js/key-points.js
输出  : <repo>/web/js/quiz-data.js

每个章节 3~5 道题；正确选项来自该知识点 text，干扰项来自其它章节的知识点 text。
随机种子固定，保证可复现。
"""

from __future__ import annotations

import json
import os
import random
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

REPO_ROOT = Path("/Users/asura/IdeaProjects/github/modelscope-classroom")
KEY_POINTS_JS = Path("/Users/asura/Desktop/modelscope-learning-plan/js/key-points.js")
OUT_FILE = REPO_ROOT / "web" / "js" / "quiz-data.js"

RANDOM_SEED = 20260602
MAX_PER_CHAPTER = 5
MIN_PER_CHAPTER = 3

# ---------------------------------------------------------------------------
# 1. 解析 key-points.js
# ---------------------------------------------------------------------------

CHAPTER_HEADER = re.compile(r'^\s+"([\w\-]+)"\s*:\s*\[\s*$')
ITEM_RE = re.compile(
    r'\{\s*text:\s*"((?:[^"\\]|\\.)*)"\s*,\s*keyword:\s*"((?:[^"\\]|\\.)*)"\s*\}'
)


def parse_key_points(js_path: Path) -> Dict[str, List[Dict[str, str]]]:
    text = js_path.read_text(encoding="utf-8")
    chapters: Dict[str, List[Dict[str, str]]] = {}
    current = None
    for line in text.splitlines():
        m = CHAPTER_HEADER.match(line)
        if m:
            current = m.group(1)
            chapters[current] = []
            continue
        if current is None:
            continue
        if line.strip().startswith("],"):
            current = None
            continue
        for tm in ITEM_RE.finditer(line):
            chapters[current].append(
                {"text": tm.group(1), "keyword": tm.group(2)}
            )
    return chapters


# ---------------------------------------------------------------------------
# 2. 生成题目
# ---------------------------------------------------------------------------

def normalize_keyword(kw: str) -> str:
    """提取 keyword 的核心词，用于查重比较。"""
    s = re.sub(r"[（(].*?[)）]", "", kw)
    s = re.sub(r"\s+", "", s).lower()
    return s


def make_question_stem(text: str, keyword: str) -> str:
    """根据知识点文本特征选择问题模板。"""
    kw = keyword.strip()
    # 流程类
    if "→" in text:
        return f"关于「{kw}」的核心流程或要点，下列描述正确的是？"
    # 对比类
    if " vs " in text or " VS " in text or "vs " in text.lower() or "区别" in text:
        return f"下列关于「{kw}」的对比说明，正确的是？"
    # 定义类
    if "=" in text or "：" in text or ":" in text:
        return f"关于「{kw}」，下列说法正确的是？"
    # 通用
    return f"关于「{kw}」，下列描述正确的是？"


def pick_distractors(
    correct_text: str,
    correct_keyword: str,
    pool: List[Tuple[str, str, str]],
    rng: random.Random,
    k: int = 3,
) -> List[str]:
    """从全局知识点池中挑选 k 个干扰项。

    pool: List of (chapter_id, text, keyword)
    """
    correct_kw_norm = normalize_keyword(correct_keyword)
    correct_text_norm = correct_text.replace(" ", "").lower()

    candidates = []
    for _, t, kw in pool:
        if t == correct_text:
            continue
        if normalize_keyword(kw) == correct_kw_norm:
            continue
        # 避免干扰项与正确选项文本高度相似
        if t.replace(" ", "").lower() == correct_text_norm:
            continue
        candidates.append(t)

    rng.shuffle(candidates)

    picked: List[str] = []
    seen_norm: set = {correct_text_norm}
    for t in candidates:
        n = t.replace(" ", "").lower()
        if n in seen_norm:
            continue
        # 进一步降低与正确答案过度重复的可能：限制共享前 6 个字符
        if t[:6] == correct_text[:6]:
            continue
        picked.append(t)
        seen_norm.add(n)
        if len(picked) == k:
            break

    # 若候选不足，再放宽规则补齐
    if len(picked) < k:
        for t in candidates:
            n = t.replace(" ", "").lower()
            if n in seen_norm:
                continue
            picked.append(t)
            seen_norm.add(n)
            if len(picked) == k:
                break

    return picked[:k]


def build_explanation(text: str, keyword: str) -> str:
    return f"「{keyword}」的核心要点：{text}。"


def gen_chapter_questions(
    chapter_id: str,
    points: List[Dict[str, str]],
    pool: List[Tuple[str, str, str]],
    rng: random.Random,
) -> List[dict]:
    n = max(MIN_PER_CHAPTER, min(MAX_PER_CHAPTER, len(points)))
    n = min(n, len(points))
    selected = points[:n]

    questions: List[dict] = []
    for kp in selected:
        text, keyword = kp["text"], kp["keyword"]
        distractors = pick_distractors(text, keyword, pool, rng, k=3)
        if len(distractors) < 3:
            # 极端兜底：用同章节其他点充当
            for sib in points:
                if sib["text"] != text and sib["text"] not in distractors:
                    distractors.append(sib["text"])
                    if len(distractors) == 3:
                        break

        options = [text] + distractors
        rng.shuffle(options)
        answer_idx = options.index(text)

        questions.append(
            {
                "question": make_question_stem(text, keyword),
                "options": options,
                "answer": answer_idx,
                "explanation": build_explanation(text, keyword),
            }
        )
    return questions


# ---------------------------------------------------------------------------
# 3. 输出 quiz-data.js
# ---------------------------------------------------------------------------

def to_js(quiz: Dict[str, dict]) -> str:
    body = json.dumps(quiz, ensure_ascii=False, indent=2)
    header = (
        "/* Auto-generated by scripts/gen_quiz_data.py\n"
        " * 基于 key-points.js 的知识点预生成的章节测验题。\n"
        " * 每章 3~5 题；正确答案来自知识点本身，干扰项随机来自其他章节。\n"
        " */\n"
        "window.QUIZ_DATA = "
    )
    return header + body + ";\n"


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    if not KEY_POINTS_JS.exists():
        print(f"[ERR] 找不到 key-points.js: {KEY_POINTS_JS}", file=sys.stderr)
        return 1

    chapters = parse_key_points(KEY_POINTS_JS)
    if not chapters:
        print("[ERR] 解析失败，未读取到章节", file=sys.stderr)
        return 2

    total_points = sum(len(v) for v in chapters.values())
    print(f"[INFO] 共解析 {len(chapters)} 个章节, {total_points} 个知识点")

    pool: List[Tuple[str, str, str]] = []
    for cid, items in chapters.items():
        for kp in items:
            pool.append((cid, kp["text"], kp["keyword"]))

    rng = random.Random(RANDOM_SEED)
    quiz: Dict[str, dict] = {}
    for cid, items in chapters.items():
        questions = gen_chapter_questions(cid, items, pool, rng)
        quiz[cid] = {"questions": questions}

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(to_js(quiz), encoding="utf-8")
    print(f"[OK ] 已写入 {OUT_FILE}, 共 {sum(len(v['questions']) for v in quiz.values())} 道题")
    return 0


if __name__ == "__main__":
    sys.exit(main())
