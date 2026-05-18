Execute the focused remediation phase below. You may edit files. Use the plan summary if present. Keep changes scoped to this phase. At the end, run the phase acceptance checks and write/update the matching .cursor/plans/ks-visual-catalog-remediation/*.md evidence file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 06 - Capture showcase screenshots and update hosted references

## Purpose

Complete the hash -> contract -> expected look loop with screenshot baselines from KS showcase pages.

## Required implementation

Improve or add:

```text
tools/design-catalog/capture-showcase-screenshots.mjs
```

It should:

- read `docs/design/catalog/visual-registry.yaml` or generated JSON through design-catalog tooling
- launch a local showcase server or accept a `--base-url`
- capture by `[hash="XYZ"], [data-ks-hash="XYZ"]`
- save screenshots under `docs/design/catalog/screenshots/`
- support desktop and mobile variants where useful
- update or emit screenshot metadata/report
- not require network access for local capture

## Screenshot paths

Recommended local paths:

```text
docs/design/catalog/screenshots/XYZ.png
docs/design/catalog/screenshots/XYZ.mobile.png
docs/design/catalog/screenshots/XYZ.dark.png
docs/design/catalog/screenshots/XYZ.light.png
```

Recommended hosted references:

```text
https://ks.forgesdlc.com/showcase/screenshots/XYZ.png
https://ks.forgesdlc.com/showcase/screenshots/XYZ.mobile.png
```

## Status policy

Registry screenshot status must be one of:

```text
captured
planned
not-applicable
blocked
```

`planned` and `blocked` require a reason. `not-applicable` requires a reason.

## Acceptance criteria

- Screenshot capture can run with documented commands.
- At least all showcase-rendered layouts/pages/chrome/components with visible roots are captured or have explicit blocked/planned reasons.
- Registry or generated screenshot report reflects current capture results.
- Screenshot files are deterministic enough for review; avoid animated or timing-dependent states unless captured intentionally.
- `.cursor/plans/ks-visual-catalog-remediation/06-screenshot-capture-and-showcase-references.md` records counts by screenshot status.

## Do not

- Do not block the whole remediation on hosted `ks.forgesdlc.com` deployment if local screenshots are captured.
- Do not mark screenshots `captured` unless files exist and are referenced correctly.
--- PHASE PROMPT END ---
