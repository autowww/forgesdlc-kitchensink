"""Shared helpers for spatial category showcase pages."""
from __future__ import annotations


def behavior_callout(classes: str, behavior: str) -> str:
    return (
        f'<div class="forge-callout forge-callout-surface mt-3">'
        f'<p class="callout-label">Expected behavior</p>'
        f'<p class="mb-1"><code>{classes}</code></p>'
        f'<p class="mb-0 forge-support">{behavior}</p></div>'
    )


SPATIAL_CSS = '<link rel="stylesheet" href="assets/ks-spatial.css">'

SPATIAL_JS_POINTER = [
    "assets/ks-pointer-depth.js",
    "assets/ks-tilt-tiles.js",
]

SPATIAL_JS_CUBE = [
    "assets/ks-spatial-cube.js",
]

SPATIAL_JS_RAIL = [
    "assets/ks-spatial-rail.js",
]

SPATIAL_JS_SCROLL = [
    "assets/ks-spatial-scroll.js",
]
