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
HASH_HLF = "Hlf"
HASH_HLS = "Hls"
HASH_HES = "Hes"
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


def _component_card(item: Mapping[str, Any], *, default_accent: str = "") -> str:
    """Unified element tile — label, name, role, optional link."""
    label = str(item.get("label", item.get("layer", "")))
    name = str(item.get("name", item.get("product", item.get("title", ""))))
    role = str(item.get("role", item.get("body", "")))
    href = str(item.get("href", ""))
    accent = str(item.get("accent", default_accent))
    elem_id = str(item.get("id", ""))
    id_attr = f' id="{e(elem_id)}"' if elem_id else ""
    label_html = (
        f'<div class="ks-handbook-element-card__label card-label text-cyan">{e(label)}</div>'
        if label
        else ""
    )
    accent_cls = f" ks-handbook-element-card--{accent}" if accent in ("amber", "cyan") else ""
    link_html = (
        f'<span class="ks-handbook-element-card__link small text-cyan">Learn more</span>'
        if href
        else ""
    )
    inner = (
        f"{label_html}"
        f'<h4 class="ks-handbook-element-card__name h6 mb-1">{e(name)}</h4>'
        f'<p class="ks-handbook-element-card__role forge-support small mb-0">{e(role)}</p>'
        f"{link_html}"
    )
    if href:
        return (
            f'<a class="ks-handbook-element-card forge-card p-3 text-decoration-none d-block h-100{accent_cls}"'
            f'{id_attr} href="{e(href)}">{inner}</a>'
        )
    return (
        f'<article class="ks-handbook-element-card forge-card p-3 h-100{accent_cls}"{id_attr}>'
        f"{inner}</article>"
    )


def _stratum_element_count(stratum: Mapping[str, Any]) -> int:
    layout = str(stratum.get("layout", "")).strip().lower()
    if layout == "dual" or stratum.get("agent") or stratum.get("human"):
        return len(list(stratum.get("agent", []))) + len(list(stratum.get("human", [])))
    return len(list(stratum.get("components", [])))


def _render_stratum_panel(stratum: Mapping[str, Any]) -> str:
    layout = str(stratum.get("layout", "")).strip().lower()
    if layout == "dual" or stratum.get("agent") or stratum.get("human"):
        return _render_stratum_dual(
            list(stratum.get("agent", [])),
            list(stratum.get("human", [])),
            agent_heading=str(stratum.get("agent_heading", "Agent permissions")),
            human_heading=str(stratum.get("human_heading", "Human obligations")),
        )
    cells = "".join(
        f'<li class="ks-handbook-layer-stratum__cell">{_component_card(c)}</li>'
        for c in list(stratum.get("components", []))
    )
    return f'<ul class="ks-handbook-layer-stratum__grid list-unstyled mb-0">{cells}</ul>'


def _render_stratum_disclosure(
    stratum: Mapping[str, Any],
    *,
    index: int,
    open_default: bool = False,
    modifier: str = "",
    accordion_name: str = "forge-platform-strata",
    ks_hash: str = "",
    ks_name: str = "handbook-stratum-disclosure",
) -> str:
    title = str(stratum.get("stratum", stratum.get("title", "")))
    summary = str(stratum.get("summary", stratum.get("subtitle", stratum.get("lede", ""))))
    count = _stratum_element_count(stratum)
    count_label = f"{count} element{'s' if count != 1 else ''}"
    open_attr = " open" if open_default else ""
    layout = str(stratum.get("layout", "")).strip().lower()
    dual_cls = " ks-handbook-layer-stratum--dual" if layout == "dual" or stratum.get("agent") else ""
    hash_attr = f" {_attrs(ks_hash, ks_name)}" if ks_hash else ""
    return (
        f'<li class="ks-handbook-layer-stratum{modifier}{dual_cls}" style="--ks-stratum-i:{index}">'
        f'<details class="ks-handbook-stratum-disclosure{modifier}"{hash_attr} '
        f'name="{e(accordion_name)}"{open_attr}>'
        f'<summary class="ks-handbook-stratum-disclosure__summary">'
        f'<span class="ks-handbook-stratum-disclosure__text">'
        f'<span class="ks-handbook-stratum-disclosure__title">{e(title)}</span>'
        f'<span class="ks-handbook-stratum-disclosure__lede forge-support">{e(summary)}</span>'
        f"</span>"
        f'<span class="ks-handbook-stratum-disclosure__meta">'
        f'<span class="ks-handbook-stratum-disclosure__count">{e(count_label)}</span>'
        f'<span class="ks-handbook-stratum-disclosure__chevron" aria-hidden="true"></span>'
        f"</span>"
        f"</summary>"
        f'<div class="ks-handbook-stratum-disclosure__panel">{_render_stratum_panel(stratum)}</div>'
        f"</details></li>"
    )


def render_evidence_spine(
    components: list[Mapping[str, Any]],
    *,
    title: str = "Evidence spine",
    subtitle: str = "Continuous proof across every stratum — not a final step.",
    aria_label: str = "Evidence spine",
    expandable: bool = True,
    open_default: bool = True,
) -> str:
    """Cross-cutting evidence strip (Hes) — expandable disclosure when *expandable*."""
    if expandable:
        stratum = {
            "stratum": title,
            "summary": subtitle,
            "components": components,
        }
        return _render_stratum_disclosure(
            stratum,
            index=0,
            open_default=open_default,
            modifier=" ks-handbook-stratum-disclosure--evidence",
            ks_hash=HASH_HES,
            ks_name="handbook-evidence-spine",
        )
    tiles = "".join(
        f'<li class="ks-handbook-evidence-spine__item">{_component_card(c)}</li>'
        for c in components
    )
    header = ""
    if title or subtitle:
        header = (
            f'<header class="ks-handbook-evidence-spine__header mb-3">'
            f'<h3 class="h6 text-cyan mb-1">{e(title)}</h3>'
            f'<p class="forge-support small mb-0">{e(subtitle)}</p></header>'
        )
    return (
        f'<section class="ks-handbook-evidence-spine mb-4" {_attrs(HASH_HES, "handbook-evidence-spine")} '
        f'aria-label="{e(aria_label)}">{header}'
        f'<ul class="ks-handbook-evidence-spine__list list-unstyled mb-0">{tiles}</ul>'
        f"</section>"
    )


def _render_stratum_dual(
    agent_items: list[Mapping[str, Any]],
    human_items: list[Mapping[str, Any]],
    *,
    agent_heading: str = "Agent permissions",
    human_heading: str = "Human obligations",
) -> str:
    agent_cells = "".join(
        f'<li class="ks-handbook-layer-stratum__cell">{_component_card(c)}</li>'
        for c in agent_items
    )
    human_cells = "".join(
        f'<li class="ks-handbook-layer-stratum__cell">{_component_card(c, default_accent="amber")}</li>'
        for c in human_items
    )
    return (
        f'<div class="ks-handbook-layer-stratum__dual">'
        f'<div class="ks-handbook-layer-stratum__column">'
        f'<h4 class="ks-handbook-layer-stratum__column-title">{e(agent_heading)}</h4>'
        f'<ul class="ks-handbook-layer-stratum__grid list-unstyled mb-0">{agent_cells}</ul></div>'
        f'<div class="ks-handbook-layer-stratum__column">'
        f'<h4 class="ks-handbook-layer-stratum__column-title">{e(human_heading)}</h4>'
        f'<ul class="ks-handbook-layer-stratum__grid list-unstyled mb-0">{human_cells}</ul></div>'
        f"</div>"
    )


def render_layer_strata(
    strata: list[Mapping[str, Any]],
    *,
    evidence: Mapping[str, Any] | None = None,
    aria_label: str = "Forge operating strata",
    expandable: bool = True,
    open_first: bool = True,
) -> str:
    """Multi-component strata stack (Hls) — expandable disclosures per stratum."""
    accordion_name = "forge-platform-strata"
    bands = ""
    start_index = 0

    if evidence and expandable:
        ev_stratum = {
            "stratum": str(evidence.get("stratum", evidence.get("title", "Evidence spine"))),
            "summary": str(evidence.get("summary", evidence.get("subtitle", ""))),
            "components": list(evidence.get("components", [])),
        }
        bands += _render_stratum_disclosure(
            ev_stratum,
            index=0,
            open_default=open_first,
            modifier=" ks-handbook-stratum-disclosure--evidence",
            accordion_name=accordion_name,
            ks_hash=HASH_HES,
            ks_name="handbook-evidence-spine",
        )
        start_index = 1

    for i, stratum in enumerate(strata):
        if expandable:
            bands += _render_stratum_disclosure(
                stratum,
                index=i + start_index,
                open_default=False,
                accordion_name=accordion_name,
            )
        else:
            title = str(stratum.get("stratum", stratum.get("title", "")))
            subtitle = str(stratum.get("summary", stratum.get("subtitle", "")))
            header = (
                f'<header class="ks-handbook-layer-stratum__header">'
                f'<h3 class="h6 text-cyan mb-1">{e(title)}</h3>'
            )
            if subtitle:
                header += f'<p class="forge-support small mb-0">{e(subtitle)}</p>'
            header += "</header>"
            layout = str(stratum.get("layout", "")).strip().lower()
            modifier = " ks-handbook-layer-stratum--dual" if layout == "dual" or stratum.get("agent") else ""
            bands += (
                f'<li class="ks-handbook-layer-stratum{modifier}" style="--ks-stratum-i:{i}">'
                f"{header}{_render_stratum_panel(stratum)}</li>"
            )

    evidence_html = ""
    if evidence and not expandable:
        evidence_html = render_evidence_spine(
            list(evidence.get("components", [])),
            title=str(evidence.get("title", evidence.get("stratum", "Evidence spine"))),
            subtitle=str(evidence.get("summary", evidence.get("subtitle", ""))),
            expandable=False,
        )

    wrapper = (
        f'<ol class="ks-handbook-layer-strata ks-handbook-layer-strata--expandable list-unstyled mb-0">'
        if expandable
        else '<ol class="ks-handbook-layer-strata list-unstyled mb-0">'
    )

    return (
        f'<section class="ks-handbook-landing-band mb-4" {_attrs(HASH_HLS, "handbook-layer-strata")} '
        f'aria-label="{e(aria_label)}">'
        f"{evidence_html}"
        f"{wrapper}{bands}</ol>"
        f"</section>"
    )


def _layer_items(items: list[Mapping[str, Any]]) -> list[tuple[str, str, str, str]]:
    rows: list[tuple[str, str, str, str]] = []
    for item in items:
        layer = str(item.get("layer", ""))
        product = str(item.get("product", item.get("title", "")))
        role = str(item.get("role", item.get("body", "")))
        href = str(item.get("href", ""))
        rows.append((layer, product, role, href))
    return rows


def render_layer_flow_chart(
    items: list[Mapping[str, Any]],
    *,
    aria_label: str = "Forge product layers",
    layout: str = "flow",
) -> str:
    """Vertical layer flow or pyramid stack (Hlf) — same forge-card tiles, no horizontal rail."""
    mode = (layout or "flow").strip().lower()
    modifier = " ks-handbook-layer-flow--pyramid" if mode == "pyramid" else ""
    steps = ""
    rows = _layer_items(items)
    for i, (layer, product, role, href) in enumerate(rows):
        card = _forge_card(product, role, href=href, label=layer)
        connector = ""
        if i < len(rows) - 1:
            connector = (
                '<div class="ks-handbook-layer-flow__connector" aria-hidden="true">'
                '<span class="ks-handbook-layer-flow__arrow"></span></div>'
            )
        steps += (
            f'<li class="ks-handbook-layer-flow__step" style="--ks-layer-i:{i}">'
            f"{card}{connector}</li>"
        )
    return (
        f'<section class="ks-handbook-landing-band mb-4" {_attrs(HASH_HLF, "handbook-layer-flow")} '
        f'aria-label="{e(aria_label)}">'
        f'<ol class="ks-handbook-layer-flow list-unstyled mb-0{modifier}">{steps}</ol>'
        f"</section>"
    )


def render_layer_card_rail(
    items: list[Mapping[str, Any]],
    *,
    aria_label: str = "Forge product layers",
    layout: str = "rail",
) -> str:
    """Horizontal peek rail (Hlr) or vertical flow/pyramid when layout is set."""
    mode = (layout or "rail").strip().lower()
    if mode in ("flow", "pyramid", "stack"):
        return render_layer_flow_chart(items, aria_label=aria_label, layout=mode)
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
    "layer_rail": lambda cfg: render_layer_card_rail(
        list(cfg.get("items", [])),
        layout=str(cfg.get("layout", "rail")),
    ),
    "layer_flow": lambda cfg: render_layer_flow_chart(
        list(cfg.get("items", [])),
        layout=str(cfg.get("layout", "flow")),
    ),
    "layer_strata": lambda cfg: render_layer_strata(
        list(cfg.get("strata", [])),
        evidence=cfg.get("evidence") if isinstance(cfg.get("evidence"), Mapping) else None,
        expandable=bool(cfg.get("expandable", True)),
        open_first=bool(cfg.get("open_first", True)),
    ),
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
