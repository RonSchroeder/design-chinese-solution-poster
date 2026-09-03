#!/usr/bin/env python3

import argparse
from pathlib import Path

from PIL import Image


SUPPORTED = {".png", ".jpg", ".jpeg", ".webp"}


def sources(path: Path):
    if path.is_file():
        yield path
        return
    for item in sorted(path.iterdir()):
        if item.is_file() and item.suffix.lower() in SUPPORTED:
            yield item


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def remove_green(
    image: Image.Image,
    edge_start: int,
    full_key: int,
    min_green: int,
    ratio_start: float,
    ratio_full: float,
    despill_margin: int,
) -> Image.Image:
    rgba = image.convert("RGBA")
    output = Image.new("RGBA", rgba.size)
    keyed = []
    excess_denominator = max(1, full_key - edge_start)
    ratio_denominator = max(0.001, ratio_full - ratio_start)

    pixel_reader = getattr(rgba, "get_flattened_data", None)
    pixels = pixel_reader() if pixel_reader else rgba.getdata()
    for red, green, blue, alpha in pixels:
        green_excess = green - max(red, blue)
        green_ratio = green_excess / max(1, green)
        if green < min_green or green_excess <= 0:
            strength = 0.0
        else:
            excess_strength = smoothstep((green_excess - edge_start) / excess_denominator)
            ratio_strength = smoothstep((green_ratio - ratio_start) / ratio_denominator)
            strength = max(excess_strength, ratio_strength)

        new_alpha = round(alpha * (1.0 - strength))
        if new_alpha <= 1:
            keyed.append((0, 0, 0, 0))
            continue
        if strength > 0:
            neutral_green = min(green, max(red, blue) + despill_margin)
            green = round(green * (1.0 - strength) + neutral_green * strength)
        keyed.append((red, green, blue, new_alpha))

    output.putdata(keyed)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove a pure-green ImageGen background while protecting pale neutral fills.")
    parser.add_argument("source", type=Path, help="Source image or directory")
    parser.add_argument("output", type=Path, help="Output directory")
    parser.add_argument("--edge-start", type=int, default=8, help="Absolute green excess where soft transparency begins")
    parser.add_argument("--full-key", type=int, default=96, help="Absolute green excess treated as fully keyed")
    parser.add_argument("--min-green", type=int, default=20, help="Minimum green channel eligible for keying")
    parser.add_argument("--ratio-start", type=float, default=0.05, help="Relative green dominance where soft transparency begins")
    parser.add_argument("--ratio-full", type=float, default=0.35, help="Relative green dominance treated as fully keyed")
    parser.add_argument("--despill-margin", type=int, default=8, help="Maximum green kept above red/blue on keyed edges")
    args = parser.parse_args()

    if not args.source.exists():
        raise SystemExit(f"Source not found: {args.source}")
    args.output.mkdir(parents=True, exist_ok=True)

    count = 0
    for source in sources(args.source):
        result = remove_green(
            Image.open(source),
            args.edge_start,
            args.full_key,
            args.min_green,
            args.ratio_start,
            args.ratio_full,
            args.despill_margin,
        )
        destination = args.output / f"{source.stem}.png"
        result.save(destination)
        bounds = result.getchannel("A").getbbox()
        print(f"Keyed {source.name} -> {destination.name}; alpha_bounds={bounds}")
        count += 1
    if count == 0:
        raise SystemExit("No supported source images found")


if __name__ == "__main__":
    main()
