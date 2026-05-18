# Consumer sites — hash markers and live verification

Kitchen Sink layouts, forge-autodoc shells, and shared components emit **`hash="XYZ"`** and **`data-ks-hash="XYZ"`** on visual roots (see [`README.md`](README.md)). Consumer sites use the **`kitchensink/`** submodule; after updating to a KS revision that includes current `components/` and `forge-autodoc/`, rebuilt HTML should carry the same attributes wherever KS Python layouts or `assemble_handbook_page` are used. **Do not claim production is fixed until raw HTML from the live URL is checked** — deploy timing and submodule pins can lag the standalone KS repo.

## Canonical public hosts (scope)

| Site | Typical content | Build repo (submodule KS) |
|------|-----------------|---------------------------|
| [forgesdlc.com](https://forgesdlc.com/) | Product / marketing pages | `forgesdlc` (`kitchensink/`) |
| [lcdl.forgesdlc.com](https://lcdl.forgesdlc.com/) | LCDL handbook | `forge-lcdl-website` (`kitchensink/` + `forge-lcdl/`) |
| [fleet.forgesdlc.com](https://fleet.forgesdlc.com/) | Fleet handbook | `forge-fleet-website` (`kitchensink/` + `forge-fleet/`) |
| [lenses.forgesdlc.com](https://lenses.forgesdlc.com/) | Lenses handbook | `forge-lenses-website` (`kitchensink/` + `forge-lenses/`) |
| [platform.forgesdlc.com](https://platform.forgesdlc.com/) | Platform handbook | `forge-platform-website` (`kitchensink/` + `forge-platform/`) |
| [ks.forgesdlc.com](https://ks.forgesdlc.com/) | Showcase | `forgesdlc-kitchensink` (`showcase/` after `build-showcase.py`) |
| [blueprints.forgesdlc.com](https://blueprints.forgesdlc.com/) | Blueprints handbook | `blueprints-website` (`kitchensink/`) |

## Map a live hash to contract and screenshot

1. Read the three-letter id from raw HTML (`hash` / `data-ks-hash`).
2. Open [`visual-registry.generated.json`](visual-registry.generated.json) (or [`visual-registry.yaml`](visual-registry.yaml)) and find the row with that **`hash`**.
3. **Design contract:** `contract` / `contract_path` (Markdown under `docs/design/catalog/…`).
4. **Canonical screenshot URL:** `screenshot_url` in the registry row. Hosted pattern (showcase):  
   `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png`  
   (mobile: `{HASH}.mobile.png`, light: `{HASH}.light.png` — see [`screenshots/README.md`](screenshots/README.md)).

## Local verification (built output)

From the **consumer repo** after its documented static build (output tree is often `website/`):

```bash
# Path to a checkout that contains docs/design/catalog/visual-registry.generated.json
# (the KS submodule root, or symlink / copy for CI)
KS_ROOT="../forgesdlc/kitchensink"   # example: adjust to your submodule path

node "$KS_ROOT/tools/design-catalog/check-consumer-hashes.mjs" \
  --repo "$KS_ROOT" \
  --file website/index.html

node "$KS_ROOT/tools/design-catalog/check-consumer-hashes.mjs" \
  --repo "$KS_ROOT" \
  --dir website/ \
  --strict
```

Standalone KS (sanity-check emitted HTML):

```bash
cd /path/to/forgesdlc-kitchensink
python3 generator/build-showcase.py
node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase/ --strict
```

## Live raw HTML — quick grep

**These only prove markers exist in the fetched HTML snapshot — not that a specific deploy revision matches git.**

```bash
curl -L https://forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
curl -L https://platform.forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
curl -L https://ks.forgesdlc.com/cases/showcase/preview-handbook.html | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
```

The KS static host uses the `cases/showcase/` path prefix (see live root `https://ks.forgesdlc.com/`). **Live HTML may lag** this repository; if grep finds no markers, rebuild/deploy KS showcase or check a deeper showcase page after confirming the deploy includes current `generator/build-showcase.py` output.

## Live check — Node (registry-aware)

Point at the same **`visual-registry.generated.json`** as your intended KS submodule revision (copy path or use submodule root):

```bash
KS_ROOT=/path/to/forgesdlc-kitchensink
node "$KS_ROOT/tools/design-catalog/check-consumer-hashes.mjs" \
  --repo "$KS_ROOT" \
  --url https://forgesdlc.com/
```

Use **`--strict`** to exit non-zero when markers are missing, unknown vs registry, or `hash` / `data-ks-hash` counts disagree per id.

## Deploy / release checklist (operators)

1. Bump **`kitchensink/`** submodule in the consumer repo to the KS commit you intend to ship.
2. Run the site generator build (`build-site.py`, `build-handbook.py`, etc.).
3. Run **`check-consumer-hashes.mjs`** on **`--dir website/`** (or key **`--file`** pages) with **`--strict`**.
4. Deploy hosting.
5. **Production verification:** `curl -L <canonical URL> | grep -E …` and/or **`--url`** against the same JSON registry you expect. Record date/time; do not claim parity without this step.

## When this repo is the only checkout

If only **forgesdlc-kitchensink** is available, you cannot merge submodule bumps in consumer repos from here. Use the commands above **after** pulling KS into each consumer workspace and rebuilding.
