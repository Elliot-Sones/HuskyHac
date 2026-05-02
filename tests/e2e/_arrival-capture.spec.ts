import { test } from '@playwright/test';

test.setTimeout(120_000);

test('capture landing page', async ({ page }) => {
  page.setDefaultTimeout(60_000);

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: 'output/playwright/landing-page.png',
    fullPage: false,
    timeout: 15_000,
  });
  await page.screenshot({
    path: 'output/playwright/landing-page-full.png',
    fullPage: true,
    timeout: 15_000,
  });
});
