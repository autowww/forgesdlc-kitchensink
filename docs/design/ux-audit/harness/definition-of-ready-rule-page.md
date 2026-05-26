# Definition of Ready — Rule page (handbook)

## Purpose

A **rule handbook page** is ready when fixtures can be built from its **Before** HTML and remediation fix can copy **After** HTML.

## Upstream dependencies

- **Ruleset** DoR met for the `rule_id`.

## Ready checklist

- [ ] File at `docs/design/ux-audit/rule-pages/<rule-id-kebab>.md` follows [RULE_PAGE_SCHEMA.md](../rule-pages/RULE_PAGE_SCHEMA.md).
- [ ] Required `##` sections present: Purpose, Passing signals, Failing signals, Before example, After example, Evidence and remediation, Related rules.
- [ ] **Before** and **After** fenced `html` blocks parse; markup uses Kitchen Sink classes (no Mermaid).
- [ ] `rule-pages.manifest.json` entry is not `missing` for this `rule_id`.
- [ ] **After** HTML is a plausible pass for the rule (not placeholder boilerplate).

## Evidence

- Valid front matter: `rule_id`, `lane`, `page_version`, `registry_fingerprint`.
- `python3 generator/build_rule_defect_fixtures.py --dry-run` can extract Before for the rule (no builder error).

## Next gate

**Detection check** DoR (choose fixture `mode`) and **fixture** build for the campaign.
