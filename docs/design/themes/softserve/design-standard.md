---
id: ks.theme.softserve.design-standard
kind: design-theme-standard
status: draft
theme: softserve
updated: 2026-05-19
---

# SoftServe theme standard

Draft captured from https://softserveinc.com/.

## Capture Evidence

The Playwright fixture reached only a bot-protection shell, so computed CSS
tokens are sparse. The content-level fetch returned the public homepage
structure and should be treated as the primary evidence for this first draft.
Do not treat the Times New Roman fallback in `tokens.json` as a real SoftServe
brand token.

## Scrubbed Takeaways

- The homepage leads with a concise category hero: "Technology Elevated".
- The first screen pairs the core positioning with one primary action,
  `Contact us`, and a service-card cluster for Artificial Intelligence, Cloud,
  and Data.
- The page uses proof-led enterprise storytelling: reports, partner awards,
  stories of impact, core partners, insights, and a closing contact CTA.
- Service and insight cards rely heavily on photographic or partner-logo imagery
  paired with short labels or concise explanatory blurbs.
- Trust is built through named customer/partner evidence rather than broad
  claims: Montblanc, Ensight, Quavo, Zenoss, AWS, NVIDIA, Google Cloud, and
  Microsoft appear as credibility anchors.

This file is a draft. A maintainer should convert useful patterns into KS
tokens, components, layout variants, or contract overlays only after reviewing
the fixture evidence.

## Reusable Theme Shape

Use this theme when the target page should feel like an enterprise digital
engineering consultancy:

1. Start with a short, elevated headline and a plain-language capability
   statement.
2. Place one primary contact/conversion action near the hero.
3. Expose three to four major capability tiles immediately after the hero.
4. Follow with news/proof modules before deeper case-study or insight grids.
5. Use named proof and partner ecosystems as credibility structure.
6. End with a direct results-oriented CTA.
