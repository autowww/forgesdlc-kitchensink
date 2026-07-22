"""Nav & layout KS component emitters — hash-governed HTML fragments."""
from __future__ import annotations

try:
    from .components import e, render_breadcrumbs
    from .ks_hash_attrs import ks_hash_attrs
except ImportError:
    from components import e, render_breadcrumbs
    from ks_hash_attrs import ks_hash_attrs

HASH_SSD = "Ssd"
HASH_STC = "Stc"
HASH_CPB = "Cpb"
HASH_BDT = "Bdt"
HASH_MNS = "Mns"
HASH_MMG = "Mmg"
HASH_SVC = "Svc"
HASH_SWZ = "Swz"
HASH_PGT = "Pgt"
HASH_FCS = "Fcs"
HASH_GCB = "Gcb"
HASH_DST = "Dst"
HASH_SPR = "Spr"
HASH_AJM = "Ajm"
HASH_TSW = "Tsw"
HASH_SAB = "Sab"
HASH_CPS = "Cps"
HASH_BSC = "Bsc"
HASH_VTH = "Vth"
HASH_EPR = "Epr"


def _attrs(hash_id: str, name: str) -> str:
    return ks_hash_attrs(hash_id, "component", name)


def render_sticky_section_dock(*, dock_id: str = "ksSectionDock") -> str:
    """Section swimlane dock shell + demo sections."""
    sections = "".join(
        f'<section class="ks-nav-dock-demo__section" data-fs-section-lane '
        f'data-fs-lane-heading="h2" id="dock-sec-{i}">'
        f'<h2>Section {i}</h2><p class="forge-support">Scroll to collapse titles into dock.</p></section>'
        for i in range(1, 5)
    )
    return (
        f'<div class="ks-nav-dock" {_attrs(HASH_SSD, "sticky-section-dock")}>'
        f'<div class="fs-section-swimlanes" id="{e(dock_id)}" role="navigation" '
        f'aria-label="Section dock"></div>'
        f'<div class="ks-nav-dock-demo">{sections}</div></div>'
    )


def render_scroll_spy_toc(
    toc: list[tuple[str, str]] | None = None,
    *,
    nav_id: str = "ks-scroll-spy-toc",
) -> str:
    items = toc or [
        ("spy-a", "Introduction"),
        ("spy-b", "Governance"),
        ("spy-c", "Verification"),
    ]
    links = "".join(
        f'<a class="nav-link" href="#{e(hid)}">{e(label)}</a>' for hid, label in items
    )
    sections = "".join(
        f'<section class="ks-section" id="{e(hid)}"><h3>{e(label)}</h3>'
        f'<p class="forge-support">Scroll spy highlights matching ToC link.</p></section>'
        for hid, label in items
    )
    return (
        f'<div class="ks-scroll-spy-toc" data-ks-scroll-spy {_attrs(HASH_STC, "scroll-spy-toc")}>'
        f'<nav class="forge-toc ks-scroll-spy-toc__rail" id="{e(nav_id)}" aria-label="On this page">'
        f'<p class="toc-title mb-2">On this page</p>{links}</nav>'
        f'<div class="ks-scroll-spy-toc__content">{sections}</div></div>'
    )


def render_chapter_progress(*, progress_id: str = "ks-chapter-progress") -> str:
    return (
        f'<div class="ks-chapter-progress" id="{e(progress_id)}" data-ks-chapter-progress '
        f'{_attrs(HASH_CPB, "chapter-progress")}>'
        f'<div class="ks-chapter-progress__track" aria-hidden="true">'
        f'<div class="ks-chapter-progress__bar"></div></div>'
        f'<span class="ks-chapter-progress__label forge-support">Reading progress</span></div>'
    )


def render_breadcrumb_depth(
    crumbs: list[tuple[str | None, str]] | None = None,
) -> str:
    items = crumbs or [
        ("#", "Handbook"),
        ("#", "Patterns"),
        (None, "Current chapter"),
    ]
    inner = render_breadcrumbs(items)
    return (
        f'<div class="ks-breadcrumb-depth" {_attrs(HASH_BDT, "breadcrumb-depth")}>'
        f"{inner}</div>"
    )


def render_mobile_nav_sheet(*, sheet_id: str = "ksMobileNavSheet") -> str:
    return (
        f'<div class="ks-mobile-nav-sheet" {_attrs(HASH_MNS, "mobile-nav-sheet")}>'
        f'<button class="btn btn-sm btn-outline-secondary" type="button" '
        f'data-bs-toggle="offcanvas" data-bs-target="#{e(sheet_id)}" '
        f'aria-controls="{e(sheet_id)}">Open nav sheet</button>'
        f'<div class="offcanvas offcanvas-start ks-mobile-nav-sheet__panel" tabindex="-1" '
        f'id="{e(sheet_id)}" aria-labelledby="{e(sheet_id)}Label">'
        f'<div class="offcanvas-header"><h5 class="offcanvas-title" id="{e(sheet_id)}Label">'
        f'Menu</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" '
        f'aria-label="Close"></button></div>'
        f'<div class="offcanvas-body"><nav class="nav flex-column">'
        f'<a class="nav-link active" href="#">Overview</a>'
        f'<a class="nav-link" href="#">Components</a>'
        f'<a class="nav-link" href="#">Patterns</a></nav></div></div></div>'
    )


def render_mega_menu(*, menu_id: str = "ksMegaMenu") -> str:
    return (
        f'<div class="ks-mega-menu" data-ks-mega-menu {_attrs(HASH_MMG, "mega-menu")}>'
        f'<button class="ks-mega-menu__trigger btn btn-sm btn-outline-secondary" type="button" '
        f'id="{e(menu_id)}-btn" aria-expanded="false" aria-controls="{e(menu_id)}-panel">'
        f'Products</button>'
        f'<div class="ks-mega-menu__panel" id="{e(menu_id)}-panel" role="region" '
        f'aria-labelledby="{e(menu_id)}-btn" hidden>'
        f'<div class="row g-3"><div class="col-6"><span class="section-label">Platform</span>'
        f'<a class="d-block" href="#">Forge SDLC</a><a class="d-block" href="#">Blueprints</a>'
        f'</div><div class="col-6"><span class="section-label">Tools</span>'
        f'<a class="d-block" href="#">Lenses</a><a class="d-block" href="#">Fleet</a>'
        f"</div></div></div></div>"
    )


def render_segmented_control(
    name: str,
    options: list[tuple[str, str]],
    *,
    checked_index: int = 0,
) -> str:
    opts = ""
    for i, (val, label) in enumerate(options):
        ch = " checked" if i == checked_index else ""
        opts += (
            f'<label class="ks-segmented__item"><input type="radio" name="{e(name)}" '
            f'value="{e(val)}"{ch} /><span>{e(label)}</span></label>'
        )
    return (
        f'<div class="ks-segmented" data-ks-segmented role="radiogroup" '
        f'{_attrs(HASH_SVC, "segmented-control")}>{opts}</div>'
    )


def render_stepper_wizard(*, wizard_id: str = "ks-stepper") -> str:
    steps = ["Plan", "Build", "Verify", "Ship"]
    items = ""
    for i, label in enumerate(steps, start=1):
        current = ' aria-current="step"' if i == 2 else ""
        items += (
            f'<li class="ks-stepper__step{" is-current" if i == 2 else ""}"{current}>'
            f'<span class="ks-stepper__num">{i}</span><span class="ks-stepper__label">{e(label)}</span></li>'
        )
    return (
        f'<div class="ks-stepper" data-ks-stepper id="{e(wizard_id)}" '
        f'{_attrs(HASH_SWZ, "stepper-wizard")}>'
        f'<ol class="ks-stepper__list">{items}</ol>'
        f'<div class="ks-stepper__actions mt-2">'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-step-prev>Back</button> '
        f'<button type="button" class="btn btn-sm btn-primary" data-ks-step-next>Next</button>'
        f"</div></div>"
    )


def render_pagination_tactile(*, page_id: str = "ks-pgt") -> str:
    return (
        f'<nav class="ks-pagination-tactile" aria-label="Pagination" id="{e(page_id)}" '
        f'{_attrs(HASH_PGT, "pagination-tactile")}>'
        f'<button type="button" class="ks-pagination-tactile__btn" aria-label="Previous">‹</button>'
        f'<button type="button" class="ks-pagination-tactile__btn is-active" aria-current="page">1</button>'
        f'<button type="button" class="ks-pagination-tactile__btn">2</button>'
        f'<button type="button" class="ks-pagination-tactile__btn">3</button>'
        f'<button type="button" class="ks-pagination-tactile__btn" aria-label="Next">›</button>'
        f"</nav>"
    )


def render_filter_chip_scroller(*, toolbar_id: str = "ks-fcs") -> str:
    chips = ["All", "Guides", "API", "Patterns", "Tools", "Release notes"]
    chip_html = "".join(
        f'<button type="button" class="ks-filter-chip{" is-active" if i == 0 else ""}" '
        f'aria-pressed="{"true" if i == 0 else "false"}">{e(c)}</button>'
        for i, c in enumerate(chips)
    )
    return (
        f'<div class="ks-filter-chip-scroller" id="{e(toolbar_id)}" data-ks-filter-chips '
        f'{_attrs(HASH_FCS, "filter-chip-scroller")}>'
        f'<div class="ks-filter-chip-scroller__track">{chip_html}</div></div>'
    )


def render_governed_combobox(*, combo_id: str = "ks-gcb") -> str:
    return (
        f'<div class="ks-governed-combobox forge-tree-combobox" id="{e(combo_id)}" '
        f'data-ks-combobox {_attrs(HASH_GCB, "governed-combobox")}>'
        f'<label class="form-label" for="{e(combo_id)}-input">Topic</label>'
        f'<input type="text" class="form-control" id="{e(combo_id)}-input" role="combobox" '
        f'aria-expanded="false" aria-controls="{e(combo_id)}-list" autocomplete="off" '
        f'placeholder="Search topics…" />'
        f'<ul class="ks-governed-combobox__list" id="{e(combo_id)}-list" role="listbox" hidden>'
        f'<li role="option" data-value="sdlc">SDLC</li>'
        f'<li role="option" data-value="pdlc">PDLC</li>'
        f'<li role="option" data-value="agents">Agents</li></ul></div>'
    )


def render_disclosure_stack(
    items: list[tuple[str, str]] | None = None,
) -> str:
    rows = items or [
        ("What is governed?", "Hashes, contracts, and oracles ship together."),
        ("How to verify?", "Run nav-layout-verifier against showcase HTML."),
    ]
    panels = ""
    for i, (title, body) in enumerate(rows):
        open_suffix = " open" if i == 0 else ""
        panels += (
            '<details class="ks-disclosure-stack__item"' + open_suffix + ">"
            f"<summary>{e(title)}</summary><p class=\"forge-support mb-0\">{e(body)}</p></details>"
        )
    return (
        f'<div class="ks-disclosure-stack" {_attrs(HASH_DST, "disclosure-stack")}>{panels}</div>'
    )


def render_split_pane_resizer(*, pane_id: str = "ks-split-pane") -> str:
    return (
        f'<div class="ks-split-pane" id="{e(pane_id)}" data-ks-split-pane '
        f'{_attrs(HASH_SPR, "split-pane-resizer")}>'
        f'<div class="ks-split-pane__primary"><div class="forge-card p-3">'
        f'<span class="section-label">Primary</span><p class="mb-0 forge-support">Handbook content.</p>'
        f"</div></div>"
        f'<div class="ks-split-pane__gutter" role="separator" aria-orientation="vertical" '
        f'tabindex="0" aria-label="Resize panes"></div>'
        f'<div class="ks-split-pane__secondary"><div class="forge-card p-3">'
        f'<span class="section-label">Preview</span><p class="mb-0 forge-support">Live preview pane.</p>'
        f"</div></div></div>"
    )


def render_anchor_jump_menu(
    anchors: list[tuple[str, str]] | None = None,
) -> str:
    items = anchors or [
        ("jump-a", "Overview"),
        ("jump-b", "Features"),
        ("jump-c", "Pricing"),
    ]
    links = "".join(
        f'<a class="ks-anchor-jump__link" href="#{e(hid)}">{e(label)}</a>' for hid, label in items
    )
    sections = "".join(
        f'<section class="ks-section" id="{e(hid)}"><h3>{e(label)}</h3>'
        f'<p class="forge-support">Anchor target section.</p></section>'
        for hid, label in items
    )
    return (
        f'<div class="ks-anchor-jump" data-ks-anchor-jump {_attrs(HASH_AJM, "anchor-jump-menu")}>'
        f'<nav class="ks-anchor-jump__bar" aria-label="Page sections">{links}</nav>'
        f"{sections}</div>"
    )


def render_tab_swimlane_sync(*, sync_id: str = "ks-tab-swimlane") -> str:
    tabs = [("tab-1", "Discover"), ("tab-2", "Design"), ("tab-3", "Deliver")]
    tab_html = "".join(
        f'<button type="button" class="ks-tab-swimlane__tab{" is-active" if i == 0 else ""}" '
        f'data-ks-tab-target="#{e(hid)}" role="tab">{e(label)}</button>'
        for i, (hid, label) in enumerate(tabs)
    )
    sections = "".join(
        f'<section class="ks-tab-swimlane__section" id="{e(hid)}" data-fs-section-lane '
        f'data-fs-lane-heading="h2"><h2>{e(label)}</h2>'
        f'<p class="forge-support">Synced with tab swimlane.</p></section>'
        for hid, label in tabs
    )
    return (
        f'<div class="ks-tab-swimlane" id="{e(sync_id)}" data-ks-tab-swimlane '
        f'{_attrs(HASH_TSW, "tab-swimlane-sync")}>'
        f'<div class="fs-section-swimlanes ks-tab-swimlane__dock" role="navigation"></div>'
        f'<div class="ks-tab-swimlane__tabs" role="tablist">{tab_html}</div>'
        f"{sections}</div>"
    )


def render_sticky_action_bar(*, bar_id: str = "ks-sab") -> str:
    return (
        f'<div class="ks-sticky-action-bar" id="{e(bar_id)}" role="toolbar" '
        f'aria-label="Page actions" {_attrs(HASH_SAB, "sticky-action-bar")}>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary">Save draft</button>'
        f'<button type="button" class="btn btn-sm btn-primary">Publish</button></div>'
    )


def render_command_palette(*, palette_id: str = "ks-cps") -> str:
    return (
        f'<div class="ks-command-palette" data-ks-command-palette id="{e(palette_id)}" '
        f'{_attrs(HASH_CPS, "command-palette")}>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-cmd-open>'
        f"Open palette ( / )</button>"
        f'<div class="ks-command-palette__overlay" hidden>'
        f'<div class="ks-command-palette__dialog" role="dialog" aria-modal="true" '
        f'aria-label="Command palette">'
        f'<input type="search" class="form-control" placeholder="Search commands…" '
        f'aria-controls="{e(palette_id)}-list" />'
        f'<ul class="ks-command-palette__list" id="{e(palette_id)}-list" role="listbox">'
        f'<li role="option">Go to Handbook</li>'
        f'<li role="option">Run UX audit</li>'
        f'<li role="option">Deploy websites</li></ul></div></div></div>'
    )


def render_bottom_sheet(*, sheet_id: str = "ks-bsc") -> str:
    return (
        f'<div class="ks-bottom-sheet" data-ks-bottom-sheet {_attrs(HASH_BSC, "bottom-sheet")}>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary" data-ks-sheet-open>'
        f"Open bottom sheet</button>"
        f'<div class="ks-bottom-sheet__backdrop" hidden></div>'
        f'<div class="ks-bottom-sheet__panel" id="{e(sheet_id)}" role="dialog" '
        f'aria-modal="true" aria-label="Actions" hidden>'
        f'<div class="ks-bottom-sheet__handle" aria-hidden="true"></div>'
        f'<p class="mb-2 section-label">Quick actions</p>'
        f'<button type="button" class="btn btn-sm btn-primary w-100 mb-2">Share</button>'
        f'<button type="button" class="btn btn-sm btn-outline-secondary w-100" data-ks-sheet-close>'
        f"Close</button></div></div>"
    )


def render_view_transition_demo(*, demo_id: str = "ks-vth") -> str:
    return (
        f'<div class="ks-view-transition" data-ks-view-transition id="{e(demo_id)}" '
        f'{_attrs(HASH_VTH, "view-transition-hero")}>'
        f'<div class="ks-view-transition__hero forge-card p-4 mb-3">'
        f'<h3 class="ks-view-transition__title mb-0">Hero surface</h3></div>'
        f'<button type="button" class="btn btn-sm btn-primary" data-ks-vt-trigger>'
        f"Transition to detail</button>"
        f'<div class="ks-view-transition__detail forge-card p-4 mt-3" hidden>'
        f'<h3 class="ks-view-transition__title mb-0">Detail surface</h3></div></div>'
    )


def render_editorial_peek_rail(items_html: str) -> str:
    return (
        f'<div class="fs-rail fs-rail--peek fs-rail--cards ks-editorial-peek-rail" '
        f'data-ks-peek-rail {_attrs(HASH_EPR, "editorial-peek-rail")}>'
        f'<div class="fs-rail__scroller overflow-auto"><div class="fs-rail__track d-flex gap-3 py-2">'
        f"{items_html}</div></div>"
        f'<button type="button" class="ks-editorial-peek-rail__prev" aria-label="Scroll previous">‹</button>'
        f'<button type="button" class="ks-editorial-peek-rail__next" aria-label="Scroll next">›</button>'
        f"</div>"
    )


def render_editorial_peek_rail_item(card_html: str) -> str:
    return f'<div class="fs-rail__item flex-shrink-0" style="width:14rem">{card_html}</div>'


def render_fisheye_depth_nav(*, nav_id: str = "ksFisheyeNav") -> str:
    """Fisheye 3D parallax nav strip (Wave 2 Ifn)."""
    try:
        from .ks_hash_attrs import ks_hash_attrs
    except ImportError:
        from ks_hash_attrs import ks_hash_attrs
    attrs = ks_hash_attrs("Ifn", "component", "fisheye-depth-nav")
    links = (
        ("Overview", "#"),
        ("Controls", "spatial-controls.html"),
        ("Ambient", "spatial-ambient.html"),
        ("Rails", "spatial-rails.html"),
    )
    items = "".join(
        f'<a class="ks-nav--fisheye__link" href="{href}">{label}</a>' for label, href in links
    )
    return (
        f'<nav class="ks-nav--fisheye ks-pointer-depth" id="{nav_id}" {attrs} '
        f'data-ks-pointer-max="12" aria-label="Fisheye depth navigation">'
        f'<div class="ks-nav--fisheye__track">{items}</div></nav>'
    )
