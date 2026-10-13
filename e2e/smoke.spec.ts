import { expect, test } from '@playwright/test';

/* The smallest end-to-end check: the site builds, starts and serves the home page. */
test('home page renders with the site title', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Melad Adera — Full Stack Developer');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
