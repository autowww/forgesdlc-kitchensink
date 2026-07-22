"""Layout shells — chapter progress, split-pane resizer."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from nav_layout import render_chapter_progress, render_split_pane_resizer  # noqa: E402

PAGE = {
    "slug": "layout-shells",
    "title": "Layout Shells",
    "intro": "Reading progress and resizable split panes for handbook layouts.",
    "family": "Patterns",
    "layout": "showcase",
    "order": 8.5,
    "toc": [
        ("sec-intro", "Overview"),
        ("sec-chapter-progress", "Chapter progress"),
        ("sec-split-pane-resizer", "Split pane resizer"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/ks-nav-layout.css">'


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-nav-shared.js",
        "assets/ks-chapter-progress.js",
        "assets/ks-split-pane.js",
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
  <p class="mb-0">Specs: <code>docs/design/nav-layout/effects/</code> ·
  Verification: <code>tools/nav-layout-verifier/</code></p>
</div>

<section id="sec-chapter-progress" class="ks-section">
  <h2 class="ks-section-title">Chapter progress</h2>
  {render_chapter_progress()}
  {_bc("ks-chapter-progress", "Scroll updates reading progress bar width.")}
</section>

<section id="sec-split-pane-resizer" class="ks-section">
  <h2 class="ks-section-title">Split pane resizer</h2>
  {render_split_pane_resizer()}
  {_bc("ks-split-pane", "Drag gutter to resize primary and secondary columns.")}
</section>
"""
