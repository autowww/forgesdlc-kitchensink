"""Overlays & transitions — command palette, bottom sheet, view transitions."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from nav_layout import (  # noqa: E402
    render_bottom_sheet,
    render_command_palette,
    render_view_transition_demo,
)

PAGE = {
    "slug": "overlays-transitions",
    "title": "Overlays & Transitions",
    "intro": "Command palette, bottom sheet, and View Transitions API patterns.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8.6,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-command-palette", "Command palette"),
        ("sec-bottom-sheet", "Bottom sheet"),
        ("sec-view-transition-hero", "View transition hero"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/ks-nav-layout.css">'


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-nav-shared.js",
        "assets/ks-command-palette.js",
        "assets/ks-bottom-sheet.js",
        "assets/ks-view-transitions.js",
    ]


def _bc(classes: str, behavior: str) -> str:
    return (
        f'<div class="forge-callout forge-callout-surface mt-3">'
        f'<p class="callout-label">Expected behavior</p>'
        f'<p class="mb-1"><code>{classes}</code></p>'
        f'<p class="mb-0 forge-support">{behavior}</p></div>'
    )


def render() -> str:
    return f"""\
<div class="forge-callout forge-callout-cyan mb-4" id="sec-intro">
  <p class="callout-label mb-1">Nav & layout pack</p>
  <p class="mb-0">Overlay primitives with focus traps and reduced-motion guards.</p>
</div>

<section id="sec-command-palette" class="ks-section">
  <h2 class="ks-section-title">Command palette</h2>
  {render_command_palette()}
  {_bc("ks-command-palette", "Open with button or / key; Escape closes overlay.")}
</section>

<section id="sec-bottom-sheet" class="ks-section">
  <h2 class="ks-section-title">Bottom sheet</h2>
  {render_bottom_sheet()}
  {_bc("ks-bottom-sheet", "Slide-up panel with backdrop dismiss.")}
</section>

<section id="sec-view-transition-hero" class="ks-section">
  <h2 class="ks-section-title">View transition hero</h2>
  {render_view_transition_demo()}
  {_bc("ks-view-transition", "Uses View Transitions API when supported; instant swap under reduced motion.")}
</section>
"""
