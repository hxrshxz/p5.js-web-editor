import { test, expect } from '../../fixtures';

test.describe('Authenticated user — logout', () => {
  test('full logout flow: session is cleared and protected routes redirect to login', async ({
    authenticatedPage: page,
    editor,
    nav,
    testData
  }) => {
    // 1. Confirm we are authenticated
    await page.goto('/');
    await editor.waitForReady();
    await nav.waitForAuth();
    await nav.expectUsernameVisible(testData.authUsername);

    // 2. Perform logout — nav.logout() asserts the Login link appears
    await nav.logout();

    // 3. Verify the session is truly invalidated: the account settings page is
    //    a protected route that requires authentication. After logout it must
    //    redirect the browser away (to /login or similar) rather than serving
    //    the page.
    await page.goto('/account');
    await page.waitForURL(
      (url) => {
        const path = url.pathname;
        // Accept any redirect: /login, /signup, or back to /
        return (
          path.includes('/login') || path.includes('/signup') || path === '/'
        );
      },
      { timeout: 10_000 }
    );

    // Confirm the login link is present on the resulting page,
    // proving the session is no longer valid.
    await expect(nav.loginLink.first()).toBeVisible({ timeout: 5_000 });
  });
});
