/**
 * Deterministic DOM collectors for generic marketing/docs/product sites.
 * Used by DET.ROUTE.* (fingerprints), DET.RESPONSIVE.*, DET.FORM.*, etc.
 */

const OVERFLOW_VIEWPORTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 900 },
];

const PLACEHOLDER_META = new Set([
  '',
  'description',
  'page description',
  'lorem ipsum',
  'todo',
  'tbd',
  'coming soon',
]);

const PLACEHOLDER_MAIL = /^mailto:(example|test|placeholder|your@|email@)/i;
const PLACEHOLDER_TEL = /^tel:(000|123|555|\+0|example)/i;

/**
 * @param {import('playwright').Page} page
 */
export async function collectGenericWebsitePageReport(page) {
  const overflowByViewport = {};
  for (const vp of OVERFLOW_VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    overflowByViewport[vp.label] = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
      const clientW = doc.clientWidth;
      const tolerance = 4;
      const overflowPx = Math.max(0, scrollW - clientW - tolerance);
      const main =
        document.querySelector('main#main')
        || document.querySelector('[role="main"]')
        || document.querySelector('main');
      let clippedPrimary = false;
      if (main) {
        const ctas = [...main.querySelectorAll('button, a[href], [role="button"]')].slice(0, 12);
        for (const el of ctas) {
          const r = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          if (r.width < 8 || r.height < 8) continue;
          if (r.right > clientW + 2 || r.left < -2) {
            clippedPrimary = true;
            break;
          }
        }
      }
      return { overflowPx, clientW, scrollW, clippedPrimary };
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });

  const domReport = await page.evaluate(
    ({ placeholderMetaList, placeholderMailRe, placeholderTelRe }) => {
      const mailRe = new RegExp(placeholderMailRe, 'i');
      const telRe = new RegExp(placeholderTelRe, 'i');
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2 && Number(style.opacity || 1) > 0.05;
      };

      const main =
        document.querySelector('main#main')
        || document.querySelector('[role="main"]')
        || document.querySelector('main')
        || document.body;

      const title = norm(document.title);
      const metaDescription = norm(document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
      const canonical = norm(document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '');
      const h1El = main ? [...main.querySelectorAll('h1')].find(visible) : null;
      const h1 = h1El ? norm(h1El.textContent) : '';
      const wordCount = norm(main?.innerText || '').split(/\s+/).filter(Boolean).length;

      const internalLinks = [];
      for (const a of document.querySelectorAll('a[href]')) {
        if (!visible(a)) continue;
        const href = a.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
        try {
          const u = new URL(href, window.location.href);
          if (u.origin !== window.location.origin) continue;
          internalLinks.push({ href: u.href, text: norm(a.textContent).slice(0, 80) });
        } catch {
          /* skip */
        }
      }

      /** @type {Array<Record<string, unknown>>} */
      const formViolations = [];
      const forms = [...document.querySelectorAll('form')].filter(visible);
      for (const form of forms.slice(0, 6)) {
        const fields = [
          ...form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea'),
        ].filter(visible);
        if (!fields.length) continue;

        let missingLabel = 0;
        let missingRequired = 0;
        let missingInlineError = 0;
        for (const field of fields) {
          const id = field.id;
          const labelled =
            (id && [...form.querySelectorAll('label[for]')].some((l) => l.getAttribute('for') === id))
            || field.closest('label')
            || norm(field.getAttribute('aria-label'))
            || norm(field.getAttribute('aria-labelledby'));
          if (!labelled) missingLabel += 1;

          if (field.required || field.getAttribute('aria-required') === 'true') {
            const hasRequiredCue =
              field.closest('label')?.textContent?.includes('*')
              || norm(field.getAttribute('aria-describedby'))
              || field.hasAttribute('required');
            if (!hasRequiredCue) missingRequired += 1;
          }

          if (field.getAttribute('aria-invalid') === 'true') {
            const errId = field.getAttribute('aria-describedby');
            let hasErrorText = false;
            if (errId) {
              for (const part of errId.split(/\s+/)) {
                const ref = document.getElementById(part);
                if (ref && norm(ref.textContent).length > 2) hasErrorText = true;
              }
            }
            if (!hasErrorText) missingInlineError += 1;
          }
        }

        const multiField = fields.length >= 2;
        const summary = form.querySelector('[role="alert"], .error-summary, [data-error-summary], .alert-danger');
        if (missingLabel) {
          formViolations.push({ issue: 'missing-label', fieldCount: fields.length, missingLabel });
        }
        if (missingRequired) {
          formViolations.push({ issue: 'missing-required-marker', fieldCount: fields.length });
        }
        if (missingInlineError) {
          formViolations.push({ issue: 'missing-inline-error', fieldCount: fields.length });
        }
        if (multiField && !summary) {
          formViolations.push({ issue: 'missing-error-summary', fieldCount: fields.length });
        }
      }

      const hasSearchOrFilter =
        Boolean(document.querySelector('input[type="search"], [role="search"] input, [data-search], .search-input'))
        || Boolean(document.querySelector('[data-filter], .filter-chip, .active-filters, [aria-label*="filter" i]'));

      /** @type {Array<Record<string, unknown>>} */
      const searchViolations = [];
      if (hasSearchOrFilter) {
        const bodyText = norm(document.body.innerText || '').toLowerCase();
        const hasResultCount = /\b\d+\s+(result|match|item|page)s?\b/i.test(bodyText)
          || Boolean(document.querySelector('[data-result-count], .result-count, output[for]'));
        const hasActiveFilters = Boolean(
          document.querySelector('.active-filters, [data-active-filter], .filter-chip.is-active, [aria-pressed="true"][data-filter]'),
        );
        const hasClearAll = Boolean(
          document.querySelector('[data-clear-filters], .clear-filters, a[href*="clear"], button[class*="clear"]'),
        );
        const hasEmptyRecovery = Boolean(
          document.querySelector('[data-empty-results], .empty-results, .no-results'),
        ) || /no results|nothing found|try (different|another|fewer)/i.test(bodyText);

        if (!hasResultCount) searchViolations.push({ issue: 'missing-result-count' });
        if (!hasActiveFilters && document.querySelector('[data-filter], select[name*="filter"]')) {
          searchViolations.push({ issue: 'missing-active-filter-state' });
        }
        if (!hasClearAll && document.querySelector('[data-filter], .filter-chip')) {
          searchViolations.push({ issue: 'missing-clear-all' });
        }
        if (!hasEmptyRecovery) searchViolations.push({ issue: 'missing-empty-recovery' });
      }

      /** @type {Array<Record<string, unknown>>} */
      const tableViolations = [];
      for (const table of document.querySelectorAll('table')) {
        if (!visible(table) || table.getAttribute('role') === 'presentation') continue;
        const rows = table.querySelectorAll('tbody tr, tr').length;
        if (rows < 6) continue;
        const headers = table.querySelectorAll('th').length;
        if (!headers) tableViolations.push({ issue: 'missing-headers', rows });
        const parent = table.parentElement;
        const contained =
          parent
          && (getComputedStyle(parent).overflowX === 'auto'
            || getComputedStyle(parent).overflowX === 'scroll'
            || parent.classList.contains('table-responsive')
            || parent.hasAttribute('data-table-scroll'));
        if (!contained && table.scrollWidth > table.clientWidth + 8) {
          tableViolations.push({ issue: 'missing-horizontal-containment', rows });
        }
        const sortButtons = [...table.querySelectorAll('button, [role="button"]')].filter((b) =>
          /sort/i.test(norm(b.getAttribute('aria-label') || b.textContent)),
        );
        for (const btn of sortButtons) {
          if (!norm(btn.getAttribute('aria-label'))) {
            tableViolations.push({ issue: 'sort-missing-label', rows });
            break;
          }
        }
        const rowActions = table.querySelectorAll('button, a[href]').length;
        if (rowActions && !table.querySelector('th:last-child, [data-row-actions]')) {
          const unnamed = [...table.querySelectorAll('tbody button, tbody a')].filter(
            (el) => !norm(el.getAttribute('aria-label') || el.textContent),
          );
          if (unnamed.length) tableViolations.push({ issue: 'row-action-unlabeled', rows });
        }
        if (rows > 20) {
          const hasPagination = Boolean(
            document.querySelector('[aria-label*="pagination" i], nav.pagination, .pagination, [data-pagination]'),
          );
          if (!hasPagination) tableViolations.push({ issue: 'missing-pagination', rows });
        }
      }

      const loadingVisible = [...document.querySelectorAll(
        '[aria-busy="true"], .loading, .skeleton, [data-loading], [role="progressbar"]',
      )].filter(visible);
      const emptyVisible = [...document.querySelectorAll(
        '[data-empty], .empty-state, .no-data, [data-state="empty"]',
      )].filter(visible);
      const errorVisible = [...document.querySelectorAll(
        '[role="alert"], .error-state, [data-state="error"], .alert-danger',
      )].filter(visible);
      const successVisible = [...document.querySelectorAll(
        '[data-state="success"], .success-state, [role="status"].success',
      )].filter(visible);

      /** @type {Array<Record<string, unknown>>} */
      const loadingViolations = [];
      const activeStates = [
        loadingVisible.length ? 'loading' : null,
        emptyVisible.length ? 'empty' : null,
        errorVisible.length ? 'error' : null,
        successVisible.length ? 'success' : null,
      ].filter(Boolean);
      if (activeStates.length > 1) {
        loadingViolations.push({ issue: 'overlapping-states', states: activeStates.join('+') });
      }
      for (const el of emptyVisible.slice(0, 3)) {
        const text = norm(el.textContent);
        if (text.length < 12 || !/(try|next|create|add|refresh|back|contact)/i.test(text)) {
          loadingViolations.push({ issue: 'empty-missing-recovery', hint: text.slice(0, 60) });
        }
      }
      for (const el of errorVisible.slice(0, 3)) {
        const text = norm(el.textContent);
        if (text.length < 10 || !/(retry|again|fix|contact|support|back)/i.test(text)) {
          loadingViolations.push({ issue: 'error-missing-recovery', hint: text.slice(0, 60) });
        }
      }

      /** @type {Array<Record<string, unknown>>} */
      const statusViolations = [];
      const hasSubmit = forms.some((f) => f.querySelector('button[type="submit"], input[type="submit"]'));
      const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
      if (hasSubmit && !liveRegions.length) {
        statusViolations.push({ issue: 'submit-without-live-region' });
      }
      const asyncActions = document.querySelectorAll('[data-async], [data-action], form[method="post"]');
      if (asyncActions.length && liveRegions.length === 0) {
        statusViolations.push({ issue: 'actions-without-feedback-region' });
      }

      const ogTitle = norm(document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '');
      const ogDescription = norm(
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      );
      const twitterCard = norm(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '');
      const favicon = Boolean(
        document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'),
      );

      /** @type {Array<Record<string, unknown>>} */
      const socialViolations = [];
      const metaLower = metaDescription.toLowerCase();
      if (!metaDescription || placeholderMetaList.includes(metaLower)) {
        socialViolations.push({ issue: 'placeholder-meta-description' });
      }
      if (!ogTitle && !ogDescription) socialViolations.push({ issue: 'missing-open-graph' });
      if (!twitterCard && !ogDescription) socialViolations.push({ issue: 'missing-twitter-preview' });
      if (!favicon) socialViolations.push({ issue: 'missing-favicon' });
      if (!canonical && wordCount > 80) socialViolations.push({ issue: 'missing-canonical' });

      /** @type {Array<Record<string, unknown>>} */
      const externalViolations = [];
      for (const a of document.querySelectorAll('a[target="_blank"]')) {
        if (!visible(a)) continue;
        const rel = norm(a.getAttribute('rel')).toLowerCase();
        if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
          externalViolations.push({
            issue: 'blank-without-noopener',
            href: (a.getAttribute('href') || '').slice(0, 120),
          });
        }
      }
      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href') || '';
        if (mailRe.test(href) || telRe.test(href)) {
          externalViolations.push({ issue: 'placeholder-contact-link', href: href.slice(0, 80) });
        }
        if (/\bdownload\b/i.test(href) || a.hasAttribute('download')) {
          const label = norm(a.getAttribute('aria-label') || a.textContent);
          if (label.length < 3) externalViolations.push({ issue: 'unlabeled-download', href: href.slice(0, 80) });
        }
      }

      /** @type {Array<Record<string, unknown>>} */
      const mediaViolations = [];
      const mediaRoots = main
        ? [...main.querySelectorAll('.hero, [class*="hero"], .card, [class*="card"]')].slice(0, 8)
        : [];
      const mediaHosts = mediaRoots.length ? mediaRoots : [main];
      for (const host of mediaHosts) {
        if (!host) continue;
        for (const el of host.querySelectorAll('img, video, canvas')) {
          if (!visible(el)) continue;
          const tag = el.tagName.toLowerCase();
          const w = Number(el.getAttribute('width') || 0);
          const h = Number(el.getAttribute('height') || 0);
          const style = window.getComputedStyle(el);
          const hasAspect =
            w > 0 && h > 0
            || Boolean(style.aspectRatio && style.aspectRatio !== 'auto')
            || el.hasAttribute('data-aspect-ratio');
          if (!hasAspect) {
            mediaViolations.push({
              issue: 'missing-aspect-hint',
              tag,
              hint: el.className ? String(el.className).slice(0, 40) : tag,
            });
          }
          const rect = el.getBoundingClientRect();
          if (rect.width > document.documentElement.clientWidth + 8) {
            mediaViolations.push({ issue: 'media-overflow', tag });
          }
        }
      }

      const navToggle = document.querySelector(
        '[aria-controls][aria-expanded], .navbar-toggler, [data-bs-toggle="offcanvas"], button[class*="menu"], button[class*="nav-toggle"]',
      );

      return {
        routeFingerprint: {
          url: window.location.href,
          title,
          h1,
          metaDescription,
          canonical,
          wordCount,
        },
        internalLinks: internalLinks.slice(0, 120),
        overflowByViewport,
        formViolations: formViolations.slice(0, 8),
        searchViolations: searchViolations.slice(0, 6),
        tableViolations: tableViolations.slice(0, 8),
        loadingViolations: loadingViolations.slice(0, 8),
        statusViolations: statusViolations.slice(0, 4),
        socialViolations: socialViolations.slice(0, 6),
        externalViolations: externalViolations.slice(0, 10),
        mediaViolations: mediaViolations.slice(0, 10),
        mobileNavStatic: {
          hasToggle: Boolean(navToggle && visible(navToggle)),
          toggleExpanded: navToggle?.getAttribute('aria-expanded') === 'true',
          hasNavPanel: Boolean(
            document.querySelector('[role="dialog"][aria-modal="true"], .offcanvas.show, nav.offcanvas, .mobile-nav'),
          ),
        },
      };
    },
    {
      placeholderMetaList: [...PLACEHOLDER_META],
      placeholderMailRe: PLACEHOLDER_MAIL.source,
      placeholderTelRe: PLACEHOLDER_TEL.source,
    },
  );

  const mobileNavReport = await collectMobileNavInteractionReport(page);

  return {
    ...domReport,
    mobileNavReport,
  };
}

/**
 * Exercise mobile nav toggle at narrow viewport (open/close, focus trap hints).
 * @param {import('playwright').Page} page
 */
export async function collectMobileNavInteractionReport(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  await page.waitForFunction(
    () => typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse,
    { timeout: 8000 },
  ).catch(() => {});

  const toggle = page.locator(
    '[aria-controls][aria-expanded], .navbar-toggler, [data-bs-toggle="offcanvas"], button[class*="menu"], button[class*="nav-toggle"]',
  ).first();

  const toggleCount = await toggle.count();
  if (!toggleCount) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    return { violations: [], skipped: true, reason: 'no-toggle' };
  }

  try {
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click({ timeout: 5000, force: true });
    await page.waitForTimeout(350);
    const openState = await page.evaluate(() => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const panel =
        document.querySelector('[role="dialog"][aria-modal="true"]')
        || document.querySelector('.offcanvas.show, .offcanvas.showing, nav.offcanvas')
        || document.querySelector('.navbar-collapse.show, #capMainNav.show, .collapse.show')
        || document.querySelector('[class*="mobile-nav"][class*="open"], [data-nav-open="true"]');
      const bodyLocked = document.body.style.overflow === 'hidden'
        || document.documentElement.classList.contains('modal-open')
        || document.body.classList.contains('offcanvas-open')
        || document.body.classList.contains('cap-nav-open');
      const closeBtn = panel
        ? panel.querySelector('[aria-label*="close" i], button.close, [data-bs-dismiss], .btn-close, .cap-header__close')
        : document.querySelector('.cap-header__close, [aria-label*="close" i].cap-header__close');
      const closeLabel = closeBtn
        ? norm(closeBtn.getAttribute('aria-label') || closeBtn.textContent)
        : '';
      const expandedToggle = document.querySelector('[aria-expanded="true"]');
      return {
        panelOpen: Boolean(panel),
        bodyLocked,
        closeLabel,
        expandedToggle: Boolean(expandedToggle),
      };
    });

    if (!openState.panelOpen && !openState.expandedToggle) {
      violations.push({ issue: 'nav-does-not-open' });
    }
    if (openState.panelOpen && !openState.closeLabel) {
      violations.push({ issue: 'missing-close-label' });
    }
    if (openState.panelOpen && !openState.bodyLocked) {
      violations.push({ issue: 'body-scroll-not-locked' });
    }

    const close = page.locator(
      '[aria-label*="close" i], button.close, [data-bs-dismiss], .btn-close, .cap-header__close',
    ).first();
    if (await close.count()) {
      await close.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(150);
    } else if (toggleCount) {
      await toggle.click({ timeout: 2000 }).catch(() => {});
    }

    const closed = await page.evaluate(() => {
      const openPanel = document.querySelector(
        '.offcanvas.show, [role="dialog"][aria-modal="true"], .navbar-collapse.show, #capMainNav.show, .collapse.show',
      );
      const expanded = document.querySelector('[aria-expanded="true"]');
      return !openPanel && !expanded;
    });
    if (!closed) violations.push({ issue: 'nav-does-not-close' });
  } catch {
    violations.push({ issue: 'nav-toggle-interaction-failed' });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  return { violations: violations.slice(0, 6) };
}
