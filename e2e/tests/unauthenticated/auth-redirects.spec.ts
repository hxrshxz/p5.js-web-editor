import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — auth redirects', () => {
  test('/account redirects to /login for unauthenticated users', async ({
    page
  }) => {
    await page.goto('/account');

    // Server redirects 302 → /login; Playwright follows it
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('/login page renders a login form', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectFormVisible();
  });

  test('/reset-password page renders without error', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForSelector('form');

    await expect(page.getByRole('heading', { name: /reset/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
