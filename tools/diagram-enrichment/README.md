# Diagram enrichment tooling

Enriches `blueprint-diagram` Markdown fences across consumer repos so they
render as **enriched flow figures** (hash `Flw`): compact per-step details plus
an Expand flyout. See `docs/ascii-to-ks-diagrams.md` § Enriched flow fences for
the fence contract.

## Files

| File | Purpose |
|---|---|
| `list-diagram-fences.py` | Inventory / status: which files still have unenriched, src-less fences |
| `ENRICHMENT-SPEC.md` | The full instruction set given to each enrichment agent |
| `enrich-diagram-fences.sh` | Runner: one isolated headless `cursor-agent` per file (default model `composer-2.5`) |

## Why one agent per file

Each agent run is grounded **only** in the target page, so `detail:`/`more:`
text matches the page's context instead of a generic description — the same
diagram key can read differently on different pages. Isolated runs also keep
token usage bounded (no accumulated conversation context).

## Typical use

```bash
# status
python3 tools/diagram-enrichment/list-diagram-fences.py ~/Code/forge-lcdl

# pilot one file
./tools/diagram-enrichment/enrich-diagram-fences.sh ~/Code/forge-lcdl --file docs/guides/RAG.md

# whole repo, capped
./tools/diagram-enrichment/enrich-diagram-fences.sh ~/Code/forge-lcdl --max 10
```

After enriching a repo, rebuild its site per `auto-build-sites.mdc` and review
the diff before committing (one commit per repo).
