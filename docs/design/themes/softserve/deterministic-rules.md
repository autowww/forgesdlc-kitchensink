# SoftServe Deterministic Rules

These draft checks combine sparse fixture observations with public homepage
content fetched from `https://www.softserveinc.com/`. They should be reviewed
before becoming quality gates.

| Rule area | Draft captured expectation |
|-----------|----------------------------|
| Hero | Root pages should expose a short category headline, a one-sentence capability statement, and one primary conversion CTA. |
| Capability tiles | First-screen or early-page service clusters should contain three to four major capability cards with concise labels and imagery. |
| Proof modules | Pages should include named credibility evidence: customer story, partner, award, report, or case-study references. |
| CTA hierarchy | `Contact us` or equivalent conversion action should be primary; secondary discovery links should not compete visually with it. |
| Insight cards | Thought-leadership grids should use content type labels, concise titles, and one clear exploration action. |
| Partner trust | Partner or customer logos must be paired with meaningful copy or a nearby credibility statement, not used as decoration only. |
| Capture quality | If Playwright metrics report zero headings, zero nav links, and the default serif stack, mark the fixture as protected/insufficient rather than accepting those as theme tokens. |

Candidate promotions: `DET.PAGE.MODE`, `DET.CTA.HIERARCHY`,
`DET.CONTEXT.BURDEN`, `DET.CARD.TITLE`, `DET.CARD.ACTION_LIMIT`,
`DET.CHART.ALT_SUMMARY`, `DET.THEME.FONT_STACK`, `DET.TOKEN.NO_DRIFT`,
and `DET.RULE_CAPTURE.QUALITY`.
