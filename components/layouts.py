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
"""
from __future__ import annotations

try:
    from .components import e
except ImportError:
    from components import e

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
    'Inter:wght@400;500;600;700;800;900&family='
    'JetBrains+Mono:wght@400;500;600;700&family='
    'Space+Mono:wght@400;700&display=swap" rel="stylesheet" />'
)

MERMAID_SCRIPT = """\
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background:       '#111827',
        primaryColor:     '#1a2235',
        primaryTextColor: '#F1F5F9',
        primaryBorderColor: 'rgba(6,182,212,0.35)',
        secondaryColor:   '#1a2235',
        secondaryTextColor: '#94A3B8',
        secondaryBorderColor: 'rgba(245,158,11,0.3)',
        tertiaryColor:    '#0A0E17',
        tertiaryTextColor: '#94A3B8',
        tertiaryBorderColor: 'rgba(6,182,212,0.15)',
        lineColor:        'rgba(6,182,212,0.4)',
        textColor:        '#F1F5F9',
        mainBkg:          '#1a2235',
        nodeBorder:       'rgba(6,182,212,0.35)',
        clusterBkg:       'rgba(6,182,212,0.06)',
        clusterBorder:    'rgba(6,182,212,0.2)',
        titleColor:       '#F1F5F9',
        edgeLabelBackground: '#111827',
        nodeTextColor:    '#F1F5F9',
        fontFamily:       'Inter, system-ui, sans-serif',
        fontSize:         '13px'
      }
    });
  </script>
"""


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
          <p class="mt-2 mb-0" style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
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
          <p class="mt-2 mb-0" style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:var(--forge-text-4);letter-spacing:0.06em">{e(subtitle)}</p>
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
) -> str:
    """Complete HTML page for an auto-generated handbook entry.

    Every parameter is a pre-rendered HTML fragment; this function only
    assembles the skeleton.
    """
    col_class = "col-lg-8 col-xl-9 order-2 order-lg-1" if toc_sidebar_html else "col-12"
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""

    return f"""<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(handbook_name)} &mdash; {e(browser_title)}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
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
) -> str:
    """Complete HTML page for a hand-crafted methodology chapter.

    The sidebar is populated client-side by JS files listed in
    *extra_scripts* (typically ``docs-nav.js`` and ``docs-toc-scrollspy.js``).
    """
    mermaid_script = MERMAID_SCRIPT if has_mermaid else ""
    extra = "\n".join(
        f'  <script src="{e(src)}"></script>' for src in (extra_scripts or [])
    )

    return f"""<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{handbook_name} — {browser_title}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
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

    return f"""<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(browser_title)} &middot; {e(brand_name)}{e(brand_accent)}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
{extra_css}
</head>
<body{lens_attr}>
  <div class="d-lg-none fs-mobile-bar sticky-top py-2 px-3 d-flex align-items-center justify-content-between">
    <a class="fs-brand text-decoration-none" href="index.html">{e(brand_name)}<span class="fs-accent">{e(brand_accent)}</span></a>
    <button class="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#fsNav" aria-controls="fsNav">Menu</button>
  </div>

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
      <main class="col-lg-9 col-xl-10 fs-main">
        <article>
          {cross_refs_html}
          {body_html}
        </article>
        {footer_html}
      </main>
    </div>
  </div>

  {CDN_BOOTSTRAP_JS}
{mermaid_script}
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
      font-family: var(--font-mono); font-size: 0.65rem;
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
      <p class="mt-1 mb-0" style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:var(--forge-text-4);letter-spacing:0.06em">{e(brand_subtitle)}</p>
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
) -> str:
    """Showcase documentation page: unified header + sticky sidebar + content + optional ToC."""
    offcanvas = offcanvas_html or sidebar_html
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
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
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
    brand_subtitle: str = "Design system",
    nav_links_html: str = "",
    hero_html: str,
    body_html: str,
    footer_html: str = "",
    extra_css: str = "",
    extra_js: list[str] | None = None,
    theme_css_href: str = "assets/forge-theme.css",
    theme_js_href: str = "assets/forge-theme.js",
) -> str:
    """Full-width hero landing page with no sidebar."""
    extra_scripts = "\n".join(
        f'<script src="{e(src)}"></script>' for src in (extra_js or [])
    )
    return f"""<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(browser_title)}</title>
  {CDN_BOOTSTRAP_CSS}
  {FONT_LINKS}
{_resolve_theme_css(theme_css_href)}
  <style>
    .landing-header {{
      position: sticky; top: 0; z-index: 30;
      background: var(--forge-bg);
      border-bottom: 1px solid var(--forge-border);
      padding: 0.75rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
    }}
    .landing-nav a {{
      color: var(--forge-text-2); text-decoration: none;
      font-family: var(--font-mono); font-size: 0.8rem;
      padding: 0.25rem 0.75rem; border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }}
    .landing-nav a:hover {{ color: var(--forge-text); background: var(--forge-surface); }}
    .landing-nav a.active {{ color: var(--forge-cyan); }}
    .landing-hero {{
      text-align: center; padding: 4rem 1.5rem 3rem;
      max-width: 56rem; margin: 0 auto;
    }}
  </style>
{extra_css}
</head>
<body>
<div class="forge-aurora"></div>
<a href="#main" class="skip-link">Skip to content</a>

<header class="landing-header">
  <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">{e(brand_name)}</span></p>
  <nav class="landing-nav d-flex gap-1" aria-label="Site navigation">
    {nav_links_html}
  </nav>
</header>

<main id="main">
  <div class="landing-hero">
    {hero_html}
  </div>
  <div class="mx-auto px-3 pb-5" style="max-width:64rem">
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
    )
