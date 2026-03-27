#!/usr/bin/env python3
"""Emit Fourier FORGE spectral SVG assets (static + slow-animated variant).

Each horizontal trace is a finite sum of sinusoids (Fourier-style partial sum),
masked into the word FORGE. Run from repo root:

  python3 generator/scripts/gen_bg_fourier_forge_spectral.py
"""
from __future__ import annotations

import math
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
OUT_STATIC = REPO / "assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-01.svg"
OUT_ANIM = REPO / "assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg"

# >1.0 speeds up SMIL loops on the animated asset (shorter dur / begin).
ANIM_SPEED = 2.5

W, H = 800, 450
X0, X1 = 0, 800
DX = 5
BASE_Y = 112.0
ROW_GAP = 5.35
HARMS = (1, 2, 3, 4, 5, 6)
AMPS = (5.8, 2.4, 2.9, 1.5, 1.1, 0.75)
STROKES = (
    'color-mix(in srgb, var(--forge-cyan, #06B6D4) 44%, transparent)',
    'color-mix(in srgb, var(--forge-amber, #F59E0B) 40%, transparent)',
    'color-mix(in srgb, var(--forge-emerald, #10B981) 36%, transparent)',
)


def row_path(y0: float, row: int) -> str:
    parts: list[str] = []
    x = float(X0)
    phis = [((row * 47 + h * 19) % 628) / 100.0 for h in HARMS]
    y = y0
    for _f, a, p in zip(HARMS, AMPS, phis):
        y += a * math.sin(2 * math.pi * _f * x / W + p)
    parts.append(f"M{x:.1f},{y:.2f}")
    x = X0 + DX
    while x <= X1 + 0.01:
        y = y0
        for _f, a, p in zip(HARMS, AMPS, phis):
            y += a * math.sin(2 * math.pi * _f * x / W + p)
        parts.append(f"L{x:.1f},{y:.2f}")
        x += DX
    return "".join(parts)


def collect_rows() -> list[tuple[str, str, int]]:
    rows: list[tuple[str, str, int]] = []
    y = BASE_Y
    r = 0
    while y < 338.0:
        stroke = STROKES[r % len(STROKES)]
        rows.append((row_path(y, r), stroke, r))
        y += ROW_GAP
        r += 1
    return rows


def backdrop_block(slow: bool = False, *, anim_speed: float = 1.0) -> str:
    """Shared interference backdrop; slightly longer periods when slow=True."""
    m = 1.15 if slow else 1.0
    sp = anim_speed if slow else 1.0
    return f"""  <g fill="none" stroke-linecap="round" opacity="0.13">
    <path d="M0,120 Q200,80 400,120 T800,120" stroke="color-mix(in srgb, var(--forge-cyan, #06B6D4) 55%, transparent)" stroke-width="1.6">
      <animateTransform attributeName="transform" type="translate" values="0,0; -140,0; 0,0" dur="{90 * m / sp:.1f}s" repeatCount="indefinite" calcMode="linear"/>
    </path>
    <path d="M0,300 Q200,340 400,300 T800,300" stroke="color-mix(in srgb, var(--forge-amber, #F59E0B) 50%, transparent)" stroke-width="1.5">
      <animateTransform attributeName="transform" type="translate" values="0,0; 120,0; 0,0" dur="{78 * m / sp:.1f}s" repeatCount="indefinite" calcMode="linear"/>
    </path>
    <path d="M0,210 Q266,170 532,210 T800,210" stroke="color-mix(in srgb, var(--forge-emerald, #10B981) 45%, transparent)" stroke-width="1.35">
      <animateTransform attributeName="transform" type="translate" values="0,0; 90,0; 0,0" dur="{105 * m / sp:.1f}s" repeatCount="indefinite" calcMode="linear"/>
    </path>
    <path d="M0,360 Q266,320 532,360 T800,360" stroke="color-mix(in srgb, var(--forge-text-3, #708090) 40%, transparent)" stroke-width="1.2">
      <animateTransform attributeName="transform" type="translate" values="0,0; -70,0; 0,0" dur="{112 * m / sp:.1f}s" repeatCount="indefinite" calcMode="linear"/>
    </path>
  </g>"""


def masked_block(
    rows: list[tuple[str, str, int]],
    *,
    mask_id: str,
    animated: bool,
    anim_speed: float = 1.0,
) -> str:
    if not animated:
        paths = "\n    ".join(
            f'<path d="{d}" stroke="{s}" stroke-width="1.12"/>' for d, s, _ in rows
        )
        return f"""  <g mask="url(#{mask_id})" fill="none" stroke-linecap="round">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0; -55,0; 0,0" dur="96s" repeatCount="indefinite" calcMode="linear"/>
    {paths}
    </g>
  </g>"""

    sp = anim_speed
    pieces: list[str] = []
    for d, s, r in rows:
        dur = (118 + (r % 9) * 7) / sp
        begin = -(r * 4.15) / sp
        amp = 26 + (r % 5) * 4
        pieces.append(
            f"""    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0; {amp},0; 0,0" dur="{dur:.2f}s" begin="{begin:.3f}s" repeatCount="indefinite" calcMode="linear"/>
      <path d="{d}" stroke="{s}" stroke-width="1.12"/>
    </g>"""
        )
    inner = "\n".join(pieces)
    gdur = 118.0 / sp
    bdur = 186.0 / sp
    return f"""  <g mask="url(#{mask_id})" fill="none" stroke-linecap="round">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0; -48,0; 0,0" dur="{gdur:.2f}s" repeatCount="indefinite" calcMode="linear"/>
      <animateTransform attributeName="transform" type="translate" additive="sum" values="0,0; 0,-8; 0,0" dur="{bdur:.2f}s" repeatCount="indefinite" calcMode="linear"/>
{inner}
    </g>
  </g>"""


def build_svg(*, animated: bool) -> str:
    rows = collect_rows()
    if animated:
        title = "Fourier spectral FORGE (animated)"
        desc = (
            "Same harmonic sums as the static asset; each row drifts horizontally on a "
            "staggered SMIL loop so the masked lettering shimmers. Global shear and "
            "vertical breathe reinforce the interference metaphor."
        )
        mask_id = "fourier-forge-mask-anim"
        bd = backdrop_block(slow=True, anim_speed=ANIM_SPEED)
        masked = masked_block(
            rows, mask_id=mask_id, animated=True, anim_speed=ANIM_SPEED
        )
    else:
        title = "Fourier spectral FORGE"
        desc = (
            "Horizontal curves are sums of sine harmonics (Joseph Fourier). They are masked "
            "into the word FORGE; the backdrop suggests detuned wave interference as used in "
            "signal analysis and transform coding."
        )
        mask_id = "fourier-forge-mask"
        bd = backdrop_block(slow=False)
        masked = masked_block(rows, mask_id=mask_id, animated=False)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" role="img">
  <title>{title}</title>
  <desc>{desc}</desc>
  <defs>
    <mask id="{mask_id}">
      <rect width="{W}" height="{H}" fill="black"/>
      <text x="400" y="278" font-size="120" font-weight="900" font-family="system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', sans-serif" text-anchor="middle" fill="white" letter-spacing="-0.03em">FORGE</text>
    </mask>
  </defs>
  <rect width="{W}" height="{H}" fill="none"/>
{bd}
{masked}
</svg>
"""


def main() -> None:
    OUT_STATIC.parent.mkdir(parents=True, exist_ok=True)
    OUT_STATIC.write_text(build_svg(animated=False), encoding="utf-8")
    print(f"Wrote {OUT_STATIC.relative_to(REPO)}")
    OUT_ANIM.write_text(build_svg(animated=True), encoding="utf-8")
    print(f"Wrote {OUT_ANIM.relative_to(REPO)}")


if __name__ == "__main__":
    main()
