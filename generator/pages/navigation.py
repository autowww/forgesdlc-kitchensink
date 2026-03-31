"""Navigation page — sidebar nav demo, flow diagram, breadcrumbs."""
from __future__ import annotations

PAGE = {
    "slug": "navigation",
    "title": "Navigation",
    "intro": "Sidebar nav patterns, flow diagrams, breadcrumbs.",
    "family": "Components",
    "layout": "showcase",
    "order": 4,
    "toc": [
        ("sec-sidebar", "Sidebar nav"),
        ("sec-workspace-lens", "Workspace Lens"),
        ("sec-flow", "Flow diagram"),
    ],
}


def extra_css() -> str:
    return '  <link rel="stylesheet" href="assets/workspace-lens.css" />\n'

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
</section>"""
