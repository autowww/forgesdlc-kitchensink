Execute the phase below. You may edit files. Keep the change scoped. Run relevant checks at the end and update the matching .cursor/plans/ks-ux-component-rules/*.md evidence/report file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 01 — Showcase and catalog inventory

Goal: build a trustworthy source-derived inventory of KS visuals and compare it against current catalog contracts and screenshots.

Tasks:

1. Try to access/capture the live showcase URLs if network is available:
   - `https://ks.forgesdlc.com/showcase/`
   - `https://kitchensink.forgesdlc.com/`
2. If live is unavailable, build local showcase with `python3 generator/build-showcase.py` and use local generated pages and `docs/design/catalog/screenshots/*.png`.
3. Run or improve `tools/design-catalog/inventory-ks-visuals.mjs` so it reports:
   - all registry rows;
   - all visual source files;
   - all emitted hashes in generated HTML;
   - screenshot availability;
   - contract availability;
   - family-covered rows and their children;
   - high-risk broad-family coverage.
4. Produce `.cursor/plans/ks-ux-component-rules/01-showcase-and-catalog-inventory.md` with:
   - inventory totals;
   - registry totals by type;
   - missing/weak contracts;
   - screenshot gaps/mismatches;
   - emitted-hash coverage;
   - visual groups needing more specific rules.

Acceptance:
- local showcase builds;
- inventory report exists;
- no Fleet-specific profile is created.
--- PHASE PROMPT END ---
