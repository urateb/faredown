import { expect, test } from '@playwright/test';

/**
 * Landing only — no search, so this does not spend a SerpApi credit.
 */
test('landing page renders the search form and validates empty submit', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Know whether the fare is actually good' }),
  ).toBeVisible();
  await expect(page.getByRole('form', { name: 'Flight search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pristina → Vienna' })).toBeVisible();
  await expect(
    page.getByLabel('Primary').getByRole('link', { name: 'How it works' }),
  ).toHaveAttribute('href', '/about');

  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Where are you flying from?')).toBeVisible();
  await expect(page.getByText('Where are you flying to?')).toBeVisible();
  await expect(page).toHaveURL('/');
});
