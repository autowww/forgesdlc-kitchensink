/**
 * Registry-aware markdown for ## Deterministic checks and ## AI-enabled review cues
 * on stateful catalog contracts (layout, page, chrome-region, layout-preview).
 */

/** @typedef {{ hash?: string, name?: string, type?: string, slug?: string, root_selector?: string | null, source_symbols?: string[], showcase_url?: string | null }} RegistryEntryLite */

/** @type {Record<string, string[]>} */
const LAYOUT_SYMBOL_DETERMINISTIC = {
  handbook_page: [
    'Handbook shells pair sidebar / ToC rails with a single primary `article` or `main` region; axe (or DOM query) reports no duplicate banner landmarks.',
    'When breadcrumbs are emitted, `doc-breadcrumb` entries align with handbook IA (no stale slugs); links resolve in built showcase output.',
  ],
  chapter_page: [
    'Chapter layout preserves one reading column with predictable H1/H2 rhythm; intra-page anchors remain stable across rebuild.',
    '`chapter_page` callers do not nest a second chrome-level `nav` intended as site primary navigation inside `main`.',
  ],
  product_page: [
    '`product-primary-nav` (**Kpn**) precedes primary content without duplicating handbook sidebars intended for dense doc trees.',
    'Product/overview patterns keep trust blocks and CTAs inside `main`; no rogue full-width grids outside landmarked regions.',
  ],
  showcase_page: [
    'Museum shells keep dense component inventories inside `main`; skip-link targets remain reachable when masthead height changes.',
    'Gallery children that reuse `showcase_page` still expose component anchors suitable for deeplinks from generated indexes.',
  ],
  landing_page: [
    'Hero band and first outcome blocks stay above the fold at the contract preview width; primary and secondary CTAs map to distinct destinations.',
    'Token-driven contrast for hero overlays meets WCAG AA against the ambient background treatment for this layout.',
  ],
  marketing_page: [
    'Interior marketing rhythm (sections → cards → CTA rail) preserves vertical spacing tokens; tables of technical detail are folded behind disclosure or sibling pages.',
    'No autoplay media in first viewport unless muted, labeled, and covered by reduced-motion fallbacks coordinated with **Ksj**.',
  ],
  listing_page: [
    'List/grid density matches Bootstrap column rules; pagination or filters remain keyboard operable.',
    'Card titles maintain heading semantics (not anonymous `div` stacks) when listings are scraped for nav aids.',
  ],
  gallery_page: [
    '`gallery_page` card grid aligns to a predictable column count per breakpoint; card media keeps aspect cues without cropping critical labels.',
    'Right-rail ToC (when enabled) mirrors `showcase_page` affordances and does not occlude thumbnail focus rings.',
  ],
  split_page: [
    'Two-pane chrome keeps focus order coherent (pane header → pane body → complementary pane); resizable splitter (if present) exposes keyboard equivalents.',
    'Neither pane substitutes for site-level `footer`/`main` landmarks; regions remain supplementary to the canonical shell.',
  ],
};

/** @type {Record<string, string[]>} */
const CHROME_SLUG_DETERMINISTIC = {
  'doc-sidebar': [
    '`doc-sidebar` link list exposes current-page state (aria-current / active class) for every built showcase consumption path.',
    'Rail width respects reading column; long labels truncate with ellipsis only when tooltip or full text is reachable.',
  ],
  'doc-offcanvas': [
    'Offcanvas open/close pairs with `button`/`a` triggers that have accessible names; focus traps while open per Bootstrap patterns.',
    'Closing restores focus to the invoking control across route-like hash changes.',
  ],
  'site-footer': [
    '`site-footer` contains secondary IA and meta links only; no takeover of primary CTA lanes reserved for page body.',
    'Footer columns stack predictably below `md` without horizontal scroll traps.',
  ],
  'doc-breadcrumb': [
    'Breadcrumb items reflect the path to the current page; intermediate crumbs are links, terminal crumb is text or marked current.',
    'Separator glyphs are decorative (`aria-hidden`) when implemented as typographic separators.',
  ],
  'doc-toc-sidebar': [
    'Heading-index links map to real `id` targets inside `main`; broken anchors fail CI when heading text changes.',
    'Sticky ToC clears fixed masthead offsets so focused targets are not clipped.',
  ],
  'product-primary-nav': [
    'Top bar keeps brand mark + primary IA labels on one horizon; collapsing menu moves items into reachable disclosure at `lg` breakpoints.',
    'Megamenu or drawers (when used) expose first interactive element on open and restore focus on Esc.',
  ],
};

/**
 * @param {RegistryEntryLite} e
 * @returns {string[]}
 */
function layoutDeterministicExtras(e) {
  const sym = (e.source_symbols || [])[0] || '';
  return LAYOUT_SYMBOL_DETERMINISTIC[sym] || [
    '`source_symbols` in the registry must match `ks_layout_symbol` / Python entrypoint for this hash; drift breaks marker audits.',
    'Child chrome regions (**Ksr**, **Kco**, …) compose without duplicate `main` or conflicting `aria-label`s on nested `nav` elements.',
  ];
}

/**
 * @param {RegistryEntryLite} e
 * @returns {string[]}
 */
function chromeDeterministicExtras(e) {
  const slug = String(e.slug || '');
  return CHROME_SLUG_DETERMINISTIC[slug] || [
    '`chrome_region_attrs(<slug>)` (or successor helper) attaches both `hash` and `data-ks-hash` on the annotated root.',
    'Region participates in coordinated responsive collapse rules documented under **Responsive behavior**.',
  ];
}

/**
 * @param {RegistryEntryLite} e
 * @returns {{ deterministic: string, aiReview: string }}
 */
export function buildGovernanceSectionsMarkdown(e) {
  const hash = String(e.hash || '?');
  const name = String(e.name || 'surface');
  const typ = String(e.type || '');
  const slug = String(e.slug || '');
  const root = e.root_selector ? String(e.root_selector) : 'registry Anatomy root_selector';

  /** @type {string[]} */
  const det = [];
  /** @type {string[]} */
  const ai = [];

  det.push(
    `Showcase/build output honors **${hash}** markers: emitted roots include both \`hash="${hash}"\` and \`data-ks-hash="${hash}"\` where \`emit_marker_in_showcase\` / museum rules apply.`,
    `Structural root for audits: ${root}: DOM snapshots and screenshot acceptance anchor here or at an explicitly documented child.`,
  );

  if (typ === 'layout') {
    det.push(...layoutDeterministicExtras(e));
    ai.push(
      `Does **${name}** read as the correct *role* for consumers (handbook vs museum vs landing) rather than an accidental mash-up of two layouts?`,
      'Under studio lighting (screenshots at ~1440px), does vertical rhythm reinforce scan-friendly hierarchy (not cramped headings or orphaned whitespace bands)?',
      'When paired with diagrams or dense tables, does chrome stay visually subordinate while remaining discoverable?',
    );
  } else if (typ === 'chrome-region') {
    det.push(...chromeDeterministicExtras(e));
    ai.push(
      `For **${name}** (\`${slug}\`), does the chrome read as purposeful product IA rather than decorative Bootstrap filler?`,
      'At condensed widths, collapsed affordances remain obvious (motion, affordance cues, labeling); no mystery-meat menus.',
      'Credibility check: typography and spacing match Forge enterprise tone ([forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md)) without looking like a generic template swap.',
    );
  } else if (typ === 'page') {
    const src = ((e.source_paths || [])[0] || '').split('/').pop() || slug;
    det.push(
      `Page generator \`${src}\` composes inside the advertised parent layout; built HTML for slug \`${slug || 'inline'}\` includes the nested layout hash markers expected by showcase inventory.`,
      '`main#main` (or contracted root) headings follow one H1 convention per view; supplementary cards do not spoof heading levels.',
    );
    ai.push(
      `Does **${name}** storytelling match the KS museum intent (education, reassurance, parity with consumer sites), not accidental placeholder copy?`,
      'Are technical blocks (API tables, prose blocks) progressively disclosed consistent with Forge landing doctrine?',
      `Screenshot or DOM review: hero / first-scroll real estate reinforces the visitor job for **${slug || name}**.`,
    );
  } else if (typ === 'layout-preview') {
    det.push(
      'Miniature preview page mirrors typography and shell stripe patterns of its parent layout hash without spoofing unrelated themes.',
      'Preview iframe/card (if present) retains readable type scale; no unreadable pixel-type used only for pixel-fit.',
    );
    ai.push(
      `Does the preview communicate *which* layout family is selected (visual signature of **${name}**) to handbook readers at a glance?`,
      'Would a consumer maintainer recognize migration risk from the preview alone (density, nav chrome, hero treatment)?',
    );
  } else {
    det.push('Extend `contract-governance-blocks.mjs` when new stateful registry types gain contracts.');
    ai.push('Document judgment-only review expectations for this type once catalog governance expands.');
  }

  const deterministicMd = ['## Deterministic checks', '', ...det.map((x) => `- ${x}`), ''].join('\n');
  const aiMd = ['## AI-enabled review cues', '', ...ai.map((x) => `- ${x}`), ''].join('\n');

  return { deterministic: deterministicMd, aiReview: aiMd, combined: `${deterministicMd}\n${aiMd}\n` };
}
