# Page design constraints

**Site:** _{SITE_NAME}_ (`{SITE_DOMAIN}`)  
**Generator repo:** _{WEBSITE_REPO}_  
**Canonical KS policy:** [scroll-overflow-policy.md](https://github.com/autowww/forgesdlc-kitchensink/blob/main/docs/design/scroll-overflow-policy.md) · [forge-enterprise-ai-website-standard.md](https://github.com/autowww/forgesdlc-kitchensink/blob/main/docs/design/forge-enterprise-ai-website-standard.md)

Read this file **before** authoring or remediating L1–L2 pages, hub shells, or landing spatial bands.

## Universal constraints (all Forge websites)

1. **Scrollbars** — Only the browser viewport may show the native/default scrollbar. Regional overflow uses hidden scrollbars plus explicit controls (peek-rail chevrons, expand, wrap/stack). **Exception:** `.forge-table-wrap` horizontal scroll for wide tables.
2. **Landing bands** — Hlr, Hlp, Hst, Dck blocks must not expose rail scrollbars; use `ks-peek-rail.js` or stack on narrow viewports.
3. **CSS bundle** — Landing spatial styles live in `forge-theme.css` / `ks-spatial.css`; do not rely on `docs-theme.css` alone on handbook consumer pages.
4. **Handbook assets** — Image paths in Markdown must match the published asset prefix for this site (see site table below).
5. **No duplicate visuals** — Do not place a static diagram under an interactive layer rail that already conveys the same story.

## Site-specific wiring

| Item | Value |
|------|-------|
| Content source repo | _{CONTENT_REPO}_ |
| Build command | _{BUILD_COMMAND}_ |
| Handbook asset public prefix | _{ASSET_PREFIX}_ |
| L1 homepage Markdown | _{L1_HOME_MD}_ |
| Site nav YAML (if any) | _{SITE_NAV_YAML}_ |
| UX prompt pack | _{PROMPT_PACK}_ |

## L1–L2 checklist (before merge)

- [ ] `page_contract_profile: landing` or `hub` on hub pages; `landing_blocks` markers match YAML.
- [ ] No `src="assets/ecosystem/` in generated HTML unless assets are served at that path.
- [ ] Peek rails have prev/next controls; scroller uses `ks-scroll-region` (no visible bar).
- [ ] Light theme: Kpn/Kbc/Ksr labels readable (`data-bs-theme="light"`).
- [ ] Run site `check-generated-site.py` (or equivalent) after rebuild.

## Remediation

Prefer **generator / KS root-cause fixes** over per-page HTML patches when the same defect appears on multiple URLs. See Forge UX remediation plans under `.cursor/plans/forge-ux-remediation/` when using the website UX auditor.
