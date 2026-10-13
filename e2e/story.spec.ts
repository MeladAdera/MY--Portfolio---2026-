import { expect, test } from '@playwright/test';

test.describe('story page', () => {
  test('shows the title, the six steps and the contact footer', async ({ page }) => {
    await page.goto('/story');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The climb.');
    await expect(page.getByRole('link', { name: 'Story' })).toHaveAttribute('aria-current', 'page');
    /* the steps are hidden until the scene reveals them, so count them in the DOM */
    await expect(page.locator('[data-step]')).toHaveCount(6);
    await expect(page.getByRole('navigation', { name: 'Contact' })).toBeAttached();
  });

  test('mounts the scene and reveals the first step', async ({ page }) => {
    await page.goto('/story');
    const stage = page.locator('figure[data-scene-state]');

    /* headless runners may lack usable WebGL; either way the mount must settle */
    await expect(stage).toHaveAttribute('data-scene-state', /ready|failed/, { timeout: 60_000 });
    const state = await stage.getAttribute('data-scene-state');
    test.skip(state !== 'ready', 'no WebGL on this runner');

    await expect(page.locator('[data-step]').first()).toHaveCSS('visibility', 'visible', {
      timeout: 30_000,
    });
    await expect(page.locator('[data-tick]')).toHaveCount(6);
  });

  test('shows the play control only when motion is allowed', async ({ page }) => {
    await page.goto('/story');
    const reducedMotion = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    const play = page.getByRole('button', { name: 'Play the climb' });
    if (reducedMotion) await expect(play).toBeHidden();
    else await expect(play).toBeVisible();
  });
});
