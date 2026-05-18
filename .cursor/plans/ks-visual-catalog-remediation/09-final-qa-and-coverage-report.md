# Phase 09 — Final QA and coverage report

Status: PASS_WITH_LIMITATIONS

## Summary

Local Kitchen Sink validation completed successfully: inventory regeneration, showcase build, catalog check, consumer-hash strict scan on built `showcase/`, Forge Autodoc unit tests, and website UX auditor tests all passed. Generated coverage artifacts agree on inventory total **363**, registry rows **91**, `contract_status` split **54 own / 37 family-covered**, and screenshot status rollups (**48 captured / 41 not-applicable / 2 blocked**) as emitted in `visual-registry-coverage.md` after the commands below.

**Limitations:** Consumer repositories were not submodule-bumped or rebuilt in this pass (propagation remains operator-driven per `docs/design/catalog/consumer-site-hash-verification.md`). Live **`https://ks.forgesdlc.com/cases/showcase/preview-handbook.html`** still returned **zero** `data-ks-hash="…"` matches after a full-document `curl` on 2026-05-18, so hosted KS showcase deployment is **not** aligned with local `showcase/` marker output despite other public hosts showing markers on sampled pages (see Phase 08 evidence).

---

## Commands executed (exact)

From repository root **`/home/lzvyahin/Code/forgesdlc-kitchensink`** unless noted.

1. `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`  
   - Note: the script requires **`--out`**; `--repo .` alone exits usage code 2.
2. `python3 generator/build-showcase.py`
3. `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase`
4. `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --verbose-contract-placeholders`
5. `node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase --strict`
6. `python3 -m pytest forge-autodoc/tests -q`
7. `cd tools/website-ux-auditor && npm test`

Additional live sniff (QA only):  
`curl -sSL --max-time 20 "https://ks.forgesdlc.com/cases/showcase/preview-handbook.html" | grep -cE 'data-ks-hash="[A-Za-z]{3}"'` → **0**

---

## Commit / branch / working-tree context

| Field | Value |
|------|-------|
| Branch | `master` |
| HEAD | `1760774` (`chore(git): stop tracking local run logs and tool output`) |
| Remote | `master...origin/master` **ahead 1** (unpushed) |
| Working tree | **Dirty**: extensive modified + untracked files under design catalog, tools, screenshots, `.cursor/plans/`, `.github/workflows/ci.yml`, `museum/studio/*`, etc. Phase 09 did **not** create a git commit. |

---

## Files changed grouped by area (conceptual — current tree)

Rough groupings reflecting outstanding remediation work captured in `git status` (not an exhaustive path list):

| Area | Examples |
|------|-----------|
| Design catalog docs & contracts | `docs/design/catalog/**/*.md`, `visual-registry.yaml`, generated `visual-*.generated.*`, `visual-registry-coverage.md` |
| Screenshots | `docs/design/catalog/screenshots/*.png`, `screenshot-capture-report.*` |
| Design-catalog tooling | `tools/design-catalog/*.mjs`, `tools/design/catalog/lib/*.mjs`, fixtures / verify scripts |
| Website UX auditor | `tools/website-ux-auditor/**` |
| CI | `.github/workflows/ci.yml` |
| Showcase / museum | Regenerated `showcase/` (after build); `museum/studio/*` |
| Governance / plans | `.cursor/plans/ks-visual-catalog-remediation/*.md`, `.cursor/rules/*.mdc` |

---

## Inventory totals by category

Source: `docs/design/catalog/visual-inventory.generated.json` → `summary.byType` (total **363**).

| proposed_type (`byType`) | Count |
|--------------------------|-------|
| diagram-or-asset | 79 |
| design-terminology | 70 |
| component | 59 |
| generated-showcase-page | 29 |
| page-instance | 23 |
| museum-surface-asset | 23 |
| visual-style | 22 |
| interaction-module | 18 |
| primitive | 10 |
| layout | 9 |
| layout-preview | 7 |
| chrome-region | 6 |
| python-component-anchor | 4 |
| visual-helper | 1 |
| showcase-app-source | 1 |
| desktop-interface | 1 |
| library-consumer | 1 |

---

## Registry totals by category

Source: **`docs/design/catalog/visual-registry-coverage.md`** after `check-visual-catalog.mjs` (same numbers as authoritative generated coverage block).

| Grouping | Detail |
|---------|--------|
| Registry entries | **91** |
| By `contract_status` | **own: 54**, **family-covered: 37** |
| By `screenshot_status` | **captured: 48**, **not-applicable: 41**, **blocked: 2** |
| By `category` | See “By category” section in `visual-registry-coverage.md` (sums to 91 rows across categories — family rows counted in their rollup categories) |

`visual-registry.generated.json` entry array length matches **91** entries.

---

## Own contract count

**54** registry rows with `contract_status: own` (per `visual-registry-coverage.md`).

---

## Family-covered count with rationale

**37** registry rows with `contract_status: family-covered`. Roll-up contracts cover:

- **`primitive-family`** (e.g. FAM umbrella for React primitives / shared primitive rules)
- **`style-family`** (stylesheet family + child `visual-style` rows where appropriate)
- **`script-family`** + child `interaction-script` rows
- **`diagram-family`** + child `diagram-asset-group` rows
- **`python-renderer-family`** + child `python-component-module` rows
- **`docs-family`**, **`showcase-app-family`**, **`museum-chrome-asset`** as documented in registry

`visual-registry-coverage.md` also notes **museum Vite bundles** (`museum/studio/assets/*`): **21** inventory paths intentionally deferred — covered at **Msm** museum shell family level until chunk names stabilize.

---

## Placeholder contract scan

- **`check-visual-catalog.mjs`** with **`--verbose-contract-placeholders`** completed with exit code **0** and printed only the usual “OK …” line — **no** per-contract stub bullet listing (implies **no** verbose-listed placeholders under current rules).
- Default (non-strict) placeholder behavior: **pass**.
- **`--strict-contract-placeholders`** was **not** required for PASS; enabling it remains an optional stricter gate in CI.

---

## Invalid / duplicate hash scan

- **`check-visual-catalog.mjs`** exit **0**: registry hash validation and duplicate detection **passed** for **91** entries.
- Auditor unit test **`registryDuplicateHashes`** exercises duplicate detection on fixtures; **`npm test`** **pass 68**.

---

## Emitted HTML marker coverage (local `showcase/`)

After `python3 generator/build-showcase.py`:

| Metric | Value |
|--------|--------|
| **`check-consumer-hashes.mjs --dir showcase --strict`** | **OK** |
| HTML files scanned | **29** |
| `hash="…"` (valid 3-letter) occurrences | **172** |
| `data-ks-hash="…"` (valid 3-letter) occurrences | **172** |
| Distinct ids (either attribute) | **44** |

Registry expectation: **`emit_marker_in_showcase: true`** on **48** entries (computed from `visual-registry.generated.json`); validator requires paired attributes where showcase emission is mandated.

---

## Screenshot status counts

From **`visual-registry-coverage.md`** (registry-derived):

| Status | Count |
|--------|-------|
| captured | 48 |
| not-applicable | 41 |
| blocked | 2 |

Supplemental: `docs/design/catalog/screenshots/screenshot-capture-report.json` captures the Playwright capture run metadata for on-disk PNG assets (aligned with remediation Phase 06).

---

## Auditor / scorer independence verification

Manual verification via repository search:

- **`analyze-website-ux.mjs`**: no `child_process` / `spawn` / `exec` invocation of **`score-website-ux.mjs`**.
- **`score-website-ux.mjs`**: no invocation of **`analyze-website-ux.mjs`**.
- Operational pairing (if any) remains **external** (e.g. `run-website-ux-remediation-loop.sh`), consistent with governance rules.

---

## Auditor test output

`cd tools/website-ux-auditor && npm test`

- **`node --test auditor-tests/*.test.js`**
- **68 tests**, **68 pass**, **0 fail**
- Includes visual-catalog JSON fixtures (`catalog-json-repo`, `catalog-dup-repo`) without runtime dependency on YAML parser in auditor path.

---

## Catalog validation output

`node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase`

```
check-visual-catalog OK (91 entries). Wrote docs/design/catalog/visual-registry-coverage.md
```

`--verbose-contract-placeholders` run: **same**, exit **0**.

---

## Showcase build output

`python3 generator/build-showcase.py`

```
[showcase] Found 22 pages
...
[showcase] Done — 22 pages + layout previews written to .../showcase/
```

Exit code **0**.

---

## Forge Autodoc / other repo tests

`python3 -m pytest forge-autodoc/tests -q` → **36 passed**.

---

## Consumer-site propagation status

| Item | Status |
|------|--------|
| Emission mechanics | Implemented in KS (`ks_hash_attrs`, layouts, forge-autodoc, etc.) |
| Submodule bump in `forgesdlc/`, `blueprints-website/`, `forge-*-website/` | **Not performed** in this QA sweep — operators follow **`docs/design/catalog/consumer-site-hash-verification.md`** |
| Local strict marker proof | **`check-consumer-hashes.mjs`** on **`showcase/`** **OK** (see above) |

---

## Live-site checks performed and results

| Check | Result |
|-------|--------|
| **`https://ks.forgesdlc.com/cases/showcase/preview-handbook.html`** (`grep -c data-ks-hash`) | **0** occurrences — deployed KS showcase **does not** reflect local marker rollout |
| Other hosts (`forgesdlc.com`, `platform.forgesdlc.com`, etc.) | **Not re-run** in this Phase 09 session; Phase 08 evidence documented prior `curl` + checker **OK** samples where applicable |

---

## Cross-check: counts agree

| Artifact | Key figures |
|---------|-------------|
| `visual-registry-coverage.md` | 91 registry rows; inventory **363**; own **54**; family-covered **37**; screenshot rollup **48 / 41 / 2** |
| `visual-inventory.generated.json` | `summary.total` **363**; `generatedAt` **2026-05-18** |
| This report | Mirrors the above — **no** manually invented divergent totals |

---

## Unresolved risks

1. **Hosted KS showcase** may remain stale versus repo `showcase/` until deploy pipeline refreshes; live HTML currently lacks observable `data-ks-hash` on sampled preview-handbook URL.
2. **Consumer repos** pick up emission only after **kitchensink submodule** updates — drift risk until bumps land.
3. **Museum Vite chunks** (`museum/studio/assets/*`) intentionally not hashed per-file in registry until filenames stabilize (**21** deferred inventory paths per coverage doc).

---

## Recommended follow-up tickets

1. **Deploy / refresh `ks.forgesdlc.com` showcase** from current `build-showcase.py` output; re-run **`check-consumer-hashes.mjs --url … --strict`** against live URLs until parity matches local `showcase/`.
2. **Submodule propagation PRs** across `forgesdlc`, `blueprints-website`, and private handbooks consuming KS — tie to checklist in `consumer-site-hash-verification.md`.
3. **Optional CI hardening:** run **`check-visual-catalog.mjs --strict-contract-placeholders`** on a schedule or main-branch gate if stub bullets must be zero-tolerance.
4. **Museum bundle policy:** when Vite output names stabilize, register chunk-level visuals or document permanent family-only coverage with explicit `hash_exception_reason` where needed.

---

## Acceptance criteria mapping

| Criterion | Met? |
|-----------|------|
| Final report exists and is current | **Yes** (this file; aligned with commands run same session) |
| Generated counts agree across registry, inventory, coverage | **Yes** |
| Report names exact commands | **Yes** |
| Honest about non-deployable / non-tested items | **Yes** (KS live showcase; consumer bumps) |
| Clean next-step list | **Yes** (see recommended tickets) |
