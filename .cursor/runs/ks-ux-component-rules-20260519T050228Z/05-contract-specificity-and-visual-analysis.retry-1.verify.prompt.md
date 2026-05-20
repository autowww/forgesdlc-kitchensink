Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 05 — Contract specificity and visual analysis

Goal: make catalog contracts genuinely useful for each emitted visual element.

For each registry row and contract:

1. Use screenshot/DOM/source analysis to determine the visual role.
2. Replace generic expected-look text with specific guidance.
3. Add deterministic checks section.
4. Add AI-enabled review cues section.
5. Add state coverage appropriate to the element.
6. Add responsive behavior specific to the element.
7. Keep family-covered rows only when a family contract is specific and useful.

Prioritize:

- pages and layouts that consumers use directly;
- chrome regions;
- React primitives;
- Python component modules;
- visual styles/theme packs;
- diagram groups;
- desktop/app interfaces.

Do not manually over-edit every file if automation can generate draft-specific sections from registry/source/screenshot metadata. But do not leave obviously generic boilerplate.

Acceptance:
- `tools/design-catalog/check-visual-catalog.mjs` detects weak contracts;
- current contracts pass or report only justified warnings;
- `docs/design/catalog/visual-registry-coverage.md` or equivalent report is regenerated;
- final report lists remaining intentionally family-covered entries.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Here’s what was completed for phase **05** (only the gaps; earlier governance/coverage work was left as-is).

### 1. Deterministic weak-contract / duplicate detection (`contract-specificity.mjs` + `check-visual-catalog.mjs`)
- Flags the old **“Calm Forge enterprise atmosphere…”** slab under **Expected look** for **`layout` / `page` / `chrome-region` / `layout-preview`**.
- After scanning contracts, clusters **normalized** Expected look bodies (length ≥ 90) and **errors** when the same body appears on **≥2** contracts for those types (stops future copy-paste slabs).

### 2. Element-specific **Expected look** + **Responsive behavior** (bulk)
- New **`tools/design-catalog/lib/contract-element-blurbs.mjs`** (slug-keyed bullets) and **`tools/design-catalog/apply-element-specific-blurbs.mjs`** (safe replace of the known slab + generic responsive pair).
- **`--write`** updated **44** own contracts; **`layout-showcase` (`Shw`)** responsive text aligned with the showcase shell (expected look for **Shw** was already good).

### 3. Family / roll-up contracts (specific, not fluff)
- **`Ksc`**, **`Kpr`**, **`Ksj`**, **`Ksv`**, **`Msm`**: **Expected look** rewritten into concrete family roles ( **`Rpf` / `FAM-react-primitives.md`** was already strong—unchanged).
- Repo-wide: **no** remaining **`Calm Forge enterprise`** boilerplate under `docs/design/catalog/`.

### 4. Docs + phase evidence
- **`docs/design/catalog/README.md`**: documents **`apply-element-specific-blurbs.mjs`**.
- **`.cursor/plans/ks-ux-component-rules/05-contract-specificity-visual-analysis.md`**: refreshed with the new tooling, family edits, and verification commands.

### 5. Verification (re-run)
```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --refresh-inventory --strict-contract-governance
# exit 0 — wrote docs/design/catalog/visual-registry-coverage.md

bash tools/design-catalog/verify-bad-fixture.sh
# exit 0 — bad fixture still fails checker with exit 1
```

**Intentional family-covered rows** remain documented in **`docs/design/catalog/visual-registry-coverage.md`** (still **37** rows in the appendix).

To refresh blurbs after registry changes, regenerate JSON (via a successful check or your generator), then:

`node tools/design-catalog/apply-element-specific-blurbs.mjs --repo . --registry-json docs/design/catalog/visual-registry.generated.json --write`
--- EXECUTION LOG END ---
