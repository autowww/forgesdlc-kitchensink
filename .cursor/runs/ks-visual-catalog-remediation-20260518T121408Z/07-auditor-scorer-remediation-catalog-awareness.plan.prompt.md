Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

--- PHASE PROMPT START ---
# 07 - Connect auditor, scorer, and remediation plans to the catalog safely

## Purpose

Make UX audit, UX scoring, and generated Cursor remediation plans aware of visual hashes and design contracts without making the systems depend on each other.

## Architecture rules

```text
shared generated JSON / low-level helpers
        ^
        |
 +------+-------------------------------+
 |                                      |
analyze-website-ux.mjs          score-website-ux.mjs
(audit + remediation plans)      (scorecard + gates + trends)
```

- The auditor may read visual registry JSON.
- The scorer may read visual registry JSON.
- Neither may call the other.
- The remediation planner may cite hashes and contract paths when findings relate to known visual elements.
- The auditor/scorer must work when the catalog is absent, with a warning rather than a crash.

## Required behavior

Add or verify:

- DOM scan for `hash="XYZ"` and `data-ks-hash="XYZ"`.
- Detection of invalid, unknown, deprecated, and duplicate emitted hashes.
- Detection of emitted hashes with missing contract references.
- Findings that cite `docs/design/catalog/...` contract paths.
- Score dimension or quality gate for visual catalog coverage.
- Remediation plans that say: update implementation and matching design contract together.
- Tests for catalog awareness with generated JSON only.

## Required output examples

Audit finding should include fields like:

```json
{
  "id": "visual-catalog-unknown-hash",
  "severity": "warn",
  "hash": "AbC",
  "selector": "[data-ks-hash=\"AbC\"]",
  "message": "Rendered hash AbC is not in docs/design/catalog/visual-registry.generated.json"
}
```

Remediation plan text should include:

```text
Affected visual: AbC - enterprise-hero-band
Design contract: docs/design/catalog/components/AbC-enterprise-hero-band.md
Update both implementation and contract if the visual expectation changes.
```

## Acceptance criteria

- `tools/website-ux-auditor/npm test` passes standalone.
- Scorer can run on a local page with cataloged hashes and report coverage.
- Auditor generated plans cite hashes when page elements include known hashes.
- No import cycle or CLI cross-call exists between auditor and scorer.
- `.cursor/plans/ks-visual-catalog-remediation/07-auditor-scorer-remediation-catalog-awareness.md` records test evidence.

## Do not

- Do not parse YAML from the auditor/scorer runtime unless the package explicitly owns the dependency and tests install it.
- Do not make missing catalog data fatal for unrelated audits.
--- PHASE PROMPT END ---
