# forgesdlc-kitchensink

Shared design system for ForgeSDLC documentation sites.

## Contents

| Directory | Purpose |
|-----------|---------|
| `css/` | Theme stylesheets — `forge-theme.css` (blueprints), `forgesdlc-theme.css` (forgesdlc.com), `docs-theme.css` (shared docs) |
| `js/` | Client-side scripts — navigation, portal, theme logic |
| `components/` | Python UI component library — atomic HTML renderers, page layouts, HTML transforms |
| `assets/svg/` | Diagram **type templates** only (Forge palette); content diagrams live in each project |
| `generator/` | `build-showcase.py` — Kitchen Sink **showcase** mini-site into `showcase/` (gitignored); `ks_assets.py` — copy theme/JS/SVG into consumer `website/assets/` (forgesdlc.com, blueprints handbook) |

## Kitchen Sink showcase

From the repo root:

```bash
python3 generator/build-showcase.py
```

Open `index.html` in a browser (it redirects to `showcase/index.html`). For reliable diagram previews and modals, serve over HTTP, e.g. `python3 -m http.server` then visit `http://localhost:8000/showcase/index.html`.

The legacy `test.html` is a redirect to the same entry point.

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

## Design tokens

Built on Bootstrap 5.3 dark mode. Primary palette:

- Background: `#0A0E17` (deep space)
- Amber accent: `#F59E0B`
- Cyan accent: `#06B6D4`
- Fonts: Inter (body), JetBrains Mono (code), Space Mono (labels)
