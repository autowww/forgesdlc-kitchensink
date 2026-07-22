import { importPlaywright } from './playwright-import.js';

/**
 * @param {import('playwright').Page} page
 * @param {Array<{ type: string, selector?: string }>} actions
 */
async function runActions(page, actions = []) {
  for (const action of actions) {
    if (action.type === 'click' && action.selector) {
      const locator = page.locator(action.selector).first();
      await locator.scrollIntoViewIfNeeded();
      const tagName = await locator.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
      if (tagName === 'input') {
        const inputType = await locator.getAttribute('type').catch(() => '');
        if (inputType === 'radio' || inputType === 'checkbox') {
          await locator.check({ force: true });
        } else {
          await locator.click({ force: true });
        }
      } else {
        await locator.click({ force: true });
      }
      await page.waitForTimeout(50);
    }
  }
}

/**
 * @param {import('playwright').Page} page
 * @param {string} selector
 */
async function collectElementMetrics(page, selector) {
  return page.$eval(selector, (element) => {
    const style = getComputedStyle(element);
    /** @type {Record<string, string>} */
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return {
      transform: style.transform,
      computed: {
        transformStyle: style.transformStyle,
        perspective: style.perspective,
        backfaceVisibility: style.backfaceVisibility,
      },
      attributes,
    };
  });
}

/**
 * @param {object} scenario
 * @param {object} options
 * @param {string} options.url
 * @param {import('playwright').Browser} [options.browser]
 * @param {boolean} [options.headless]
 * @returns {Promise<{ id: string, collected: object }>}
 */
export async function runScenario(scenario, options) {
  const { url, headless = true } = options;
  let browser = options.browser;
  let ownsBrowser = false;

  if (!browser) {
    const playwright = await importPlaywright();
    browser = await playwright.chromium.launch({ headless });
    ownsBrowser = true;
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  if (scenario.prefers_reduced_motion) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  } else {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await runActions(page, scenario.actions || []);

    const expect = scenario.expect || {};
    const selector =
      expect.inner_selector ||
      expect.root_selector ||
      '[data-ks-hash]';

    const collected = await collectElementMetrics(page, selector);
    return { id: scenario.id, collected };
  } finally {
    await context.close();
    if (ownsBrowser) {
      await browser.close();
    }
  }
}

/**
 * @param {object} oracle
 * @param {object} options
 * @param {string} options.url
 * @param {import('playwright').Browser} [options.browser]
 * @param {boolean} [options.headless]
 * @returns {Promise<Array<{ id: string, collected: object }>>}
 */
export async function runOracleScenarios(oracle, options) {
  const results = [];
  let browser = options.browser;
  let ownsBrowser = false;

  if (!browser) {
    const playwright = await importPlaywright();
    browser = await playwright.chromium.launch({ headless: options.headless ?? true });
    ownsBrowser = true;
  }

  try {
    for (const scenario of oracle.scenarios || []) {
      results.push(
        await runScenario(scenario, {
          ...options,
          browser,
        }),
      );
    }
    return results;
  } finally {
    if (ownsBrowser) {
      await browser.close();
    }
  }
}

/**
 * Returns true when Chromium is launchable (integration tests may skip otherwise).
 */
export async function canLaunchBrowser() {
  try {
    const playwright = await importPlaywright();
    const browser = await playwright.chromium.launch({ headless: true });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}
