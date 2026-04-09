"""HTML body for the for-agents showcase page (loaded only via for_agents.py)."""
from __future__ import annotations

from components import (
    bold,
    e,
    e_content,
    render_alert,
    render_authorship_signal,
    render_breadcrumbs,
    render_canonical_note,
    render_cross_refs,
    render_diagrams_section,
    render_external_sources_section,
    render_flow_details_section,
    render_footer,
    render_io_table,
    render_ks_diagram_block,
    render_nav_buttons,
    render_page_header,
    render_page_header_chapter,
    render_skip_link,
    render_table,
    render_template_banner,
    render_tier_nav,
    render_toc_sidebar,
    render_toc_sidebar_simple,
    wrap_product_site_article,
)
from pages._diagram_gallery import diagram_template_count, render_family_sections_html

_CHEVRON = (
    '<svg class="doc-sidebar-chevron" width="14" height="14" viewBox="0 0 16 16" '
    'fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 '
    '.708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 '
    '2.354a.5.5 0 0 1 0-.708z"/></svg>'
)


def _spec_dl(items: list[tuple[str, str]]) -> str:
    dds = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in items)
    return f'<dl class="ag-spec forge-support small mb-3">{dds}</dl>'


def _all_diagram_gallery_sections_html() -> str:
    """One ks-section per family; every template as a clickable thumb (same catalog as diagrams.html)."""
    return render_family_sections_html(variant="for_agents")


def _python_function_inventory_table() -> str:
    rows: list[list[str]] = [
        ["<code>e(s)</code>", "str", "HTML-escape for attributes (includes quotes)."],
        ["<code>e_content(s)</code>", "str", "Escape for text nodes (no quote encoding)."],
        ["<code>bold(s)</code>", "str", "Wrap escaped content in <code>&lt;strong&gt;</code>."],
        ["<code>render_table(headers, rows, …)</code>", "str", "Striped Forge table inside <code>.forge-table-wrap</code>."],
        ["<code>render_io_table(rows)</code>", "str", "Intent/Inputs/Outputs/Participants/Timebox columns via <code>render_table</code>."],
        [
            "<code>render_section(sid, title, inner, …)</code>",
            "str",
            "Article section: optional top <code>.forge-divider</code>, <code>&lt;section id&gt;</code>, optional <code>.section-label</code>, <code>&lt;h2 class=&quot;font-display&quot;&gt;</code>.",
        ],
        [
            "<code>render_mermaid_block(diagram, expandable=False)</code>",
            "str",
            "<code>.forge-diagram</code> + <code>.mermaid</code>; if expandable, adds <code>forge-diagram-trigger</code> and <code>openDiagramModal(this)</code>.",
        ],
        [
            "<code>render_diagrams_section(title, sid, diagrams)</code>",
            "str",
            "Calls <code>render_section</code> with intro line + one <code>render_mermaid_block</code> per diagram string.",
        ],
        [
            "<code>render_alert(content, variant=…, label=…)</code>",
            "str",
            "Maps Bootstrap-like variants to <code>.forge-callout-*</code>; content is not re-escaped (HTML allowed).",
        ],
        ["<code>render_template_banner()</code>", "str", "Fixed amber template warning via <code>render_alert</code>."],
        [
            "<code>render_canonical_note(canonical_md, generator=…)</code>",
            "str",
            "Surface callout pointing editors at source Markdown + generator command.",
        ],
        ["<code>render_breadcrumbs(crumbs)</code>", "str", "<code>(href, label)</code> pairs; <code>href=None</code> marks active crumb."],
        ["<code>render_nav_buttons(prev_link, next_link)</code>", "str", "Prev/next <code>.btn-cyan-outline</code> / <code>.btn-forge-outline</code> row; empty if both unset."],
        [
            "<code>render_external_sources_section(sid, items, …)</code>",
            "str",
            "Unstyled list of external links + blurbs; optional pointer to REFERENCE-LINKS.md.",
        ],
        [
            "<code>render_flow_details_section(sid, items)</code>",
            "str",
            "Per-diagram narrative: <code>(title, paragraph)</code> tuples as <code>&lt;h3&gt;</code> + paragraph inside <code>render_section</code>.",
        ],
        [
            "<code>render_toc_sidebar(toc)</code>",
            "str",
            "Right column wrapper + <code>.forge-toc</code>; entries <code>(id, text, level)</code> — level 3 links get extra left padding.",
        ],
        ["<code>render_toc_sidebar_simple(toc)</code>", "str", "Same nav markup without level (chapter pages)."],
        ["<code>render_skip_link(target=&quot;#main&quot;)</code>", "str", "<code>.skip-link</code> anchor for accessibility."],
        [
            "<code>render_mobile_nav_button(target_id=…)</code>",
            "str",
            "Fixed hamburger <code>.btn-forge</code> toggling Bootstrap offcanvas sidebar.",
        ],
        ["<code>render_footer(date, label=…)</code>", "str", "Muted top-border footer with generation note."],
        [
            "<code>render_page_header(title, subtitle=…, …)</code>",
            "str",
            "Handbook-style page title block (labels + display heading).",
        ],
        [
            "<code>render_page_header_chapter(…)</code>",
            "str",
            "Chapter variant of page header (methodology pages).",
        ],
        [
            "<code>render_tier_nav(groups)</code>",
            "str",
            "Product sidebar tier groups (used with <code>product_page</code> / fs theme).",
        ],
        [
            "<code>render_cross_refs(items, variant=…)</code>",
            "str",
            "<code>.fs-cross-refs</code> aside; <code>variant=&quot;subtle&quot;</code> lowers emphasis.",
        ],
        [
            "<code>render_authorship_signal(lead, support=…)</code>",
            "str",
            "<code>.landing-authorship</code> aside for human direction vs agent output.",
        ],
        [
            "<code>render_product_landing_hero(…)</code>",
            "str",
            "Hero stack: kicker, gradient H1, tagline, CTAs — classes <code>.landing-hero-*</code> in <code>forgesdlc-theme.css</code>. Requires that sheet in <code>&lt;head&gt;</code> via <code>landing_page(product_chrome_css_href=&quot;assets/forgesdlc-theme.css&quot;)</code> after <code>forge-theme.css</code>. Optional <code>visual_column_extra_class</code> (e.g. <code>landing-hero-visual--cover</code>).",
        ],
        [
            "<code>wrap_product_site_article(inner_html)</code>",
            "str",
            "Wraps body in <code>.fs-main &gt; article</code> for product landing content.",
        ],
        [
            "<code>render_product_footer(…)</code>",
            "str",
            "<code>.fs-footer</code> block with brand line + handbook link.",
        ],
        [
            "<code>render_stage_carousel(slides, …)</code>",
            "str",
            "<code>fs-stage-carousel</code> + track/slides; <code>data-fs-*</code> for autoplay, loop, arrows, dots; variants <code>hero</code>, <code>gallery</code>, <code>testimonial</code>.",
        ],
        [
            "<code>render_rail(items, …)</code>",
            "str",
            "<code>fs-rail</code> scroll-snap scroller; variants <code>cards</code>, <code>logos</code>, <code>media</code>; optional wheel hijack via <code>rail_wheel</code>.",
        ],
        [
            "<code>render_card_rail(items, …)</code>",
            "str",
            "Wrapper: <code>render_rail(..., variant=&quot;cards&quot;)</code>; topic preview tiles use <code>data-fs-rail-action=&quot;topic&quot;</code>.",
        ],
        [
            "<code>render_hero_carousel / render_gallery_carousel / render_thumb_gallery / render_testimonial_slider / render_logo_strip</code>",
            "str",
            "Thin wrappers over stage carousel and rail with preset modifiers (<code>fs-hero-carousel</code>, logo grid/marquee, etc.).",
        ],
    ]
    return render_table(
        ["Function", "Returns", "Role / emitted markup"],
        rows,
        cell_escape=False,
    )


def _transforms_inventory_table() -> str:
    rows: list[list[str]] = [
        [
            "<code>apply_all(html)</code>",
            "tuple[str, bool, bool]",
            "Canonical pipeline end-to-end; returns <code>(html, has_mermaid, has_ks_diagram)</code> for layout script injection (consumers may force <code>has_mermaid=False</code>).",
        ],
        [
            "<code>convert_mermaid_blocks(html)</code>",
            "tuple[str, bool]",
            "Replaces fenced diagram blocks <code>&lt;pre&gt;&lt;code class=&quot;language-mermaid&quot;&gt;</code> with <code>.forge-diagram</code> + <code>.mermaid</code>.",
        ],
        [
            "<code>convert_ascii_diagram_blocks(html)</code>",
            "tuple[str, bool, bool]",
            "Replaces <code>language-blueprint-diagram-ascii</code> / <code>language-ks-diagram-ascii</code> with <code>.forge-diagram-ascii</code>; third value is true when any block uses <code>expand:</code> with a valid catalog <code>key:</code> (legend modal).",
        ],
        [
            "<code>convert_ks_diagram_blocks(html)</code>",
            "tuple[str, bool]",
            "Replaces <code>language-ks-diagram</code> / <code>language-ks-diagram-expand</code> with static SVG tiles (<code>.ks-diagram-tile</code>).",
        ],
        [
            "<code>enhance_tables(html)</code>",
            "str",
            "Wraps bare <code>&lt;table&gt;</code> and adds Forge table classes.",
        ],
        [
            "<code>enhance_blockquotes(html)</code>",
            "str",
            "Maps blockquotes to <code>.forge-callout-*</code>; recognizes <strong>Warning</strong> / <strong>Note</strong> / <strong>Template</strong> prefixes.",
        ],
        [
            "<code>enhance_code_blocks(html)</code>",
            "str",
            "Adds <code>.forge-code</code> to <code>&lt;pre&gt;</code> (including language-* code classes).",
        ],
        [
            "<code>extract_toc(html)</code>",
            "list[tuple[str, str, int]]",
            "Collects <code>&lt;h2 id&gt;</code> / <code>&lt;h3 id&gt;</code> for ToC builders.",
        ],
    ]
    return render_table(
        ["Function", "Returns", "Role"],
        rows,
        cell_escape=False,
    )


def _layouts_inventory_table() -> str:
    rows: list[list[str]] = [
        [
            "<code>handbook_page</code>",
            "Blueprint handbook: sidebar + article + right ToC column.",
            "blueprints-website",
        ],
        [
            "<code>chapter_page</code>",
            "Methodology chapter shell; uses <code>docs-theme.css</code>; often JS-hydrated nav.",
            "blueprints-website chapters",
        ],
        [
            "<code>product_page</code>",
            "Marketing/product article + tier sidebar; <code>forgesdlc-theme.css</code>.",
            "forgesdlc.com",
        ],
        [
            "<code>showcase_page</code>",
            "Sticky site header + sidebar + body + optional right <code>.forge-toc</code> — canonical doc shell.",
            "Kitchensink showcase; consumer doc generators",
        ],
        [
            "<code>landing_page</code>",
            "Top nav + hero band + body; no sidebar. Use <code>product_chrome_css_href</code> for <code>forgesdlc-theme.css</code>; optional <code>hero_band_extra_class</code> (e.g. <code>fs-hero-band--scrim</code>).",
            "Live <a href=\"preview-landing.html\"><code>preview-landing.html</code></a>; showcase <code>index.html</code>",
        ],
        [
            "<code>marketing_page</code>",
            "Collapsible top nav + single article column; no hero band. Optional <code>announcement_html</code>.",
            "Public marketing interiors; preview <code>preview-marketing.html</code>",
        ],
        [
            "<code>gallery_page</code>",
            "Same shell as showcase but main column full width (no right ToC column).",
            "<code>diagrams.html</code>",
        ],
        [
            "<code>split_page</code>",
            "Two-column main: left demo, right documentation.",
            "Optional detail / playground pages",
        ],
    ]
    return render_table(
        ["Layout", "Structure / theme", "Used by"],
        rows,
        cell_escape=False,
    )


def render_body() -> str:
    bc_demo = render_breadcrumbs(
        [("index.html", "Home"), ("tokens.html", "Tokens"), (None, "Current page")]
    )
    skip_demo = render_skip_link("#ag-intro")
    alert_demo = render_alert(
        "Generated by <code>render_alert(..., variant=&quot;info&quot;, label=&quot;Note&quot;)</code>.",
        variant="info",
        label="Note",
    )
    table_demo = render_table(
        ["Column A", "Column B"],
        [["Alpha", "One"], ["Beta", "Two"]],
        cell_escape=True,
    )
    io_demo = render_io_table(
        [
            ("Ship slice", "Repo + CI", "Static site", "Team", "Weekly"),
        ],
    )
    tmpl_demo = render_template_banner()
    canon_demo = render_canonical_note(
        "docs/example.md",
        generator="python3 generator/build-handbook.py --all",
    )
    nav_btn_demo = render_nav_buttons(
        prev_link=("tokens.html", "Tokens"),
        next_link=("controls.html", "Controls"),
    )
    ext_demo = render_external_sources_section(
        "ag-demo-ext",
        [
            (
                "https://example.com",
                "Example spec",
                "Short summary of why it matters.",
            ),
        ],
        reference_link="#ag-nav-more",
    )
    flow_demo = render_flow_details_section(
        "ag-demo-flow",
        [
            ("Step one", "Narrative paragraph for the walkthrough."),
            ("Step two", "Another beat in the flow."),
        ],
    )
    footer_demo = render_footer("2026-03-31", label="Showcase demo footer")
    toc_simple_demo = render_toc_sidebar_simple(
        [("ag-demo-h2", "Sample H2"), ("ag-demo-h3", "Sample H3")],
    )
    ph_demo = render_page_header(
        "Page title",
        "One-line intro for handbook-style headers.",
        label="Handbook",
    )
    cross_demo = render_cross_refs(
        [("index.html", "Home"), ("tokens.html", "Tokens")],
    )
    auth_demo = render_authorship_signal(
        "Direction and review: human.",
        "Draft assistance from tools where noted.",
    )
    tier_demo = render_tier_nav(
        [
            ("Product", [("/overview", "Overview"), ("/pricing", "Pricing")]),
            ("Docs", [("/guide", "Guide")]),
        ],
        current_href="/overview",
    )
    bold_demo = bold("sample")
    ph_chapter_demo = render_page_header_chapter(
        "Chapter title",
        "Chapter intro for methodology pages (breadcrumb nav + H1).",
        '<ol class="breadcrumb mb-1"><li class="breadcrumb-item"><a href="index.html">Home</a></li>'
        '<li class="breadcrumb-item active" aria-current="page">Chapter</li></ol>',
    )
    toc_leveled_demo = render_toc_sidebar(
        [
            ("ag-demo-h2", "Section (level 2)", 2),
            ("ag-demo-h3", "Subsection (level 3)", 3),
        ],
    )
    wrap_product_demo = wrap_product_site_article(
        '<p class="forge-support mb-0">Inner column wrapped for <code>landing_page</code> — '
        "<code>product_page</code> already wraps <code>body_html</code> in an article (see preview-product).</p>",
    )
    diagrams_section_demo = render_diagrams_section(
        "Diagrams section helper",
        "ag-for-agents-diagrams-section",
        ["graph LR\n  A[Reachable] --> B[Showcase]"],
    )
    ks_tile_demo = render_ks_diagram_block(
        key="linear",
        alt="Linear flow template (catalog)",
        expandable=False,
    )
    diagram_gallery_sections = _all_diagram_gallery_sections_html()
    nd = diagram_template_count()
    python_inventory = _python_function_inventory_table()
    transforms_inventory = _transforms_inventory_table()
    layouts_inventory = _layouts_inventory_table()
    return f"""\
<section id="ag-intro" class="ks-section">
  <h2 class="ks-section-title">How to use this page</h2>
  <p class="forge-support mb-3">This file is the <strong>consolidated machine-readable reference</strong> for the Forge kitchensink showcase. Each section follows the same shape: <strong>Purpose</strong> (when to use it), <strong>Styling</strong> (CSS classes and tokens), <strong>Markup</strong> (DOM pattern or Python emitter), <strong>Behavior</strong> (client scripts, if any), then a <strong>live example</strong>. The canonical stylesheet for this shell is <code>css/forge-theme.css</code> (imported as <code>assets/forge-theme.css</code> in generated pages). Bootstrap 5.3 provides utilities (<code>.d-flex</code>, <code>.gap-*</code>, <code>.mb-*</code>) layered on top of Forge tokens (<code>--forge-*</code>).</p>
  <div class="forge-callout forge-callout-cyan mb-0">
    <p class="callout-label text-cyan">Scope</p>
    <p class="forge-support mb-0">This page documents the <strong>handbook/showcase</strong> theme. Product marketing pages use <code>forgesdlc-theme.css</code> and <code>fs-*</code> classes — see the <a href="#ag-product-theme">Product theme</a> and <a href="#ag-fs-overview">Presentation primitives</a> sections. Full-page shells are Python functions in <code>components/layouts.py</code>. <strong>CSS order:</strong> <code>forge-theme.css</code> → <code>forgesdlc-theme.css</code> (<code>product_chrome_css_href</code>) → site overrides (<code>extra_css</code>) — see <code>generator/ks_assets.py</code>.</p>
  </div>
</section>

<section id="ag-tokens-colors" class="ks-section">
  <h2 class="ks-section-title">Tokens · Color palette</h2>
  {_spec_dl([
    ("Purpose", "Semantic colors for backgrounds, surfaces, accents, and text hierarchy. Always prefer <code>var(--forge-*)</code> over raw hex in custom CSS so light/dark and future tweaks stay consistent."),
    ("Styling", "Tokens live on <code>:root</code> in <code>forge-theme.css</code> / <code>forge-light-theme.css</code>. Key names: <code>--forge-bg</code>, <code>--forge-surface</code>, <code>--forge-surface-2</code>, <code>--forge-amber</code>, <code>--forge-cyan</code>, <code>--forge-orange</code>, <code>--forge-emerald</code>, <code>--forge-text</code> through <code>--forge-text-4</code>, <code>--forge-border</code>."),
    ("Markup", "Reference in inline styles: <code>style=\"color:var(--forge-cyan)\"</code> or in CSS rules. Swatch UI uses <code>.ks-swatch</code>, <code>.ks-swatch-box</code>, <code>.ks-swatch-label</code>."),
    ("Behavior", "<code>forge-theme.js</code> sets <code>data-bs-theme</code> on <code>&lt;html&gt;</code> from cookie <code>forge_color_scheme</code> (light / dark / auto). Tokens swap via CSS when the theme changes."),
    ("Python", "No dedicated renderer — use tokens in strings you pass to <code>render_*</code> helpers or in generator templates."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="d-flex flex-wrap gap-3 mb-3">
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-bg)"></div><span class="ks-swatch-label">bg</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-surface)"></div><span class="ks-swatch-label">surface</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-amber)"></div><span class="ks-swatch-label">amber</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-cyan)"></div><span class="ks-swatch-label">cyan</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-emerald)"></div><span class="ks-swatch-label">emerald</span></div>
    <div class="ks-swatch"><div class="ks-swatch-box" style="background:var(--forge-text-3)"></div><span class="ks-swatch-label">text-3</span></div>
  </div>
</section>

<section id="ag-tokens-type" class="ks-section">
  <h2 class="ks-section-title">Tokens · Typography</h2>
  {_spec_dl([
    ("Purpose", "Display headings, body, labels, and monospace code. Keeps handbook and showcase visually aligned with brand fonts."),
    ("Styling", "<code>.font-display</code> — Proxima Nova Black (900). Body uses Open Sans. <code>.font-label</code> / <code>.section-label</code> for small labels. <code>.forge-support</code> — muted explanatory text. <code>.forge-gradient-text</code> — amber→cyan gradient on display text. Utilities: <code>.text-amber</code>, <code>.text-cyan</code>, <code>.text-dim</code>, <code>.text-dim-2</code>, <code>.text-muted-4</code>. CSS variables: <code>--font-display</code>, <code>--font-label</code>, <code>--font-mono</code>."),
    ("Markup", "Apply classes to <code>&lt;h1&gt;</code>–<code>&lt;h3&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;span&gt;</code>. Links in prose pick up cyan styling from theme rules."),
    ("Python", "<code>e(s)</code> / <code>e_content(s)</code> / <code>bold(s)</code> in <code>components/components.py</code> escape text for safe HTML insertion."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <h1 class="font-display" style="font-size:1.5rem">Display heading</h1>
  <p>Body with <strong>strong</strong>, <a href="#">link</a>, <code>inline code</code>.</p>
  <p class="forge-support">Support line — smaller, lower contrast.</p>
  <p class="forge-gradient-text font-display" style="font-size:1.25rem">Gradient display text</p>
  <p><span class="text-amber">amber</span> · <span class="text-cyan">cyan</span> · <span class="text-dim">dim</span></p>
  <p class="forge-support mb-0"><code>bold("…")</code> → {bold_demo}</p>
</section>

<section id="ag-tokens-spacing" class="ks-section">
  <h2 class="ks-section-title">Tokens · Spacing &amp; layout width</h2>
  {_spec_dl([
    ("Purpose", "Rhythm between blocks; content max-width for readability."),
    ("Styling", "Bootstrap spacing: <code>.p-*</code>, <code>.m-*</code>, <code>.gap-*</code>, <code>.g-*</code> on grids. Showcase sections use <code>.ks-section</code> and <code>.ks-section-title</code> for vertical rhythm. Typical content caps: ~56rem article column, wider for landing — see theme comments in <code>forge-theme.css</code>."),
    ("Markup", "Wrap page sections in <code>&lt;section class=&quot;ks-section&quot; id=&quot;…&quot;&gt;</code> so <code>showcase.js</code> scroll-spy can track them (requires an <code>id</code>)."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="forge-table-wrap">
    <table class="table table-striped table-sm mb-0">
      <thead><tr><th>Utility</th><th>Role</th></tr></thead>
      <tbody>
        <tr><td><code>.mb-3</code></td><td>Margin below a block</td></tr>
        <tr><td><code>.gap-3</code></td><td>Flex/grid gap (1rem)</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section id="ag-surf-glass" class="ks-section">
  <h2 class="ks-section-title">Surfaces · Glass panels</h2>
  {_spec_dl([
    ("Purpose", "Frosted panels for cards, stats, and dashboard tiles."),
    ("Styling", "<code>.glass</code> — default cyan-accent hover glow. <code>.glass-amber</code> — amber border/glow on hover. <code>.glass-solid</code> — opaque surface, less blur. Often combined with <code>.p-3</code> / <code>.p-4</code>."),
    ("Markup", "<code>&lt;div class=&quot;glass p-3&quot;&gt;…&lt;/div&gt;</code>"),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="row g-3">
    <div class="col-md-4"><div class="glass p-3"><p class="section-label text-cyan mb-1">Glass</p><p class="mb-0 forge-support">Cyan hover glow.</p></div></div>
    <div class="col-md-4"><div class="glass-amber p-3"><p class="section-label text-amber mb-1">Glass amber</p><p class="mb-0 forge-support">Amber accent.</p></div></div>
    <div class="col-md-4"><div class="glass-solid p-3"><p class="section-label mb-1">Glass solid</p><p class="mb-0 forge-support">Solid fill.</p></div></div>
  </div>
</section>

<section id="ag-surf-cards" class="ks-section">
  <h2 class="ks-section-title">Surfaces · Cards</h2>
  {_spec_dl([
    ("Purpose", "Clickable or static tiles with hover “breathe” border animation."),
    ("Styling", "<code>.forge-card</code> base. <code>.card-amber</code> for amber accent variant. <code>.breathe-link</code> on <code>&lt;a&gt;</code> (interactive). <code>.breathe-static</code> on <code>&lt;div&gt;</code> (decorative). <code>.card-label</code> for small upper label inside card."),
    ("Markup", "Link card: <code>&lt;a class=&quot;forge-card breathe-link&quot; href=&quot;…&quot;&gt;</code>. Static: <code>&lt;div class=&quot;forge-card breathe-static&quot;&gt;</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="row g-3">
    <div class="col-md-4"><a class="forge-card breathe-link" href="#ag-surf-cards"><p class="card-label">Cyan</p><h5 class="mt-2 mb-1">Link card</h5><p class="forge-support mb-0">breathe-link</p></a></div>
    <div class="col-md-4"><a class="forge-card card-amber breathe-link" href="#ag-surf-cards"><p class="card-label">Amber</p><h5 class="mt-2 mb-1">Amber link</h5><p class="forge-support mb-0">card-amber</p></a></div>
    <div class="col-md-4"><div class="forge-card breathe-static"><p class="card-label">Static</p><h5 class="mt-2 mb-1">Non-link</h5><p class="forge-support mb-0">breathe-static</p></div></div>
  </div>
</section>

<section id="ag-surf-bento" class="ks-section">
  <h2 class="ks-section-title">Surfaces · Bento grid</h2>
  {_spec_dl([
    ("Purpose", "Responsive grid of equal cells (often glass tiles)."),
    ("Styling", "Container <code>.bento-grid</code>. Column template: <code>.bento-3</code> (three columns → one column on small screens)."),
    ("Markup", "<code>&lt;div class=&quot;bento-grid bento-3&quot;&gt;</code> with glass children."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="bento-grid bento-3">
    <div class="glass p-3"><p class="section-label text-cyan mb-0">Cell 1</p></div>
    <div class="glass p-3"><p class="section-label text-amber mb-0">Cell 2</p></div>
    <div class="glass p-3"><p class="section-label mb-0">Cell 3</p></div>
  </div>
</section>

<section id="ag-surf-tables" class="ks-section">
  <h2 class="ks-section-title">Surfaces · Tables</h2>
  {_spec_dl([
    ("Purpose", "Data tables with Forge striping and horizontal scroll on narrow viewports."),
    ("Styling", "Wrap <code>&lt;table&gt;</code> in <code>.forge-table-wrap</code>. Table classes: <code>.table</code>, <code>.table-sm</code>, <code>.table-striped</code>, optional <code>.mb-0</code>."),
    ("Python", "<code>render_table(headers, rows, striped=True, cell_escape=False)</code> and <code>render_io_table(rows)</code> emit the wrap + table."),
  ])}
  <p class="section-label text-cyan mb-2">Example (Python-generated)</p>
  {table_demo}
</section>

<section id="ag-surf-dividers" class="ks-section">
  <h2 class="ks-section-title">Surfaces · Dividers</h2>
  {_spec_dl([
    ("Purpose", "Section break without heavy chrome."),
    ("Styling", "<code>&lt;hr class=&quot;forge-divider&quot;&gt;</code> — gradient rule using token colors."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <p class="forge-support">Above the line</p>
  <hr class="forge-divider">
  <p class="forge-support mb-0">Below the line</p>
</section>

<section id="ag-ctrl-buttons" class="ks-section">
  <h2 class="ks-section-title">Controls · Buttons</h2>
  {_spec_dl([
    ("Purpose", "Primary actions and secondary outlines in brand colors."),
    ("Styling", "Bootstrap <code>.btn</code> plus <code>.btn-forge</code> (amber fill), <code>.btn-forge-outline</code> (amber outline), <code>.btn-cyan-outline</code> (cyan outline). Sizing: <code>.btn-sm</code> etc."),
    ("Markup", "<code>&lt;button type=&quot;button&quot; class=&quot;btn btn-forge&quot;&gt;</code> or <code>&lt;a&gt;</code> with same classes."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="d-flex flex-wrap gap-3 align-items-center">
    <button type="button" class="btn btn-forge">Primary</button>
    <button type="button" class="btn btn-forge-outline">Outline amber</button>
    <button type="button" class="btn btn-cyan-outline">Outline cyan</button>
  </div>
</section>

<section id="ag-ctrl-badges" class="ks-section">
  <h2 class="ks-section-title">Controls · Badges</h2>
  {_spec_dl([
    ("Purpose", "Compact status or tag chips."),
    ("Styling", "Base <code>.forge-badge</code> plus tone: <code>.badge-cyan</code>, <code>.badge-amber</code>, <code>.badge-emerald</code>, <code>.badge-red</code>, <code>.badge-dim</code>."),
    ("Markup", "<code>&lt;span class=&quot;forge-badge badge-cyan&quot;&gt;Label&lt;/span&gt;</code>"),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="d-flex flex-wrap gap-2">
    <span class="forge-badge badge-cyan">Cyan</span>
    <span class="forge-badge badge-amber">Amber</span>
    <span class="forge-badge badge-emerald">Emerald</span>
    <span class="forge-badge badge-red">Red</span>
    <span class="forge-badge badge-dim">Dim</span>
  </div>
</section>

<section id="ag-ctrl-callouts" class="ks-section">
  <h2 class="ks-section-title">Controls · Callouts / alerts</h2>
  {_spec_dl([
    ("Purpose", "Highlighted notes: info, warning, success, error, neutral surface."),
    ("Styling", "Wrapper <code>.forge-callout</code> + variant: <code>.forge-callout-cyan</code>, <code>.forge-callout-amber</code>, <code>.forge-callout-emerald</code>, <code>.forge-callout-red</code>, <code>.forge-callout-surface</code>. Optional <code>.callout-label</code> with <code>.text-cyan</code> / <code>.text-amber</code> etc. For a pinned toolbar in <code>showcase_page</code> main content, use <code>.ks-sticky-panel</code> (sticky below <code>.site-header</code> via <code>--site-header-h</code>; darker glass surface in <code>forge-theme.css</code> / <code>docs-theme.css</code>)."),
    ("Python", "<code>render_alert(content, variant=…, label=…)</code> maps variants <code>info|warning|success|danger|secondary|light</code> to those classes. For bespoke markup, hand-write the divs as below."),
  ])}
  <p class="section-label text-cyan mb-2">Example (hand markup)</p>
  <div class="forge-callout forge-callout-cyan mb-2">
    <p class="callout-label text-cyan">Info</p>
    <p class="mb-0 forge-support">Cyan callout body.</p>
  </div>
  <p class="section-label text-cyan mb-2">Example (<code>render_alert</code>)</p>
  {alert_demo}
</section>

<section id="ag-ctrl-code" class="ks-section">
  <h2 class="ks-section-title">Controls · Code blocks &amp; inline</h2>
  {_spec_dl([
    ("Purpose", "Syntax-colored blocks (manual spans) or Markdown-derived <code>&lt;pre&gt;</code>."),
    ("Styling", "Block container <code>.forge-code</code>. Inner spans: <code>.keyword</code>, <code>.highlight</code>, <code>.comment</code> for demo styling. Markdown pipeline adds <code>.forge-code</code> to <code>&lt;pre&gt;</code> via <code>enhance_code_blocks</code> in <code>transforms.py</code>."),
    ("Markup", "Inline: <code>&lt;code&gt;</code>, <code>&lt;kbd&gt;</code> for keys."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="forge-code">
<span class="keyword">def</span> build_page():
    <span class="comment"># returns HTML string</span>
    <span class="keyword">return</span> layout(body)
  </div>
</section>

<section id="ag-nav-sidebar" class="ks-section">
  <h2 class="ks-section-title">Navigation · Sidebar patterns</h2>
  {_spec_dl([
    ("Purpose", "Handbook-style left rail: flat links or collapsible groups."),
    ("Styling", "Classic: <code>.forge-sidebar</code>, <code>.nav-section-label</code>, <code>.nav-rail</code>, <code>.nav-link</code> (<code>.active</code> for current), <code>.nav-group-toggle</code>, <code>.nav-sub-group</code>, <code>.nav-sub-link</code>. Site header brand: <code>.forge-brand</code> + <code>.brand-icon</code> (see sticky header in <code>showcase_page</code>). Collapsible doc pattern: <code>.doc-sidebar-group</code>, <code>.doc-sidebar-row</code>, <code>.doc-sidebar-toggle</code> (showcase also uses <code>.doc-sidebar-toggle--full</code> for full-width family rows), <code>.doc-sidebar-heading</code> / <code>.doc-sidebar-heading--label</code>, <code>.doc-sidebar-children</code>, <code>.doc-sidebar-link</code>, <code>.doc-sidebar-sublink</code>."),
    ("Behavior", "Showcase sidebar is server-rendered HTML. Some consumer sites hydrate chapter sidebars with JSON + JS — structure classes stay the same for CSS."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="row g-3">
    <div class="col-md-6">
      <div class="forge-sidebar p-3" style="border-radius:12px;border:1px solid var(--forge-border);min-height:200px">
        <p class="nav-section-label">Rail</p>
        <nav class="nav-rail">
          <a class="nav-link active" href="#">Active</a>
          <a class="nav-link" href="#">Other</a>
        </nav>
      </div>
    </div>
    <div class="col-md-6">
      <div class="forge-sidebar p-3" style="border-radius:12px;border:1px solid var(--forge-border);min-height:200px">
        <a class="doc-sidebar-link active" href="#">Top link</a>
        <div class="doc-sidebar-group">
          <div class="doc-sidebar-row">
            <button type="button" class="doc-sidebar-toggle" aria-label="Toggle">{_CHEVRON}</button>
            <a href="#" class="doc-sidebar-heading">Group</a>
          </div>
          <div class="doc-sidebar-children">
            <a class="doc-sidebar-sublink" href="#">Child</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="ag-nav-flow" class="ks-section">
  <h2 class="ks-section-title">Navigation · Flow diagram (CSS)</h2>
  {_spec_dl([
    ("Purpose", "Horizontal process / pipeline steps without SVG."),
    ("Styling", "Row <code>.forge-flow</code>. Steps <code>.forge-flow-node</code> with optional <code>.node-active</code>. Separators <code>.forge-flow-arrow</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="forge-flow">
    <span class="forge-flow-node node-active">A</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">B</span>
    <span class="forge-flow-arrow">&rarr;</span>
    <span class="forge-flow-node">C</span>
  </div>
</section>

<section id="ag-nav-chrome" class="ks-section">
  <h2 class="ks-section-title">Navigation · Breadcrumbs, skip link, mobile, footer</h2>
  {_spec_dl([
    ("Purpose", "Accessibility and orientation: skip to content, breadcrumb trail, mobile menu trigger, page footer."),
    ("Styling", "Breadcrumbs: <code>&lt;ol class=&quot;breadcrumb small mb-3&quot;&gt;</code> with <code>.breadcrumb-item</code>, <code>.active</code>, <code>aria-current</code>. Skip link is visually hidden until focused. Footer uses <code>render_footer</code> patterns (links + support text)."),
    ("Python", "<code>render_breadcrumbs([(href, label), …])</code> — use <code>href=None</code> for active crumb. <code>render_skip_link(target=&quot;#main&quot;)</code>. <code>render_mobile_nav_button()</code> for offcanvas toggle. <code>render_footer(date, label=…)</code> for generated-page footer."),
  ])}
  <p class="section-label text-cyan mb-2">Example (<code>render_breadcrumbs</code>)</p>
  {bc_demo}
  <p class="section-label text-cyan mb-2">Example (<code>render_skip_link</code>)</p>
  <div class="forge-callout forge-callout-surface py-2">{skip_demo}<span class="forge-support ms-2">Tab to focus the skip link.</span></div>
</section>

<section id="ag-nav-more" class="ks-section">
  <h2 class="ks-section-title">Navigation · More <code>components.py</code> emitters (live)</h2>
  <p class="forge-support mb-3">These helpers are listed in the <a href="#ag-python-inventory">function inventory</a>; below is runnable output for coverage. <code>render_mobile_nav_button()</code> is omitted here (fixed-position hamburger for the offcanvas shell — see handbook previews).</p>
  <p class="section-label text-cyan mb-2"><code>render_io_table</code></p>
  {io_demo}
  <p class="section-label text-cyan mb-2"><code>render_template_banner</code> · <code>render_canonical_note</code></p>
  <div class="row g-3">
    <div class="col-md-6">{tmpl_demo}</div>
    <div class="col-md-6">{canon_demo}</div>
  </div>
  <p class="section-label text-cyan mb-2"><code>render_nav_buttons</code></p>
  {nav_btn_demo}
  <p class="section-label text-cyan mb-2"><code>render_external_sources_section</code></p>
  {ext_demo}
  <p class="section-label text-cyan mb-2"><code>render_flow_details_section</code></p>
  {flow_demo}
  <p class="section-label text-cyan mb-2"><code>render_footer</code></p>
  {footer_demo}
  <p class="section-label text-cyan mb-2"><code>render_toc_sidebar_simple</code> (inner nav only)</p>
  <div class="forge-callout forge-callout-surface p-3" style="max-width:28rem">{toc_simple_demo}</div>
  <p class="section-label text-cyan mb-2"><code>render_page_header</code></p>
  {ph_demo}
  <p class="section-label text-cyan mb-2"><code>render_page_header_chapter</code></p>
  {ph_chapter_demo}
  <p class="section-label text-cyan mb-2"><code>render_toc_sidebar</code> (levels 2 vs 3 — extra indent on H3 links)</p>
  <div class="forge-callout forge-callout-surface p-3" style="max-width:22rem">{toc_leveled_demo}</div>
  <p class="section-label text-cyan mb-2"><code>render_cross_refs</code> · <code>render_authorship_signal</code></p>
  <div class="row g-3 mb-3">
    <div class="col-md-6">{cross_demo}</div>
    <div class="col-md-6">{auth_demo}</div>
  </div>
  <p class="section-label text-cyan mb-2"><code>render_tier_nav</code> (product theme — needs <code>forgesdlc-theme.css</code> for full polish)</p>
  <div class="p-3 rounded border" style="border-color:var(--forge-border)!important;max-width:22rem">{tier_demo}</div>
  <p class="section-label text-cyan mb-2"><code>render_ks_diagram_block</code> (static SVG tile)</p>
  <div class="forge-table-wrap" style="max-width:24rem">{ks_tile_demo}</div>
</section>

<section id="ag-python-api" class="ks-section">
  <h2 class="ks-section-title">Python · <code>components/components.py</code> API</h2>
  {_spec_dl([
    ("Purpose", "Atomic HTML fragments composed by site generators; layouts in <code>layouts.py</code> wrap full pages."),
    ("Escaping", "<code>e(s)</code> — full escape for attributes; <code>e_content(s)</code> — for text nodes; <code>bold(s)</code>."),
    ("Tables", "<code>render_table</code>, <code>render_io_table</code>."),
    ("Sections", "<code>render_section</code> — titled block with optional label."),
    ("Diagrams (diagram-as-code)", "<code>render_mermaid_block</code>, <code>render_diagrams_section</code>."),
    ("Callouts / banners", "<code>render_alert</code>, <code>render_template_banner</code>, <code>render_canonical_note</code>."),
    ("Nav &amp; content", "<code>render_breadcrumbs</code>, <code>render_nav_buttons</code>, <code>render_external_sources_section</code>, <code>render_flow_details_section</code>."),
    ("ToC", "<code>render_toc_sidebar</code>, <code>render_toc_sidebar_simple</code> — expect heading ids in body."),
    ("Chrome", "<code>render_skip_link</code>, <code>render_mobile_nav_button</code>, <code>render_footer</code>."),
    ("Headers / product", "<code>render_page_header</code>, <code>render_page_header_chapter</code>, <code>render_tier_nav</code>, <code>render_cross_refs</code>, <code>render_authorship_signal</code>, <code>render_product_landing_hero</code>, <code>wrap_product_site_article</code>, <code>render_product_footer</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Example (output shape of <code>render_mermaid_block</code>)</p>
  <p class="forge-support small mb-2"><code>showcase_page</code> injects the diagram runtime when the showcase page sets <code>has_mermaid</code> in its <code>PAGE</code> dict (see <a href="diagram-code-examples.html"><code>diagram-code-examples.html</code></a>). This page sets <code>has_mermaid</code> so the examples below initialize. Forge and handbook builds often pass <code>has_mermaid=False</code> and use <code>has_ks_diagram</code> + static templates instead.</p>
  <div class="forge-diagram breathe-static">
    <div class="mermaid small">graph LR
  A[Agent] --> B[HTML]</div>
  </div>
  <p class="section-label text-cyan mb-2"><code>render_diagrams_section</code> (uses <code>render_section</code> + multiple Mermaid blocks)</p>
  {diagrams_section_demo}
</section>

<section id="ag-python-inventory" class="ks-section">
  <h2 class="ks-section-title">Python · Complete function inventory</h2>
  <p class="forge-support mb-3">Every public symbol in <code>components/components.py</code> that emits markup (plus escaping helpers). Parameters and edge cases live in the module docstrings — this table is for coverage checking and routing agents to the right helper.</p>
  {python_inventory}
</section>

<section id="ag-transforms" class="ks-section">
  <h2 class="ks-section-title">Transforms · <code>components/transforms.py</code></h2>
  {_spec_dl([
    ("Purpose", "Post-process Markdown-generated HTML into Forge-themed markup."),
    ("Order", "<code>apply_all</code> runs: <code>convert_mermaid_blocks</code> → <code>convert_ascii_diagram_blocks</code> → <code>convert_ks_diagram_blocks</code> → <code>enhance_tables</code> → <code>enhance_blockquotes</code> → <code>enhance_code_blocks</code>. Returns <code>(html, has_mermaid, has_ks_diagram)</code>; <code>has_ks_diagram</code> is true for SVG template fences or ASCII fences with <code>expand:</code> and a valid catalog <code>key:</code>."),
    ("enhance_tables", "Wraps bare <code>&lt;table&gt;</code> with <code>.forge-table-wrap</code> and adds <code>.table .table-sm .table-striped</code>."),
    ("enhance_blockquotes", "Maps <code>**Warning**</code> / <code>**Note**</code> / <code>**Template**</code> lead-ins to colored callouts; generic blockquotes become <code>.forge-callout-surface</code>."),
    ("enhance_code_blocks", "Adds <code>.forge-code</code> to <code>&lt;pre&gt;</code>."),
    ("convert_mermaid_blocks", "Finds <code>language-mermaid</code> and <code>language-mermaid-expand</code> fenced blocks (Markdown <code>```mermaid</code> / <code>```mermaid-expand</code>) and replaces with <code>.forge-diagram</code> + <code>.mermaid</code>. Expand variant adds <code>forge-diagram-trigger</code> + <code>openDiagramModal</code> (runtime path)."),
    ("convert_ascii_diagram_blocks", "<code>language-blueprint-diagram-ascii</code> / <code>language-ks-diagram-ascii</code> → <code>.forge-diagram-ascii</code> + monospace <code>&lt;pre&gt;</code>; optional <code>key:</code> / <code>expand:</code> uses <code>openDiagramWithDetail</code> like SVG tiles."),
    ("convert_ks_diagram_blocks", "KS-native fences → <code>.ks-diagram-tile</code> + SVG <code>&lt;img&gt;</code>; expand uses <code>openDiagramWithDetail</code>. Layouts set <code>include_diagram_expand_modal</code> when <code>has_ks_diagram</code> (or legacy <code>has_mermaid</code> on showcase)."),
    ("extract_toc", "Parses <code>&lt;h2 id&gt;</code> / <code>&lt;h3 id&gt;</code> for right-rail ToC tuples."),
  ])}
  <p class="section-label text-cyan mb-2">Complete API</p>
  {transforms_inventory}
</section>

<section id="ag-diag-svg" class="ks-section">
  <h2 class="ks-section-title">Diagrams · SVG template assets</h2>
  {_spec_dl([
    ("Purpose", "Reusable diagram archetypes under <code>assets/svg/template-*.svg</code> — content instances live in consuming repos."),
    ("Styling", "Thumbnail cards use <code>.forge-diagram</code>, <code>.forge-diagram-trigger</code>, <code>.ks-diagram-card</code>, <code>.ks-thumb</code> in gallery."),
    ("Markup", "Typical thumb: <code>&lt;div class=&quot;forge-diagram forge-diagram-trigger …&quot; onclick=&quot;openDiagramWithDetail(this, 'linear')&quot;&gt;&lt;img src=&quot;assets/svg/template-….svg&quot; alt=&quot;…&quot;&gt;</code>. The key (<code>linear</code>, <code>loop</code>, …) must exist in <code>DIAGRAM_DETAILS</code> inside <code>showcase.js</code>."),
    ("Behavior", "<code>openDiagramWithDetail</code> clones SVG into the modal and wires hover/legend from JS metadata."),
  ])}
  <p class="forge-support mb-0">Live thumbnails for all {nd} templates follow in the next sections — each card is clickable.</p>
</section>

<section id="ag-diag-catalog" class="ks-section">
  <h2 class="ks-section-title">Diagrams · All {nd} SVG templates (visual)</h2>
  <p class="forge-support mb-4">Below are the same archetypes as <a href="diagrams.html"><code>diagrams.html</code></a> (built from <code>pages._diagram_gallery</code>): one <code>.bento-grid.bento-3</code> per family, each tile uses <code>onclick=&quot;openDiagramWithDetail(this, '&lt;key&gt;')&quot;</code> where <code>&lt;key&gt;</code> matches <code>DIAGRAM_DETAILS</code> in <code>js/showcase.js</code>. Cards include a <strong>Diagram-as-code:</strong> line listing the closest native grammars (flowchart, gantt, <code>xychart-beta</code>, etc.). Scroll is long by design so models and humans can see every asset.</p>
</section>

{diagram_gallery_sections}

<section id="ag-diag-code" class="ks-section">
  <h2 class="ks-section-title">Diagrams · diagram-as-code</h2>
  {_spec_dl([
    ("Purpose", "Diagram-as-code blocks rendered at runtime."),
    ("Styling", "Wrapper <code>&lt;div class=&quot;forge-diagram breathe-static&quot;&gt;</code> (optional <code>forge-diagram-trigger</code> + <code>onclick</code> for expand). Inner <code>&lt;div class=&quot;mermaid small&quot;&gt;</code> holds escaped source text."),
    ("Python", "<code>render_mermaid_block(diagram, expandable=False)</code> — when expandable, adds trigger and <code>openDiagramModal(this)</code>."),
  ])}
</section>

<section id="ag-diag-js" class="ks-section">
  <h2 class="ks-section-title">Diagrams · Modal DOM contract</h2>
  {_spec_dl([
    ("Purpose", "Full-screen/lightbox SVG viewer shared by diagram gallery and layout previews."),
    ("Markup", "Backdrop <code>#diagramModal.diagram-modal-backdrop</code> containing <code>.diagram-modal</code>, header (<code>#diagramModalTitle</code>, close button <code>.diagram-modal-close</code> calling <code>closeDiagramModal()</code>), body with <code>#diagramModalCanvas.diagram-modal-canvas</code> and <code>#diagramModalDetail.diagram-modal-detail</code>."),
    ("Behavior", "<code>showcase.js</code> implements <code>openDiagramWithDetail</code>, <code>openDiagramModal</code>, <code>openLayoutPreview</code> (iframe + legend), scroll-spy on <code>.ks-section[id]</code> for ToC/sidebar."),
  ])}
</section>

<section id="ag-motion-pulse" class="ks-section">
  <h2 class="ks-section-title">Motion · Pulse</h2>
  {_spec_dl([
    ("Purpose", "Continuous soft glow to draw attention (hero metrics, alerts)."),
    ("Styling", "<code>.pulse</code> on cyan/glass surfaces; <code>.pulse-amber</code> on amber glass."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="row g-3">
    <div class="col-md-4"><div class="glass p-3 pulse text-center"><span class="section-label">pulse</span></div></div>
    <div class="col-md-4"><div class="glass-amber p-3 pulse-amber text-center"><span class="section-label">pulse-amber</span></div></div>
  </div>
</section>

<section id="ag-motion-breathe" class="ks-section">
  <h2 class="ks-section-title">Motion · Breathe</h2>
  {_spec_dl([
    ("Purpose", "Hover border/shadow oscillation on cards and diagram shells."),
    ("Styling", "<code>.breathe-link</code> (clickable) and <code>.breathe-static</code> (non-link). Often paired with <code>.forge-card</code> or <code>.forge-diagram</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="row g-3">
    <div class="col-md-4"><a class="forge-card breathe-link d-block text-center py-3" href="#ag-motion-breathe">breathe-link</a></div>
    <div class="col-md-4"><div class="forge-card breathe-static text-center py-3">breathe-static</div></div>
  </div>
</section>

<section id="ag-motion-stats" class="ks-section">
  <h2 class="ks-section-title">Motion · Stat counters</h2>
  {_spec_dl([
    ("Purpose", "Large number + label in a glass tile (dashboards, landing stats)."),
    ("Styling", "Container <code>.forge-stat</code> inside glass. Value <code>.stat-value</code> (add <code>.text-amber</code> / <code>.text-cyan</code> or inline color). Label <code>.stat-label</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Example</p>
  <div class="bento-grid bento-3">
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-amber">12</div>
      <div class="stat-label">Label A</div>
    </div>
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-cyan">42</div>
      <div class="stat-label">Label B</div>
    </div>
  </div>
</section>

<section id="ag-layout-overview" class="ks-section">
  <h2 class="ks-section-title">Layouts · Overview</h2>
  {_spec_dl([
    ("Purpose", "Full HTML documents: <code>handbook_page</code>, <code>chapter_page</code>, <code>product_page</code>, <code>showcase_page</code>, <code>landing_page</code>, <code>marketing_page</code>, <code>gallery_page</code>, <code>split_page</code> in <code>components/layouts.py</code>."),
    ("Canonical shell", "<code>showcase_page</code> is the reference documentation layout (header + sidebar + body + optional right ToC). Consumer generators should mirror <code>generator/build-showcase.py</code> <code>_render_page</code> kwargs (including <code>has_mermaid</code> from <code>PAGE</code> when needed)."),
    ("Live previews", 'Build writes <code>preview-handbook.html</code>, <code>preview-chapter.html</code>, <code>preview-product.html</code>, <code>preview-split.html</code> next to other showcase HTML via <code>layout_previews.py</code>. The <a href="layouts.html">Page Layouts</a> page opens them in a modal iframe.'),
  ])}
  <p class="section-label text-cyan mb-2">Layout functions (<code>layouts.py</code>)</p>
  {layouts_inventory}
</section>

<section id="ag-layout-showcase" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>showcase_page</code></h2>
  {_spec_dl([
    ("Parameters", "<code>browser_title</code>, <code>page_title</code>, <code>sidebar_html</code>, <code>body_html</code>, <code>toc_html</code> (optional), <code>breadcrumb_html</code>, <code>footer_html</code>, <code>extra_css</code>, <code>extra_js</code> (list of src paths), <code>theme_css_href</code>, <code>theme_js_href</code>, <code>has_mermaid</code> (optional, default false — injects diagram runtime init when true)."),
    ("Structure", "Sticky header (brand, breadcrumb, H1) + scrollable left sidebar + main column + optional right <code>.forge-toc</code>."),
    ("Used by", "Kitchensink showcase (this site) for most pages."),
  ])}
</section>

<section id="ag-layout-landing" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>landing_page</code></h2>
  {_spec_dl([
    ("Parameters", "<code>hero_html</code>, <code>body_html</code>, <code>nav_links_html</code>, <code>footer_html</code>, <code>announcement_html</code> (optional full-width strip, <code>.fs-site-announcement</code>) — no sidebar. <code>product_chrome_css_href</code> (e.g. <code>assets/forgesdlc-theme.css</code>) after <code>theme_css_href</code>; <code>hero_band_extra_class</code> for opt-in hero modifiers."),
    ("Used by", "Product homepages (e.g. forgesdlc.com, situ8.app). Live: <a href=\"preview-landing.html\"><code>preview-landing.html</code></a>. Showcase entry still uses <code>index.html</code>."),
  ])}
</section>

<section id="ag-layout-marketing" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>marketing_page</code></h2>
  {_spec_dl([
    ("Parameters", "<code>body_html</code>, <code>nav_links_html</code>, <code>footer_html</code>, <code>announcement_html</code> (optional). No hero band; Bootstrap navbar collapse on small screens."),
    ("Used by", "Marketing interiors without <code>product_page</code> sidebar chrome. Live: <a href=\"preview-marketing.html\"><code>preview-marketing.html</code></a>."),
  ])}
</section>

<section id="ag-layout-gallery" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>gallery_page</code></h2>
  {_spec_dl([
    ("Parameters", "Like showcase but no right-rail ToC column — wider main for grids."),
    ("Used by", "<code>diagrams.html</code>."),
  ])}
</section>

<section id="ag-layout-split" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>split_page</code></h2>
  {_spec_dl([
    ("Parameters", "<code>left_html</code> (demo), <code>right_html</code> (docs). <code>extra_js</code> passed separately in builder."),
    ("Used by", "Optional pattern for playground + explanation pages."),
  ])}
</section>

<section id="ag-layout-handbook" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>handbook_page</code></h2>
  {_spec_dl([
    ("Parameters", "<code>sidebar_html</code>, <code>body_html</code>, <code>toc_html</code> — three-column blueprint handbook."),
    ("Used by", "blueprints-website generator."),
  ])}
</section>

<section id="ag-layout-chapter" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>chapter_page</code></h2>
  {_spec_dl([
    ("Styling", "Uses <code>docs-theme.css</code> for chapter chrome."),
    ("Used by", "Methodology chapters in blueprints-website."),
  ])}
</section>

<section id="ag-layout-product" class="ks-section">
  <h2 class="ks-section-title">Layouts · <code>product_page</code></h2>
  {_spec_dl([
    ("Styling", "<code>forgesdlc-theme.css</code>, <code>fs-*</code> layout and tier sidebar."),
    ("Used by", "forgesdlc.com static generator."),
  ])}
</section>

<section id="ag-js-theme" class="ks-section">
  <h2 class="ks-section-title">JS · <code>forge-theme.js</code></h2>
  {_spec_dl([
    ("Purpose", "Theme preference persistence and Bootstrap <code>data-bs-theme</code> sync."),
    ("Cookie", "<code>forge_color_scheme</code> values: <code>light</code>, <code>dark</code>, <code>auto</code> (follow system)."),
    ("DOM", "Dropdown roots <code>.forge-theme-dropdown</code>; items with <code>data-forge-color-scheme</code>; label <code>.forge-theme-current</code>."),
    ("Events", "Dispatches <code>forge-theme-applied</code> on <code>window</code> with effective theme."),
    ("Diagram runtime / SVG", "File header documents diagram scaling and cluster animation hooks used on content pages."),
  ])}
</section>

<section id="ag-js-showcase" class="ks-section">
  <h2 class="ks-section-title">JS · <code>showcase.js</code></h2>
  {_spec_dl([
    ("Scroll-spy", "<code>IntersectionObserver</code> on <code>.ks-section[id]</code>; toggles <code>.active</code> on <code>.forge-toc .nav-link</code> and <code>#ks-sidebar-nav a[href^=&quot;#&quot;]</code>."),
    ("Diagram modal", "<code>DIAGRAM_DETAILS</code> map keys match <code>onclick</code> keys in gallery cards. <code>openLayoutPreview</code> embeds showcase pages or <code>preview-*.html</code> in the modal iframe."),
  ])}
</section>

<section id="ag-product-theme" class="ks-section">
  <h2 class="ks-section-title">Product · <code>forgesdlc-theme.css</code> &amp; <code>fs-*</code></h2>
  {_spec_dl([
    ("Purpose", "Marketing/product site look separate from handbook dark docs."),
    ("Tokens", "CSS variables use <code>--fs-*</code> prefix (see stylesheet). Classes include <code>.fs-layout</code>, <code>.fs-sidebar</code>, <code>.fs-brand</code>, <code>.landing-hero-*</code>, <code>.fs-cross-refs</code>."),
    ("Python", "<code>render_product_landing_hero</code>, <code>render_cross_refs</code>, <code>render_product_footer</code>, <code>wrap_product_site_article</code> emit product markup."),
    ("Marketing sections", "<code>components/marketing_sections.py</code> — <code>render_marketing_stat_band</code>, <code>render_case_study_spotlight</code>, <code>render_people_showcase</code> (see <a href=\"#ag-marketing-sections\">Marketing sections</a>)."),
    ("Live preview", "After <code>python3 generator/build-showcase.py</code>, open <code>showcase/preview-product.html</code> (or use the Layouts page “Open live preview” for product) — do not load product CSS on this handbook-themed page or variables will clash."),
  ])}
  <p class="forge-support mb-0">Relative link from this file: <a href="preview-product.html"><code>preview-product.html</code></a> (same directory as <code>for-agents.html</code>) — includes <code>render_product_landing_hero</code>, <code>render_product_footer</code>, and notes on <code>wrap_product_site_article</code>.</p>
  <p class="section-label text-cyan mb-2 mt-3"><code>wrap_product_site_article</code> (landing bodies only)</p>
  <div class="forge-callout forge-callout-surface p-3">{wrap_product_demo}</div>
</section>

<section id="ag-marketing-sections" class="ks-section">
  <h2 class="ks-section-title">Marketing · <code>components/marketing_sections.py</code></h2>
  {_spec_dl([
    ("Purpose", "Composable KPI row, case study spotlight, and people grid for enterprise-style static marketing pages."),
    ("Styling", "Uses <code>.forge-stat-band</code> / <code>.forge-stat</code>, <code>.fs-case-study-spotlight</code>, <code>.fs-people-showcase</code> in <code>forgesdlc-theme.css</code>; compose inside <code>landing_page</code> body or <code>wrap_product_site_article</code>."),
    ("Imports", "<code>from components import render_marketing_stat_band, MarketingStatCell, …</code> — symbols are exported from the <code>components</code> package after core emitters load."),
    ("Live", "<a href=\"presentation.html#sec-marketing-sections\"><code>presentation.html</code> · Marketing sections</a>."),
  ])}
</section>

<section id="ag-fs-overview" class="ks-section">
  <h2 class="ks-section-title">Presentation · Stage vs rail</h2>
  {_spec_dl([
    ("Purpose", "Marketing and storytelling patterns live in the <code>fs-*</code> product layer — not handbook <code>forge-*</code> primitives."),
    ("When to use stage", "One slide in view: heroes, testimonials, large galleries. Supports autoplay (disabled when <code>prefers-reduced-motion</code>), swipe, keyboard, dots, arrows."),
    ("When to use rail", "Multiple peers horizontally: case-study cards, logos, media strips. CSS scroll-snap first; optional arrow nudging; optional vertical-wheel → horizontal scroll."),
    ("Live examples", "<a href=\"presentation.html\"><code>presentation.html</code></a> in the built showcase."),
  ])}
</section>

<section id="ag-fs-stage" class="ks-section">
  <h2 class="ks-section-title">Presentation · <code>fs-stage-carousel</code></h2>
  {_spec_dl([
    ("Purpose", "Single-focus carousel: translate track inside fixed aspect-ratio viewport to avoid CLS."),
    ("Styling", "Block in <code>forgesdlc-theme.css</code> — <code>.fs-stage-carousel</code>, <code>__viewport</code>, <code>__track</code>, <code>__slide</code>, <code>__overlay</code>, <code>__toolbar</code>, modifiers <code>--hero</code>, <code>--gallery</code>, <code>--testimonial</code>."),
    ("Markup", "Root <code>&lt;section data-fs-stage-carousel&gt;</code> with <code>data-fs-autoplay</code>, <code>data-fs-interval-ms</code>, <code>data-fs-loop</code>, <code>data-fs-show-arrows</code>, <code>data-fs-show-dots</code>; live region <code>.fs-stage-carousel__live</code> (<code>aria-live=&quot;polite&quot;</code>); slides are <code>.fs-stage-carousel__slide</code> with stable <code>id</code>s for <code>aria-controls</code> on dots."),
    ("Slide actions", "<code>data-fs-slide-action=&quot;lightbox&quot;</code> + <code>data-fs-lightbox-src</code> / <code>data-fs-lightbox-alt</code>; <code>topic</code> + <code>data-fs-topic-href</code> / <code>data-fs-topic-title</code> calls <code>openTopicPreviewModal</code>; <code>link</code> uses a full-size <code>&lt;a class=&quot;fs-stage-carousel__media-hit&quot;&gt;</code>."),
    ("Behavior", "<code>fs-presentation.js</code> wires navigation, touch swipe, autoplay pause on hover/focus/manual nav (resume after pointer/focus leaves root), visibility pause, and dot generation."),
    ("Python API", "<code>render_stage_carousel</code> from <code>components/presentation.py</code> (also re-exported from <code>components</code> package)."),
  ])}
  <p class="section-label text-cyan mb-2">Live example</p>
  <p class="forge-support mb-0">See <a href="presentation.html#sec-stage-primitive">Presentation controls · Primitive</a>.</p>
</section>

<section id="ag-fs-rail" class="ks-section">
  <h2 class="ks-section-title">Presentation · <code>fs-rail</code></h2>
  {_spec_dl([
    ("Purpose", "Horizontal multi-card / logo / media scroller with snap points and optional peek of the next card."),
    ("Styling", "<code>.fs-rail</code>, <code>__scroller</code>, <code>__track</code>, <code>__item</code>, modifiers <code>--cards</code>, <code>--logos</code>, <code>--media</code>, <code>--peek</code>."),
    ("Markup", "Root <code>&lt;div data-fs-rail&gt;</code> with <code>data-fs-rail-arrows</code>, <code>data-fs-rail-wheel</code>; prev/next <code>.fs-rail__arrow</code> flank <code>.fs-rail__scroller</code>."),
    ("Behavior", "Arrows call <code>scrollBy</code> (~0.72 viewport width); optional wheel listener maps vertical delta to horizontal when enabled."),
    ("Python API", "<code>render_rail</code>, <code>render_card_rail</code>."),
  ])}
  <p class="section-label text-cyan mb-2">Live example</p>
  <p class="forge-support mb-0">See <a href="presentation.html#sec-rail-primitive">Presentation controls · fs-rail</a>.</p>
</section>

<section id="ag-fs-derived" class="ks-section">
  <h2 class="ks-section-title">Presentation · Derived Phase 1 components</h2>
  {_spec_dl([
    ("fs-hero-carousel", "Modifier <code>fs-stage-carousel--hero</code> + wide aspect; overlay copy and CTAs."),
    ("fs-gallery-carousel", "<code>--gallery</code>; caption overlay on media; same-height viewport."),
    ("fs-thumb-gallery", "Wraps stage + <code>.fs-thumb-gallery__strip</code> tab-style thumbs; JS syncs selection."),
    ("fs-card-rail", "<code>fs-rail--cards</code> with <code>.forge-card</code> cells."),
    ("fs-testimonial-slider", "<code>--testimonial</code> text-first slide layout."),
    ("fs-logo-strip", "<code>mode=&quot;grid&quot;|&quot;rail&quot;|&quot;marquee&quot;</code>; marquee uses duplicated segment + CSS animation (disabled when reduced-motion)."),
  ])}
  <p class="section-label text-cyan mb-2">Live example</p>
  <p class="forge-support mb-0"><a href="presentation.html"><code>presentation.html</code></a> — full section list in page ToC.</p>
</section>

<section id="ag-fs-python" class="ks-section">
  <h2 class="ks-section-title">Presentation · <code>components/presentation.py</code></h2>
  {_spec_dl([
    ("Purpose", "Typed slide/item dataclasses (<code>StageSlide</code>, <code>RailItem</code>, <code>LogoItem</code>) and HTML emitters for product pages."),
    ("Styling", "Escapes text via <code>e</code> / <code>e_content</code>; does not load CSS — consumer must include <code>forgesdlc-theme.css</code>."),
    ("Imports", "Showcase <code>pages/presentation.py</code> imports <code>presentation</code> and <code>marketing_sections</code> (path lists <code>components/</code>); package consumers use <code>from components import render_stage_carousel</code> or <code>render_marketing_stat_band</code>."),
  ])}
  <p class="forge-support mb-0">Inventory rows: <a href="#ag-python-inventory">Python · Function inventory</a>.</p>
</section>

<section id="ag-fs-js" class="ks-section">
  <h2 class="ks-section-title">Presentation · <code>fs-presentation.js</code></h2>
  {_spec_dl([
    ("Purpose", "Stage carousel, thumb sync, rail arrows/wheel, dedicated image lightbox (<code>#fsMediaLightbox</code>) — avoids sharing the diagram modal."),
    ("Load order", "After Bootstrap bundle and <code>forge-theme.js</code> so <code>openTopicPreviewModal</code> exists for topic slide actions."),
    ("Lightbox", "Global <code>fsOpenMediaLightbox(src, alt)</code>; Escape and backdrop close; restores <code>body</code> overflow."),
  ])}
</section>

<div id="diagramModal" class="diagram-modal-backdrop" hidden aria-hidden="true">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <div id="diagramModalTitle" class="diagram-modal__title forge-gradient-text" role="heading" aria-level="2"></div>
      <button type="button" class="diagram-modal-close" onclick="closeDiagramModal()" aria-label="Close"><span class="diagram-modal-close-icon" aria-hidden="true"></span></button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>"""
