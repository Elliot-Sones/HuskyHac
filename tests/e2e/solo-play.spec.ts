import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function waitForArrivalToFinish(page: Page) {
  await expect(page.getByText('Touchdown')).toBeVisible();
  await expect(page.getByTestId('world-canvas-host')).toBeVisible({ timeout: 10_000 });
}

test('solo play loads when multiplayer is disabled', async ({ page }) => {
  await page.goto('/play');

  await expect(page.getByText('Choose your traveler')).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill('Elliot');
  await page.getByRole('button', { name: 'Use green avatar' }).click();
  await page.getByLabel('Accessory').selectOption('suitcase');
  await page.getByRole('button', { name: 'Launch game' }).click();

  await waitForArrivalToFinish(page);
  await expect(page.getByText('Airport room')).toHaveCount(0);
  await expect(page.getByText('Choose your traveler')).toHaveCount(0);
});

test('eiffel tower destination loads as a walkable solo world', async ({ page }) => {
  await page.goto('/play?destination=france-eiffel_tour');

  await page.getByRole('button', { name: 'Launch game' }).click();

  await waitForArrivalToFinish(page);
  await expect(page.getByText('Champ de Mars · Tour Eiffel')).toBeVisible();
  await expect(page.getByText('M. Moreau')).toBeVisible();
  await expect(page.getByText('Ticket kiosk · south pillar')).toBeVisible();
});
