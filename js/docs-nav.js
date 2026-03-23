/**
 * Shared handbook sidebar + mobile offcanvas navigation.
 *
 * Edit DOC_NAV below: each entry is either
 *   - a leaf chapter: { href, label }
 *   - a chapter with sub-pages: { hubHref, label, groupId, children: [ … ] }
 *
 * Group `children` may mix:
 *   - leaves: { href, label }
 *   - nested hubs: { hubHref, label, groupId, children: [{ href, label }, …] } (e.g. Scrum → Foundation, Roles, …)
 *
 * Top-level groupId and each nested groupId must be unique (ASCII, no spaces) — used in collapse target ids.
 */
(function () {
  'use strict';

  /**
   * Order = sidebar order. Only groups with a non-empty children array render as collapsible;
   * use a single { href, label } until sub-chapter HTML exists.
   */
  var DOC_NAV = [
    { href: 'index.html', label: 'Handbook home' },
    { href: 'overview.html', label: 'Overview & roles' },
    { href: 'phases.html', label: 'Phases A–F' },
    { href: 'dod.html', label: 'Definition of done' },
    { href: 'change.html', label: 'Change control' },
    { href: 'review.html', label: 'Review cadence' },
    { href: 'cicd.html', label: 'CI/CD & quality gates' },
    { href: 'documentation.html', label: 'Documentation layout' },
    {
      hubHref: 'spec-driven.html',
      label: 'Spec-driven development',
      groupId: 'SpecDriven',
      ariaLabel: 'Spec-driven sub-chapters',
      children: [
        { href: 'spec-driven.html', label: 'Overview' },
        { href: 'spec-driven-sdd-schema.html', label: 'SDD schema & templates' },
        { href: 'spec-driven-sdd-ceremonies.html', label: 'Ceremonies (SDD I/O)' },
        { href: 'spec-driven-sdd-process.html', label: 'Process (SDD I/O)' },
      ],
    },
    { href: 'agents.html', label: 'Agents & automation' },
    {
      hubHref: 'methodologies.html',
      label: 'Methodologies & tracking',
      groupId: 'Methodologies',
      ariaLabel: 'Methodology sub-chapters',
      children: [
        { href: 'methodologies-roles.html', label: 'Roles & archetypes' },
        { href: 'methodologies-ceremonies.html', label: 'Ceremonies' },
        {
          hubHref: 'methodologies-scrum.html',
          label: 'Scrum',
          groupId: 'MethodologiesScrum',
          children: [
            { href: 'methodologies-scrum-foundation.html', label: 'Foundation' },
            { href: 'methodologies-scrum-roles.html', label: 'Roles' },
            { href: 'methodologies-scrum-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-scrum-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-kanban.html',
          label: 'Kanban',
          groupId: 'MethodologiesKanban',
          children: [
            { href: 'methodologies-kanban-foundation.html', label: 'Foundation' },
            { href: 'methodologies-kanban-roles.html', label: 'Roles' },
            { href: 'methodologies-kanban-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-kanban-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-phased.html',
          label: 'Phased delivery',
          groupId: 'MethodologiesPhased',
          children: [
            { href: 'methodologies-phased-foundation.html', label: 'Foundation' },
            { href: 'methodologies-phased-roles.html', label: 'Roles' },
            { href: 'methodologies-phased-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-phased-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-xp.html',
          label: 'XP',
          groupId: 'MethodologiesXp',
          children: [
            { href: 'methodologies-xp-foundation.html', label: 'Foundation' },
            { href: 'methodologies-xp-roles.html', label: 'Roles' },
            { href: 'methodologies-xp-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-xp-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-lean.html',
          label: 'Lean',
          groupId: 'MethodologiesLean',
          children: [
            { href: 'methodologies-lean-foundation.html', label: 'Foundation' },
            { href: 'methodologies-lean-roles.html', label: 'Roles' },
            { href: 'methodologies-lean-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-lean-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-spiral.html',
          label: 'Spiral',
          groupId: 'MethodologiesSpiral',
          children: [
            { href: 'methodologies-spiral-foundation.html', label: 'Foundation' },
            { href: 'methodologies-spiral-roles.html', label: 'Roles' },
            { href: 'methodologies-spiral-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-spiral-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-v-model.html',
          label: 'V-Model',
          groupId: 'MethodologiesVModel',
          children: [
            { href: 'methodologies-v-model-foundation.html', label: 'Foundation' },
            { href: 'methodologies-v-model-roles.html', label: 'Roles' },
            { href: 'methodologies-v-model-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-v-model-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-devops.html',
          label: 'DevOps',
          groupId: 'MethodologiesDevops',
          children: [
            { href: 'methodologies-devops-foundation.html', label: 'Foundation' },
            { href: 'methodologies-devops-roles.html', label: 'Roles' },
            { href: 'methodologies-devops-ceremonies.html', label: 'Ceremonies' },
            { href: 'methodologies-devops-process.html', label: 'Process' },
          ],
        },
        {
          hubHref: 'methodologies-forge.html',
          label: 'Forge',
          groupId: 'MethodologiesForge',
          children: [
            { href: 'methodologies-forge-foundation-connection.html', label: 'Foundation' },
            { href: 'methodologies-forge-roles.html', label: 'Roles' },
            { href: 'methodologies-forge-ceremonies-prescriptive.html', label: 'Ceremonies' },
            { href: 'methodologies-forge-process-and-flows.html', label: 'Process & flows' },
            { href: 'methodologies-forge-forge-sdlc-pdlc-bridge.html', label: 'SDLC/PDLC bridge' },
            { href: 'methodologies-forge-bellows.html', label: 'Bellows' },
            { href: 'methodologies-forge-daily.html', label: 'Daily' },
            { href: 'methodologies-forge-planning.html', label: 'Planning' },
            { href: 'methodologies-forge-setup.html', label: 'Setup' },
            { href: 'methodologies-forge-product-manager.html', label: 'Product manager' },
          ],
        },
        { href: 'methodologies-fdd.html', label: 'FDD' },
        { href: 'methodologies-crystal.html', label: 'Crystal' },
        { href: 'methodologies-dsdm.html', label: 'DSDM' },
        { href: 'methodologies-shape-up.html', label: 'Shape Up' },
        { href: 'methodologies-da.html', label: 'Disciplined Agile' },
        { href: 'methodologies-bdd.html', label: 'BDD' },
        { href: 'methodologies-rad.html', label: 'RAD' },
        { href: 'methodologies-agile.html', label: 'Agile (umbrella)' },
        { href: 'methodologies-agentic.html', label: 'Agentic SDLC' },
      ],
    },
    { href: 'governance.html', label: 'Governance' },
  ];

  function currentPage() {
    var path = window.location.pathname || '';
    var seg = path.split('/').filter(Boolean).pop() || 'index.html';
    if (seg.indexOf('.') === -1) seg = 'index.html';
    try {
      seg = decodeURIComponent(seg);
    } catch (e) {}
    return seg;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function navLinkClass(active) {
    return 'doc-sidebar-link' + (active ? ' active' : '');
  }

  function subLinkClass(active) {
    return 'doc-sidebar-sublink' + (active ? ' active' : '');
  }

  /** True if `page` matches this leaf or any descendant href (one level of nesting). */
  function childMatchesPage(page, child) {
    if (child.href && child.href === page) return true;
    if (child.hubHref && child.hubHref === page) return true;
    if (child.children && child.children.length) {
      var j;
      for (j = 0; j < child.children.length; j++) {
        if (child.children[j].href === page) return true;
      }
    }
    return false;
  }

  function groupIsOpen(page, item) {
    if (page === item.hubHref) return true;
    var i;
    for (i = 0; i < item.children.length; i++) {
      if (childMatchesPage(page, item.children[i])) return true;
    }
    return false;
  }

  function nestedGroupIsOpen(page, sub) {
    if (page === sub.hubHref) return true;
    var j;
    for (j = 0; j < sub.children.length; j++) {
      if (sub.children[j].href === page) return true;
    }
    return false;
  }

  function renderLeaf(page, item) {
    var active = item.href === page;
    return (
      '<a class="' +
      navLinkClass(active) +
      '" href="' +
      escapeAttr(item.href) +
      '"' +
      (active ? ' aria-current="page"' : '') +
      '>' +
      escapeHtml(item.label) +
      '</a>\n'
    );
  }

  function renderGroup(page, item, collapseId, navSuffix) {
    var open = groupIsOpen(page, item);
    var hubActive = page === item.hubHref;
    var html = '';
    var i;

    var aria = item.ariaLabel || item.label + ' sub-chapters';

    html += '<div class="doc-sidebar-group">';
    html += '<div class="doc-sidebar-row">';
    html +=
      '<button type="button" class="doc-sidebar-toggle' +
      (open ? '' : ' collapsed') +
      '" data-bs-toggle="collapse" data-bs-target="#' +
      collapseId +
      '" aria-expanded="' +
      open +
      '" aria-controls="' +
      collapseId +
      '" aria-label="Toggle ' + escapeAttr(item.label) + '">';
    html +=
      '<svg class="doc-sidebar-chevron" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';
    html += '</button>';
    html +=
      '<a href="' +
      escapeAttr(item.hubHref) +
      '" class="doc-sidebar-heading' +
      (hubActive ? ' active' : '') +
      '"' +
      (hubActive ? ' aria-current="page"' : '') +
      '>' +
      escapeHtml(item.label) +
      '</a>';
    html += '</div>';
    html +=
      '<div id="' +
      collapseId +
      '" class="collapse' +
      (open ? ' show' : '') +
      '" role="group" aria-label="' +
      escapeAttr(aria) +
      '">';
    html += '<div class="doc-sidebar-children">';

    for (i = 0; i < item.children.length; i++) {
      html += renderMethodologyChild(page, item.children[i], navSuffix);
    }
    html += '</div></div></div>\n';
    return html;
  }

  function renderMethodologyChild(page, c, navSuffix) {
    if (c.hubHref && c.children && c.children.length && c.groupId) {
      return renderNestedMethodologyGroup(page, c, navSuffix);
    }
    if (c.href) {
      var ca = c.href === page;
      return (
        '<a class="' +
        subLinkClass(ca) +
        '" href="' +
        escapeAttr(c.href) +
        '"' +
        (ca ? ' aria-current="page"' : '') +
        '>' +
        escapeHtml(c.label) +
        '</a>\n'
      );
    }
    return '';
  }

  function renderNestedMethodologyGroup(page, sub, navSuffix) {
    var collapseId = 'docNavSub-' + sub.groupId + '-' + navSuffix;
    var open = nestedGroupIsOpen(page, sub);
    var hubActive = page === sub.hubHref;
    var aria = escapeAttr(sub.label + ' sub-chapters');
    var html = '';
    var j;

    html += '<div class="doc-sidebar-nested">';
    html += '<div class="doc-sidebar-row">';
    html +=
      '<button type="button" class="doc-sidebar-toggle' +
      (open ? '' : ' collapsed') +
      '" data-bs-toggle="collapse" data-bs-target="#' +
      collapseId +
      '" aria-expanded="' +
      open +
      '" aria-controls="' +
      collapseId +
      '" aria-label="Toggle ' + escapeAttr(sub.label) + '">';
    html +=
      '<svg class="doc-sidebar-chevron" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';
    html += '</button>';
    html +=
      '<a href="' +
      escapeAttr(sub.hubHref) +
      '" class="doc-sidebar-heading' +
      (hubActive ? ' active' : '') +
      '"' +
      (hubActive ? ' aria-current="page"' : '') +
      '>' +
      escapeHtml(sub.label) +
      '</a>';
    html += '</div>';
    html +=
      '<div id="' +
      collapseId +
      '" class="collapse' +
      (open ? ' show' : '') +
      '" role="group" aria-label="' +
      aria +
      '">';
    html += '<div class="doc-sidebar-children">';
    for (j = 0; j < sub.children.length; j++) {
      var cc = sub.children[j];
      var cca = cc.href === page;
      html +=
        '<a class="' +
        subLinkClass(cca) +
        '" href="' +
        escapeAttr(cc.href) +
        '"' +
        (cca ? ' aria-current="page"' : '') +
        '>' +
        escapeHtml(cc.label) +
        '</a>\n';
    }
    html += '</div></div></div>\n';
    return html;
  }

  function renderNav(page, navSuffix) {
    var html = '';
    var i;
    var entry;

    html += '<p class="nav-section-label">Chapters</p>';
    html += '<div class="nav-rail">';

    for (i = 0; i < DOC_NAV.length; i++) {
      entry = DOC_NAV[i];
      if (entry.children && entry.children.length > 0 && entry.hubHref && entry.groupId) {
        html += renderGroup(
          page,
          entry,
          'docNavGroup-' + entry.groupId + '-' + navSuffix,
          navSuffix
        );
      } else if (entry.href) {
        html += renderLeaf(page, entry);
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * Match scroll-margin, scroll spy, and mini-TOC sticky `top` to the real height of the
   * sticky chapter header (breadcrumb + title + subtitle). Fixed rem guesses hide the TOC
   * under the header (z-index 20) when the stack wraps or fonts load late.
   */
  function syncStickyChapterScrollOffset() {
    var header = document.querySelector(
      '.doc-main > .doc-content > header:first-of-type, .doc-main > .doc-content-wide > header:first-of-type'
    );
    if (!header) return;

    var gapPx = 6;

    function apply() {
      var h = Math.ceil(header.getBoundingClientRect().height);
      var px = Math.max(80, h + gapPx);
      document.documentElement.style.setProperty('--doc-toc-scroll-offset', px + 'px');
    }

    apply();

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        apply();
      });
      ro.observe(header);
    }
    window.addEventListener('resize', apply, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        apply();
      });
    }
  }

  function init() {
    syncStickyChapterScrollOffset();

    var page = currentPage();
    var side = document.getElementById('doc-sidebar-nav');
    var off = document.getElementById('doc-offcanvas-nav');
    if (side) side.innerHTML = renderNav(page, 'sidebar');
    if (off) off.innerHTML = renderNav(page, 'offcanvas');

    document.querySelectorAll('.doc-sidebar-toggle[data-bs-toggle="collapse"]').forEach(function (btn) {
      var target = btn.getAttribute('data-bs-target');
      if (!target) return;
      var el = document.querySelector(target);
      if (!el) return;
      el.addEventListener('shown.bs.collapse', function () {
        btn.classList.remove('collapsed');
        btn.setAttribute('aria-expanded', 'true');
      });
      el.addEventListener('hidden.bs.collapse', function () {
        btn.classList.add('collapsed');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
