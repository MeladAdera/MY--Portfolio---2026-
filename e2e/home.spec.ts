import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('shows the hero copy, about facts and the projects list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'From ideas to working products.',
    );
    await expect(page.getByRole('link', { name: 'Who am I?' })).toHaveAttribute('href', '#about');
    await expect(page.getByRole('region', { name: /I’m Melad/ })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Work in progress.' }).getByRole('listitem'),
    ).toHaveCount(3);
  });

  test('mounts the scene and lets the visitor pause and resume it', async ({ page }) => {
    const reducedMotion = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    test.skip(reducedMotion, 'the control is hidden under reduced motion');
    await page.goto('/');
    const stage = page.locator('figure[data-scene-state]');

    /* Headless runners may lack usable WebGL; either way the mount must settle. */
    await expect(stage).toHaveAttribute('data-scene-state', /ready|failed/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Pause scene' }).click();
    await expect(page.getByRole('button', { name: 'Play scene' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(stage).toHaveAttribute('data-scene-status', 'paused');

    await page.getByRole('button', { name: 'Play scene' }).click();
    await expect(page.getByRole('button', { name: 'Pause scene' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('under reduced motion it shows the finished scene and no control', async ({ page }) => {
    const reducedMotion = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    test.skip(!reducedMotion, 'only meaningful in the reduced-motion project');
    await page.goto('/');
    const stage = page.locator('figure[data-scene-state]');

    await expect(stage).toHaveAttribute('data-scene-state', /ready|failed/, { timeout: 60_000 });
    await expect(page.getByRole('button', { name: /scene/ })).toBeHidden();
  });
});
