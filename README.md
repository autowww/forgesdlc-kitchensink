# forgesdlc-kitchensink

Shared design system for ForgeSDLC documentation sites.

**Git / branching (Forge Team tier):** [`docs/GIT-WORKFLOW.md`](docs/GIT-WORKFLOW.md).

## Canonical documentation shell

**For generated static documentation pages, treat the Kitchen Sink showcase as the single source of truth for HTML structure.**

- **Layout:** [`showcase_page`](components/layouts.py) — sticky site header, `forge-sidebar` left rail, main `doc-content`, optional right-rail `forge-toc`.
- **Assets:** [`forge-theme.css`](css/forge-theme.css) + [`forge-theme.js`](js/forge-theme.js) (paths are typically copied into your site’s `assets/` during build).
- **Composition reference:** [`generator/build-showcase.py`](generator/build-showcase.py) — `_render_page()` builds the `common` kwargs and calls `showcase_page(body_html=..., toc_html=..., **common)` for the default `layout` path. **Copy that call shape** in other generators rather than inventing parallel page shells.

Other layouts in `layouts.py` (`handbook_page`, `product_page`, `chapter_page`, `landing_page`, `gallery_page`, `split_page`, …) remain for **existing sites and special cases** (home/hero, card grids, split demos, legacy handbooks). **New** cross-project doc output should target **`showcase_page`** unless you have a hard requirement for a different shell.

### Using `showcase_page` in your generator

Minimal pattern (adjust paths for your repo layout):

```python
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "kitchensink" / "components"))

from layouts import showcase_page

sidebar_html = """<div class="nav-rail">
  <a class="doc-sidebar-link" href="index.html">Home</a>
</div>"""

body_html = "<p class=\"forge-support\">Your Markdown → HTML body.</p>"

toc_html = ""  # or right-rail links: '<a class="nav-link" href="#sec-1">Section</a>'

html = showcase_page(
    browser_title="My Page — My Site",
    brand_name="My Site",
    brand_subtitle="Docs",
    page_title="My Page",
    breadcrumb_html='<nav aria-label="breadcrumb"><ol class="breadcrumb mb-1">...</ol></nav>',
    sidebar_html=sidebar_html,
    offcanvas_html="",  # often same as sidebar_html
    body_html=body_html,
    toc_html=toc_html,
    footer_html="<footer>...</footer>",
    extra_css="",
    extra_js=["assets/showcase.js"],  # optional; KS showcase uses this for modals/diagrams
    theme_css_href="assets/forge-theme.css",
    theme_js_href="assets/forge-theme.js",
)
```

This mirrors the `common` dict and `showcase_page(...)` invocation in `build-showcase.py` (`_render_page`, default branch).

### Migration (other repositories)

Converging **existing** generators to this shell is **separate work** (not required to use this repo):

| Project | Generator | Direction |
|---------|-----------|-----------|
| **forgesdlc** | `generator/build-site.py` | Prefer `showcase_page` over `product_page` where a doc-style shell fits; keep `landing_page` for true marketing/hero pages if needed. |
| **blueprints-website** | `generator/build-handbook.py` | Align handbook HTML with `showcase_page` where feasible; `handbook_page` may remain until migrated. |

## Contents

| Directory | Purpose |
|-----------|---------|
| `css/` | Theme stylesheets — `forge-theme.css` (blueprints), `forgesdlc-theme.css` (forgesdlc.com), `docs-theme.css` (shared docs) |
| `js/` | Client-side scripts — navigation, portal, theme logic |
| `components/` | Python UI component library — atomic HTML renderers, page layouts, HTML transforms |
| `assets/svg/` | Diagram **type templates** only (Forge palette); content diagrams live in each project |
| `generator/` | `build-showcase.py` — Kitchen Sink **showcase** mini-site into `showcase/` (gitignored); `ks_assets.py` — copy theme/JS/SVG into consumer `website/assets/` (forgesdlc.com, blueprints handbook) |
| `forge-autodoc/` | Markdown → static handbook HTML (`python3 -m forge_autodoc`); consumed by **blueprints-website** and **forgesdlc** via `kitchensink/forge-autodoc` (no separate submodule) |
| `react/` | Optional React primitives — e.g. **`WorkspaceLensControl`**; consumed by **Lenses Studio** via `npm run sync-kitchensink-react` in `forge-lenses/lenses-enterprise` (see `react/README.md`) |
| `docs/design/` | **Forge Enterprise UI** ([`forge-enterprise-ui.md`](docs/design/forge-enterprise-ui.md)) — theme packs (`fs_pack`) and static sites; **Lenses Studio shell** ([`lenses-studio-shell.md`](docs/design/lenses-studio-shell.md)) — Electron window, `/studio/` SPA, `/__ks/` reuse |

## Kitchen Sink showcase

From the repo root:

```bash
python3 generator/build-showcase.py
```

Open `index.html` in a browser (it redirects to `showcase/index.html`). For reliable diagram previews and modals, serve over HTTP, e.g. `python3 -m http.server` then visit `http://localhost:8000/showcase/index.html`.

The legacy `test.html` is a redirect to the same entry point.

### Showcase layouts (`generator/build-showcase.py`)

Each page module under `generator/pages/` sets `PAGE["layout"]`, which `_render_page` maps to a layout function in `components/layouts.py`:

| `layout` | Function | Typical use |
|----------|----------|-------------|
| `"showcase"` (default) | `showcase_page` | **Canonical doc shell** — sidebar, main body, optional right-rail ToC. Use for almost all component and token documentation. |
| `"gallery"` | `gallery_page` | Full-width main column (no right ToC). Used by **`diagrams.html`** for the bento diagram catalog. |
| `"landing"` | `landing_page` | Top nav + hero + body, no sidebar. **`index.html`** (home) and **`living-background.html`**. |
| `"split"` | `split_page` | Two-column main (demo left, notes right). **`split-layout.html`** exercises this in the built site; `layout_previews.py` also emits `preview-split.html`. |

New pages should default to **`showcase`** unless they intentionally need gallery width, a marketing landing shell, or a split main.

## Usage as submodule

```bash
git submodule add <url> kitchensink
```

Then reference styles and components from your generator:

```python
import sys
sys.path.insert(0, "kitchensink/components")
from components import render_card, render_badge
from transforms import enhance_tables
```

CSS is copied to your `website/assets/` during build.

## Blueprint diagram fences (Markdown → HTML)

Handbook and product-site generators run Markdown through HTML transforms that replace fenced blocks with static SVG tiles (Forge palette) and optional click-to-expand legend modals.

**Public fence names (use in blueprint / product Markdown):**

- ` ```blueprint-diagram ` — inline tile (no lightbox)
- ` ```blueprint-diagram-expand ` — tile opens modal with catalog legend when `key:` matches a known template
- ` ```blueprint-diagram-ascii ` — monospace ASCII / box-drawing in the diagram shell; optional `key:` / `alt:` / `caption:` / `expand:` prefix (same modal behavior as SVG when `expand:` is true and `key:` is valid)

**Legacy aliases** (still accepted by transforms): ` ```ks-diagram ` / ` ```ks-diagram-expand `; ASCII: ` ```ks-diagram-ascii `.

Heuristics for picking a `key:` from ASCII intent are documented in [`docs/ascii-to-ks-diagrams.md`](docs/ascii-to-ks-diagrams.md).

**Inline example:**

```markdown
```blueprint-diagram
key: swimlane
alt: Cross-team handoffs
```
```

**Expand example:**

```markdown
```blueprint-diagram-expand
key: linear
alt: End-to-end flow
```
```

**ASCII example:**

```markdown
```blueprint-diagram-ascii
key: linear
alt: Sketch of a linear flow
caption: Optional caption below the figure
+------+     +------+
|  A   | --> |  B   |
+------+     +------+
```
```

**Custom SVG under `assets/`:**

```markdown
```blueprint-diagram-expand
src: svg/my-flow.svg
alt: Program-specific figure
expand: true
```
```

- **Catalog keys** (`linear`, `swimlane`, `sequence`, …) and SVG filenames are defined in [`generator/pages/_diagram_gallery.py`](generator/pages/_diagram_gallery.py) (`_FAMILIES`).
- **Legend text** for the modal is shipped to sites as `ks-diagram-catalog.js` (metadata extracted from the showcase `DIAGRAM_DETAILS` object); keep catalog and templates in sync when you add types.
- The **diagram runtime** is loaded on **showcase** pages only (`diagram-code-examples.html`, diagram parallels)—not on consumer handbook/product builds by default.
- GitHub does not render diagram fences; use the published HTML site or build [`generator/build-showcase.py`](generator/build-showcase.py) locally for live previews.

## Design tokens

Built on Bootstrap 5.3 dark mode. Primary palette:

- Background: `#0A0E17` (deep space)
- Amber accent: `#F59E0B`
- Cyan accent: `#06B6D4`
- Fonts: Proxima Nova Black (display), Open Sans (body / labels), Courier New (code); load Proxima via Adobe Fonts or `@font-face`
