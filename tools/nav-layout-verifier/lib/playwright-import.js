/** Safe dynamic import wrapper for Chromium Playwright installs. */

export async function importPlaywright() {
  try {
    return await import('playwright');
  } catch (error) {
    throw new Error(`Playwright is required for spatial effect verification. Install it:

  npm install
  npx playwright install chromium

Original error: ${error.message}`);
  }
}
