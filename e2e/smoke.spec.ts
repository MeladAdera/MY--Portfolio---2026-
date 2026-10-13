import { expect, test } from '@playwright/test';

/* The smallest end-to-end check: the site builds, starts and serves the home page. */
test('home page renders with the site title', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Melad Adera — Full Stack Developer');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('every page carries the site icon', async ({ page }) => {
  for (const path of ['/', '/work', '/story']) {
    await page.goto(path);
    for (const rel of ['icon', 'apple-touch-icon']) {
      const href = await page.locator(`link[rel="${rel}"]`).getAttribute('href');
      expect(href, `${rel} on ${path}`).toBeTruthy();
      const icon = await page.request.get(href!);
      expect(icon.ok()).toBe(true);
      expect(icon.headers()['content-type']).toBe('image/png');
    }
  }
});
