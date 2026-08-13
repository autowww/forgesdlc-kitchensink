# Fai — ForgeAISuggestionReview

**Hash:** `Fai` · **Type:** composition · **Family:** enterprise-app · **Status:** active

Implemented in `js/ks-ai-suggestion-review.js` (`createAISuggestionReview`). Showcase: `enterprise-app-compositions.html` `#sec-eac-ai`.

## Purpose

Governed enterprise-app surface for **ENT.APP.AI**.

## Root element

```html
<div hash="Fai" data-ks-hash="Fai"
     data-ks-type="composition" data-ks-name="forge-ai-suggestion-review">
```

## Accessibility

- Follow ENT.APP.09 required_states in `docs/design/enterprise-app/a11y-state-matrices.md`.
- Prefer visible labels and `role`/`aria-*` on interactive regions.

## Deterministic checks

- Root `[data-ks-hash="Fai"]` present when composition mounts.
- Related: `DET.APP.AI_PROVENANCE`.

## Enterprise use

| Enterprise use | Related ENT.APP | Related DET |
|----------------|-----------------|-------------|
| Principle-aligned operator UX | ENT.APP.AI | `DET.APP.AI_PROVENANCE` |

Contract: [`enterprise-app/rules/ENT.APP.AI.yaml`](../../enterprise-app/rules/ENT.APP.AI.yaml).
