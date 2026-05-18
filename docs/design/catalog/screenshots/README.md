# Screenshots (generated)

PNG captures for catalog hashes are produced offline against a loopback HTTP server (or `file:` URLs) — **no network** required for capture itself.

## Commands

From repo root:

```bash
python3 generator/build-showcase.py
cd tools/design-catalog && npm ci && npx playwright install chromium
node capture-showcase-screenshots.mjs --repo ../.. --serve-showcase --update-registry --mirror-to-showcase
```

## Outputs

| Artifact | Purpose |
|----------|---------|
| `{HASH}.png` | Desktop, dark color scheme (canonical baseline) |
| `{HASH}.mobile.png` | Narrow viewport (~390×844), dark |
| `{HASH}.light.png` | Desktop light color scheme |
| `screenshot-capture-report.{json,md}` | Per-hash results |

Published convention (when deployed with mirrored `showcase/screenshots/`):

- `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png`
- `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.mobile.png`

Registry `screenshot_url` points at the desktop PNG; mobile paths follow the same directory pattern.
