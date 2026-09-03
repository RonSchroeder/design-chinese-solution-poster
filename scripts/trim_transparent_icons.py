#!/usr/bin/env python3

import argparse
from pathlib import Path

from PIL import Image


def sources(path: Path):
    if path.is_file():
        yield path
        return
    yield from sorted(path.glob("*.png"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Crop transparent icon margins and add proportional safe padding.")
    parser.add_argument("source", type=Path, help="Transparent PNG or directory")
    parser.add_argument("output", type=Path, help="Output directory")
    parser.add_argument("--padding-ratio", type=float, default=0.08)
    parser.add_argument("--min-padding", type=int, default=8)
    args = parser.parse_args()

    if not args.source.exists():
        raise SystemExit(f"Source not found: {args.source}")
    args.output.mkdir(parents=True, exist_ok=True)

    count = 0
    for source in sources(args.source):
        image = Image.open(source).convert("RGBA")
        bounds = image.getchannel("A").getbbox()
        if bounds is None:
            print(f"Skipped fully transparent image: {source.name}")
            continue
        cropped = image.crop(bounds)
        padding = max(args.min_padding, round(max(cropped.size) * args.padding_ratio))
        canvas = Image.new(
            "RGBA",
            (cropped.width + padding * 2, cropped.height + padding * 2),
            (0, 0, 0, 0),
        )
        canvas.paste(cropped, (padding, padding))
        destination = args.output / f"{source.stem}.png"
        canvas.save(destination)
        print(f"Trimmed {source.name}: {image.size} -> {canvas.size}")
        count += 1
    if count == 0:
        raise SystemExit("No non-empty transparent PNG images found")


if __name__ == "__main__":
    main()

