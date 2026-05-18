# Phase 08 — Consumer-site propagation and live hash checks

## Scope completed (this repo)

| Deliverable | Status |
|-------------|--------|
| `tools/design-catalog/check-consumer-hashes.mjs` | Added — `--url`, `--file`, `--dir`, `--repo`, `--registry`, `--strict`, `--quiet` |
| `docs/design/catalog/consumer-site-hash-verification.md` | Added — hosts table, contract/screenshot mapping, local + live commands, deploy checklist |
| `docs/design/catalog/README.md` | Updated — link to consumer verification section |
| `.github/workflows/ci.yml` | Updated — smoke run: `check-consumer-hashes.mjs --dir showcase --strict` after `build-showcase.py` |

## Propagation model (no separate consumer-repo edits in this phase)

HTML emission comes from Kitchen Sink **`ks_hash_attrs`**, **`ks_catalog_hashes`**, **`forge_autodoc` → `handbook_page` / `page_main_attrs`**, and layouts in `components/layouts.py`. Consumer sites receive this behavior by updating the **`kitchensink/`** submodule and rebuilding; no additional code changes were required in sibling repos for attribute *shape*.

**Repositories not modified here:** `forgesdlc/`, `blueprints-website/`, `forge-*-website/` — operators bump submodules and rebuild per [consumer-site-hash-verification.md](../../../docs/design/catalog/consumer-site-hash-verification.md).

## Local verification (2026-05-18)

- **Command:** `node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase --strict`
- **Result:** OK — 172 paired `hash` / `data-ks-hash` occurrences (29 HTML files), registry counts aligned per hash id.

## Live verification (2026-05-18)

Raw HTML was sampled with `curl -L` and the Node checker against **`docs/design/catalog/visual-registry.generated.json`** in this checkout.

| URL | `curl \| grep` markers | `check-consumer-hashes.mjs --url --strict` |
|-----|------------------------|---------------------------------------------|
| https://forgesdlc.com/ | Yes (`Ldg`, `Ksf`, …) | OK |
| https://platform.forgesdlc.com/ | Yes (`Hbk`, `Hdc`, `Ksr`, …) | OK |
| https://lcdl.forgesdlc.com/ | Yes (`Hbk`, `Ksr`, `Kco`, …) | not re-run in session (grep sufficient) |
| https://fleet.forgesdlc.com/ | Yes (same pattern) | not re-run |
| https://lenses.forgesdlc.com/ | Yes (same pattern) | not re-run |
| https://ks.forgesdlc.com/cases/showcase/preview-handbook.html | **No** `data-ks-hash` in fetched document (~10 KiB) | **Not claimed OK** — deployed KS showcase lags this repo / marker rollout |

**Conclusion:** Do **not** claim **`ks.forgesdlc.com` showcase HTML** carries catalog hash markers until a live fetch shows them (or deploy is refreshed from current `build-showcase.py` output). Other listed hosts showed markers on homepage/handbook shells at check time.

## Acceptance criteria mapping

- **Consumer propagation** — Documented; emission path is KS + submodule bump (no redesign).
- **Absent consumer checkouts** — Sibling repos were not opened; exact operator commands are in `consumer-site-hash-verification.md`.
- **Live-check documentation** — `curl` lines and Node usage recorded; README cross-link.
- **No false deploy claims** — Evidence distinguishes hosts with observed markers vs `ks.forgesdlc.com` showcase sample without markers.
