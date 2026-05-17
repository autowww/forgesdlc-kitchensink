# Forge Website UX Auditor — Cursor workflow

The auditor writes deterministic Markdown plans under **`.cursor/plans/forge-ux-remediation/`** in the repo you pass as **`--repo`**. It does not modify product code.

## What gets generated

- **`audit-report.md`** — Heuristic findings from repo inventory (and Playwright, if used). Front matter includes **`generated_at`** and **`audit_run_id`**.
- **`audit-data.json`** — Machine-readable summary; includes **`auditRunId`** and **`generatedAt`** matching the report and plans.
- **`00-master-remediation-sequence.md`** — Ordered list of child plans.
- **`01-…` through `08-…`** — Themed remediation prompts (IA, hero, trust, a11y, homepage shell/screenshots, etc.).
- **`screenshots/`** — When Playwright runs (not in `--static-only`).

## Remediation runner rule

With **`--install-rule`**, the tool also writes:

```text
<repo>/.cursor/rules/forge-ux-remediation-plan-runner.mdc
```

Enable that rule in Cursor when executing plans (or apply its constraints in your session). It expects: run plans in order, inspect real files before editing, relocate technical depth instead of deleting it, no invented claims, validate builds where possible.

## Recommended execution

1. Generate plans from the **target website repo** (for example `forge-platform-website`), not from Kitchen Sink alone.
2. Open **`00-master-remediation-sequence.md`** and skim scope.
3. Use **Plan Mode** on **`01-site-inventory-and-content-map.md`** first; merge or discard findings.
4. Execute later plans in numeric order; run each site’s documented build (often **`python3 generator/build-site.py`**) after substantive generator or content changes.
5. Re-run the auditor with **`--site`** once the preview is available for screenshot-backed checks.

## One-shot Agent prompt

```text
Read .cursor/plans/forge-ux-remediation/00-master-remediation-sequence.md and execute the child plans in numeric order. After each child plan, summarize files changed, UX impact, validation performed, and unresolved risks. Do not invent product capabilities or compliance claims.
```

## Source of truth

Plans reference the Forge standard at **`docs/design/forge-enterprise-ai-website-standard.md`** inside Kitchen Sink (path may be **`kitchensink/docs/design/...`** when using a submodule checkout). Homepage routing and handbook-shell separation norms are spelled out in **[`forge-enterprise-ai-website-standard-v2-addendum.md`](../../docs/design/forge-enterprise-ai-website-standard-v2-addendum.md)**.

Operator install and CLI flags: **[`../../tools/website-ux-auditor/README.md`](../../tools/website-ux-auditor/README.md)**.

## Plan todo status (refresh)

On each run, **`forge-ux-remediation.plan.md`** is regenerated. By default (**plan status refresh** is on), the auditor reads the **previous** `forge-ux-remediation.plan.md` in the same output folder and **copies forward** each `ux-*` todo’s `status:` if it is still valid (`pending`, `in_progress`, `completed`, `cancelled`). That way, after you or Cursor marks steps complete in the YAML, a **re-audit** updates the snapshot and findings **without** wiping progress.

Use **`--no-refresh-plan-status`** only when you want every todo reset to `pending`. Workspace rule (multi-repo hub): **[`../../../.cursor/rules/forge-website-ux-auditor-runs.mdc`](../../../.cursor/rules/forge-website-ux-auditor-runs.mdc)** summarizes this convention.
