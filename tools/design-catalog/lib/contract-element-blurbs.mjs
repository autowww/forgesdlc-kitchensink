/**
 * Element-specific Expected look + Responsive behavior bullets for catalog contracts.
 * Keyed by registry `slug` where the old shared Forge slab was pasted.
 */

const STD =
  '[forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)';

/** @param {Record<string, unknown>} e registry entry */
export function expectedLookBulletsForEntry(e) {
  const slug = String(e.slug || '');
  const name = String(e.name || '');
  const rs = String(e.root_selector || '').trim();
  const rsBit = rs ? ` Registry root: \`${rs}\`.` : '';

  const map = EXPECTED_LOOK_SLUGS[slug];
  if (typeof map === 'function') return map({ slug, name, root_selector: rs });
  if (typeof map === 'string') return map;

  return [
    `- **${name}** (${slug}): describe visible structure, hierarchy, and chrome vs \`main\` content using token vocabulary from ${STD}.${rsBit}`,
    `- Avoid repeating site-wide theme prose here; anchor reviewers to selectors, spacing rhythm, and neighbor regions (\`Kpn\`, \`Ksr\`, \`Ktx\`).`,
  ].join('\n');
}

/** @param {Record<string, unknown>} e */
export function responsiveBulletsForEntry(e) {
  const slug = String(e.slug || '');
  const map = RESPONSIVE_SLUGS[slug];
  if (typeof map === 'function') return map(e);
  if (typeof map === 'string') return map;
  return (
    `- Follow Bootstrap 5 breakpoints inherited by KS layouts; keep tap targets ≥44×44px on dense museum controls.\n` +
    `- When side rails collapse, preserve skip-link reachability and avoid trapping focus in drawers (\`Kco\`).`
  );
}

/** @type {Record<string, string | ((ctx: { slug: string; name: string; root_selector: string }) => string)>} */
const EXPECTED_LOOK_SLUGS = {
  'doc-breadcrumb': ({ root_selector }) =>
    [
      `- Horizontal **breadcrumb** strip (\`${root_selector || '.ks-doc-breadcrumb'}\`): muted secondary text, chevron or slash separators read as decoration only.`,
      `- Terminal crumb reads as current location; upstream crumbs are compact links with visible focus rings (${STD}).`,
      `- Stays visually lighter than **Kpn** and narrower than handbook rails (**Ksr**/**Ktx**) so IA reads as orientation, not navigation chrome.`,
    ].join('\n'),

  'doc-sidebar': ({ root_selector }) =>
    [
      `- Left **handbook sidebar** rail (\`${root_selector || 'aside.forge-sidebar'}\`): vertical IA list with clear active-section affordance and calm separators.`,
      `- Density suits long doc trees; scroll is confined to the rail so \`main\` reading columns stay stable (${STD}).`,
      `- Distinct from **Ktx** (in-page ToC): this rail owns site/doc section switching, not heading anchors.`,
    ].join('\n'),

  'doc-toc-sidebar': ({ root_selector }) =>
    [
      `- Narrow **in-page ToC** column (\`${root_selector || 'Bootstrap grid ToC column'}\`): mirrors heading hierarchy with subtle indent stepped lists.`,
      `- Active anchor state tracks scroll position without shouting over article body styles (${STD}).`,
      `- Paired with chapter/handbook layouts—never mistaken for **Ksr** doc IA rail.`,
    ].join('\n'),

  'site-footer': ({ root_selector }) =>
    [
      `- **Footer** band (\`${root_selector || 'footer region'}\`): balanced columns for links/meta; quieter typography than body copy.`,
      `- Separates closing utilities (copyright, secondary links) from page conclusions without competing with CTAs in \`main\` (${STD}).`,
      `- Decorative dividers or glyphs remain non-semantic (\`aria-hidden\` where appropriate).`,
    ].join('\n'),

  'doc-offcanvas': ({ root_selector }) =>
    [
      `- **Offcanvas drawer** (\`${root_selector || 'offcanvas panel'}\`) slides over content with Forge slate panel styling and clear header/title row.`,
      `- Focus trap while open; closing restores prior focus and avoids obscuring skip targets (${STD}).`,
      `- Used where handbook/mobile chrome collapses—coordinate width and elevation with **Ksr**/**Kpn** disclosures.`,
    ].join('\n'),

  'layout-handbook': () =>
    [
      `- **Handbook shell**: fluid container with **Kpn** masthead, optional **Kbc**, **Ksr** doc rail, wide reading \`main\`, optional **Ktx** ToC column, **Ksf** footer.`,
      `- Optical weight favors long-form reading: predictable column widths, subdued chrome (${STD}).`,
    ].join('\n'),

  'layout-chapter': () =>
    [
      `- **Chapter reading** shell tuned for single-chapter flows: hero/title band (when present) stays subordinate to readable article column.`,
      `- Side rails (**Ksr**, **Ktx**) frame content without shrinking body line-length awkwardly (${STD}).`,
    ].join('\n'),

  'layout-product': () =>
    [
      `- **Product docs** shell mirroring handbook density but with product IA cues (overview/quickstart depth) inside \`main\`.`,
      `- Chrome stack matches handbook family (**Kpn**, **Kbc**, rails, **Ksf**) with layout spacing tuned for mixed prose + reference blocks (${STD}).`,
    ].join('\n'),

  'layout-landing': () =>
    [
      `- **Landing** canvas: hero-forward vertical storytelling with generous bands; chrome stays minimal versus marketing body.`,
      `- Section stacks follow Forge landing rhythm (hero → proof → depth) without burying primary CTA (${STD}).`,
    ].join('\n'),

  'layout-marketing': () =>
    [
      `- **Marketing interior** frame for narrative sections—supports cards, strips, and diagrams without showcase density.`,
      `- Sidebars are rare; emphasis stays on scannable headings and deliberate whitespace (${STD}).`,
    ].join('\n'),

  'layout-listing': () =>
    [
      `- **Listing/index** frame tuned for scan-heavy grids or tables—predictable header region + filter slot patterns when present.`,
      `- Pagination or continuation cues remain visually calm versus gallery tiles (${STD}).`,
    ].join('\n'),

  'layout-gallery': () =>
    [
      `- **Gallery** frame emphasizes tile grids and previews—more visual rhythm than handbook layouts.`,
      `- Controls for filtering/sorting (when present) align with dense museum interactions (${STD}).`,
    ].join('\n'),

  'layout-split': () =>
    [
      `- **Split two-panel** composition: primary pane plus secondary inspector/nav pane with clear resize/stack behavior.`,
      `- Neither panel reads like duplicated chrome—landmarks remain singular (${STD}).`,
    ].join('\n'),

  'layout-showcase': () =>
    [
      `- Museum **showcase** shell: fluid chrome with roomy \`main\` tuned for dense component inventories, TOC-adjacent rails, and anchored sample blocks (not a marketing landing canvas).`,
      `- Typography and color stack follow ${STD}: slate base, disciplined amber/cyan accents, Proxima display versus Open Sans body rhythm.`,
    ].join('\n'),

  'preview-handbook': () =>
    [
      `- Static **preview** page rendering the handbook layout (**Hbk**) for screenshots—chrome proportions match production shell.`,
      `- Museum framing only; still carries hash markers for regression (${STD}).`,
    ].join('\n'),

  'preview-chapter': () =>
    [
      `- Static **preview** of **Chp** chapter layout for golden screenshots—reading column and rails visible at desktop width.`,
      `- No interactive authoring UI—pure catalog capture surface (${STD}).`,
    ].join('\n'),

  'preview-product': () =>
    [
      `- Static **preview** of **Prd** product layout—mirrors handbook chrome stack with product-shaped \`main\`.`,
      `- Used for pixel/regression baselines, not consumer routing (${STD}).`,
    ].join('\n'),

  'preview-marketing': () =>
    [
      `- Static **preview** of **Mkt** interior marketing layout—section stacks visible without dynamic CMS.`,
      `- Typography proves marketing rhythm against KS tokens (${STD}).`,
    ].join('\n'),

  'preview-listing': () =>
    [
      `- Static **preview** of **Lst** listing layout—grid/table density visible at neutral desktop width.`,
      `- Validates spacing against crowded indexes (${STD}).`,
    ].join('\n'),

  'preview-landing': () =>
    [
      `- Static **preview** of **Ldg** landing layout—hero band and first folds composed for screenshot parity.`,
      `- Ensures landing chrome does not collide with museum chrome (${STD}).`,
    ].join('\n'),

  'preview-split': () =>
    [
      `- Static **preview** of **Spl** split layout—both panes visible before narrow breakpoints collapse them.`,
      `- Demonstrates divider affordances without live app state (${STD}).`,
    ].join('\n'),

  index: () =>
    [
      `- **Showcase home / index**: curated portal into museum sections—cards or lists introduce areas without dumping raw link walls.`,
      `- First screen sells scan structure; dense references stay below the fold (${STD}).`,
    ].join('\n'),

  tokens: () =>
    [
      `- **Tokens** demo surfaces swatches, scales, and typography ramps—tabular clarity over marketing flair.`,
      `- Readers compare named tokens side-by-side with readable monospace labels (${STD}).`,
    ].join('\n'),

  controls: () =>
    [
      `- **Controls** gallery shows interactive primitives with consistent spacing—states (hover/error/disabled) must be visible in samples.`,
      `- Components align to KS forms/button guidance without one-off styling (${STD}).`,
    ].join('\n'),

  navigation: () =>
    [
      `- **Navigation patterns** page compares IA treatments—tabs, pills, breadcrumbs coexist without duplicate mastheads.`,
      `- Highlights differences between global (**Kpn**), doc (**Ksr**), and in-page navigation (${STD}).`,
    ].join('\n'),

  surfaces: () =>
    [
      `- **Surfaces** page demonstrates cards, wells, panels—layered depth uses borders/shadows sparingly on dark shells.`,
      `- Each sample labels intent (informational vs actionable) (${STD}).`,
    ].join('\n'),

  presentation: () =>
    [
      `- **Presentation** patterns show slide-scale typography and hero bands suited to speaker-view framing.`,
      `- Motion (if present) stays bounded and pairs with reduced-motion fallbacks (${STD}).`,
    ].join('\n'),

  'enterprise-marketing': () =>
    [
      `- **Enterprise marketing** slice showcases trust-forward strips—balanced copy blocks, evidence-forward tone.`,
      `- Avoids gimmick gradients; accent usage matches disciplined amber/cyan (${STD}).`,
    ].join('\n'),

  'for-agents': () =>
    [
      `- **For agents** museum content explains automation boundaries—callouts and diagrams foreground governance.`,
      `- Reads as operator guidance, not hype (${STD}).`,
    ].join('\n'),

  layouts: () =>
    [
      `- **Layouts demo** indexes layout families with readable thumbnails/cards—differences between handbook/landing/gallery obvious.`,
      `- Cross-links to preview hashes for screenshot parity (${STD}).`,
    ].join('\n'),

  'split-layout': () =>
    [
      `- **Split layout demo** stresses two-pane ergonomics—divider visibility and pane hierarchy clear.`,
      `- Collapsed mobile behavior should mirror **Spl** expectations (${STD}).`,
    ].join('\n'),

  'nested-roadmap': () =>
    [
      `- **Nested roadmap** visuals emphasize hierarchical delivery arcs—nodes readable at zoomed-out scale.`,
      `- Color encodes phase without relying on color alone (labels/icons accompany) (${STD}).`,
    ].join('\n'),

  'forge-react-primitives': () =>
    [
      `- **React primitives** museum page hosts interactive **Rpf** family components—studio chrome, monospace data lanes, disciplined status signals.`,
      `- Each mount exposes child hashes via \`data-ks-hash\`; styling flows from \`forge-react-primitives.css\` (${STD}).`,
    ].join('\n'),

  'react-primitives-live': () =>
    [
      `- **Live primitives** scenarios exercise mounting, loading, and edge props—states visibly distinct.`,
      `- Density matches operator tooling; scrolling stays regional inside demos (${STD}).`,
    ].join('\n'),

  'ks-creation-mindmap': () =>
    [
      `- **Mindmap** diagram emphasizes relational IA—labels legible, connectors calm against dark canvas.`,
      `- Export/preview variants preserve contrast for PNG captures (${STD}).`,
    ].join('\n'),

  'data-charts-static': () =>
    [
      `- **Static charts** demonstrate **Dcs** styling—axes, ticks, and legends readable without animation.`,
      `- Color palettes respect semantic consistency across chart types (${STD}).`,
    ].join('\n'),

  'data-charts-api': () =>
    [
      `- **Charts API** demos show interactive refresh states—loading/error overlays bounded to chart region.`,
      `- Tooltips and focus rings remain keyboard reachable (${STD}).`,
    ].join('\n'),

  'diagram-code-examples': () =>
    [
      `- **Diagram + code** pairings align SVG figures with fenced samples—horizontal rhythm prevents crowding.`,
      `- Diagrams inherit KS diagram tokens (${STD}).`,
    ].join('\n'),

  diagrams: () =>
    [
      `- **Diagrams** gallery showcases SVG archetypes—labels sized for zoomed screenshots.`,
      `- Decorative vs informational layers are visually distinguishable (${STD}).`,
    ].join('\n'),

  'svg-backgrounds': () =>
    [
      `- **SVG backgrounds** gallery highlights atmospheric layers behind content—foreground text stays dominant.`,
      `- Motion-capable backgrounds defer to reduced-motion settings (${STD}).`,
    ].join('\n'),

  motion: () =>
    [
      `- **Motion** samples illustrate purposeful transitions—no gratuitous looping that obscures content.`,
      `- Each pattern documents static fallback (${STD}).`,
    ].join('\n'),

  'forge-ambient': () =>
    [
      `- **Forge ambient** backgrounds layer subtle gradients/noise suited to hero/backdrop slots.`,
      `- Theme siblings (\`KEm\`) coordinate without breaking contrast (${STD}).`,
    ].join('\n'),

  'living-background': () =>
    [
      `- **Living background** demos balance animated canvas with readable overlays—content gutters remain steady.`,
      `- Respects reduced-motion and prefers CSS transforms over layout thrash (${STD}).`,
    ].join('\n'),

  'handbook-chapter': () =>
    [
      `- **Handbook chapter main** body showcases long-form autodoc/handbook HTML inside **Chp**/**Hbk** shells.`,
      `- Heading ladder, callouts, and code blocks adopt handbook rhythm (${STD}).`,
    ].join('\n'),
};

/** @type {Record<string, string | ((e: Record<string, unknown>) => string)>} */
const RESPONSIVE_SLUGS = {
  'doc-breadcrumb': () =>
    [
      `- Below \`md\`, allow wrapping with aligned crumbs; truncate ultra-deep paths with ellipsis + accessible title text rather than horizontal scroll.`,
      `- Maintain ≥44×44px hit areas on crumb links where touch applies.`,
    ].join('\n'),

  'doc-sidebar': () =>
    [
      `- Collapse **Ksr** into **Kco** or navbar disclosure below \`lg\`; keep scroll containment inside the drawer/rail.`,
      `- When visible, long trees scroll independently of \`main\`.`,
    ].join('\n'),

  'doc-toc-sidebar': () =>
    [
      `- **Ktx** stacks beneath article **or** hides behind toggle per layout variant—never squeezes body line length below readable widths.`,
      `- Sticky behaviors (if enabled) degrade gracefully when overflow clipping would trap focus.`,
    ].join('\n'),

  'site-footer': () =>
    [
      `- Footer columns stack by \`sm\`/\`md\` with readable link grouping; legal/meta lines wrap instead of tiny horizontal scroll.`,
      `- Maintain tap spacing between dense footer links.`,
    ].join('\n'),

  'doc-offcanvas': () =>
    [
      `- Panel width caps around tablet sizes; full-height takeover respects safe-area insets on mobile.`,
      `- Escape gestures/controls remain visible—no invisible dismiss targets.`,
    ].join('\n'),

  'layout-handbook': () =>
    [
      `- Below \`lg\`, **Ksr**/**Ktx** collapse per variant; \`main\` spans full width with comfortable gutters.`,
      `- Wide tables/diagrams scroll inside regional containers.`,
    ].join('\n'),

  'layout-chapter': () =>
    [
      `- Reading column maintains max-width for prose; auxiliary rails drop below content on narrow breakpoints.`,
      `- Hero media (if any) scales without cropping critical annotations.`,
    ].join('\n'),

  'layout-product': () =>
    [
      `- Mirrors handbook responsive behavior with allowance for wider reference tables in product docs.`,
      `- Sidebars collapse consistently with **Hbk**/**Chp** variants.`,
    ].join('\n'),

  'layout-landing': () =>
    [
      `- Hero typography scales down without orphans; CTAs remain thumb-reachable.`,
      `- Background media yields to content stacking first—no illegible overlaps.`,
    ].join('\n'),

  'layout-marketing': () =>
    [
      `- Multi-column marketing bands become single column \`md\` and below with preserved heading order.`,
      `- Imagery and diagrams preserve aspect without forcing viewport scroll jank.`,
    ].join('\n'),

  'layout-listing': () =>
    [
      `- Filters/toolbars stack; grids reduce columns progressively (**xl→lg→md→sm**).`,
      `- Empty states remain centered and readable on phones.`,
    ].join('\n'),

  'layout-gallery': () =>
    [
      `- Tile grids reflow from dense desktop columns to 1–2 columns on phones.`,
      `- Captions truncate with expansion affordances when necessary.`,
    ].join('\n'),

  'layout-split': () =>
    [
      `- Panels stack vertically \`md\` and below with clear section headings restoring context.`,
      `- Resizable handles (if any) expose larger touch targets when collapsed.`,
    ].join('\n'),

  'layout-showcase': () =>
    [
      `- Breakpoints follow Bootstrap 5 patterns used across KS: stacks at \`md\`/\`lg\`, sidebars collapse into offcanvas or toggles; wide component demos scroll inside regional containers.`,
      `- Showcase controls and gallery tiles keep ≥44×44px tap targets; skip links stay reachable when masthead/disclosures change height.`,
    ].join('\n'),

  'preview-handbook': () =>
    [
      `- Capture at ~1440px desktop first; optional narrower captures document collapse behavior inherited from **Hbk**.`,
    ].join('\n'),

  'preview-chapter': () =>
    [
      `- Desktop capture highlights reading column; narrow capture shows stacked rails inherited from **Chp**.`,
    ].join('\n'),

  'preview-product': () =>
    [
      `- Desktop capture validates product-shaped \`main\`; narrow capture mirrors handbook collapse patterns.`,
    ].join('\n'),

  'preview-marketing': () =>
    [
      `- Capture demonstrates stacked marketing bands at phone width—no clipped CTAs.`,
    ].join('\n'),

  'preview-listing': () =>
    [
      `- Capture shows grid collapse and filter stacking consistent with **Lst**.`,
    ].join('\n'),

  'preview-landing': () =>
    [
      `- Capture proves hero + first fold at \`sm\`/\`md\` without overlapping nav.`,
    ].join('\n'),

  'preview-split': () =>
    [
      `- Include one stacked variant screenshot showing pane order and headings.`,
    ].join('\n'),

  index: () =>
    [
      `- Portal cards stack single-column on phones; maintain breathing room between dense museum links.`,
    ].join('\n'),

  tokens: () =>
    [
      `- Token tables scroll horizontally inside labelled regions; swatches stay aligned.`,
    ].join('\n'),

  controls: () =>
    [
      `- Control demos stack vertically on narrow widths; maintain spacing between touch targets.`,
    ].join('\n'),

  navigation: () =>
    [
      `- Pattern comparisons remain readable—avoid side-by-side overflows; convert to stacked demos \`sm\` and below.`,
    ].join('\n'),

  surfaces: () =>
    [
      `- Surface samples reflow as cards; shadows/borders remain subtle when stacked.`,
    ].join('\n'),

  presentation: () =>
    [
      `- Slide-scale typography scales down; preview chrome never hides critical headings.`,
    ].join('\n'),

  'enterprise-marketing': () =>
    [
      `- Trust strips stack; logos/evidence rows wrap instead of ultra-small raster scaling.`,
    ].join('\n'),

  'for-agents': () =>
    [
      `- Diagrams and callouts reflow; maintain readable line length for explanatory prose.`,
    ].join('\n'),

  layouts: () =>
    [
      `- Layout index cards reflow; thumbnails retain aspect without cropping labels.`,
    ].join('\n'),

  'split-layout': () =>
    [
      `- Mirrors **Spl**: stacked panes below \`md\` with preserved landmark order.`,
    ].join('\n'),

  'nested-roadmap': () =>
    [
      `- Roadmap canvases pan/zoom or scroll regionally; labels remain legible when zoomed out.`,
    ].join('\n'),

  'forge-react-primitives': () =>
    [
      `- Interactive demos stack; grids horizontal-scroll inside labelled panels.`,
    ].join('\n'),

  'react-primitives-live': () =>
    [
      `- Live mounts shrink gracefully; avoid clipped dropdown menus—flip alignment when needed.`,
    ].join('\n'),

  'ks-creation-mindmap': () =>
    [
      `- Mindmap SVG scales or pans inside viewport; text stays readable at default zoom.`,
    ].join('\n'),

  'data-charts-static': () =>
    [
      `- Charts shrink width-first; legends reposition to avoid overlap on narrow screens.`,
    ].join('\n'),

  'data-charts-api': () =>
    [
      `- Loading overlays respect reduced space; chart region keeps minimum readable height.`,
    ].join('\n'),

  'diagram-code-examples': () =>
    [
      `- Code blocks scroll horizontally independently; diagrams scale above prose on phones.`,
    ].join('\n'),

  diagrams: () =>
    [
      `- Diagram galleries reflow; SVG text scales or wraps annotations thoughtfully.`,
    ].join('\n'),

  'svg-backgrounds': () =>
    [
      `- Background previews show safe cropping zones; foreground demos keep minimum contrast.`,
    ].join('\n'),

  motion: () =>
    [
      `- Motion samples degrade under reduced-motion; static thumbnails communicate intent.`,
    ].join('\n'),

  'forge-ambient': () =>
    [
      `- Ambient layers scale/crop without obscuring overlaid hero copy checkpoints.`,
    ].join('\n'),

  'living-background': () =>
    [
      `- Animated canvases pause or simplify under reduced-motion; content gutters fixed.`,
    ].join('\n'),

  'handbook-chapter': () =>
    [
      `- Long-form body uses responsive typography; code blocks and tables scroll regionally.`,
    ].join('\n'),
};
