# Studio UX PDCA harness (Kitchen Sink)

Page-by-page Studio UX rewrite pipeline for Forge Studio SPAs (Forge Market first).

## Enterprise app UX rules (canonical)

| Doc / artifact | Role |
|----------------|------|
| [`docs/design/forge-enterprise-app-ux-standard.md`](../../docs/design/forge-enterprise-app-ux-standard.md) | Operator SPA standard (shell, copy, budgets) |
| [`docs/design/ux-audit/enterprise-app-ux-rules.md`](../../docs/design/ux-audit/enterprise-app-ux-rules.md) | Rule catalog + PDCA mapping |
| [`lib/enterprise-app-ruleset.json`](lib/enterprise-app-ruleset.json) | **Closed pack** for GPT + scorer (`DET.STUDIO.*` + shared `DET.APP.*` / `AI.APP.*`) |
| [`lib/load-ruleset.mjs`](lib/load-ruleset.mjs) / [`lib/load_ruleset.py`](lib/load_ruleset.py) | Prompt appendix + `rule_id` validation |

Handbook pages: `docs/design/ux-audit/rule-pages/det-studio-*.md` → showcase `ux-audit-rules/det-studio-*.html` after `build-showcase.py`.

## Assessment checklist (density / IA)

Prompt: `prompts/assess-studio-ux.txt` (includes injected ruleset table). Scorer: `score-page.mjs` (facts from `capture-page.mjs`).

| Check / axis | Fail when |
|--------------|-----------|
| `DET.STUDIO.TITLE_NAV_MATCH` / `page_identity` | Page H1 ≠ active rail label |
| `DET.STUDIO.JOB_BUDGET` / `job_budget` | Many H2s without `[role=tablist]`; competing jobs above fold |
| `DET.BUTTON.GROUP.MAX` / `control_density` | Action row with >3 visible buttons |
| `DET.APP.PRIMARY_CTA` | >1 non-ghost primary `.fc-btn` |
| `DET.STUDIO.MECHANISM_LEAD` / `human_outcome` | Lead is harvest/API/mechanism without outcome verbs |
| `DET.STUDIO.FULLPAGE_SHOT` | Screenshot height ≈ viewport only (nested scroll not expanded) |
| `wiki_functionality` | Only weighted on wiki/graph pages |

GPT findings must cite rule IDs when applicable and pick `suggested_ks_component` from the closed list (`Svc`, `Ftb`, `Sab`, Cap panels, existing `studio-ui/src/ks/` wrappers). `pdca_prompt` should remount IA before cosmetic polish.

Capture expands nested scroll roots (e.g. `main.fc-main`) so ChatGPT receives a full-length PNG. Set `KS_PUBLIC_BASE` (default `https://ks.forgesdlc.com`) for showcase deep links; handbook pages live under `{KS_PUBLIC_BASE}/cases/showcase/ux-audit-rules.html`.

## Quick start (Forge Market)

```bash
cd forge-market
./scripts/fm-studio-ux-pdca/run-fm-studio-ux-pdca.sh --dry-run
./scripts/fm-studio-ux-pdca/run-fm-studio-ux-pdca.sh --max-pages 2 --mock-gpt

# Live ChatGPT (no --mock-gpt); prefer server-only Studio on :9792
SKIP_CURSOR_AGENT=1 FM_STUDIO_UX_SKIP_RESTART=1 \
  ./scripts/fm-studio-ux-pdca/run-fm-studio-ux-pdca.sh \
  --max-pages 1 --max-iterations-per-page 1
```

Confirm `assessment.json` has `"_source": "chatgpt"` on live runs (fail-closed; no silent mock).

## Layout

| Path | Role |
|------|------|
| `run-studio-ux-pdca-loop.sh` | Dev/bootstrap orchestrator |
| `capture-page.mjs` | Playwright full-scroll screenshot + DOM snapshot |
| `assess-page-gpt.py` | ChatGPT CDP assessment → `assessment.json` |
| `run-cursor-pdca.sh` | Cursor `agent` invocation |
| `score-page.mjs` | Deterministic DET density/IA scoring |
| `lib/gates.mjs` | Score threshold evaluation |
| `lib/enterprise-app-ruleset.json` | Closed DET/AI pack for enterprise apps |
| `lib/load-ruleset.mjs` | Ruleset loader (Node) |
| `lib/load_ruleset.py` | Ruleset loader (Python / GPT) |
| `notify-matrix.py` | Matrix cycle summary (notify-only) |
| `lib/page-manifest.schema.json` | Manifest JSON Schema |

## Workbench output

```
workbench/studio-ux-pdca/<consumer_id>/<campaign-id>/
  manifest-snapshot.yaml
  campaign-summary.json
  pages/<slug>/iter-001/{before.png,after.png,assessment.json,...}
```

## Environment

| Variable | Purpose |
|----------|---------|
| `SKIP_CURSOR_AGENT=1` | Skip Cursor implementation step |
| `SKIP_GPT_ASSESSMENT=1` | Use mock assessment (explicit only) |
| `CDP_URL` | Edge CDP for ChatGPT |
| `FM_STUDIO_UX_CHATGPT_PROJECT` | ChatGPT sidebar project (default `Forge Market`; do not reuse `FI_UPLIFT_CHATGPT_PROJECT`) |
| `KS_PUBLIC_BASE` | Public KS showcase origin for prompt links |
| `REQUIRE_SCREENSHOT_ATTACH=1` | Fail if full-page PNG cannot attach (default on) |
| `FORGE_LCDL_CDP_SELECTIVE_ATTACH=0` | Use full Playwright CDP (required for screenshot upload; assess sets this by default) |
| `MATRIX_HOMESERVER` / `MATRIX_ACCESS_TOKEN` / `FM_STUDIO_UX_MATRIX_ROOM_ID` | Matrix notify |
| `FM_STUDIO_UX_MAX_PAGES` | Cap pages per run |
| `FM_STUDIO_UX_MAX_ITERATIONS_PER_PAGE` | Cap iterations per page (default 5) |

## Add a new Studio consumer

1. Add `scripts/<product>-studio-ux-pdca/pages.manifest.yaml`
2. Implement `consumer_hooks.py` (see forge-market adapter)
3. Run: `./run-studio-ux-pdca-loop.sh <repo> <manifest>`

## Run tests

```bash
cd tools/studio-ux-pdca
node --test lib/enterprise-app-ruleset.test.mjs
```

## lmeta

Canonical flows live in **forge-cdp-manager** `flows/studio-ux-pdca/`; mirrors under `lmeta/units/studio-ux-pdca/`.

Platform workcell: `studio_ux_pdca_worker` — see forge-platform `docs/workcells/studio-ux-pdca-worker.md`.
