# WCAG reference seeds

Optional YAML overrides merged by `npm run sync-wcag-md` into generated pages under `wcag/`.

Bootstrap missing stubs (does not overwrite existing seeds):

```bash
cd tools/website-a11y-auditor
npm run bootstrap-wcag-seeds
npm run sync-wcag-md
```

Fields: `summary`, `operatorNotes`, `forgeRulesHighlight` (array of rule IDs). Do not paste W3C normative text.

Filename: `sc-{id}.yaml` (e.g. `sc-1.1.1.yaml`) or `wcag3-{REQUIREMENT_ID}.yaml` (e.g. `wcag3-WCAG3-REQ-TEXT-ALT.yaml`).
