# S01 — Dual-wiki spike

**Phase:** S01  
**Kind:** foundation  
**Depends on:** S00

## Goal

Scaffold the dual-wiki maintainer corpus and showcase handbook hub for spatial effects: in-repo specs, oracle schema, hash allocation for 20 components, and `generator/pages/spatial-effects.py` as the built handbook surface (KS showcase only — no new `*-website` repo).

## Files to inspect

- `docs/design/catalog/contract-template.md`
- `docs/design/catalog/visual-registry.yaml`
- `generator/pages/spatial-effects.py`
- `generator/pages/surfaces.py` — migrate existing tilt documentation references
- `components/spatial.py` — hash constants

## Expected changes

| Path | Action |
|------|--------|
| `docs/design/spatial/README.md` | Subsystem overview |
| `docs/design/spatial/ORACLE-SCHEMA.md` | JSON oracle schema documentation |
| `docs/design/spatial/effects/*.md` | One maintainer doc per effect (20 files) |
| `docs/design/spatial/oracles/*.json` | Oracle stub per hash (Flp … Srl) |
| `docs/design/catalog/components/<HASH>-*.md` | Contract stubs or family coverage notes |
| `docs/design/catalog/visual-registry.yaml` | Allocate 20 spatial hashes |
| `generator/pages/spatial-effects.py` | Showcase hub with TOC anchors per effect |

## Acceptance criteria

- Dual-wiki tree exists under `docs/design/spatial/`
- Each effect maintainer doc lists oracle scenario IDs matching its JSON oracle
- Registry rows exist for all 20 hashes
- Showcase builds `spatial-effects.html` with section anchors
- `check-oracle-doc-sync.mjs` passes once S02 harness lands (optional warning in S01)

## Check commands

```bash
./scripts/ks-spatial-pdca/pdca-run-phase.sh S01 check
```

## Rollback

Revert S01 commit; remove `docs/design/spatial/` scaffold and registry rows added in this phase.

## Governance

- **No Fleet-specific UX auditor profile.**
- Maintainer docs use prose/tables — no Mermaid diagrams.
- Full component CSS/JS implementation belongs in S03+; S01 may ship stubs and scaffold only.
