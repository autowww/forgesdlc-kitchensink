"""Handbook landing spatial bands — enterprise L1/L2 uplift (Hlr, Hlp, Hst, Dck)."""

from __future__ import annotations

from typing import Any, Mapping

try:
    from .components import e
    from .ks_hash_attrs import ks_hash_attrs
    from .nav_layout import render_editorial_peek_rail, render_editorial_peek_rail_item
except ImportError:
    from components import e
    from ks_hash_attrs import ks_hash_attrs
    from nav_layout import render_editorial_peek_rail, render_editorial_peek_rail_item

HASH_HLR = "Hlr"
HASH_HLP = "Hlp"
HASH_HST = "Hst"
HASH_DCK = "Dck"


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


def _forge_card(
    title: str,
    body: str,
    *,
    href: str = "",
    label: str = "",
    accent: str = "",
) -> str:
    label_html = f'<div class="card-label text-cyan">{e(label)}</div>' if label else ""
    accent_cls = f" card-{accent}" if accent in ("amber", "cyan") else ""
    inner = (
        f'{label_html}<h3 class="h5 mb-2">{e(title)}</h3>'
        f'<p class="forge-support mb-0">{e(body)}</p>'
    )
    if href:
        return (
            f'<a class="forge-card p-3 text-decoration-none d-block h-100{accent_cls}" '
            f'href="{e(href)}">{inner}</a>'
        )
    return f'<div class="forge-card p-3 h-100{accent_cls}">{inner}</div>'


def render_layer_card_rail(
    items: list[Mapping[str, Any]],
    *,
    aria_label: str = "Forge product layers",
) -> str:
    """Horizontal peek rail of layer/product cards (Hlr)."""
    cells = ""
    for item in items:
        layer = str(item.get("layer", ""))
        product = str(item.get("product", item.get("title", "")))
        role = str(item.get("role", item.get("body", "")))
        href = str(item.get("href", ""))
        cells += render_editorial_peek_rail_item(
            _forge_card(product, role, href=href, label=layer)
        )
    rail = render_editorial_peek_rail(cells)
    return (
        f'<section class="ks-handbook-landing-band mb-4" {_attrs(HASH_HLR, "handbook-layer-rail")} '
        f'aria-label="{e(aria_label)}">{rail}</section>'
    )


def render_role_path_rail(
    paths: list[Mapping[str, Any]],
    *,
    aria_label: str = "Choose your path",
) -> str:
    """Persona quick-path peek rail (Hlp / EPR)."""
    cells = ""
    for item in paths:
        persona = str(item.get("persona", item.get("label", "")))
        title = str(item.get("title", ""))
        body = str(item.get("body", item.get("hint", "")))
        href = str(item.get("href", ""))
        cells += render_editorial_peek_rail_item(
            _forge_card(title, body, href=href, label=persona, accent="amber")
        )
    rail = render_editorial_peek_rail(cells)
    return (
        f'<section class="ks-handbook-landing-band mb-4" {_attrs(HASH_HLP, "handbook-role-path-rail")} '
        f'aria-label="{e(aria_label)}">{rail}</section>'
    )


def render_trust_deck(
    cards: list[Mapping[str, Any]],
    *,
    aria_label: str = "Trust and boundaries",
) -> str:
    """Stacked trust/boundary cards (Dck)."""
    stack = ""
    for i, card in enumerate(cards):
        title = str(card.get("title", ""))
        body = str(card.get("body", ""))
        stack += (
            f'<div class="ks-deck--stack__card forge-card p-3" style="--ks-deck-i:{i}">'
            f'<h3 class="h6 mb-2">{e(title)}</h3>'
            f'<p class="forge-support mb-0">{e(body)}</p></div>'
        )
    return (
        f'<section class="ks-handbook-landing-band mb-4" aria-label="{e(aria_label)}">'
        f'<div class="ks-deck--stack ks-handbook-trust-deck" {_attrs(HASH_DCK, "card-deck-stack")}>'
        f"{stack}</div></section>"
    )


def render_steps_band(
    steps: list[Mapping[str, Any]],
    *,
    aria_label: str = "How it works",
) -> str:
    """Numbered steps strip for landing pages (Hst)."""
    items = ""
    for i, step in enumerate(steps, 1):
        title = str(step.get("title", step.get("label", "")))
        body = str(step.get("body", ""))
        items += (
            f'<li class="ks-handbook-steps__item">'
            f'<span class="ks-handbook-steps__num" aria-hidden="true">{i}</span>'
            f"<div><strong>{e(title)}</strong>"
            f'<p class="forge-support mb-0">{e(body)}</p></div></li>'
        )
    return (
        f'<section class="ks-handbook-landing-band mb-4" aria-label="{e(aria_label)}">'
        f'<ol class="ks-handbook-steps list-unstyled mb-0" {_attrs(HASH_HST, "handbook-steps-band")}>'
        f"{items}</ol></section>"
    )


_RENDERERS = {
    "layer_rail": lambda cfg: render_layer_card_rail(list(cfg.get("items", []))),
    "role_path_rail": lambda cfg: render_role_path_rail(list(cfg.get("paths", cfg.get("items", [])))),
    "trust_deck": lambda cfg: render_trust_deck(list(cfg.get("cards", []))),
    "steps_band": lambda cfg: render_steps_band(list(cfg.get("steps", []))),
}


def render_landing_block(block_type: str, config: Mapping[str, Any]) -> str:
    """Render one landing block from frontmatter config."""
    fn = _RENDERERS.get(block_type.strip())
    if fn is None:
        return ""
    return fn(dict(config))


def apply_landing_markers(body_html: str, blocks: Mapping[str, Any]) -> str:
    """Replace ``<!-- ks-landing:TYPE -->`` markers with rendered spatial bands."""
    if not blocks:
        return body_html
    out = body_html
    for block_type, config in blocks.items():
        marker = f"<!-- ks-landing:{block_type} -->"
        if marker not in out:
            continue
        cfg = dict(config) if isinstance(config, Mapping) else {}
        rendered = render_landing_block(str(block_type), cfg)
        out = out.replace(marker, rendered, 1)
    return out
