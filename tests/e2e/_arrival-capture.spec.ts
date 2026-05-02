import { test, expect } from '@playwright/test';

test.setTimeout(180_000);

test('capture arrival transition frames', async ({ page }) => {
  page.setDefaultTimeout(60_000);

  await page.goto('/play');

  await expect(page.getByText('Choose your traveler')).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill('Elliot');
  await page.getByRole('button', { name: 'Use green avatar' }).click();
  await page.getByLabel('Accessory').selectOption('suitcase');
  await page.getByRole('button', { name: 'Launch game' }).click();

  // Wait until the arrival's Touchdown kicker exists in the DOM (canvas mounted).
  await expect(page.getByText('Touchdown')).toBeVisible({ timeout: 30_000 });

  const launchedAt = Date.now();
  const checkpoints = [
    { label: '00-immediate', absoluteMs: 200 },
    { label: '01-mid-descent', absoluteMs: 1500 },
    { label: '02-late-descent', absoluteMs: 3000 },
    { label: '03-touchdown', absoluteMs: 4000 },
    { label: '04-rolling', absoluteMs: 5200 },
  ] as const;

  for (const cp of checkpoints) {
    const waitMs = Math.max(0, cp.absoluteMs - (Date.now() - launchedAt));
    await page.waitForTimeout(waitMs);
    await page.screenshot({
      path: `output/playwright/arrival-${cp.label}.png`,
      fullPage: false,
      timeout: 10_000,
    });
  }
});
