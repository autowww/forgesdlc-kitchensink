"""Navigation page — sidebar nav demo, flow diagram, breadcrumbs, nav-layout primitives."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "components"))

from nav_layout import (  # noqa: E402
    render_anchor_jump_menu,
    render_breadcrumb_depth,
    render_mega_menu,
    render_mobile_nav_sheet,
    render_scroll_spy_toc,
    render_sticky_section_dock,
    render_tab_swimlane_sync,
)

PAGE = {
    "slug": "navigation",
    "title": "Navigation",
    "intro": "Sidebar nav patterns, flow diagrams, breadcrumbs, and nav-layout primitives.",
    "family": "Components",
    "layout": "showcase",
    "order": 4,
    "toc": [
        ("sec-sidebar", "Sidebar nav"),
        ("sec-workspace-lens", "Workspace Lens"),
        ("sec-flow", "Flow diagram"),
        ("sec-sticky-section-dock", "Sticky section dock"),
        ("sec-scroll-spy-toc", "Scroll-spy TOC"),
        ("sec-breadcrumb-depth", "Breadcrumb depth"),
        ("sec-mobile-nav-sheet", "Mobile nav sheet"),
        ("sec-mega-menu", "Mega menu"),
        ("sec-anchor-jump-menu", "Anchor jump menu"),
        ("sec-tab-swimlane-sync", "Tab swimlane sync"),
    ],
}


def extra_css() -> str:
    return (
        '  <link rel="stylesheet" href="assets/workspace-lens.css" />\n'
        '  <link rel="stylesheet" href="assets/ks-nav-layout.css" />\n'
        '  <link rel="stylesheet" href="assets/fs-section-swimlanes.css" />\n'
    )


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-nav-shared.js",
        "assets/ks-docs-toc-scrollspy.js",
        "assets/ks-mega-menu.js",
        "assets/ks-anchor-jump.js",
        "assets/ks-tab-swimlane.js",
        "assets/ks-section-swimlanes.js",
    ]


def _bc(classes: str, behavior: str) -> str:
    return (
        f'<div class="forge-callout forge-callout-surface mt-3">'
        f'<p class="callout-label">Expected behavior</p>'
        f'<p class="mb-1"><code>{classes}</code></p>'
        f'<p class="mb-0 forge-support">{behavior}</p></div>'
    )

_CHEVRON = (
    '<svg class="doc-sidebar-chevron" width="14" height="14" viewBox="0 0 16 16" '
    'fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 '
    '.708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 '
    '2.354a.5.5 0 0 1 0-.708z"/></svg>'
)


def render() -> str:
    return f"""\
<section id="sec-sidebar" class="ks-section">
  <h2 class="ks-section-title">Sidebar Navigation</h2>
  <p class="forge-support mb-3">Two sidebar patterns: classic <code>nav-rail</code> and collapsible <code>doc-sidebar-*</code>.</p>
  <div class="row g-3">
    <div class="col-md-6">
      <div class="forge-sidebar p-3" style="border-radius:12px;border:1px solid var(--forge-border);min-height:280px">
        <div class="forge-brand mb-3"><span class="brand-icon">F</span> Forge Handbook</div>
        <p class="nav-section-label">Chapters</p>
        <nav class="nav-rail">
          <a class="nav-link active" href="#">Overview &amp; roles</a>
          <a class="nav-link" href="#">Phases A–F</a>
          <a class="nav-link" href="#">Definition of done</a>
          <a class="nav-link" href="#">Change control</a>
        </nav>
        <a class="nav-group-toggle mt-2" href="#">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          Methodologies
        </a>
        <div class="nav-sub-group">
          <a class="nav-sub-link active" href="#">Scrum</a>
          <a class="nav-sub-link" href="#">Kanban</a>
          <a class="nav-sub-link" href="#">XP</a>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="forge-sidebar p-3" style="border-radius:12px;border:1px solid var(--forge-border);min-height:280px">
        <p class="nav-section-label">Collapsible sidebar</p>
        <a class="doc-sidebar-link active" href="#">Handbook home</a>
        <a class="doc-sidebar-link" href="#">Overview &amp; roles</a>
        <div class="doc-sidebar-group">
          <div class="doc-sidebar-row">
            <button type="button" class="doc-sidebar-toggle" aria-label="Toggle">{_CHEVRON}</button>
            <a href="#" class="doc-sidebar-heading">Spec-driven</a>
          </div>
          <div class="doc-sidebar-children">
            <a class="doc-sidebar-sublink" href="#">Overview</a>
            <a class="doc-sidebar-sublink active" href="#">SDD schema</a>
            <a class="doc-sidebar-sublink" href="#">Ceremonies</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.nav-rail</code> · <code>.nav-link</code> · <code>.doc-sidebar-group</code> · <code>.doc-sidebar-toggle</code> · <code>.doc-sidebar-children</code></p>
  </div>
</section>

<section id="sec-workspace-lens" class="ks-section">
  <h2 class="ks-section-title">Workspace Lens</h2>
  <p class="forge-support mb-3">
    Primary chrome for switching cognitive mode (<strong>Flow</strong> vs <strong>Artifacts</strong>) in Lenses Studio.
    Classes: <code>.ks-workspace-lens</code> and children. Popover can use <code>&lt;details&gt;</code> (showcase) or React state (app).
  </p>
  <div class="row g-4 align-items-start">
    <div class="col-lg-6">
      <p class="nav-section-label mb-2">Closed trigger (open the panel to choose)</p>
      <details class="ks-workspace-lens">
        <summary class="ks-workspace-lens__trigger" aria-label="Workspace navigation mode">
          <span class="ks-workspace-lens__eyebrow" style="display:inline;margin-right:0.35rem">Workspace Lens</span>
          <span class="ks-workspace-lens__trigger-label">Flow</span>
        </summary>
        <div class="ks-workspace-lens__panel">
          <p class="ks-workspace-lens__eyebrow">Workspace Lens</p>
          <div class="ks-workspace-lens__segments" role="group" aria-label="Lens mode">
            <button type="button" class="ks-workspace-lens__segment ks-workspace-lens__segment--active">
              <span class="ks-workspace-lens__segment-title">Flow</span>
              <span class="ks-workspace-lens__segment-desc">Follow work from idea to release</span>
            </button>
            <button type="button" class="ks-workspace-lens__segment">
              <span class="ks-workspace-lens__segment-title">Artifacts</span>
              <span class="ks-workspace-lens__segment-desc">Browse plans, projects, docs, and sites directly</span>
            </button>
          </div>
          <p class="ks-workspace-lens__remember">Your choice is saved in this browser for next visit.</p>
        </div>
      </details>
      <p class="ks-workspace-lens__helper mt-2">Follow the path from idea to release</p>
    </div>
    <div class="col-lg-6">
      <p class="nav-section-label mb-2">Panel expanded (static)</p>
      <div class="ks-workspace-lens">
        <button type="button" class="ks-workspace-lens__trigger" aria-expanded="true" aria-haspopup="dialog" disabled>
          <span class="ks-workspace-lens__eyebrow" style="display:inline;margin-right:0.35rem">Workspace Lens</span>
          <span class="ks-workspace-lens__trigger-label">Artifacts</span>
        </button>
        <div class="ks-workspace-lens__panel" style="position:relative;top:0;margin-top:0.5rem">
          <div class="ks-workspace-lens__segments" role="group" aria-label="Lens mode">
            <button type="button" class="ks-workspace-lens__segment">
              <span class="ks-workspace-lens__segment-title">Flow</span>
              <span class="ks-workspace-lens__segment-desc">Follow work from idea to release</span>
            </button>
            <button type="button" class="ks-workspace-lens__segment ks-workspace-lens__segment--active">
              <span class="ks-workspace-lens__segment-title">Artifacts</span>
              <span class="ks-workspace-lens__segment-desc">Browse plans, projects, docs, and sites directly</span>
            </button>
          </div>
          <p class="ks-workspace-lens__remember">Your choice is saved in this browser for next visit.</p>
        </div>
        <p class="ks-workspace-lens__helper mt-2">Browse the workspace by asset type</p>
      </div>
    </div>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Stylesheet</p>
    <p class="mb-0"><code>css/workspace-lens.css</code> (loaded as <code>assets/workspace-lens.css</code> in the showcase)</p>
  </div>
</section>

<section id="sec-flow" class="ks-section">
  <h2 class="ks-section-title">Flow Diagram (Pure CSS)</h2>
  <p class="forge-support mb-3">Horizontal step indicators using <code>.forge-flow</code>.</p>
  <div class="forge-flow">
    <span class="forge-flow-node node-active">Spark</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">Spec</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">Build</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">Review</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">Ship</span>
  </div>
  <div class="forge-callout forge-callout-surface mt-3">
    <p class="callout-label">Classes</p>
    <p class="mb-0"><code>.forge-flow</code> · <code>.forge-flow-node</code> · <code>.node-active</code> · <code>.forge-flow-arrow</code></p>
  </div>
</section>

<section id="sec-sticky-section-dock" class="ks-section">
  <h2 class="ks-section-title">Sticky section dock</h2>
  {render_sticky_section_dock()}
  {_bc("ks-nav-dock", "Scroll collapses section titles into swimlane dock (ForgeSectionSwimlanes).")}
</section>

<section id="sec-scroll-spy-toc" class="ks-section">
  <h2 class="ks-section-title">Scroll-spy TOC</h2>
  {render_scroll_spy_toc()}
  {_bc("ks-scroll-spy-toc", "ToC links highlight active section on scroll.")}
</section>

<section id="sec-breadcrumb-depth" class="ks-section">
  <h2 class="ks-section-title">Breadcrumb depth</h2>
  {render_breadcrumb_depth()}
  {_bc("ks-breadcrumb-depth", "Current crumb lifted with depth shadow.")}
</section>

<section id="sec-mobile-nav-sheet" class="ks-section">
  <h2 class="ks-section-title">Mobile nav sheet</h2>
  {render_mobile_nav_sheet()}
  {_bc("ks-mobile-nav-sheet", "Bootstrap offcanvas nav with depth panel shadow.")}
</section>

<section id="sec-mega-menu" class="ks-section">
  <h2 class="ks-section-title">Mega menu</h2>
  {render_mega_menu()}
  {_bc("ks-mega-menu", "Expandable multi-column panel; Escape closes.")}
</section>

<section id="sec-anchor-jump-menu" class="ks-section">
  <h2 class="ks-section-title">Anchor jump menu</h2>
  {render_anchor_jump_menu()}
  {_bc("ks-anchor-jump", "Horizontal sticky bar with scroll-spy active state.")}
</section>

<section id="sec-tab-swimlane-sync" class="ks-section">
  <h2 class="ks-section-title">Tab swimlane sync</h2>
  {render_tab_swimlane_sync()}
  {_bc("ks-tab-swimlane", "Tabs scroll to sections; swimlane dock tracks lanes.")}
</section>"""
