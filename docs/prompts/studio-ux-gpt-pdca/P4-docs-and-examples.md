# P4 — Docs and few-shot examples

**Model:** Composer 2.5  
**Allowlist:** `README.md`, `prompts/examples/`, `forge-market/docs/handbook/operator/studio-ux-pdca.md`

## Plan

Document three prompt families; add good/bad suggestion JSON examples referenced from assess template.

**Success:** README table distinguishes ChatGPT assess vs Composer PDCA packs vs website `AI.*`; examples exist; operator doc updated.

## Do

1. Create `prompts/examples/good-suggestion.json` and `bad-laundry-list.json`.
2. Reference examples in `assess-studio-ux.txt` few-shot section.
3. Add **Three prompt families** table to `tools/studio-ux-pdca/README.md`.
4. Update `forge-market/docs/handbook/operator/studio-ux-pdca.md` for structured suggestions + render path.
5. Document `STUDIO_UX_DESCRIPTION_MAX_CHARS` in README env table.

## Check

```bash
cd forgesdlc-kitchensink/tools/studio-ux-pdca
test -f prompts/examples/good-suggestion.json
test -f prompts/examples/bad-laundry-list.json
grep -q 'Three prompt families' README.md
grep -q 'plan\[\]' README.md
```

## Adjust

- Do not claim website auditor behavior in Studio docs.
- Keep handbook base `ks.forgesdlc.com/cases/showcase/`.
