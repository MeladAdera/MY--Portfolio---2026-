import { expect, test } from '@playwright/test';

test.describe('work page', () => {
  test('opens on the three project cards, each a link to its case', async ({ page }) => {
    await page.goto('/work');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Three things I’m building.');
    const cards = page.getByRole('navigation', { name: 'Projects on this page' });
    await expect(cards.getByRole('link')).toHaveCount(3);
    await expect(cards.getByRole('img')).toHaveCount(3);

    await cards.getByRole('link', { name: /SportBooker/ }).click();
    await expect(page).toHaveURL(/#sportbooker$/);
    await expect(page.getByRole('heading', { level: 2, name: 'SportBooker' })).toBeInViewport();
  });

  test('keeps the full case for each project and the contact section', async ({ page }) => {
    await page.goto('/work');

    await expect(page.getByRole('article')).toHaveCount(3);
    const inventory = page.getByRole('article', { name: 'Inventory Distribution' });
    await expect(inventory.getByRole('term').filter({ hasText: 'Built with' })).toBeVisible();
    await expect(inventory.getByRole('heading', { level: 3, name: 'Decisions' })).toBeVisible();
    await expect(inventory.getByRole('listitem')).toHaveCount(5);

    await expect(page.getByRole('link', { name: 'Say hello' })).toHaveAttribute(
      'href',
      'mailto:dev.melad.adera@gmail.com',
    );
    await expect(page.getByRole('link', { name: 'Download resume' })).toHaveAttribute(
      'href',
      '/resume/Melad_Adera.pdf',
    );
    const resume = await page.request.get('/resume/Melad_Adera.pdf');
    expect(resume.ok()).toBe(true);
    expect(resume.headers()['content-type']).toContain('application/pdf');
    /* the sealed letter plays once the section is in view */
    const letter = page.getByRole('img', { name: /letter slides into an envelope/ });
    await letter.scrollIntoViewIfNeeded();
    await expect(letter).toHaveAttribute('data-sealed', 'true');
  });
});
