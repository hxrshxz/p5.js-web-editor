import { test, expect } from '../../fixtures';

test.describe('Authenticated user — duplicate sketch', () => {
  test('can duplicate a sketch via File > Duplicate', async ({
    authenticatedPage: page,
    editor,
    nav,
    testData
  }) => {
    // 1. Open editor, save to get a persistent project ID
    await editor.gotoNew();
    await nav.waitForAuth();
    await nav.openFileMenu();
    await Promise.all([
      page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`)),
      editor.clickSave()
    ]);

    const originalUrl = page.url();
    // Extract the project ID from the URL for comparison later
    const originalId = originalUrl.split('/').at(-1);

    // 2. Duplicate via File menu
    await nav.openFileMenu();
    await expect(editor.duplicateMenuItem).toBeVisible({ timeout: 5000 });
    await expect(editor.duplicateMenuItem).toBeEnabled({ timeout: 5000 });
    await editor.duplicateMenuItem.evaluate((el: HTMLElement) => el.click());

    // 3. Browser must navigate to the duplicate's own URL
    await page.waitForURL((url) => url.href !== originalUrl, {
      timeout: 15_000
    });

    const newUrl = page.url();
    const newId = newUrl.split('/').at(-1);

    // URL must have changed — the duplicate is a separate project
    expect(newUrl).not.toBe(originalUrl);
    // Project IDs must be different — the server created a new document
    expect(newId).not.toBe(originalId);
    // The duplicate's name must include the word "copy" in the toolbar
    await expect(
      page
        .locator('header, [class*="toolbar"]')
        .filter({ hasText: /copy/i })
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
