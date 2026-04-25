"""Live React primitives — bundle loads JSON via GET from ``showcase/data/react-primitives/``.

The browser bundle is built with Vite (see ``showcase-react-app/``). After ``npm run build`` there,
``python3 generator/build-showcase.py`` copies the IIFE and static JSON into ``showcase/``.
"""
from __future__ import annotations

PAGE = {
    "slug": "react-primitives-live",
    "title": "React primitives (live + JSON)",
    "intro": (
        "Interactive <code>TileDropdownControl</code> and <code>ForgeKeyValueGrid</code> "
        "fetched from static JSON (normal GET) under <code>data/react-primitives/</code>."
    ),
    "family": "Components",
    "layout": "showcase",
    "order": 3.5,
    "toc": [("sec-intro", "Overview"), ("sec-tile", "TileDropdownControl"), ("sec-kv", "Key / value grid")],
}


def extra_css() -> str:
    return (
        '  <link rel="stylesheet" href="assets/forge-react-primitives.css" />\n'
        '  <link rel="stylesheet" href="assets/tile-dropdown.css" />'
    )


def extra_js_paths() -> list[str]:
    return [
        "assets/react-primitives-demo.js",
    ]


def render() -> str:
    return """\
<section id="sec-intro" class="ks-section">
  <h2 class="ks-section-title">Overview</h2>
  <p class="forge-support mb-3">Static data lives in the <strong>source</strong> tree as
  <code>showcase-react-app/public/data/react-primitives/*.json</code> (Vite copies them into
  the build, then the showcase build copies to <code>showcase/data/react-primitives/</code>).
  The React bundle issues ordinary <code>GET</code> requests so you can test with devtools Network,
  or replace files while serving over HTTP and refresh.</p>
  <p class="forge-support mb-0">Endpoints are passed as
  <code>data-tile-endpoint</code> / <code>data-kv-endpoint</code> on the mount <code>div</code> so you
  can point at other JSON in the same origin without recompiling the bundle (edit this page&apos;s
  <code>render()</code> output and re-run <code>build-showcase.py</code> only).</p>
</section>
<div id="ks-react-primitives-root"
  class="mb-4"
  data-tile-endpoint="data/react-primitives/tile-dropdown-options.json"
  data-kv-endpoint="data/react-primitives/metadata-kv.json"
  aria-label="React primitives live mount"
  lang="en">
  <p class="forge-support" role="status" style="min-height:1.5em">If this line stays visible, the
  IIFE did not run — from repo root, run <code>(cd showcase-react-app &amp;&amp; npm ci &amp;&amp; npm run
  build)</code> then <code>python3 generator/build-showcase.py</code>. See
  <code>showcase-react-app/README.md</code>.</p>
</div>
"""
