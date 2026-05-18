Execute the focused remediation phase below. You may edit files. Use the plan summary if present. Keep changes scoped to this phase. At the end, run the phase acceptance checks and write/update the matching .cursor/plans/ks-visual-catalog-remediation/*.md evidence file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 08 - Consumer-site propagation and live hash checks

## Purpose

Ensure KS visual hash attributes and design contracts are useful to consumer websites, not only to the KS showcase.

## Consumer sites in scope

At minimum, document and prepare checks for:

```text
forgesdlc.com
lcdl.forgesdlc.com
fleet.forgesdlc.com
lenses.forgesdlc.com
platform.forgesdlc.com
ks.forgesdlc.com
```

Only update repositories available in the current checkout. If consumer site repos are not present, create instructions and scripts that they can run after pulling the updated KS package.

## Required implementation

- Ensure generated/exported HTML from KS templates carries `hash` and `data-ks-hash` through to consumer pages.
- Add a consumer verification script or documented command.
- Add deployment checklist for checking live raw HTML.
- Add guidance for mapping live hash to catalog contract and screenshot URL.

## Recommended local check script

Create or update something like:

```text
tools/design-catalog/check-consumer-hashes.mjs
```

It should accept:

```bash
node tools/design-catalog/check-consumer-hashes.mjs --url https://forgesdlc.com/
node tools/design-catalog/check-consumer-hashes.mjs --file path/to/index.html
node tools/design-catalog/check-consumer-hashes.mjs --dir dist/
```

It should report:

- number of `hash="XYZ"` markers
- number of `data-ks-hash="XYZ"` markers
- invalid hashes
- unknown hashes relative to registry JSON
- missing pair, for example `hash` exists without `data-ks-hash`
- likely generated docs/handbook shell issues when relevant

## Required live check commands

Document exact commands:

```bash
curl -L https://forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
curl -L https://platform.forgesdlc.com/ | grep -E 'data-ks-hash|hash="[A-Za-z]{3}"'
```

Use a more robust Node checker when available.

## Acceptance criteria

- Consumer propagation is implemented where source repos are present.
- Where source repos are absent, the final report explicitly says what could not be changed and gives exact commands for the consumer repo.
- Live-check documentation exists.
- The verification report does not claim live hashes are deployed unless checked against current live raw HTML.
- `.cursor/plans/ks-visual-catalog-remediation/08-consumer-site-propagation-and-live-checks.md` records local and live verification status.

## Do not

- Do not claim `forgesdlc.com` is updated unless a live HTML check shows hash markers.
- Do not make a visual redesign of the consumer sites in this phase.
--- PHASE PROMPT END ---
