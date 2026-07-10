# -*- coding: utf-8 -*-
"""按行去重脚本：读取 单号.txt，去除空行与重复行（保持首次出现顺序），写入新文件。"""
from pathlib import Path

SRC = Path("/Users/asura/Desktop/单号.txt")
DST = Path("/Users/asura/Desktop/单号_去重.txt")


def main() -> None:
    raw_lines = SRC.read_text(encoding="utf-8").splitlines()
    original_count = len(raw_lines)

    seen = set()
    deduped = []
    empty_count = 0
    for line in raw_lines:
        stripped = line.strip()
        if not stripped:
            empty_count += 1
            continue
        if stripped in seen:
            continue
        seen.add(stripped)
        deduped.append(stripped)

    DST.write_text("\n".join(deduped) + ("\n" if deduped else ""), encoding="utf-8")

    deduped_count = len(deduped)
    removed_dup = original_count - empty_count - deduped_count

    print(f"原始行数        : {original_count}")
    print(f"空行数（已忽略）: {empty_count}")
    print(f"去重后行数      : {deduped_count}")
    print(f"去除的重复行数  : {removed_dup}")
    print(f"输出文件        : {DST}")


if __name__ == "__main__":
    main()
