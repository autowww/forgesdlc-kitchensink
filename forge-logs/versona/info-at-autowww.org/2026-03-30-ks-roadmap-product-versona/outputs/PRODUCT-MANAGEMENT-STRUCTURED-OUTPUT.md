# Product Management Versona — structured output (contract §5)

**Session:** `2026-03-30-ks-roadmap-product-versona` · **Actor:** info@autowww.org

**Work item:** Roadmap theme — **Kitchen Sink (KS) product roadmap** (derived from KS assessment report)  
**Phase:** PDLC **P2–P3** (validation / strategy) toward P4–P5 as adoption mechanics land; SDLC **A–B** discover/specify for framework productization  
**Review depth:** **High** (roadmap row Definition of Ready applied to themes)

### Concerns

| # | Concern | Severity | Recommendation |
|---|---------|----------|----------------|
| 1 | Roadmap rows risk becoming a **feature backlog** (“more components”) instead of **adoptability first** (entry, search, versioning, releases, theme isolation). | significant | Keep **Horizon 1** locked to legibility + search + broken assets; defer broad UI patterns until layers/versioning are credible. |
| 2 | **Submodule-only adoption** is a friction story; “starter repos / semver” in Horizon 2 needs an **owner and minimal viable path** (e.g. one tagged release + one public template) or it stays internal. | significant | Define one **MVP consumption story**: pip/git tag + single starter; document what stays submodule-only short term. |
| 3 | **Theme clash** (product vs handbook CSS) blocks trust for “one framework, multiple shells.” | significant | Treat **theme isolation** as a **product risk** — sequence with layer packaging (tokens vs layouts vs transforms). |
| 4 | **Scale features** (search, version selector) are table stakes; shipping search **before** large new content reduces findability debt. | minor | Enforce assessment order: **search early** in Horizon 1. |
| 5 | **“Kitchen Sink”** as public product name may undersell the stack; renaming is **GTM / comms** cost. | minor | Short **naming / positioning** decision (Marketing lens) in parallel with Horizon 1, or accept KS as codename for 1–2 quarters. |
| 6 | **Governance maturity matrix** (stable/beta/legacy) is easy to defer; without it, adopters cannot commit. | significant | Ship **explicit stability labels** with layouts/transforms in the same release train as changelog + roadmap pages. |

### Evidence requests

- **Adoption targets:** First **non-Forge** adopter (if any), or external credibility as a 12-month goal — sets Horizon 2 investment.
- **Search:** Client-side index vs hosted — **constraint and cost** decision.
- **Versioning:** Doc **version selector** vs **framework semver** only — multi-version build scope.
- **Wireframe SVGs:** Root cause (path, build, CSP) — **RCA** so “did not load” does not recur.
- **PMF signal:** One primary metric (e.g. clones, stars, support volume, external PRs).

### Suggested next Versonas

| Versona / rule | When | Why |
|----------------|------|-----|
| `versona-ux` | Before locking search UX and Horizon 1 IA | IA, accessibility, theme-boundary UX |
| `versona-ba` | When writing getting started / install / adoption paths AC and non-goals | Requirements vs marketing copy |
| `versona-marketing` or `versona-family-product` | Naming, positioning line, changelog tone | “Not a component gallery” vs outbound messaging |
| `versona-se` (or Architecture) | Theme isolation design and layer split | Semver and packaging coherence |
| `versona-all` | If discipline routing is unclear | Route before deep implementation |

### Recommendation

**Proceed with conditions**

- Horizon 1 must include **real home + onboarding pages + search + wireframe fix** before net-new primitives.
- **Stability/maturity** published alongside the roadmap.
- **Theme isolation** is a named Horizon 2 initiative with an exit criterion (documented safe combinations or namespaced CSS variables).

---

## Roadmap synthesis (theme level — Definition of Ready)

| Theme | Outcome | Evidence / why now | Horizon | Dependencies | Non-goals | Next gate |
|-------|---------|-------------------|---------|--------------|-----------|-----------|
| Public legibility | Visitor understands KS, layers, adoption paths, start here | Assessment: weak entry | **0–30 d** | Copy + IA; optional UX | Rebuilding all showcase | Home + nav pages shipped; positioning sign-off |
| Quality bar | No broken showcase assets | Wireframes “did not load” | **0–30 d** | Asset paths / build | Full redesign | RCA; layouts page verified |
| Discoverability | Find content across docs | No search UI | **0–30 d** | Search tech choice | Perfect relevance | Search live (MVP) |
| Layered productization | Adopters know what to pin and how it versions | Submodule friction | **30–90 d** | Tags/releases; docs | Full PyPI monorepo if N/A | Tagged releases + compatibility matrix; optional starter |
| Theme isolation | Handbook + product themes don’t clash | Documented clash | **30–90 d** | SE/Arch design | Rewrite all CSS at once | Isolation strategy + migration notes |
| Publishing primitives | Next docs/knowledge patterns (tabs, pagination, release notes, …) | Expand publishing not app chrome | **3–6 mo** | Stable layouts/transforms | Full form library | Prioritized backlog + pilot |
| Governance & scale | Safe adoption; regressions caught | Informal maturity labels | **6–12 mo** | CI, checks | Heavy committee | Maturity matrix + checks on built HTML |

### Strategic alignment

- **Core bet:** Python-first static publishing + **agent-readable** spec as differentiator; protect in comms and Horizon 3 ordering.
- **Top risk:** **Adoptability** beats **breadth** for the next two quarters.
