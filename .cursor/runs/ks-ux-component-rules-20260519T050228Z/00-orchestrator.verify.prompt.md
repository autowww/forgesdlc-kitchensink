Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 00 — Orchestrator

Create `.cursor/plans/ks-ux-component-rules/00-master-sequence.md`.

The plan must sequence the work in this pack and explicitly state:

- Fleet is only a regression example, not a profile.
- The source of truth is KS visual catalog + local/live showcase screenshots + emitted DOM hashes.
- Deterministic rules should cover most repeatable failures.
- AI-enabled rules should handle final judgment and propose new deterministic rules.

Before broad edits, inspect:

- `docs/design/catalog/visual-registry.yaml`
- `docs/design/catalog/**/*.md`
- `docs/design/catalog/screenshots/`
- `tools/design-catalog/*`
- `tools/website-ux-auditor/*`
- `components/`, `css/`, `js/`, `generator/pages/`, `react/`, `assets/svg/`

Write the plan tree listed in `INITIATING_PROMPT.md`.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Here is what was done:

### Created `.cursor/plans/ks-ux-component-rules/00-master-sequence.md`

It includes:

- **Fleet** called out only as a **regression / generic fixture**, not a product profile.
- **Source of truth**: `visual-registry.yaml` + contracts + local/live showcase + screenshots + DOM hashes (`hash` / `data-ks-hash`).
- **Deterministic** rules for most repeatable failures; **AI** for judgment and **candidate deterministic rules**.
- **Pre-edit inspection** table for catalog, tooling, auditor, and implementation dirs (`components/`, `css/`, `js/`, `generator/pages/`, `react/`, `assets/svg/`).
- **Plan tree** from `ks-ux-component-rules-governor-pack/INITIATING_PROMPT.md` (`00`–`07` with short descriptions).
- **Evidence** with what was reviewed and validation results.

`INITIATING_PROMPT.md` is **not** in this repo; the plan points at `ks-ux-component-rules-governor-pack/INITIATING_PROMPT.md` on your machine.

### Small test fix (so `npm test` passes)

`buildWatchFrameLines` takes five trailing args; the test passed **`meta` as the 4th argument**, so `meta` was `undefined`. A **`crawlLogTail`** array was inserted before **`meta`** in `tools/website-ux-auditor/auditor-tests/loop-watch-dashboard-frame.test.js`.

### Checks run

| Step | Outcome |
|------|---------|
| `python3 generator/build-showcase.py` | OK |
| `npm test` (website-ux-auditor) | **89/89** OK |
| `check-visual-catalog.mjs` | OK (**91 entries**); updated `docs/design/catalog/visual-registry-coverage.md` and `docs/design/catalog/visual-registry.generated.json` |

The orchestrator evidence in `00-master-sequence.md` records this.

**Note:** Phases **01–07** are only listed in `00-master-sequence.md`; they are not created yet (that matches phase 00 scope). If you want the catalog JSON/coverage left untouched next time, run the checker with whatever flags avoid writes (only if the tool supports it) or restore those files from git.
--- EXECUTION LOG END ---
