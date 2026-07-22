# Spatial effect oracle schema

Machine-readable oracles in `oracles/{HASH}.json` drive Playwright scenarios and LCDL `ks_spatial_effect_evaluate_v1`.

## Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hash` | string | yes | Three-letter KS visual hash (e.g. `Flp`). |
| `slug` | string | yes | Kebab-case effect id matching maintainer doc filename. |
| `showcase_anchor` | string | yes | Showcase section id from `spatial-effects.py` TOC (e.g. `#sec-flip-card`). |
| `scenarios` | array | yes | One or more deterministic test scenarios. |

## Scenario object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable scenario id referenced by contracts and CI (e.g. `flp-dom-present`). |
| `prefers_reduced_motion` | boolean | yes | Emulate `prefers-reduced-motion: reduce` when true. |
| `actions` | array | yes | Ordered Playwright-style steps before evaluation (may be empty). |
| `expect` | object | yes | Pass criteria after actions complete. |

### `actions[]` entries

Each action is an object with a `type` field:

| type | Fields | Purpose |
|------|--------|---------|
| `click` | `selector` | Click matching element. |
| `hover` | `selector` | Move pointer over element. |
| `mouse_move` | `selector`, `x`, `y` | Normalized pointer position (0–1) within element. |
| `drag` | `selector`, `dx`, `dy` | Pointer drag in pixels. |
| `scroll` | `selector`, `x`? / `y`? | Scroll container by offset. |
| `fill` | `selector`, `value` | Set input value (range, text). |
| `wait` | `ms` | Pause before next action. |

### `expect` object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `root_selector` | string | yes | Must be `[data-ks-hash="{HASH}"]` for the effect hash. |
| `threshold` | number | yes | Minimum pass ratio for scenario assertions (**1.0** = all checks must pass). |

Evaluators resolve `showcase_anchor` on the spatial-effects showcase page, run `actions`, then assert the rooted element is visible, carries correct `hash` / `data-ks-hash`, and meets effect-specific transform/motion rules implied by the maintainer doc.

## File naming

- Oracle: `oracles/{HASH}.json` (hash letters as allocated in `components/spatial.py`).
- Maintainer doc: `effects/{slug}.md`.
- Contract: `docs/design/catalog/components/{HASH}-{slug}.md`.

## Versioning

Add scenarios with new ids; do not rename ids once referenced in contracts or CI. Bump hash only via visual-registry governance when anatomy changes materially.
