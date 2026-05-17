/** Safe dynamic import wrapper for Chromium Playwright installs. */

export async function importPlaywright() {
  try {
    return await import('playwright');
  } catch (error) {
    throw new Error(`Playwright is required for site inspection. Install it in the website repo:

  npm install -D playwright
  npx playwright install chromium

Original error: ${error.message}`);
  }
}
