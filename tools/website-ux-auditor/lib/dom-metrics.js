import {
  TECHNICAL_TRANSLATIONS,
  TRUST_TERMS,
  ECOSYSTEM_TERMS,
  OUTCOME_TERMS,
  CTA_TERMS,
  HANDBOOK_CHROME_PHRASES,
} from './constants.js';

/**
 * Evaluate DOM heuristic metrics inside the Playwright browser context for one URL.
 */
export async function collectDomMetrics(page, href) {
  return page.evaluate(
    ({ TECHNICAL_TRANSLATIONS, TRUST_TERMS, ECOSYSTEM_TERMS, OUTCOME_TERMS, CTA_TERMS, HANDBOOK_CHROME_PHRASES }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const words = (s) => norm(s).split(/\s+/).filter(Boolean);
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };
      const textOf = (el) => norm(el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '');
      const root = document.querySelector('main#main') || document.querySelector('main') || document.body;
      const qsRoot = (sel) => Array.from(root.querySelectorAll(sel));
      const qsDoc = (sel) => Array.from(document.querySelectorAll(sel));
      const allText = norm(root.innerText || '');
      const bodyWords = words(allText);
      const headings = qsRoot('h1,h2,h3').filter(visible).map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: textOf(el).slice(0, 240),
        top: Math.round(el.getBoundingClientRect().top),
        words: words(textOf(el)).length,
        fontSize: Number.parseFloat(window.getComputedStyle(el).fontSize || '0'),
      }));
      const links = qsRoot('a[href]').filter(visible).map((el) => ({
        text: textOf(el).slice(0, 160),
        href: el.getAttribute('href'),
        top: Math.round(el.getBoundingClientRect().top),
      }));
      const navLinks = qsDoc('header a[href]').filter(visible).map((el) => textOf(el).slice(0, 120)).filter(Boolean);
      const buttons = qsRoot('button, [role="button"], a[href]').filter(visible).map((el) => ({
        text: textOf(el).slice(0, 140),
        top: Math.round(el.getBoundingClientRect().top),
        tag: el.tagName.toLowerCase(),
      })).filter((x) => x.text);
      const paragraphs = qsRoot('p').filter(visible).map((el) => ({ text: textOf(el).slice(0, 260), words: words(textOf(el)).length, top: Math.round(el.getBoundingClientRect().top) }));
      const sections = qsRoot('section, article').filter(visible).map((el) => ({
        words: words(textOf(el)).length,
        top: Math.round(el.getBoundingClientRect().top),
        textStart: textOf(el).slice(0, 180),
      }));
      const images = qsRoot('img').filter(visible).map((el) => ({ alt: el.getAttribute('alt') || '', top: Math.round(el.getBoundingClientRect().top) }));
      const aboveFoldText = norm(
        qsRoot('*')
          .filter((el) => visible(el) && el.getBoundingClientRect().top < 900 && el.getBoundingClientRect().bottom > 0)
          .map(textOf)
          .filter(Boolean)
          .join(' '),
      ).slice(0, 2500);
      const aboveFoldWords = words(aboveFoldText);
      const codeAboveFold = qsRoot('pre, code, table').filter((el) => visible(el) && el.getBoundingClientRect().top < 900).length;
      const tables = qsRoot('table').filter(visible).length;
      const preBlocks = qsRoot('pre').filter(visible).length;
      const codeBlocks = qsRoot('code').filter(visible).length;
      const cards = qsRoot('[class*="card"], [class*="tile"], [class*="feature"], [class*="panel"], [data-card]').filter(visible).length;
      const firstH1 = headings.find((h) => h.tag === 'h1') || null;
      const h1Count = headings.filter((h) => h.tag === 'h1').length;
      const title = norm(document.title);
      const metaDescription = norm(document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
      const metaViewport = norm(document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '');
      const lang = document.documentElement.getAttribute('lang') || '';
      const topCtas = buttons.filter((b) => b.top < 900 && CTA_TERMS.some((term) => b.text.toLowerCase().includes(term))).slice(0, 8);
      const allLower = allText.toLowerCase();
      const aboveLower = aboveFoldText.toLowerCase();
      const countTerms = (terms, text) => terms.reduce((acc, t) => acc + (text.toLowerCase().includes(String(t).toLowerCase()) ? 1 : 0), 0);
      const technicalHits = TECHNICAL_TRANSLATIONS.map(([term, plain]) => ({ term, plain, aboveFold: aboveLower.includes(term.toLowerCase()), anywhere: allLower.includes(term.toLowerCase()) })).filter((x) => x.aboveFold || x.anywhere);
      const genericAiHits = ['ai-powered', 'powered by ai', 'agentic', 'ai enabled', 'ai-enabled'].filter((t) => allLower.includes(t));

      const parseRgb = (value) => {
        const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
        if (parts.length < 3 || parts.some((p, idx) => idx < 3 && !Number.isFinite(p))) return null;
        if (parts.length >= 4 && parts[3] === 0) return null;
        return parts.slice(0, 3);
      };
      const luminance = (rgb) => {
        const srgb = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
      };
      const contrastRatio = (a, b) => {
        const l1 = luminance(a);
        const l2 = luminance(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const backgroundOf = (el) => {
        let node = el;
        while (node && node.nodeType === 1) {
          const bg = parseRgb(window.getComputedStyle(node).backgroundColor);
          if (bg) return bg;
          node = node.parentElement;
        }
        return [255, 255, 255];
      };
      const contrastSamples = qsRoot('p, a, button, h1, h2, h3, li').filter(visible).slice(0, 160).map((el) => {
        const style = window.getComputedStyle(el);
        const fg = parseRgb(style.color);
        const bg = backgroundOf(el);
        const size = Number.parseFloat(style.fontSize || '16');
        const ratio = fg && bg ? contrastRatio(fg, bg) : null;
        return {
          text: textOf(el).slice(0, 80),
          tag: el.tagName.toLowerCase(),
          ratio: ratio ? Number(ratio.toFixed(2)) : null,
          size,
          top: Math.round(el.getBoundingClientRect().top),
        };
      }).filter((s) => s.ratio !== null);
      const lowContrast = contrastSamples.filter((s) => (s.size >= 24 ? s.ratio < 3 : s.ratio < 4.5)).slice(0, 12);

      const auxiliaryLink = (anchor) => {
        const raw = String(anchor.getAttribute('href') || '').trim();
        const hLower = raw.toLowerCase();
        const cls = String(anchor.getAttribute('class') || '').toLowerCase();
        const al = String(anchor.getAttribute('aria-label') || '').toLowerCase();
        const idNearest = String(anchor.closest('[id]')?.getAttribute('id') || '').toLowerCase();
        if (!raw || hLower.startsWith('javascript:')) return true;
        if (/^#(main|content|skip|top|skipnav|navbarNav|page|root)\b/i.test(raw)) return true;
        if (/\bskip\b/.test(al) || al.includes('skip to')) return true;
        if (idNearest.includes('cookie') || /\bcookie-banner\b|\bcookieConsent\b|\bcc-banner\b/i.test(cls)) return true;
        if (/\btheme\b|\bpalette\b|\bappearance\b|\bcolor-mode\b|\bdark\b.*\bmode\b/.test(al) || /\btheme-switch\b|\btheme-toggle\b/i.test(cls)) return true;
        return false;
      };

      const mainElRaw = document.querySelector('main#main') || document.querySelector('main');
      const mainH1Candidates = mainElRaw ? Array.from(mainElRaw.querySelectorAll('h1')).filter(visible) : [];
      const mainFirstH1 = mainH1Candidates[0];
      const firstMainH1Top = mainFirstH1 ? Math.round(mainFirstH1.getBoundingClientRect().top) : null;

      let firstMainContentEl = null;
      if (mainElRaw) {
        firstMainContentEl = [...mainElRaw.querySelectorAll('p, h1, h2, article, section')].find(visible)
          || (mainFirstH1 && visible(mainFirstH1) ? mainFirstH1 : null);
      }
      const firstMainContentTop = firstMainContentEl ? Math.round(firstMainContentEl.getBoundingClientRect().top) : null;

      const mainElForChrome = document.querySelector('main#main') || document.querySelector('main');
      const isOutsideMain = (el) => {
        if (!mainElForChrome) return true;
        return !mainElForChrome.contains(el);
      };

      const docLinksAll = qsDoc('a[href]').filter((a) => visible(a) && !auxiliaryLink(a));
      const docVisibleLinkCount = docLinksAll.length;
      const sidebarOffcanvasAnchors = qsDoc('aside a[href], [class*="sidebar"] a[href], [class*="offcanvas"] a[href]').filter((a) => visible(a) && !auxiliaryLink(a));
      const sidebarOffcanvasLinkCount = sidebarOffcanvasAnchors.length;

      const navChromeEls = qsDoc('header, nav, aside, [class*="sidebar"], [class*="offcanvas"]').filter(isOutsideMain);
      const navChromeContainerCount = navChromeEls.filter(visible).length;

      const preMainFirstH1LinkCount = firstMainH1Top == null ? 0
        : docLinksAll.filter((a) => {
          const rt = Math.round(a.getBoundingClientRect().top);
          return rt >= -2 && rt < firstMainH1Top - 1;
        }).length;

      const handbookPieces = [];
      for (const el of navChromeEls) {
        if (!visible(el)) continue;
        handbookPieces.push(norm(textOf(el)).slice(0, 4200));
        if (handbookPieces.length > 40) break;
      }
      const handbookChromeHayRaw = handbookPieces.join('\n').toLowerCase();

      let handbookChromeTermHits = 0;
      for (const ph of HANDBOOK_CHROME_PHRASES || []) {
        const p = String(ph || '').toLowerCase().trim();
        if (!p) continue;
        let idx = 0;
        while (idx < handbookChromeHayRaw.length) {
          const j = handbookChromeHayRaw.indexOf(p, idx);
          if (j === -1) break;
          handbookChromeTermHits++;
          idx = j + Math.max(p.length, 1);
        }
      }
      const adrMatches = handbookChromeHayRaw.match(/\badrs?\b/g);
      handbookChromeTermHits += adrMatches ? adrMatches.length : 0;
      /** Heuristic chrome score for homepage-shell messages (hits ≥2 often matches sidebar tree labels). */
      const hasHandbookChromeOnHome = handbookChromeTermHits >= 2;

      const dupRegionAnchors = qsDoc('header a[href], nav a[href], aside a[href], [class*="sidebar"] a[href], [class*="offcanvas"] a[href]')
        .filter((a) => visible(a) && !auxiliaryLink(a))
        .filter(isOutsideMain);
      const dupByText = new Map();
      for (const anchor of dupRegionAnchors) {
        const kt = norm(textOf(anchor)).toLowerCase();
        if (!kt || kt.length < 2) continue;
        dupByText.set(kt, (dupByText.get(kt) || 0) + 1);
      }
      let duplicateNavLinkTextCount = 0;
      for (const c of dupByText.values()) {
        if (c > 1) duplicateNavLinkTextCount += (c - 1);
      }

      const outsideMainHeaderNavAnchors = qsDoc('header a[href], nav a[href]').filter((a) => visible(a) && !auxiliaryLink(a)).filter(isOutsideMain);
      const outsideMainHeaderNavLinkCount = outsideMainHeaderNavAnchors.length;

      const vh = Math.round(window.innerHeight);
      const heroFoldBottom = Math.min(900, Math.max(Math.round(vh * 0.92), 560));
      const qualifiesHeroVisual = (el) => {
        if (!visible(el) || !mainElRaw || !mainElRaw.contains(el)) return false;
        const r = el.getBoundingClientRect();
        if (r.top >= heroFoldBottom || r.bottom <= 48) return false;
        return r.width >= 236 && r.height >= 156;
      };

      let mainHeroVisualAboveFoldCount = 0;
      /** @type {{ tag: string, width: number, height: number, top: number, altLen: number, hasCaption: boolean, decorativeGuess: boolean } | null} */
      let heroPrimaryVisual = null;
      if (mainElRaw) {
        const candidates = [
          ...mainElRaw.querySelectorAll('img'),
          ...mainElRaw.querySelectorAll('svg'),
          ...mainElRaw.querySelectorAll('video'),
          ...mainElRaw.querySelectorAll('canvas'),
        ];
        const seen = new Set();
        for (const el of candidates) {
          if (!qualifiesHeroVisual(el)) continue;
          const key = `${el.tagName}:${Math.round(el.getBoundingClientRect().top)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          mainHeroVisualAboveFoldCount += 1;
          const r = el.getBoundingClientRect();
          const area = r.width * r.height;
          const tag = el.tagName.toLowerCase();
          const alt = tag === 'img' ? (el.getAttribute('alt') || '') : '';
          const altLower = alt.toLowerCase();
          const fig = tag === 'img' ? el.closest('figure') : null;
          const capText = fig ? norm(fig.querySelector('figcaption')?.textContent || '') : '';
          const decorativeGuess =
            el.getAttribute('role') === 'presentation'
            || altLower.includes('decorative')
            || altLower.includes('background')
            || altLower.includes('ambient texture')
            || (tag === 'img' && !alt && !capText && Number(el.naturalWidth || r.width) > 1200);
          const candidate = {
            tag,
            width: Math.round(r.width),
            height: Math.round(r.height),
            top: Math.round(r.top),
            altLen: alt.length,
            hasCaption: Boolean(capText && capText.length > 3),
            decorativeGuess,
          };
          const prevArea = heroPrimaryVisual ? heroPrimaryVisual.width * heroPrimaryVisual.height : 0;
          if (!heroPrimaryVisual || area > prevArea) heroPrimaryVisual = candidate;
        }
      }

      const headingWordSum = headings.reduce((acc, h) => acc + (Number(h.words) || 0), 0);
      const headingBodyWordRatio = bodyWords.length ? headingWordSum / bodyWords.length : 0;

      const extractAcronyms = (txt) => {
        const out = new Set();
        const re = /\b[A-Z][A-Z0-9]{1,6}\b/g;
        let m;
        while ((m = re.exec(txt)) !== null) {
          const t = m[0];
          if (t.length < 2) continue;
          out.add(t);
        }
        return out.size;
      };
      const uniqueAcronymLikeCount = extractAcronyms(allText);
      const aboveFoldAcronymLikeCount = extractAcronyms(aboveFoldText);
      const apiLikePathHits = (allText.match(/\/v\d+\/[^\s)'"<>]+|\/api\/[^\s)'"<>]+|\/v1\b/gi) || []).length;

      const firstViewportLinkCount = docLinksAll.filter((a) => {
        const t = Math.round(a.getBoundingClientRect().top);
        return t >= -2 && t < vh;
      }).length;
      const secondViewportLinkCount = docLinksAll.filter((a) => {
        const t = Math.round(a.getBoundingClientRect().top);
        return t >= vh && t < 2 * vh;
      }).length;

      let heroMainWordCount = 0;
      if (mainElRaw) {
        let buf = 0;
        for (const el of mainElRaw.querySelectorAll('h1,h2,h3,p,li')) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.top >= heroFoldBottom || r.bottom <= 0) continue;
          buf += words(textOf(el)).length;
        }
        heroMainWordCount = buf;
      }

      const sectionTops = sections.map((s) => s.top).filter((t) => Number.isFinite(t) && t >= -4).sort((a, b) => a - b);
      const sectionGaps = [];
      for (let i = 1; i < sectionTops.length; i++) sectionGaps.push(sectionTops[i] - sectionTops[i - 1]);
      const sectionMedianGapPx = sectionGaps.length
        ? [...sectionGaps].sort((a, b) => a - b)[Math.floor(sectionGaps.length / 2)]
        : null;

      let maxParagraphMeasurePx = 0;
      if (mainElRaw) {
        for (const el of mainElRaw.querySelectorAll('p')) {
          if (!visible(el)) continue;
          const wpx = Math.round(el.getBoundingClientRect().width);
          if (wpx > maxParagraphMeasurePx) maxParagraphMeasurePx = wpx;
        }
      }

      const sampleEl = qsRoot('p, li, a, button, h2, h3, span').filter(visible).slice(0, 36);
      const fontSet = new Set();
      const colorSet = new Set();
      for (const el of sampleEl) {
        const st = window.getComputedStyle(el);
        const ff = norm(st.fontFamily || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        if (ff) fontSet.add(ff);
        const rgb = parseRgb(st.color);
        if (rgb) colorSet.add(rgb.map((n) => Math.round(n)).join(','));
      }

      const ctaTops = (topCtas || []).map((c) => Number(c.top)).filter((n) => Number.isFinite(n));
      const ctaVerticalSpreadPx = ctaTops.length >= 2 ? Math.max(...ctaTops) - Math.min(...ctaTops) : 0;

      /** Progressive disclosure: technical blocks before first substantial explainer paragraph in main. */
      let firstTechnicalBlockTop = null;
      let firstExplainerParagraphTop = null;
      if (mainElRaw) {
        const blocks = [];
        for (const el of mainElRaw.querySelectorAll('pre, table, p')) {
          if (!visible(el)) continue;
          const tag = el.tagName.toLowerCase();
          const top = Math.round(el.getBoundingClientRect().top);
          if (tag === 'pre' || tag === 'table') {
            blocks.push({ kind: 'technical', top });
          } else if (tag === 'p' && words(textOf(el)).length >= 16) {
            blocks.push({ kind: 'explain', top });
          }
        }
        blocks.sort((a, b) => a.top - b.top);
        firstTechnicalBlockTop = blocks.find((b) => b.kind === 'technical')?.top ?? null;
        firstExplainerParagraphTop = blocks.find((b) => b.kind === 'explain')?.top ?? null;
      }
      const technicalPrecedesMainExplanation =
        firstTechnicalBlockTop != null
        && firstExplainerParagraphTop != null
        && firstTechnicalBlockTop + 4 < firstExplainerParagraphTop;

      /** First headings inside main for storyline heuristics */
      let earlyMainHeadings = [];
      if (mainElRaw) {
        earlyMainHeadings = Array.from(mainElRaw.querySelectorAll('h2, h3'))
          .filter(visible)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            text: textOf(el).slice(0, 200),
            top: Math.round(el.getBoundingClientRect().top),
          }))
          .sort((a, b) => a.top - b.top)
          .slice(0, 14);
      }

      const mainLower = norm(mainElRaw ? mainElRaw.innerText || '' : '').toLowerCase();
      const workflowStorySignalHits = ['how it works', 'how we work', 'workflow', 'stage', 'step ', 'steps', 'your work', 'pipeline', 'lifecycle'].filter((t) => mainLower.includes(t)).length;
      const aiCapabilityStoryHits = ['agent', 'llm', 'model ', 'governed', 'contract', 'delegat', 'review gate', 'human review', 'bounded'].filter((t) => mainLower.includes(t)).length;
      const proofStorySignalHits = ['trust', 'boundary', 'evidence', 'security posture', 'enterprise', 'designed for governed', 'data boundary'].filter((t) => mainLower.includes(t)).length;

      const ksVisualHashReport = (() => {
        const nodes = Array.from(document.querySelectorAll('[data-ks-hash], [hash]'));
        const invalidRaw = [];
        const mismatches = [];
        const incompleteMarkers = [];
        const instanceCountByHash = new Map();
        const validSet = new Set();

        const pushInvalid = (value, source) => {
          const v = String(value || '').trim();
          if (!v) return;
          if (/^[A-Za-z]{3}$/.test(v)) return;
          invalidRaw.push({ value: v.slice(0, 80), source });
        };

        for (const el of nodes) {
          const dRaw = el.getAttribute('data-ks-hash');
          const hRaw = el.getAttribute('hash');
          const dTrim = String(dRaw || '').trim();
          const hTrim = String(hRaw || '').trim();
          const tag = el.tagName.toLowerCase();

          if (dTrim) pushInvalid(dRaw, 'data-ks-hash');
          if (hTrim) pushInvalid(hRaw, 'hash');

          const dValid = /^[A-Za-z]{3}$/.test(dTrim);
          const hValid = /^[A-Za-z]{3}$/.test(hTrim);

          if (dValid && hValid && dTrim !== hTrim) {
            mismatches.push({ hashAttr: hTrim, dataKsHash: dTrim, tag });
            continue;
          }

          if (dValid && !hTrim) {
            incompleteMarkers.push({ side: 'hash-missing', tag, dataKsHash: dTrim });
          } else if (hValid && !dTrim) {
            incompleteMarkers.push({ side: 'data-ks-hash-missing', tag, hash: hTrim });
          }

          const canon = dValid ? dTrim : (hValid ? hTrim : '');
          if (canon) {
            instanceCountByHash.set(canon, (instanceCountByHash.get(canon) || 0) + 1);
            validSet.add(canon);
          }
        }

        const instObj = {};
        for (const [k, v] of instanceCountByHash.entries()) instObj[k] = v;

        return {
          validUnique: [...validSet].sort(),
          invalidRaw,
          mismatches,
          incompleteMarkers,
          instanceCountByHash: instObj,
        };
      })();

      return {
        title,
        metaDescription,
        metaViewport,
        lang,
        url: window.location.href,
        allTextStart: allText.slice(0, 3000),
        aboveFoldText,
        wordCount: bodyWords.length,
        aboveFoldWordCount: aboveFoldWords.length,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        headings,
        h1Count,
        firstH1,
        links,
        navLinks,
        buttons,
        topCtas,
        paragraphs,
        sections,
        images,
        codeAboveFold,
        tables,
        preBlocks,
        codeBlocks,
        cards,
        technicalHits,
        genericAiHits,
        trustTermCount: countTerms(TRUST_TERMS, allText),
        trustTermsAboveFold: countTerms(TRUST_TERMS, aboveFoldText),
        ecosystemTermCount: countTerms(ECOSYSTEM_TERMS, allText),
        ecosystemTermsAboveFold: countTerms(ECOSYSTEM_TERMS, aboveFoldText),
        outcomeTermCount: countTerms(OUTCOME_TERMS, allText),
        imagesMissingAlt: images.filter((img) => !img.alt).length,
        lowContrast,
        homepageShellMetricsPresent: true,
        docVisibleLinkCount,
        sidebarOffcanvasLinkCount,
        navChromeContainerCount,
        preMainFirstH1LinkCount,
        handbookChromeTermHits,
        hasHandbookChromeOnHome,
        duplicateNavLinkTextCount,
        firstMainH1Top,
        firstMainContentTop,
        outsideMainHeaderNavLinkCount,
        mainHeroVisualAboveFoldCount,
        heroPrimaryVisual,
        headingBodyWordRatio,
        uniqueAcronymLikeCount,
        aboveFoldAcronymLikeCount,
        apiLikePathHits,
        firstViewportLinkCount,
        secondViewportLinkCount,
        heroMainWordCount,
        sectionMedianGapPx,
        maxParagraphMeasurePx,
        distinctFontFamiliesSampled: fontSet.size,
        distinctTextColorsSampled: colorSet.size,
        ctaVerticalSpreadPx,
        firstTechnicalBlockTop,
        firstExplainerParagraphTop,
        technicalPrecedesMainExplanation,
        earlyMainHeadings,
        workflowStorySignalHits,
        aiCapabilityStoryHits,
        proofStorySignalHits,
        ksVisualHashReport,
        ksVisualHashes: ksVisualHashReport.validUnique,
      };
    },
    {
      TECHNICAL_TRANSLATIONS,
      TRUST_TERMS,
      ECOSYSTEM_TERMS,
      OUTCOME_TERMS,
      CTA_TERMS,
      HANDBOOK_CHROME_PHRASES,
    },
  );
}
