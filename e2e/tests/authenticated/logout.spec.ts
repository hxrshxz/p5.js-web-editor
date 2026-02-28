import { test, expect } from '../../fixtures';

test.describe('Authenticated user — logout', () => {
  test('full logout flow: confirm login, logout, and session clearance', async ({
    authenticatedPage: page,
    editor,
    nav,
    testData
  }) => {
    await page.goto('/');
    await editor.waitForReady();
    await nav.waitForAuth();
    await nav.expectUsernameVisible(testData.authUsername);
    await nav.logout();
  });
});
