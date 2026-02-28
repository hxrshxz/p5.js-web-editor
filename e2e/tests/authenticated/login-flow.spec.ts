import { test, expect } from '../../fixtures';

test.describe('Login flow', () => {
  test('user can log in via the login form and sees their username in the nav', async ({
    loginPage,
    nav,
    testData
  }) => {
    await loginPage.goto();
    await loginPage.login(testData.authEmail, testData.authPassword);
    await nav.waitForAuth();
    await nav.expectUsernameVisible(testData.authUsername);
  });

  test('shows an error message for invalid credentials', async ({
    loginPage
  }) => {
    await loginPage.goto();
    await loginPage.login('notauser@example.com', 'wrongpassword');
    await loginPage.expectErrorVisible();
  });

  test('login page is accessible from the nav when unauthenticated', async ({
    page,
    editor,
    nav
  }) => {
    await editor.gotoNew();
    await expect(nav.loginLink).toBeVisible();
    await nav.loginLink.evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/login/);
  });
});
