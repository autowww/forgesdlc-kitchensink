/**
 * Canonical registry data → written to docs/design/catalog/visual-registry.yaml
 * Run: node tools/design-catalog/write-registry-yaml.mjs
 */
const ST = 'docs/design/forge-enterprise-ai-website-standard.md';

const cssPaths = [
  'css/forge-theme.css',
  'css/forge-react-primitives.css',
  'css/script-assembly.css',
  'css/forge-fleet-admin.css',
  'css/tile-dropdown.css',
  'css/nested-roadmap.css',
  'css/forgesdlc-theme.css',
  'css/docs-theme.css',
  'css/wizard-flow.css',
  'css/workspace-lens.css',
  'css/forgesdlc-pack-minimal.css',
  'css/forgesdlc-pack-contrast.css',
  'css/forgesdlc-pack-focus.css',
  'css/forgesdlc-pack-showcase.css',
  'css/forgesdlc-pack-enterprise.css',
  'css/forge-data-charts.css',
  'css/forge-ambient.css',
  'css/forge-ambient-themes.css',
  'css/ks-living-background.css',
  'css/forge-light-theme.css',
  'css/svg-background-gallery.css',
  'css/ks-animated-backgrounds.css',
];

const jsPaths = [
  'js/nested-roadmap.js',
  'js/showcase.js',
  'js/forge-theme.js',
  'js/ks-diagram-modal.js',
  'js/forge-data-charts.js',
  'js/roadmap-dates.js',
  'js/ks-tilt-tiles.js',
  'js/ks-diagram-catalog.js',
  'js/ks-animated-backgrounds.js',
  'js/forge-ambient.js',
  'js/ks-living-motion.js',
  'js/fs-home-expand-tiles.js',
  'js/fs-nav-dropdown.js',
  'js/diagram-modal-zoom.js',
  'js/fs-presentation.js',
  'js/svg-background-gallery.js',
  'js/portal-nav.js',
  'js/docs-nav.js',
];

const svgPaths = [
  "assets/svg/ambient/aurora-flow.svg",
  "assets/svg/ambient/constellation-sweep.svg",
  "assets/svg/ambient/contour-drift.svg",
  "assets/svg/ambient/mesh-bloom.svg",
  "assets/svg/ambient/orbit-field.svg",
  "assets/svg/ambient/signal-river.svg",
  "assets/svg/backgrounds/contours/bg-contour-depth-01.svg",
  "assets/svg/backgrounds/contours/bg-contour-flow-01.svg",
  "assets/svg/backgrounds/contours/bg-topology-soft-01.svg",
  "assets/svg/backgrounds/dots/bg-dots-cluster-01.svg",
  "assets/svg/backgrounds/dots/bg-dots-drift-01.svg",
  "assets/svg/backgrounds/dots/bg-dots-field-01.svg",
  "assets/svg/backgrounds/dots/bg-dots-pulse-01.svg",
  "assets/svg/backgrounds/grids/bg-grid-pulse-01.svg",
  "assets/svg/backgrounds/grids/bg-grid-shift-01.svg",
  "assets/svg/backgrounds/grids/bg-hex-drift-01.svg",
  "assets/svg/backgrounds/grids/bg-lattice-flow-01.svg",
  "assets/svg/backgrounds/neurons/bg-neurons-cluster-01.svg",
  "assets/svg/backgrounds/neurons/bg-neurons-pulsegraph-01.svg",
  "assets/svg/backgrounds/neurons/bg-neurons-softmesh-01.svg",
  "assets/svg/backgrounds/neurons/bg-neurons-synapse-01.svg",
  "assets/svg/backgrounds/orbits/bg-orbit-minimal-01.svg",
  "assets/svg/backgrounds/orbits/bg-orbit-node-01.svg",
  "assets/svg/backgrounds/orbits/bg-pulse-ring-01.svg",
  "assets/svg/backgrounds/orbits/bg-signal-beacon-01.svg",
  "assets/svg/backgrounds/signals/bg-signal-trace-01.svg",
  "assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-01.svg",
  "assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg",
  "assets/svg/backgrounds/sinusoids/bg-sine-interference-01.svg",
  "assets/svg/backgrounds/sinusoids/bg-sine-layered-01.svg",
  "assets/svg/backgrounds/sinusoids/bg-sine-ribbon-01.svg",
  "assets/svg/backgrounds/stars/bg-stars-drift-01.svg",
  "assets/svg/backgrounds/stars/bg-stars-parallax-01.svg",
  "assets/svg/backgrounds/stars/bg-stars-sparse-01.svg",
  "assets/svg/layout-schematic-gallery.svg",
  "assets/svg/layout-schematic-handbook.svg",
  "assets/svg/layout-schematic-landing.svg",
  "assets/svg/layout-schematic-product.svg",
  "assets/svg/layout-schematic-showcase.svg",
  "assets/svg/layout-schematic-split.svg",
  "assets/svg/living/global/field-rails-01.svg",
  "assets/svg/living/motifs/branch-rail-01.svg",
  "assets/svg/living/motifs/converge-trace-01.svg",
  "assets/svg/living/motifs/dual-rail-01.svg",
  "assets/svg/living/motifs/frame-card-grid-01.svg",
  "assets/svg/living/motifs/narrative-guides-01.svg",
  "assets/svg/living/motifs/sparse-frame-01.svg",
  "assets/svg/living/motifs/trace-flow-01.svg",
  "assets/svg/template-area-chart.svg",
  "assets/svg/template-bar-chart.svg",
  "assets/svg/template-board-columns.svg",
  "assets/svg/template-bullet-chart.svg",
  "assets/svg/template-checklist.svg",
  "assets/svg/template-decision-flow.svg",
  "assets/svg/template-funnel.svg",
  "assets/svg/template-gantt.svg",
  "assets/svg/template-gate-chain.svg",
  "assets/svg/template-gauge.svg",
  "assets/svg/template-heatmap.svg",
  "assets/svg/template-kpi-card.svg",
  "assets/svg/template-line-chart.svg",
  "assets/svg/template-linear-flow.svg",
  "assets/svg/template-loop-cycle.svg",
  "assets/svg/template-nested-donut.svg",
  "assets/svg/template-network.svg",
  "assets/svg/template-org-chart.svg",
  "assets/svg/template-pie-donut.svg",
  "assets/svg/template-quadrant.svg",
  "assets/svg/template-radar.svg",
  "assets/svg/template-roadmap.svg",
  "assets/svg/template-scatter.svg",
  "assets/svg/template-sequence.svg",
  "assets/svg/template-stacked-bar.svg",
  "assets/svg/template-state-machine.svg",
  "assets/svg/template-swimlane.svg",
  "assets/svg/template-timeline.svg",
  "assets/svg/template-tree.svg",
  "assets/svg/template-venn.svg",
  "assets/svg/template-waterfall.svg",
];

function base(e) {
  return {
    family: null,
    aliases: [],
    parent_hash: null,
    child_hashes: [],
    accessibility_notes: null,
    responsive_notes: null,
    owner: 'forge-ks',
    last_reviewed: null,
    notes: '',
    hash_exception_reason: null,
    design_standard_refs: [ST],
    ...e,
  };
}

export const entries = [];

function addLayout(hash, name, slug, symbol, showcasePreview) {
  entries.push(
    base({
      hash,
      name,
      slug,
      type: 'layout',
      family: 'layouts',
      status: 'active',
      source_paths: ['components/layouts.py'],
      source_symbols: [symbol],
      root_selector: 'div.container-fluid.px-0',
      contract: `docs/design/catalog/layouts/${hash}-${slug}.md`,
      contract_status: 'own',
      showcase_url: showcasePreview
        ? `https://ks.forgesdlc.com/showcase/${showcasePreview}`
        : null,
      screenshot_url: `https://ks.forgesdlc.com/showcase/screenshots/${hash}.png`,
      screenshot_status: 'planned',
      emit_marker_in_showcase: true,
    }),
  );
}

addLayout('Hbk', 'Handbook layout', 'layout-handbook', 'handbook_page', 'preview-handbook.html');
addLayout('Chp', 'Chapter layout', 'layout-chapter', 'chapter_page', 'preview-chapter.html');
addLayout('Prd', 'Product handbook layout', 'layout-product', 'product_page', 'preview-product.html');
addLayout('Shw', 'Showcase documentation layout', 'layout-showcase', 'showcase_page', null);
addLayout('Ldg', 'Landing layout', 'layout-landing', 'landing_page', 'preview-landing.html');
addLayout('Mkt', 'Marketing interior layout', 'layout-marketing', 'marketing_page', 'preview-marketing.html');
addLayout('Lst', 'Listing layout', 'layout-listing', 'listing_page', 'preview-listing.html');
addLayout('Gly', 'Gallery layout', 'layout-gallery', 'gallery_page', null);
addLayout('Spl', 'Split two-panel layout', 'layout-split', 'split_page', 'preview-split.html');

const pageDefs = [
  ['Idx', 'Showcase home', 'index', 'index'],
  ['Tkn', 'Design tokens', 'tokens', 'tokens'],
  ['Ctr', 'Controls', 'controls', 'controls'],
  ['Nav', 'Navigation patterns', 'navigation', 'navigation'],
  ['Srf', 'Surfaces', 'surfaces', 'surfaces'],
  ['Pnz', 'Presentation', 'presentation', 'presentation'],
  ['Enm', 'Enterprise marketing', 'enterprise-marketing', 'enterprise_marketing'],
  ['Fag', 'For agents', 'for-agents', 'for_agents'],
  ['Lyt', 'Layouts demo', 'layouts', 'layouts_demo'],
  ['Slt', 'Split layout demo', 'split-layout', 'split_layout_demo'],
  ['Ndr', 'Nested roadmap', 'nested-roadmap', 'nested_roadmap'],
  ['Frp', 'Forge React primitives', 'forge-react-primitives', 'forge_react_primitives'],
  ['Rpl', 'React primitives live', 'react-primitives-live', 'react_primitives_live'],
  ['Kcm', 'KS creation mindmap', 'ks-creation-mindmap', 'ks_creation_mindmap'],
  ['Dcs', 'Data charts static', 'data-charts-static', 'data_charts_static'],
  ['Dca', 'Data charts API', 'data-charts-api', 'data_charts_api'],
  ['Dce', 'Diagram code examples', 'diagram-code-examples', 'diagram_code_examples'],
  ['Dgm', 'Diagrams', 'diagrams', 'diagrams'],
  ['Sgb', 'SVG backgrounds', 'svg-backgrounds', 'svg_backgrounds'],
  ['Mtn', 'Motion', 'motion', 'motion'],
  ['Fam', 'Forge ambient', 'forge-ambient', 'forge_ambient'],
  ['Lvg', 'Living background system', 'living-background', 'living_background_system'],
];

function addPage(hash, name, slug, module) {
  entries.push(
    base({
      hash,
      name,
      slug,
      type: 'page',
      family: 'showcase-pages',
      status: 'active',
      source_paths: [`generator/pages/${module}.py`],
      source_symbols: [module],
      root_selector: 'main#main',
      contract: `docs/design/catalog/pages/${hash}-${slug}.md`,
      contract_status: 'own',
      showcase_url: `https://ks.forgesdlc.com/showcase/${slug}.html`,
      screenshot_url: `https://ks.forgesdlc.com/showcase/screenshots/${hash}.png`,
      screenshot_status: 'planned',
      emit_marker_in_showcase: true,
    }),
  );
}

for (const [h, n, s, m] of pageDefs) addPage(h, n, s, m);

function addPreview(hash, name, slug, file) {
  entries.push(
    base({
      hash,
      name,
      slug,
      type: 'layout-preview',
      family: 'layout-previews',
      status: 'active',
      source_paths: ['generator/layout_previews.py'],
      source_symbols: ['write_layout_preview_pages'],
      root_selector: 'main#main',
      contract: `docs/design/catalog/pages/${hash}-${slug}.md`,
      contract_status: 'own',
      showcase_url: `https://ks.forgesdlc.com/showcase/${file}`,
      screenshot_url: `https://ks.forgesdlc.com/showcase/screenshots/${hash}.png`,
      screenshot_status: 'planned',
      emit_marker_in_showcase: true,
    }),
  );
}

addPreview('Vsp', 'Preview split layout', 'preview-split', 'preview-split.html');
addPreview('Vhb', 'Preview handbook layout', 'preview-handbook', 'preview-handbook.html');
addPreview('Vcp', 'Preview chapter layout', 'preview-chapter', 'preview-chapter.html');
addPreview('Vpd', 'Preview product layout', 'preview-product', 'preview-product.html');
addPreview('Vmk', 'Preview marketing layout', 'preview-marketing', 'preview-marketing.html');
addPreview('Vlg', 'Preview listing layout', 'preview-listing', 'preview-listing.html');
addPreview('Vln', 'Preview landing layout', 'preview-landing', 'preview-landing.html');

const reactHashes = [
  ['Tdc', 'TileDropdownControl', 'TileDropdownControl.tsx'],
  ['Fkg', 'ForgeKeyValueGrid', 'ForgeKeyValueGrid.tsx'],
  ['Fsb', 'ForgeStatusBanner', 'ForgeStatusBanner.tsx'],
  ['Fvw', 'ForgeReviewPanel', 'ForgeReviewPanel.tsx'],
  ['Fdg', 'ForgeDiagnosticPanel', 'ForgeDiagnosticPanel.tsx'],
  ['Fwb', 'ForgeWorkflowStageBar', 'ForgeWorkflowStageBar.tsx'],
  ['Fen', 'ForgeEventTimeline', 'ForgeEventTimeline.tsx'],
  ['Frh', 'ForgeRunHeader', 'ForgeRunHeader.tsx'],
  ['Fda', 'ForgeDecisionActionBar', 'ForgeDecisionActionBar.tsx'],
  ['Wlc', 'WorkspaceLensControl', 'WorkspaceLensControl.tsx'],
];

const reactChildHashes = reactHashes.map((r) => r[0]);

for (const [hash, comp, file] of reactHashes) {
  entries.push(
    base({
      hash,
      name: comp,
      slug: comp.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
      type: 'react-primitive',
      family: 'react-primitives',
      status: 'active',
      source_paths: [`react/${file}`],
      source_symbols: [comp],
      root_selector: '[data-ks-react-root]',
      contract: 'docs/design/catalog/primitives/FAM-react-primitives.md',
      contract_status: 'family-covered',
      showcase_url: 'https://ks.forgesdlc.com/showcase/forge-react-primitives.html',
      screenshot_url: `https://ks.forgesdlc.com/showcase/screenshots/${hash}.png`,
      screenshot_status: 'planned',
      emit_marker_in_showcase: true,
      parent_hash: null,
      child_hashes: [],
    }),
  );
}

entries.push(
  base({
    hash: 'Rpf',
    name: 'React primitives family',
    slug: 'fam-react-primitives',
    type: 'primitive-family',
    family: 'react-primitives',
    status: 'active',
    source_paths: reactHashes.map((r) => `react/${r[2]}`),
    source_symbols: reactHashes.map((r) => r[1]),
    root_selector: null,
    contract: 'docs/design/catalog/primitives/FAM-react-primitives.md',
    contract_status: 'own',
    showcase_url: 'https://ks.forgesdlc.com/showcase/forge-react-primitives.html',
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
    child_hashes: reactChildHashes,
    notes: 'Family contract lists covered react primitive hashes.',
  }),
);

entries.push(
  base({
    hash: 'Ksc',
    name: 'Kitchen Sink stylesheets',
    slug: 'fam-styles',
    type: 'style-family',
    family: 'css-styles',
    status: 'active',
    source_paths: cssPaths,
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/styles/Ksc-fam-styles.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
  }),
);

entries.push(
  base({
    hash: 'Ksj',
    name: 'Kitchen Sink interaction scripts',
    slug: 'fam-scripts',
    type: 'script-family',
    family: 'js-modules',
    status: 'active',
    source_paths: jsPaths,
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/interactions/Ksj-fam-scripts.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
  }),
);

entries.push(
  base({
    hash: 'Ksv',
    name: 'Kitchen Sink SVG diagram & schematic assets',
    slug: 'fam-svg',
    type: 'diagram-family',
    family: 'svg-assets',
    status: 'active',
    source_paths: svgPaths,
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/diagrams/Ksv-fam-svg.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
  }),
);

entries.push(
  base({
    hash: 'Kpr',
    name: 'Python HTML renderer helpers',
    slug: 'fam-python-renderers',
    type: 'python-renderer-family',
    family: 'python-components',
    status: 'active',
    source_paths: [
      'components/components.py',
      'components/presentation.py',
      'components/enterprise_marketing.py',
      'components/marketing_sections.py',
      'components/nested_roadmap.py',
      'components/diagram_catalog.py',
      'components/transforms.py',
      'components/living_background.py',
      'components/roadmap_date_editor.py',
      'components/diagram_modal_fragment.py',
    ],
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/components/Kpr-fam-python-renderers.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
    notes: 'Covers public render_* and related helpers inventoried under components/*.py',
  }),
);

entries.push(
  base({
    hash: 'Kdt',
    name: 'Design terminology docs',
    slug: 'fam-design-docs',
    type: 'docs-family',
    family: 'docs-terminology',
    status: 'active',
    source_paths: [
      'docs/design/forge-enterprise-ui.md',
      'docs/design/forge-enterprise-ai-website-standard-v2-addendum.md',
      'docs/design/forge-enterprise-ai-website-standard.md',
      'docs/design/lenses-studio-shell.md',
      'docs/design/wizard-flow-studio.md',
      'docs/PAGE-LAYOUT-TAXONOMY.md',
    ],
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/page-types/Kdt-fam-design-terminology.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
  }),
);

entries.push(
  base({
    hash: 'Kra',
    name: 'Showcase React app sources',
    slug: 'fam-showcase-react-app',
    type: 'showcase-app-family',
    family: 'showcase-react-app',
    status: 'active',
    source_paths: ['showcase-react-app/src/main.tsx'],
    source_symbols: [],
    root_selector: null,
    contract: 'docs/design/catalog/pages/Kra-fam-showcase-react-app.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'planned',
    emit_marker_in_showcase: false,
    notes: 'Expand source_paths when inventory lists additional src files.',
  }),
);

entries.push(
  base({
    hash: 'Msm',
    name: 'Museum studio desktop shell',
    slug: 'museum-studio',
    type: 'desktop-interface',
    family: 'museum',
    status: 'active',
    source_paths: ['museum/studio/index.html'],
    source_symbols: [],
    root_selector: 'body',
    contract: 'docs/design/catalog/desktop-interfaces/Msm-museum-studio.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: 'https://ks.forgesdlc.com/showcase/screenshots/Msm.png',
    screenshot_status: 'planned',
    emit_marker_in_showcase: false,
    notes: 'Static bundled studio;-marker optional—emit on body when paths are stable.',
  }),
);

entries.push(
  base({
    hash: 'Fad',
    name: 'Forge-autodoc handbook consumer',
    slug: 'forge-autodoc',
    type: 'library-consumer',
    family: 'forge-autodoc',
    status: 'active',
    source_paths: ['forge-autodoc/forge_autodoc/page.py', 'forge-autodoc/forge_autodoc/simple_build.py'],
    source_symbols: [],
    root_selector: 'main',
    contract: 'docs/design/catalog/page-types/Fad-forge-autodoc.md',
    contract_status: 'own',
    showcase_url: null,
    screenshot_url: null,
    screenshot_status: 'not-applicable',
    emit_marker_in_showcase: false,
    notes: 'Uses handbook_page and other layouts when building handbooks.',
  }),
);
