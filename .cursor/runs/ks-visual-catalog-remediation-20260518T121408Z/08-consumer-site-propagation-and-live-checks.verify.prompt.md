Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 08 - Consumer-site propagation and live hash checks

## Purpose

Ensure KS visual hash attributes and design contracts are useful to consumer websites, not only to the KS showcase.

## Consumer sites in scope

At minimum, document and prepare checks for:

```text
forgesdlc.com
lcdl.forgesdlc.com
fleet.forgesdlc.com
lenses.forgesdlc.com
platform.forgesdlc.com
ks.forgesdlc.com
```

Only update repositories available in the current checkout. If consumer site repos are not present, create instructions and scripts that they can run after pulling the updated KS package.

## Required implementation

- Ensure generated/exported HTML from KS templates carries `hash` and `data-ks-hash` through to consumer pages.
- Add a consumer verification script or documented command.
- Add deployment checklist for checking live raw HTML.
- Add guidance for mapping live hash to catalog contract and screenshot URL.

## Recommended local check script

Create or update something like:

```text
tools/design-catalog/check-consumer-hashes.mjs
```

It should accept:

```bash
node tools/design-catalog/check-consumer-hashes.mjs --url https://forgesdlc.com/
node tools/design-catalog/check-consumer-hashes.mjs --file path/to/index.html
node tools/design-catalog/check-consumer-hashes.mjs --dir dist/
```

It should report:

- number of `hash="XYZ"` markers
- number of `data-ks-hash="XYZ"` markers
- invalid hashes
- unknown hashes relative to registry JSON
- missing pair, for example `hash` exists without `data-ks-hash`
- likely generated docs/handbook shell issues when relevant

## Required live check commands

Document exact commands:

```bash
curl -L https://forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
curl -L https://platform.forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
```

Use a more robust Node checker when available.

## Acceptance criteria

- Consumer propagation is implemented where source repos are present.
- Where source repos are absent, the final report explicitly says what could not be changed and gives exact commands for the consumer repo.
- Live-check documentation exists.
- The verification report does not claim live hashes are deployed unless checked against current live raw HTML.
- `.cursor/plans/ks-visual-catalog-remediation/08-consumer-site-propagation-and-live-checks.md` records local and live verification status.

## Do not

- Do not claim `forgesdlc.com` is updated unless a live HTML check shows hash markers.
- Do not make a visual redesign of the consumer sites in this phase.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
## What was implemented

### 1. `tools/design-catalog/check-consumer-hashes.mjs`
- **Inputs:** `--url`, `--file`, or `--dir` (exactly one); optional `--repo`, `--registry` (defaults to `docs/design/catalog/visual-registry.generated.json` under `--repo`).
- **Reports:** occurrence counts for valid 3-letter `hash=` / `data-ks-hash=`, distinct ids, invalid values, hashes not in the registry, per-id **pair count mismatches**, and optional handbook-url heuristics.
- **`--strict`:** exit `1` if any of those problems appear.
- **Governance:** does not call the website UX auditor/scorer (per rule).

### 2. `docs/design/catalog/consumer-site-hash-verification.md`
- Table of public hosts and how they relate to consumer repos.
- **Mapping:** live three-letter id → `visual-registry.generated.json` → `contract_path` and `screenshot_url` / `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png`.
- **Local:** run the script on `website/` after build (with example `KS_ROOT` paths).
- **Live:** required `curl | grep` examples plus Node checks; notes that **`ks.forgesdlc.com` uses `cases/showcase/`** and that **live HTML can lag** this repo.
- **Deploy checklist** for submodule bump → build → `check-consumer-hashes.mjs` → deploy → `curl`/`--url` proof.

### 3. `docs/design/catalog/README.md`
- Short “Consumer sites” subsection pointing at the new doc and script.

### 4. `.github/workflows/ci.yml`
- After `build-showcase.py`, runs  
  `node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase --strict`.

### 5. Evidence file
- `.cursor/plans/ks-visual-catalog-remediation/08-consumer-site-propagation-and-live-checks.md` — deliverables, propagation rationale (KS + submodule; no consumer redesign), local and **live** results.

## Consumer propagation
Hashes are already emitted from KS (`ks_hash_attrs`, `ks_catalog_hashes`, `forge_autodoc` → `page_main_attrs`, layouts). Consumer sites pick them up by **bumping `kitchensink/`** and rebuilding; no edits were made in `forgesdlc/` or handbook repos in this phase (those repos are only referenced in the new doc).

## Acceptance checks run
| Check | Result |
|--------|--------|
| `node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase --strict` | **OK** (172 paired markers, 29 HTML files) |
| Live `forgesdlc.com` / `platform.forgesdlc.com` with `--url --strict` | **OK** |
| Live `lcdl` / `fleet` / `lenses` homepages, `curl \| grep` | **Markers present** |
| Live `https://ks.forgesdlc.com/cases/showcase/preview-handbook.html` | **No `data-ks-hash` in fetched HTML** — evidence file states **not** to claim KS showcase is updated until live raw HTML shows markers (deploy appears behind this repo). |
--- EXECUTION LOG END ---
