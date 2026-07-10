#!/usr/bin/env python3
"""按网格自动检测并将图标大图裁切为一个个单独的 PNG。

思路(在参考脚本的"网格裁切"基础上做了自适应):
- 基于 alpha 通道的行/列投影自动检测网格的行数与列数,无需手动写死每格尺寸;
- 在每个网格单元内做紧致裁剪(去掉四周透明留白),得到干净的单个图标;
- 自动跳过没有内容的空单元(例如最后一行右侧的空位)。

用法:
    python split_icons.py [源图片] [输出目录]
默认处理同目录下的 ICON-1.png,输出到 <源文件名>_cells/。
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ALPHA_THRESH = 10     # alpha 超过该值才算作不透明像素
MIN_LINE_PIXELS = 15  # 一整行/一整列中不透明像素超过该数量才视为"有内容"


def content_bands(has_content):
    """从布尔序列中提取连续为 True 的区间 [(start, end), ...](含端点)。"""
    bands = []
    start = None
    for i, v in enumerate(has_content):
        if v and start is None:
            start = i
        elif not v and start is not None:
            bands.append((start, i - 1))
            start = None
    if start is not None:
        bands.append((start, len(has_content) - 1))
    return bands


def tight_bbox(sub_mask):
    """返回子掩码内非零区域的紧致边界 (x0, y0, x1, y1);无内容返回 None。"""
    ys = np.where(sub_mask.any(axis=1))[0]
    xs = np.where(sub_mask.any(axis=0))[0]
    if len(xs) == 0 or len(ys) == 0:
        return None
    return int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "ICON-1.png"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else src.parent / f"{src.stem}_cells"
    out_dir.mkdir(parents=True, exist_ok=True)

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    mask = arr[:, :, 3] > ALPHA_THRESH
    H, W = mask.shape

    row_has = mask.sum(axis=1) > MIN_LINE_PIXELS
    col_has = mask.sum(axis=0) > MIN_LINE_PIXELS
    row_bands = content_bands(row_has)
    col_bands = content_bands(col_has)

    print(f"图片尺寸: {W} x {H}")
    print(f"检测到网格: {len(row_bands)} 行 x {len(col_bands)} 列")

    count = 0
    sizes = []
    for r, (y0, y1) in enumerate(row_bands, start=1):
        for c, (x0, x1) in enumerate(col_bands, start=1):
            cell = mask[y0:y1 + 1, x0:x1 + 1]
            bb = tight_bbox(cell)
            if bb is None:
                continue  # 空单元(如最后一行右侧的空位)
            bx0, by0, bx1, by1 = bb
            box = (x0 + bx0, y0 + by0, x0 + bx1, y0 + by1)
            crop = im.crop(box)
            crop.save(out_dir / f"icon_r{r}c{c}.png")
            sizes.append(crop.size)
            count += 1

    ws = [s[0] for s in sizes]
    hs = [s[1] for s in sizes]
    print(f"已保存 {count} 个图标到: {out_dir}")
    if sizes:
        print(f"单个图标尺寸范围: 宽 {min(ws)}~{max(ws)}, 高 {min(hs)}~{max(hs)}")


if __name__ == "__main__":
    main()
