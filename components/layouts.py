"""Full-page layout templates — Forge theme.

Seven layout variants:

``handbook_page``
    Auto-generated handbook pages (``build-handbook.py``).  Server-rendered
    sidebar; CSS from ``forge-theme.css``.

``chapter_page``
    Hand-crafted methodology chapters.  Client-side JS-driven sidebar;
    CSS from ``docs-theme.css``.

``product_page``
    Product / marketing sites (``build-site.py``).  Tier-grouped sidebar nav;
    CSS from ``forgesdlc-theme.css``.

Handbook and chapter layouts share the Forge structural skeleton (aurora, data-rail
sidebar, offcanvas, ToC column).  Product layout uses ``fs-*`` classes for a
distinct visual identity while reusing shared CDN links and Mermaid init.

``showcase_page``
    Component documentation with unified sticky header, sidebar, optional ToC.

``landing_page``
    Full-width hero page with no sidebar (homepages, overviews).

``gallery_page``
    Sidebar + card grid content, no right-rail ToC (catalogs, browsers).

``split_page``
    Sidebar + two-panel content: example left, docs right.

Color mode: ``FORGE_COLOR_SCHEME_INIT`` (inline head), ``forge-theme.js``, cookie
``forge_color_scheme`` (``light`` | ``dark`` | ``auto``), and ``html[data-bs-theme]``.
"""
from __future__ import annotations

try:
    from .components import e
except ImportError:
    from components import e

# ``diagram_modal_fragment`` lives next to ``layouts.py``; importers add ``…/components`` to ``sys.path``.
from diagram_modal_fragment import render_diagram_expand_modal_html

# ---------------------------------------------------------------------------
# Shared fragments
# ---------------------------------------------------------------------------

CDN_BOOTSTRAP_CSS = (
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" '
    'rel="stylesheet" crossorigin="anonymous" />'
)

CDN_BOOTSTRAP_JS = (
    '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" '
    'crossorigin="anonymous"></script>'
)

FONT_LINKS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    '  <link href="https://fonts.googleapis.com/css2?family='
    'Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" '
    'rel="stylesheet" />'
)

# Inline before CSS to avoid a flash of the wrong ``data-bs-theme`` (must match forge-theme.js).
FORGE_COLOR_SCHEME_INIT = """\
  <script>
  (function(){try{var m=document.cookie.match(/(?:^|;)\\s*forge_color_scheme=([^;]*)/);var v=m?decodeURIComponent(m[1].trim()):'';var mq=window.matchMedia('(prefers-color-scheme: dark)');var t='dark';if(v==='light')t='light';else if(v==='dark')t='dark';else if(v==='auto')t=mq.matches?'dark':'light';document.documentElement.setAttribute('data-bs-theme',t);}catch(e){}})();
  </script>"""

THEME_TOGGLE_DROPDOWN = """\
<div class="dropdown forge-theme-dropdown position-fixed top-0 end-0 m-2" style="z-index:1050" data-forge-pref="dark">
  <button type="button" class="forge-theme-trigger dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" id="forgeThemeMenu" aria-haspopup="true" aria-label="Appearance and color theme" title="Theme">
    <span class="forge-theme-trigger__aurora" aria-hidden="true"></span>
    <span class="forge-theme-trigger__inner">
      <span class="forge-theme-trigger__icons" aria-hidden="true">
        <svg class="forge-theme-ico forge-theme-ico--light" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <svg class="forge-theme-ico forge-theme-ico--dark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="forge-theme-ico forge-theme-ico--auto" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8"/><path d="M12 18v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>
      </span>
      <span class="forge-theme-trigger__copy">
        <span class="forge-theme-eyebrow">Appearance</span>
        <span class="forge-theme-current">Dark</span>
      </span>
      <svg class="forge-theme-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end forge-theme-menu" aria-labelledby="forgeThemeMenu">
    <li>
      <button type="button" class="dropdown-item forge-theme-option" data-forge-color-scheme="light">
        <svg class="forge-theme-opt-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>
        <span>Light</span>
        <svg class="forge-theme-tick" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      </button>
    </li>
    <li>
      <button type="button" class="dropdown-item forge-theme-option active" data-forge-color-scheme="dark">
        <svg class="forge-theme-opt-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <span>Dark</span>
        <svg class="forge-theme-tick" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      </button>
    </li>
    <li>
      <button type="button" class="dropdown-item forge-theme-option" data-forge-color-scheme="auto">
        <svg class="forge-theme-opt-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8"/><path d="M12 18v4"/></svg>
        <span>System</span>
        <svg class="forge-theme-tick" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      </button>
    </li>
  </ul>
</div>"""

MERMAID_SCRIPT = """\
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

    function forgeMermaidThemeVariables(dark) {
      return dark
        ? {
            darkMode: true,
            background: '#111827',
            primaryColor: '#1a2235',
            primaryTextColor: '#F1F5F9',
            primaryBorderColor: 'rgba(6,182,212,0.35)',
            secondaryColor: '#1a2235',
            secondaryTextColor: '#94A3B8',
            secondaryBorderColor: 'rgba(245,158,11,0.3)',
            tertiaryColor: '#0A0E17',
            tertiaryTextColor: '#94A3B8',
            tertiaryBorderColor: 'rgba(6,182,212,0.15)',
            lineColor: 'rgba(6,182,212,0.4)',
            textColor: '#F1F5F9',
            mainBkg: '#1a2235',
            nodeBorder: 'rgba(6,182,212,0.35)',
            clusterBkg: 'rgba(6,182,212,0.06)',
            clusterBorder: 'rgba(6,182,212,0.2)',
            titleColor: '#F1F5F9',
            edgeLabelBackground: '#111827',
            nodeTextColor: '#F1F5F9',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            sectionBkgColor: 'rgba(6,182,212,0.06)',
            altSectionBkgColor: 'rgba(15,23,42,0.45)',
            gridColor: 'rgba(148,163,184,0.22)',
            taskBkgColor: '#1e293b',
            taskBorderColor: 'rgba(6,182,212,0.45)',
            activeTaskBkgColor: 'rgba(6,182,212,0.28)',
            activeTaskBorderColor: '#22d3ee',
            doneTaskBkgColor: 'rgba(6,182,212,0.14)',
            doneTaskBorderColor: 'rgba(6,182,212,0.35)',
            critBkgColor: 'rgba(245,158,11,0.25)',
            critBorderColor: '#F59E0B',
            todayLineColor: '#F59E0B',
            taskTextOutsideColor: '#F1F5F9',
            taskTextLightColor: '#CBD5E1',
            taskTextDarkColor: '#E2E8F0',
            pie1: 'rgba(6,182,212,0.9)',
            pie2: 'rgba(245,158,11,0.88)',
            pie3: 'rgba(34,211,238,0.75)',
            pie4: 'rgba(148,163,184,0.55)',
            pie5: 'rgba(14,165,233,0.85)',
            pie6: 'rgba(251,191,36,0.8)',
            pie7: 'rgba(56,189,248,0.65)',
            pie8: 'rgba(94,234,212,0.5)',
            pie9: 'rgba(6,182,212,0.45)',
            pie10: 'rgba(245,158,11,0.45)',
            pie11: 'rgba(125,211,252,0.55)',
            pie12: 'rgba(203,213,225,0.45)',
            pieStrokeColor: 'rgba(6,182,212,0.45)',
            pieOuterStrokeColor: 'rgba(6,182,212,0.35)',
            pieTitleTextColor: '#F1F5F9',
            pieSectionTextColor: '#F1F5F9',
            pieLegendTextColor: '#CBD5E1',
            quadrant1Fill: 'rgba(6,182,212,0.14)',
            quadrant2Fill: 'rgba(6,182,212,0.07)',
            quadrant3Fill: 'rgba(245,158,11,0.1)',
            quadrant4Fill: 'rgba(148,163,184,0.1)',
            quadrant1TextFill: '#E2E8F0',
            quadrant2TextFill: '#E2E8F0',
            quadrant3TextFill: '#E2E8F0',
            quadrant4TextFill: '#E2E8F0',
            quadrantPointFill: '#F59E0B',
            quadrantPointTextFill: '#F8FAFC',
            quadrantXAxisTextFill: '#94A3B8',
            quadrantYAxisTextFill: '#94A3B8',
            quadrantTitleFill: '#F1F5F9',
            quadrantInternalBorderStrokeFill: 'rgba(6,182,212,0.28)',
            quadrantExternalBorderStrokeFill: 'rgba(6,182,212,0.45)',
            xyChart: {
              backgroundColor: 'transparent',
              titleColor: '#F1F5F9',
              dataLabelColor: '#E2E8F0',
              xAxisTitleColor: '#94A3B8',
              xAxisLabelColor: '#94A3B8',
              xAxisTickColor: '#94A3B8',
              xAxisLineColor: 'rgba(148,163,184,0.35)',
              yAxisTitleColor: '#94A3B8',
              yAxisLabelColor: '#94A3B8',
              yAxisTickColor: '#94A3B8',
              yAxisLineColor: 'rgba(148,163,184,0.35)',
              plotColorPalette: '#06B6D4,#F59E0B,#22D3EE,#94A3B8,#0EA5E9,#FBBF24,#38BDF8,#CBD5E1',
            },
          }
        : {
            darkMode: false,
            background: '#f1f5f9',
            primaryColor: '#e2e8f0',
            primaryTextColor: '#0f172a',
            primaryBorderColor: 'rgba(8,145,178,0.45)',
            secondaryColor: '#e2e8f0',
            secondaryTextColor: '#475569',
            secondaryBorderColor: 'rgba(217,119,6,0.35)',
            tertiaryColor: '#f8fafc',
            tertiaryTextColor: '#64748b',
            tertiaryBorderColor: 'rgba(8,145,178,0.2)',
            lineColor: 'rgba(8,145,178,0.45)',
            textColor: '#0f172a',
            mainBkg: '#e2e8f0',
            nodeBorder: 'rgba(8,145,178,0.45)',
            clusterBkg: 'rgba(6,182,212,0.08)',
            clusterBorder: 'rgba(8,145,178,0.25)',
            titleColor: '#0f172a',
            edgeLabelBackground: '#f1f5f9',
            nodeTextColor: '#0f172a',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            sectionBkgColor: 'rgba(6,182,212,0.08)',
            altSectionBkgColor: '#f8fafc',
            gridColor: 'rgba(71,85,105,0.22)',
            taskBkgColor: '#e2e8f0',
            taskBorderColor: 'rgba(8,145,178,0.45)',
            activeTaskBkgColor: 'rgba(6,182,212,0.22)',
            activeTaskBorderColor: '#0891b2',
            doneTaskBkgColor: 'rgba(6,182,212,0.12)',
            doneTaskBorderColor: 'rgba(8,145,178,0.35)',
            critBkgColor: 'rgba(245,158,11,0.22)',
            critBorderColor: '#d97706',
            todayLineColor: '#d97706',
            taskTextOutsideColor: '#0f172a',
            taskTextLightColor: '#475569',
            taskTextDarkColor: '#1e293b',
            pie1: 'rgba(8,145,178,0.88)',
            pie2: 'rgba(217,119,6,0.85)',
            pie3: 'rgba(14,165,233,0.75)',
            pie4: 'rgba(100,116,139,0.55)',
            pie5: 'rgba(6,182,212,0.7)',
            pie6: 'rgba(245,158,11,0.65)',
            pie7: 'rgba(56,189,248,0.65)',
            pie8: 'rgba(45,212,191,0.55)',
            pie9: 'rgba(8,145,178,0.45)',
            pie10: 'rgba(217,119,6,0.45)',
            pie11: 'rgba(125,211,252,0.6)',
            pie12: 'rgba(148,163,184,0.5)',
            pieStrokeColor: 'rgba(8,145,178,0.4)',
            pieOuterStrokeColor: 'rgba(8,145,178,0.35)',
            pieTitleTextColor: '#0f172a',
            pieSectionTextColor: '#0f172a',
            pieLegendTextColor: '#475569',
            quadrant1Fill: 'rgba(6,182,212,0.12)',
            quadrant2Fill: 'rgba(6,182,212,0.06)',
            quadrant3Fill: 'rgba(245,158,11,0.08)',
            quadrant4Fill: 'rgba(148,163,184,0.1)',
            quadrant1TextFill: '#1e293b',
            quadrant2TextFill: '#1e293b',
            quadrant3TextFill: '#1e293b',
            quadrant4TextFill: '#1e293b',
            quadrantPointFill: '#d97706',
            quadrantPointTextFill: '#0f172a',
            quadrantXAxisTextFill: '#475569',
            quadrantYAxisTextFill: '#475569',
            quadrantTitleFill: '#0f172a',
            quadrantInternalBorderStrokeFill: 'rgba(8,145,178,0.3)',
            quadrantExternalBorderStrokeFill: 'rgba(8,145,178,0.45)',
            xyChart: {
              backgroundColor: 'transparent',
              titleColor: '#0f172a',
              dataLabelColor: '#1e293b',
              xAxisTitleColor: '#475569',
              xAxisLabelColor: '#475569',
              xAxisTickColor: '#64748b',
              xAxisLineColor: 'rgba(71,85,105,0.28)',
              yAxisTitleColor: '#475569',
              yAxisLabelColor: '#475569',
              yAxisTickColor: '#64748b',
              yAxisLineColor: 'rgba(71,85,105,0.28)',
              plotColorPalette: '#0891b2,#d97706,#06b6d4,#64748b,#0ea5e9,#f59e0b,#38bdf8,#94a3b8',
            },
          };
    }

    function snapshotMermaidSources() {
      document.querySelectorAll('.mermaid').forEach(function (el) {
        if (el.dataset.forgeMermaidSrc) return;
        var t = (el.textContent || '').trim();
        if (t) el.dataset.forgeMermaidSrc = t;
      });
    }

    function resetMermaidElements() {
      document.querySelectorAll('.mermaid').forEach(function (el) {
        var src = el.dataset.forgeMermaidSrc;
        if (!src) return;
        el.removeAttribute('data-processed');
        el.textContent = src;
      });
    }

    /**
     * Mermaid measures label boxes at init; Forge CSS (fonts, case, letter-spacing) can make
     * the rendered HTML wider/taller than foreignObject + label rects. Re-measure after paint
     * and grow foreignObject + node label rects (flowchart nodes only — not cluster frame rects).
     */
    function forgeMermaidExpandForeignLabels() {
      document
        .querySelectorAll('.forge-diagram svg foreignObject, #diagramModalCanvas svg foreignObject')
        .forEach(function (fo) {
          var inner = fo.querySelector('div');
          if (!inner) return;
          var sw = 0;
          var sh = 0;
          try {
            sw = inner.scrollWidth;
            sh = inner.scrollHeight;
          } catch (e) {
            return;
          }
          if (sw < 2 || sh < 2) return;
          var padX = 14;
          var padY = 10;
          var needW = Math.ceil(sw + padX);
          var needH = Math.ceil(sh + padY);
          var cw = parseFloat(fo.getAttribute('width')) || 0;
          var ch = parseFloat(fo.getAttribute('height')) || 0;
          if (needW <= cw && needH <= ch) return;
          var nw = Math.max(cw, needW);
          var nh = Math.max(ch, needH);
          fo.setAttribute('width', String(nw));
          fo.setAttribute('height', String(nh));
          var nodeG = fo.closest('g.node');
          if (!nodeG) return;
          var lr =
            nodeG.querySelector('rect.label-container') ||
            nodeG.querySelector('rect.basic.label-container') ||
            nodeG.querySelector('rect.basic');
          if (!lr) return;
          var rw = parseFloat(lr.getAttribute('width')) || 0;
          var rh = parseFloat(lr.getAttribute('height')) || 0;
          if (nw > rw) lr.setAttribute('width', String(nw));
          if (nh > rh) lr.setAttribute('height', String(nh));
        });
    }

    async function forgeMermaidRefresh() {
      var nodes = document.querySelectorAll('.mermaid');
      if (!nodes.length) return;
      snapshotMermaidSources();
      var dark = document.documentElement.getAttribute('data-bs-theme') !== 'light';
      resetMermaidElements();
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: forgeMermaidThemeVariables(dark),
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
          diagramPadding: 12,
          nodeSpacing: 56,
          rankSpacing: 56,
          padding: 20,
          wrappingWidth: 240,
        },
      });
      await mermaid.run({ querySelector: '.mermaid' });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          forgeMermaidExpandForeignLabels();
        });
      });
    }

    window.forgeMermaidRefresh = forgeMermaidRefresh;
    window.forgeMermaidExpandForeignLabels = forgeMermaidExpandForeignLabels;
    forgeMermaidRefresh().catch(function () {});
  </script>"""


def _resolve_theme_css(theme_css_href: str) -> str:
    """Return the ``<link>`` tag for the Forge theme CSS."""
    return f'  <link rel="stylesheet" href="{e(theme_css_href)}" />'


def _resolve_theme_js(theme_js_href: str) -> str:
    """Return the ``<script>`` tag for the Forge theme JS."""
    return f'  <script src="{e(theme_js_href)}"></script>'


# ---------------------------------------------------------------------------
# Template: sidebar + offcanvas (Forge data-rail style)
# ---------------------------------------------------------------------------

def _render_sidebar(handbook_name: str, sidebar_html: str) -> str:
    return f"""\
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0" style="min-height:100vh;position:sticky;top:0;overflow-y:auto">
        <div class="px-3 py-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="forge-brand mb-0">
            <span class="brand-icon">F</span>
            <span class="text-amber">{e(handbook_name)}</span>
          </p>
          <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
        </div>
        <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Handbook chapters">
          <p class="nav-section-label">Chapters</p>
          <div class="nav-rail">
            {sidebar_html}
          </div>
        </nav>
      </aside>"""


def _render_sidebar_js_driven(handbook_name: str, subtitle: str) -> str:
    """Sidebar whose content is populated by a client-side JS nav file."""
    return f"""\
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0" style="min-height:100vh;position:sticky;top:0;overflow-y:auto">
        <div class="px-3 py-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="forge-brand mb-0">
            <span class="brand-icon">F</span>
            <span class="text-amber">{e(handbook_name)}</span>
          </p>
          <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">{e(subtitle)}</p>
        </div>
        <nav class="nav-scroll flex-grow-1 px-2 py-3" id="doc-sidebar-nav" aria-label="Handbook chapters"></nav>
      </aside>"""


def _render_offcanvas(handbook_name: str, offcanvas_html: str) -> str:
    return f"""\
      <div class="offcanvas offcanvas-start" tabindex="-1" id="docNavOffcanvas" aria-labelledby="docNavLabel" style="background:var(--forge-bg);color:var(--forge-text);border-right:1px solid var(--forge-border)">
        <div class="offcanvas-header" style="border-bottom:1px solid var(--forge-border)">
          <h5 class="offcanvas-title font-display" id="docNavLabel" style="font-size:1rem">
            <span class="text-amber">{e(handbook_name)}</span>
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body forge-sidebar p-0">
          <nav class="nav flex-column px-2 py-2 nav-rail" aria-label="Chapters mobile">
            {offcanvas_html}
          </nav>
        </div>
      </div>"""


def _render_offcanvas_js_driven(handbook_name: str) -> str:
    return f"""\
      <div class="offcanvas offcanvas-start" tabindex="-1" id="docNavOffcanvas" aria-labelledby="docNavLabel" style="background:var(--forge-bg);color:var(--forge-text);border-right:1px solid var(--forge-border)">
        <div class="offcanvas-header" style="border-bottom:1px solid var(--forge-border)">
          <h5 class="offcanvas-title font-display" id="docNavLabel" style="font-size:1rem">
            <span class="text-amber">{e(handbook_name)}</span>
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body forge-sidebar p-0">
          <nav class="nav flex-column px-2 py-2 nav-scroll nav-rail" id="doc-offcanvas-nav" aria-label="Handbook chapters mobile"></nav>
        </div>
      </div>"""


# ---------------------------------------------------------------------------
# Layout 1: handbook_page  (build-handbook.py)
# ---------------------------------------------------------------------------

def handbook_page(
    *,
    browser_title: str,
    handbook_name: str,
    page_title: str,
    intro: str,
    body_html: str,
    toc_sidebar_html: str,
    sidebar_html: str,
    offcanvas_html: str,
    template_banner: str,
    canonical_note: str,
    nav_buttons: str,
    footer_html: str,
    has_mermaid: bool,
    theme_css_href: str = "templates/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    include_diagram_expand_modal: bool = False,
) -> str:
    """Complete HTML page for an auto-generated handbook entry.

    Every parameter is a pre-rendered HTML fragment; this function only
    assembles the skeleton.

    When *include_diagram_expand_modal* is True, embed the diagram lightbox shell
    so ``openDiagramModal`` in ``forge-theme.js`` can expand rendered Mermaid SVGs
    (e.g. fences converted with the expandable variant in ``convert_mermaid_blocks``).
    """
    col_class = "col-lg-8 col-xl-9 order-2 order-lg-1" if toc_sidebar_html else "col-12"
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""
    diagram_modal = (
        render_diagram_expand_modal_html() if include_diagram_expand_modal else ""
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
{FORGE_COLOR_SCHEME_INIT}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(handbook_name)} &mdash; {e(browser_title)}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
{THEME_TOGGLE_DROPDOWN}
  <button type="button" class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow" style="z-index:1040" data-bs-toggle="offcanvas" data-bs-target="#docNavOffcanvas" aria-controls="docNavOffcanvas" aria-label="Open navigation">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
  </button>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
{_render_sidebar(handbook_name, sidebar_html)}
{_render_offcanvas(handbook_name, offcanvas_html)}
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
        <div class="mx-auto doc-content" style="max-width:56rem">
          <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
            <p class="section-label text-cyan mb-2">Handbook</p>
            <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">{e(page_title)}</h1>
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">{intro}</p>
          </header>
{template_banner}
          <div class="row g-3 g-lg-4">
            <div class="{col_class}">
{body_html}
            </div>
{toc_sidebar_html}
          </div>
{canonical_note}
{nav_buttons}
          {footer_html}
        </div>
      </main>
    </div>
  </div>
  {CDN_BOOTSTRAP_JS}
{_resolve_theme_js(theme_js_href)}
{mermaid_script}
{diagram_modal}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Layout 2: chapter_page  (build_methodology_chapters.py)
# ---------------------------------------------------------------------------

def chapter_page(
    *,
    browser_title: str,
    handbook_name: str,
    handbook_subtitle: str,
    header_html: str,
    main_sections: str,
    toc_sidebar_html: str,
    canonical_note: str,
    nav_buttons: str,
    footer_html: str,
    has_mermaid: bool,
    extra_scripts: list[str] | None = None,
    theme_css_href: str = "assets/docs-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    nav_btn_class: str = "btn-forge",
    include_diagram_expand_modal: bool = False,
) -> str:
    """Complete HTML page for a hand-crafted methodology chapter.

    The sidebar is populated client-side by JS files listed in
    *extra_scripts* (typically ``docs-nav.js`` and ``docs-toc-scrollspy.js``).
    """
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""
    extra = "\n".join(
        f'  <script src="{e(src)}"></script>' for src in (extra_scripts or [])
    )
    diagram_modal = (
        render_diagram_expand_modal_html() if include_diagram_expand_modal else ""
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
{FORGE_COLOR_SCHEME_INIT}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{handbook_name} — {browser_title}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
{THEME_TOGGLE_DROPDOWN}
  <button type="button" class="btn {nav_btn_class} position-fixed top-0 start-0 m-3 d-lg-none shadow" style="z-index:1040" data-bs-toggle="offcanvas" data-bs-target="#docNavOffcanvas" aria-controls="docNavOffcanvas" aria-label="Open navigation">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
  </button>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
{_render_sidebar_js_driven(handbook_name, handbook_subtitle)}
{_render_offcanvas_js_driven(handbook_name)}
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
        <div class="mx-auto doc-content" style="max-width:56rem">
          {header_html}
          <div class="row g-3 g-lg-4">
            <div class="col-lg-8 col-xl-9 order-2 order-lg-1">
{main_sections}
            </div>
            <div class="col-lg-4 col-xl-3 order-1 order-lg-2">
{toc_sidebar_html}
            </div>
          </div>
{canonical_note}
          {nav_buttons}
          {footer_html}
        </div>
      </main>
    </div>
  </div>
  {CDN_BOOTSTRAP_JS}
{_resolve_theme_js(theme_js_href)}
{extra}
{mermaid_script}
{diagram_modal}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Layout 3: product_page  (build-site.py — forgesdlc.com)
# ---------------------------------------------------------------------------

def product_page(
    *,
    browser_title: str,
    brand_name: str = "Forge",
    brand_accent: str = "SDLC",
    body_html: str,
    nav_html: str,
    offcanvas_nav_html: str = "",
    cross_refs_html: str = "",
    footer_html: str,
    lens: str | None = None,
    has_mermaid: bool = False,
    theme_css_href: str = "assets/forgesdlc-theme.css",
    extra_css: str = "",
    theme_js_href: str = "assets/forge-theme.js",
    primary_nav_html: str = "",
    head_extra: str = "",
    title_override: str | None = None,
    include_diagram_expand_modal: bool = False,
) -> str:
    """Complete HTML page for a product / marketing site.

    Uses ``fs-*`` CSS classes from ``forgesdlc-theme.css``.
    The sidebar is tier-grouped and rendered server-side.

    For full handbook typography and prose (markdown), load ``forge-theme.css``
    first via ``theme_css_href`` and append ``forgesdlc-theme.css`` in ``extra_css``.
    """
    lens_attr = f' data-lens="{e(lens)}"' if lens else ""
    offcanvas = offcanvas_nav_html or nav_html
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""
    diagram_modal = (
        render_diagram_expand_modal_html() if include_diagram_expand_modal else ""
    )
    doc_title = (
        e(title_override)
        if title_override
        else f"{e(browser_title)} &middot; {e(brand_name)}{e(brand_accent)}"
    )
    head_x = head_extra.strip()
    head_block = (head_x + "\n  ") if head_x else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
{FORGE_COLOR_SCHEME_INIT}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{doc_title}</title>
  {head_block}{CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
{extra_css}
</head>
<body{lens_attr}>
{THEME_TOGGLE_DROPDOWN}
  <div class="d-lg-none fs-mobile-bar sticky-top py-2 px-3 d-flex align-items-center justify-content-between">
    <a class="fs-brand text-decoration-none" href="index.html">{e(brand_name)}<span class="fs-accent">{e(brand_accent)}</span></a>
    <button class="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#fsNav" aria-controls="fsNav">Menu</button>
  </div>
  <nav class="fs-primary-nav-global" aria-label="Site sections">
    <div class="fs-primary-nav-global-inner">
      {primary_nav_html}
    </div>
  </nav>

  <div class="offcanvas offcanvas-start fs-offcanvas d-lg-none" tabindex="-1" id="fsNav" aria-labelledby="fsNavLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="fsNavLabel">Navigate</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      {offcanvas}
    </div>
  </div>

  <div class="container-fluid fs-layout">
    <div class="row g-0">
      <aside class="col-lg-3 col-xl-2 d-none d-lg-block fs-sidebar p-3">
        <a class="fs-brand d-block text-decoration-none mb-3" href="index.html">{e(brand_name)}<span class="fs-accent">{e(brand_accent)}</span></a>
        {nav_html}
      </aside>
      <main class="col-lg-9 col-xl-10 fs-main fs-main--product-wide">
        <article>
          {cross_refs_html}
          {body_html}
        </article>
        {footer_html}
      </main>
    </div>
  </div>

  {CDN_BOOTSTRAP_JS}
{_resolve_theme_js(theme_js_href)}
{mermaid_script}
{diagram_modal}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Shared: showcase-family helpers (used by showcase/gallery/split layouts)
# ---------------------------------------------------------------------------

_SHOWCASE_EXTRA_CSS = """\
  <style>
    :root { --site-header-h: auto; }
    .doc-main { position: relative; }
    .site-header {
      position: sticky; top: 0; z-index: 30;
      background: var(--forge-bg);
      border-bottom: 1px solid var(--forge-border);
    }
    .site-header-brand {
      border-right: 1px solid var(--forge-border);
      background: var(--forge-bg);
      padding: 0.75rem 1rem;
      display: flex; flex-direction: column; justify-content: center;
    }
    .site-header-content {
      padding: 0.75rem 1.5rem;
      display: flex; flex-direction: column; justify-content: center;
    }
    @media (min-width: 992px) {
      .site-header-content {
        padding-right: max(7rem, 9.5vw);
      }
    }
    .ks-section { margin-bottom: 3.5rem; }
    .ks-section-title {
      font-family: var(--font-label);
      font-size: 0.65rem; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--forge-text-3);
      border-bottom: 1px solid var(--forge-border);
      padding-bottom: 0.4rem; margin-bottom: 1.25rem;
    }
    .ks-swatch {
      display: inline-flex; flex-direction: column;
      align-items: center; gap: 0.35rem; min-width: 80px;
    }
    .ks-swatch-box {
      width: 56px; height: 56px; border-radius: 10px;
      border: 1px solid var(--forge-border);
    }
    .ks-swatch-label {
      font-family: var(--font-label); font-size: 0.65rem; font-weight: 600;
      color: var(--forge-text-3);
    }
    .ks-section[id] { scroll-margin-top: calc(var(--site-header-h, 4rem) + 1.5rem); }
    .forge-toc { top: calc(var(--site-header-h, 4rem) + 1.5rem); }
  </style>"""


def _showcase_header(
    brand_name: str,
    brand_subtitle: str,
    page_title: str,
    breadcrumb_html: str,
) -> str:
    return f"""\
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">{e(brand_name)}</span></p>
      <p class="mt-1 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">{e(brand_subtitle)}</p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content">
      {breadcrumb_html}
      <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">{e(page_title)}</h1>
    </div>
  </div>
</header>"""


def _showcase_sidebar(sidebar_html: str) -> str:
    return f"""\
  <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0" id="ks-sidebar-aside">
    <nav class="nav-scroll flex-grow-1 px-2 py-3" style="overflow-y:auto;min-height:0" aria-label="Sections">
      {sidebar_html}
    </nav>
  </aside>"""


_SHOWCASE_SIDEBAR_SYNC_JS = """\
<script>
(function () {
  'use strict';
  var hdr = document.querySelector('.site-header');
  var aside = document.getElementById('ks-sidebar-aside');
  function sync() {
    if (!hdr || !aside) return;
    var h = hdr.offsetHeight;
    aside.style.position = 'sticky';
    aside.style.top = h + 'px';
    aside.style.height = 'calc(100vh - ' + h + 'px)';
    aside.style.overflow = 'hidden';
    document.documentElement.style.setProperty('--site-header-h', h + 'px');
  }
  sync();
  window.addEventListener('resize', sync);
})();
</script>"""


# ---------------------------------------------------------------------------
# Layout 4: showcase_page  (component documentation)
# ---------------------------------------------------------------------------

def showcase_page(
    *,
    browser_title: str,
    brand_name: str = "Kitchen Sink",
    brand_subtitle: str = "Design system",
    page_title: str,
    breadcrumb_html: str = "",
    sidebar_html: str,
    offcanvas_html: str = "",
    body_html: str,
    toc_html: str = "",
    footer_html: str = "",
    extra_css: str = "",
    extra_js: list[str] | None = None,
    theme_css_href: str = "assets/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    has_mermaid: bool = False,
) -> str:
    """Showcase documentation page: unified header + sticky sidebar + content + optional ToC."""
    offcanvas = offcanvas_html or sidebar_html
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""
    extra_scripts = "\n".join(
        f'<script src="{e(src)}"></script>' for src in (extra_js or [])
    )
    toc_col = ""
    col_class = "col-12"
    if toc_html:
        col_class = "col-lg-8 col-xl-9 order-2 order-lg-1"
        toc_col = f"""
    <div class="col-lg-4 col-xl-3 order-1 order-lg-2">
      <nav class="forge-toc" aria-label="On this page">
        <p class="toc-title mb-2">On this page</p>
        {toc_html}
      </nav>
    </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
{FORGE_COLOR_SCHEME_INIT}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(browser_title)}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
{_SHOWCASE_EXTRA_CSS}
{extra_css}
</head>
<body>
<div class="forge-aurora"></div>
<a href="#main" class="skip-link">Skip to content</a>
{THEME_TOGGLE_DROPDOWN}

<button type="button" class="btn btn-forge position-fixed top-0 start-0 m-3 d-lg-none shadow" style="z-index:1040" data-bs-toggle="offcanvas" data-bs-target="#docNavOffcanvas" aria-controls="docNavOffcanvas" aria-label="Open navigation">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
</button>

<div class="container-fluid px-0">
{_showcase_header(brand_name, brand_subtitle, page_title, breadcrumb_html)}

<div class="row g-0 flex-lg-nowrap min-vh-100">
{_showcase_sidebar(sidebar_html)}

  <div class="offcanvas offcanvas-start d-lg-none" tabindex="-1" id="docNavOffcanvas" style="background:var(--forge-bg);border-right:1px solid var(--forge-border);max-width:280px">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--forge-border)">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">{e(brand_name)}</span></p>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body forge-sidebar p-2">
      {offcanvas}
    </div>
  </div>

  <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pb-5 doc-main">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <div class="row g-3 g-lg-4">
    <div class="{col_class}">
{body_html}
    </div>
{toc_col}
    </div>
    {footer_html}
  </div>
  </main>
</div>
</div>

{CDN_BOOTSTRAP_JS}
{_resolve_theme_js(theme_js_href)}
{_SHOWCASE_SIDEBAR_SYNC_JS}
{extra_scripts}
{mermaid_script}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Layout 5: landing_page  (hero / marketing — no sidebar)
# ---------------------------------------------------------------------------

def landing_page(
    *,
    browser_title: str,
    brand_name: str = "Kitchen Sink",
    brand_accent: str = "",
    brand_href: str = "index.html",
    brand_subtitle: str = "Design system",
    nav_links_html: str = "",
    hero_html: str,
    body_html: str,
    footer_html: str = "",
    extra_css: str = "",
    extra_js: list[str] | None = None,
    theme_css_href: str = "assets/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    body_extra_class: str = "",
    head_extra: str = "",
    title_override: str | None = None,
) -> str:
    """Full-width hero landing page with no sidebar."""
    extra_scripts = "\n".join(
        f'<script src="{e(src)}"></script>' for src in (extra_js or [])
    )
    accent_html = (
        f'<span class="fs-accent">{e(brand_accent)}</span>' if brand_accent else ""
    )
    doc_title = e(title_override) if title_override else e(browser_title)
    head_x = head_extra.strip()
    head_block = (head_x + "\n  ") if head_x else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
{FORGE_COLOR_SCHEME_INIT}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{doc_title}</title>
  {head_block}{CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
{extra_css}
</head>
<body{f' class="{e(body_extra_class.strip())}"' if body_extra_class.strip() else ""}>
<div class="forge-aurora"></div>
<a href="#main" class="skip-link">Skip to content</a>
{THEME_TOGGLE_DROPDOWN}

<header class="landing-header">
  <div class="landing-header-inner">
    <a class="fs-brand text-decoration-none" href="{e(brand_href)}">{e(brand_name)}{accent_html}</a>
    <nav class="landing-nav" aria-label="Site navigation">
      {nav_links_html}
    </nav>
  </div>
</header>

<main id="main" class="fs-landing-main">
  <div class="landing-hero fs-landing-hero-band" data-fs-section="hero">
    {hero_html}
  </div>
  <div class="fs-landing-body-shell">
    {body_html}
  </div>
  {footer_html}
</main>

{CDN_BOOTSTRAP_JS}
{_resolve_theme_js(theme_js_href)}
{extra_scripts}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Layout 6: gallery_page  (sidebar + card grid, no ToC)
# ---------------------------------------------------------------------------

def gallery_page(
    *,
    browser_title: str,
    brand_name: str = "Kitchen Sink",
    brand_subtitle: str = "Design system",
    page_title: str,
    breadcrumb_html: str = "",
    sidebar_html: str,
    offcanvas_html: str = "",
    body_html: str,
    toc_html: str = "",
    footer_html: str = "",
    extra_css: str = "",
    extra_js: list[str] | None = None,
    theme_css_href: str = "assets/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    has_mermaid: bool = False,
) -> str:
    """Gallery page: sidebar + full-width card grid; optional right-rail ToC like showcase_page."""
    return showcase_page(
        browser_title=browser_title,
        brand_name=brand_name,
        brand_subtitle=brand_subtitle,
        page_title=page_title,
        breadcrumb_html=breadcrumb_html,
        sidebar_html=sidebar_html,
        offcanvas_html=offcanvas_html,
        body_html=body_html,
        toc_html=toc_html,
        footer_html=footer_html,
        extra_css=extra_css,
        extra_js=extra_js,
        theme_css_href=theme_css_href,
        theme_js_href=theme_js_href,
        has_mermaid=has_mermaid,
    )


# ---------------------------------------------------------------------------
# Layout 7: split_page  (sidebar + two-panel content)
# ---------------------------------------------------------------------------

def split_page(
    *,
    browser_title: str,
    brand_name: str = "Kitchen Sink",
    brand_subtitle: str = "Design system",
    page_title: str,
    breadcrumb_html: str = "",
    sidebar_html: str,
    offcanvas_html: str = "",
    left_html: str,
    right_html: str,
    footer_html: str = "",
    extra_css: str = "",
    extra_js: list[str] | None = None,
    theme_css_href: str = "assets/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
    has_mermaid: bool = False,
) -> str:
    """Split page: sidebar + two-panel layout (example left, docs right)."""
    body = f"""
    <div class="row g-4">
      <div class="col-lg-7 order-2 order-lg-1">
        {left_html}
      </div>
      <div class="col-lg-5 order-1 order-lg-2">
        {right_html}
      </div>
    </div>"""
    return showcase_page(
        browser_title=browser_title,
        brand_name=brand_name,
        brand_subtitle=brand_subtitle,
        page_title=page_title,
        breadcrumb_html=breadcrumb_html,
        sidebar_html=sidebar_html,
        offcanvas_html=offcanvas_html,
        body_html=body,
        toc_html="",
        footer_html=footer_html,
        extra_css=extra_css,
        extra_js=extra_js,
        theme_css_href=theme_css_href,
        theme_js_href=theme_js_href,
        has_mermaid=has_mermaid,
    )
