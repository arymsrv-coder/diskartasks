"""Vertical (1080x1920) caption overlays from the same CAPS list, wrapped to two lines max, placed at ~70% height."""
import os
from PIL import Image, ImageDraw, ImageFont
from captions import CAPS
W, H = 1080, 1920
os.makedirs("clips/caps_v", exist_ok=True)
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 58)
Image.new("RGBA", (W, H), (0, 0, 0, 0)).save("clips/caps_v/blank.png")
def wrap(d, text, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines
lines_out, t_prev = [], 0.0
def gap(d):
    if d > 0.001: lines_out.append(f"file 'blank.png'\nduration {d:.3f}")
for i, (a, b, t) in enumerate(CAPS):
    gap(a - t_prev)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ls = wrap(d, t, W - 140); lh = 74
    bw = max(d.textlength(l, font=font) for l in ls); bh = lh * len(ls)
    y0 = 1330 - bh // 2
    d.rounded_rectangle([(W - bw) / 2 - 32, y0 - 16, (W + bw) / 2 + 32, y0 + bh + 12], radius=26, fill=(8, 22, 26, 215))
    for k, l in enumerate(ls):
        d.text(((W - d.textlength(l, font=font)) / 2, y0 + k * lh), l, font=font, fill=(255, 255, 255, 255))
    im.save(f"clips/caps_v/c{i:03d}.png")
    lines_out.append(f"file 'c{i:03d}.png'\nduration {b - a:.3f}"); t_prev = b
gap(264.9 - t_prev); lines_out.append("file 'blank.png'")
open("clips/caps_v/list.txt", "w").write("\n".join(lines_out) + "\n"); print("ok")
