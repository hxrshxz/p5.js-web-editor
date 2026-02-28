import { test, expect } from '../../fixtures';

test.describe('Authenticated user — save sketch', () => {
  test('saving a new sketch changes the URL and persists the project', async ({
    authenticatedPage: page,
    nav,
    editor,
    testData
  }) => {
    await page.goto('/');
    await nav.waitForAuth();
    await nav.openFileMenu();
    await editor.clickSave();

    await page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`));
    const savedUrl = page.url();

    expect(savedUrl).toMatch(new RegExp(`/${testData.authUsername}/sketches/`));

    await page.goto('/');
    await nav.waitForAuth();

    await page.goto(savedUrl);
    await editor.waitForReady();
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
  });
});
