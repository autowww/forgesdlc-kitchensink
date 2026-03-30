# forge-autodoc (**fa**)

Build **static technical handbooks / tutorials** for engineers from your repository’s Markdown, using this repo’s **Kitchen Sink** (`../components`, `../css`, …) for `handbook_page`, prose styling, diagrams, and shared assets.

**Source of truth:** this directory lives inside **[forgesdlc-kitchensink](https://github.com/autowww/forgesdlc-kitchensink)** at `forge-autodoc/`. Sites vendor **one** `kitchensink/` submodule and use `kitchensink/forge-autodoc` for imports and CLI—no separate forge-autodoc submodule.

**Git / branching (Forge Team tier):** [`../docs/GIT-WORKFLOW.md`](../docs/GIT-WORKFLOW.md) (scopes include `forge_autodoc`).

## Layout

- `forge_autodoc/` — Python package (Markdown → HTML, sidebars, page assembly).
- **Kitchensink** for themes and transforms is the **parent repository** (`..`), not a nested submodule.

## Diagram fences in Markdown

Consumer handbooks use fenced blocks processed by Kitchen Sink transforms. Authoring details: parent repo README section **«Blueprint diagram fences»** (`blueprint-diagram` / `blueprint-diagram-expand`; legacy `ks-diagram` aliases remain supported).

## Install

From this directory:

```bash
pip install -e .
# or: pip install markdown PyYAML && PYTHONPATH=. python3 -m forge_autodoc --help
```

## Quick CLI

Build a single content tree to a directory (flat HTML filenames derived from paths):

```bash
python3 -m forge_autodoc build \
  --kitchensink .. \
  --content ./path/to/docs \
  --out ./dist/handbook \
  --handbook-name "My handbook"
```

Or use a YAML config file:

```bash
python3 -m forge_autodoc build --config handbook.yaml
```

See [`examples/handbook.example.yaml`](examples/handbook.example.yaml).

## Using fa from a site that vendors `kitchensink/`

Put **source** Markdown where you choose (e.g. `fa-tutorial-md/`). Point **`PYTHONPATH`** at `kitchensink/forge-autodoc` and pass **`--kitchensink`** to your site’s `kitchensink/` directory (same revision as the rest of the build):

```bash
git submodule update --init --recursive kitchensink

PYTHONPATH=kitchensink/forge-autodoc python3 -m forge_autodoc build \
  --content ./fa-tutorial-md \
  --out ./tutorials \
  --kitchensink ./kitchensink \
  --handbook-name "Project tutorials"
```

**Kitchensink path (`--kitchensink`):** Always the host’s `kitchensink/` submodule root so themes match the site.

Or use a YAML config at the host root; paths in the file are relative to **the YAML file’s directory** (see [`examples/fa-handbook.host.example.yaml`](examples/fa-handbook.host.example.yaml)).

Copy [`examples/build-fa-tutorials.host.example.sh`](examples/build-fa-tutorials.host.example.sh) to the host as `build-fa-tutorials.sh` and adjust names. Add `tutorials/` to the host `.gitignore` if you do not commit built HTML.

## Library usage

```python
from pathlib import Path
import forge_autodoc as fa

ks = Path("kitchensink")
body = fa.markdown_to_handbook_html("# Title\n\nHello.")
html = fa.assemble_handbook_page(
    kitchensink_root=ks,
    browser_title="Page",
    handbook_name="Docs",
    ...
)
```

## Requirements

- Python 3.10+
- `pip install markdown PyYAML`
- Kitchensink checkout (parent repo when developing fa; host `kitchensink/` submodule when embedded in a site)
