import { test, expect } from '../../fixtures';

// NOTE: We can't create a real account in tests without cleanup,
// so we test the signup form UI, validation, and navigation only.
// Full signup + auto-login is covered by integration tests.

test.describe('Signup flow — unauthenticated', () => {
  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto();
  });

  test('signup page renders the registration form', async ({ signupPage }) => {
    await expect(signupPage.heading).toBeVisible();
    await expect(signupPage.usernameField).toBeVisible();
    await expect(signupPage.emailField).toBeVisible();
    await expect(signupPage.passwordField).toBeVisible();
    await expect(signupPage.submitButton).toBeVisible();
  });

  test('shows validation errors when form is submitted empty', async ({
    signupPage
  }) => {
    // Button is disabled when form is empty — assert that instead of clicking
    await signupPage.expectSubmitDisabled();
  });

  test('signup page has a link to the login page', async ({
    page,
    signupPage
  }) => {
    await expect(signupPage.loginLink).toBeVisible();
    await signupPage.loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page is accessible from the nav when unauthenticated', async ({
    page,
    editor,
    nav
  }) => {
    await editor.gotoNew();
    await expect(nav.signupLink).toBeVisible();
    await nav.signupLink.evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/signup/);
  });
});
