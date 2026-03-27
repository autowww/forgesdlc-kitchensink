"""Showcase: living background + motion system (landing layout demo)."""
from __future__ import annotations

import html
import json
from pathlib import Path

_REPO = Path(__file__).resolve().parent.parent.parent
_PRESETS = _REPO / "assets" / "motion-presets" / "living-archetype-presets.json"


def _presets_table() -> str:
    data = json.loads(_PRESETS.read_text(encoding="utf-8"))
    rows: list[str] = []
    for key, spec in sorted((data.get("archetypes") or {}).items(), key=lambda x: x[0]):
        label = html.escape(str(spec.get("label") or key), quote=False)
        motif = spec.get("motif_file")
        motif_cell = html.escape(str(motif), quote=False) if motif else "—"
        notes = html.escape(str(spec.get("notes") or ""), quote=False)
        rows.append(
            f"<tr><td><code>{html.escape(key, quote=False)}</code></td>"
            f"<td>{label}</td><td><code>{motif_cell}</code></td><td>{notes}</td></tr>"
        )
    return (
        "<table class='table table-sm table-dark forge-support' style='font-size:0.85rem'>"
        "<thead><tr><th>Archetype</th><th>Label</th><th>Motif file</th><th>Notes</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table>"
    )


PAGE = {
    "slug": "living-background",
    "title": "Living background system",
    "intro": "Global SVG field, section archetypes, scroll/pointer scene — kitchensink-first.",
    "family": "Patterns",
    "layout": "landing",
    "living_background": True,
    "order": 68,
    "toc": [],
}


def hero_html() -> str:
    return """\
<div class="container py-4 px-3 px-xxl-5">
  <p class="section-label text-cyan mb-2">Patterns</p>
  <h1 class="font-display forge-gradient-text" style="font-size:clamp(1.75rem,4vw,2.75rem)">
    Living background &amp; motion
  </h1>
  <p class="forge-support mb-0" style="max-width:40rem">
    Reusable global field plus section motifs driven by <code>data-ks-living-archetype</code>.
    Audit: <code>docs/living-background-audit.md</code> in the repo;
    presets: <code>assets/motion-presets/living-archetype-presets.json</code>.
  </p>
</div>"""


def body_html(_pages: list[dict]) -> str:
    table = _presets_table()
    motif_file = {
        "narrative": "narrative-guides-01.svg",
        "process": "trace-flow-01.svg",
        "card_grid": "frame-card-grid-01.svg",
        "cta": "converge-trace-01.svg",
    }
    bands = [
        ("narrative", "Narrative band", "Horizontal guide lines — low intensity."),
        ("process", "Process band", "Routed path with a single spark (SMIL)."),
        ("card_grid", "Card grid band", "Corner frames; calm interior."),
        ("cta", "CTA band", "Converging traces toward a focal point."),
    ]
    blocks: list[str] = []
    for arch, title, desc in bands:
        mf = motif_file[arch]
        src = html.escape(f"assets/svg/living/motifs/{mf}", quote=True)
        blocks.append(
            f'<section class="ks-living-section py-5" data-ks-living-archetype="{html.escape(arch, quote=False)}" '
            f'style="min-height:12rem;border-top:1px solid rgba(148,163,184,0.12)">'
            f'<div class="ks-section-bg ks-ambient-bg ks-bg-density--low" data-ks-bg-src="{src}" '
            f'aria-hidden="true"></div>'
            f'<div class="container"><h2 class="h4 text-white mb-2">{html.escape(title, quote=False)}</h2>'
            f'<p class="forge-support mb-0">{html.escape(desc, quote=False)}</p></div></section>'
        )
    return (
        f'<article class="doc-content px-3 px-xxl-5 pb-5"><div class="container py-4">'
        f"<h2 class=\"h5 text-amber mb-3\">Archetype → motif matrix</h2>{table}"
        f'<p class="forge-support mt-3 mb-0">Below: sample bands using the same asset paths as the product site generator.</p>'
        f"</div>{''.join(blocks)}</article>"
    )
