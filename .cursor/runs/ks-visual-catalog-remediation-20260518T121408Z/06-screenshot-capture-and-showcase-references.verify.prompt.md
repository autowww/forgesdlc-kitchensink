Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
Here is what was delivered for **phase 06**.

### Implementation

**[`tools/design-catalog/capture-showcase-screenshots.mjs`](tools/design-catalog/capture-showcase-screenshots.mjs)** now:

- Loads entries from **`visual-registry.yaml`** (default) or optional **`--registry-json`** (normalized generated JSON).
- Serves **`showcase/`** on loopback via **`--serve-showcase`** (Node `http` static server — no external fetch for capture logic), or uses **`--base-url`** / **`--showcase-url`** for another loopback server.
- Targets **`[hash="XYZ"], [data-ks-hash="XYZ"]`** (falls back to `body` if missing).
- Writes **`HASH.png`** (desktop dark), **`HASH.mobile.png`**, **`HASH.light.png`**, optional **`HASH.dark.png`** via **`--write-dark-alias`**.
- Writes **`screenshot-capture-report.json`** and **`screenshot-capture-report.md`** under **`docs/design/catalog/screenshots/`**.
- **`--update-registry`** sets **`screenshot_status: captured`** and hosted **`screenshot_url`** when **`HASH.png`** exists.
- **`--mirror-to-showcase`** copies PNGs into **`showcase/screenshots/`** so paths match **`https://ks.forgesdlc.com/showcase/screenshots/...`** when that tree is deployed.
- Uses **`reducedMotion`**, **`deviceScaleFactor: 1`**, and injected CSS to freeze animations/transitions for stabler pixels.

**[`tools/design-catalog/check-visual-catalog.mjs`](tools/design-catalog/check-visual-catalog.mjs)** accepts **`screenshot_status: blocked`** with the same documentation rule as **`planned`** / **`missing`** (URL, **`notes`**, or **`screenshot_reason`**).

**Registry**

- **`Shw`**, **`Gly`**: **`showcase_url`** set to canonical showcase HTML (`layouts.html`, `diagrams.html`).
- **`Kra`**, **`Msm`**: **`blocked`** + **`screenshot_reason`** (no static showcase root / Electron shell).

Docs updated: **[`docs/design/catalog/README.md`](docs/design/catalog/README.md)**, **[`docs/design/catalog/screenshots/README.md`](docs/design/catalog/screenshots/README.md)**.

### Acceptance runs (all OK)

- `python3 generator/build-showcase.py`
- `node capture-showcase-screenshots.mjs --repo ../.. --serve-showcase --update-registry --mirror-to-showcase` → **48** hashes captured, **0** failures.
- `node tools/design-catalog/check-visual-catalog.mjs ...` → OK.
- `bash tools/design-catalog/verify-bad-fixture.sh` → OK.
- `cd tools/website-ux-auditor && npm test` → OK.

### Artifacts / counts

- **`docs/design/catalog/screenshots/`** and **`showcase/screenshots/`**: **144** PNGs (~**39 MiB** each tree) + capture reports.
- **Screenshot status counts** (91 registry rows): **captured 48**, **not-applicable 41**, **blocked 2**, **planned 0**, **missing 0** (also reflected in **`docs/design/catalog/visual-registry-coverage.md`**).

### Evidence file

**[`.cursor/plans/ks-visual-catalog-remediation/06-screenshot-capture-and-showcase-references.md`](.cursor/plans/ks-visual-catalog-remediation/06-screenshot-capture-and-showcase-references.md)** records the acceptance table, status counts, blocked reasons, and commands run.

---

**Note:** Large PNGs are now in the working tree; commit only when you intend to version ~78 MiB of binaries (or adjust `.gitignore` / LFS if your policy prefers not to track them).
--- EXECUTION LOG END ---
