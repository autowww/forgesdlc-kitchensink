# SoftServe AI Principles

Use the fixture screenshots and `extracted-design/observations.json` to judge
whether transformed pages preserve this theme's feel.

Because the Playwright capture hit bot protection, use the fetched homepage
content as the primary first-pass evidence and treat visual-token conclusions as
unconfirmed until a full browser fixture is available.

Review prompts:

- Does the page feel like a confident enterprise digital engineering company:
  direct, capability-rich, and grounded in real work?
- Does the story move from elevated promise to services, proof, customer impact,
  partner credibility, insights, and a final conversion CTA?
- Do service cards use concrete capability labels instead of generic marketing
  adjectives?
- Does proof feel named and inspectable, using partners, reports, awards,
  customers, or roles rather than unsupported superlatives?
- Do insight and case-study grids feel editorial and curated rather than like a
  dense link dump?
- Are images/logos used as evidence for services, customers, partners, or
  thought leadership rather than as decorative filler?
- Which repeated judgment should become a deterministic `DET.*` rule?

Fixture pages:
- https://softserveinc.com/

Fetched homepage evidence:

- Hero: "Technology Elevated"; SoftServe describes itself as a digital
  engineering company building data, cloud, AI/ML, robotics, IoT, and XR
  solutions.
- Primary CTA: `Contact us`.
- Early service tiles: Artificial Intelligence, Cloud, Data.
- Proof/news modules: MIT agentic AI report and NVIDIA partner award.
- Impact stories: Montblanc, Ensight, Quavo, Zenoss.
- Partner trust: AWS, NVIDIA, Google Cloud, Microsoft.
- Insight grid: white papers and reports around agentic AI, AI economics,
  humanoids, cloud modernization, and data initiatives.
