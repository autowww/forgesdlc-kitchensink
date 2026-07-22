# N01 — Dual-wiki spike

**Phase:** N01  
**Kind:** foundation  
**Depends on:** N00

## Goal

Scaffold the dual-wiki maintainer corpus and showcase handbook hub for nav-layout effects: in-repo specs, oracle schema, hash allocation for 20 components, and `generator/pages/nav-layout-effects.py` as the built handbook surface (KS showcase only — no new `*-website` repo).

## Files to inspect

- `docs/design/catalog/contract-template.md`
- `docs/design/catalog/visual-registry.yaml`
- `generator/pages/nav-layout-effects.py`
- `generator/pages/surfaces.py` — migrate existing tilt documentation references
- `components/nav-layout.py` — hash constants

## Expected changes

| Path | Action |
|------|--------|
| `docs/design/nav-layout/README.md` | Subsystem overview |
| `docs/design/nav-layout/ORACLE-SCHEMA.md` | JSON oracle schema documentation |
| `docs/design/nav-layout/effects/*.md` | One maintainer doc per effect (20 files) |
| `docs/design/nav-layout/oracles/*.json` | Oracle stub per hash (Ssd … Epr) |
| `docs/design/catalog/components/<HASH>-*.md` | Contract stubs or family coverage notes |
| `docs/design/catalog/visual-registry.yaml` | Allocate 20 nav-layout hashes |
| `generator/pages/nav-layout-effects.py` | Showcase hub with TOC anchors per effect |

## Acceptance criteria

- Dual-wiki tree exists under `docs/design/nav-layout/`
- Each effect maintainer doc lists oracle scenario IDs matching its JSON oracle
- Registry rows exist for all 20 hashes
- Showcase builds `nav-layout-effects.html` with section anchors
- `check-oracle-doc-sync.mjs` passes once N02 harness lands (optional warning in N01)

## Check commands

```bash
./scripts/ks-nav-layout-pdca/pdca-run-phase.sh N01 check
```

## Rollback

Revert N01 commit; remove `docs/design/nav-layout/` scaffold and registry rows added in this phase.

## Governance

- **No Fleet-specific UX auditor profile.**
- Maintainer docs use prose/tables — no Mermaid diagrams.
- Full component CSS/JS implementation belongs in N03+; N01 may ship stubs and scaffold only.
