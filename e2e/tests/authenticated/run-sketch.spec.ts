import { test, expect } from '../../fixtures';

test.describe('Authenticated user — run sketch', () => {
  test('editor and preview are visible and username is shown in nav', async ({
    authenticatedPage: page,
    editor,
    nav,
    testData
  }) => {
    await editor.gotoNew();
    await nav.waitForAuth();
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
    await nav.expectUsernameVisible(testData.authUsername);
  });

  test('can run a sketch without being redirected to login', async ({
    authenticatedPage: page,
    editor
  }) => {
    await editor.gotoNew();
    await expect(editor.editorHolder).toBeVisible();
    await editor.runSketch();
    await expect(editor.previewIframe).toBeVisible({ timeout: 10_000 });
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/signup');
  });
});
