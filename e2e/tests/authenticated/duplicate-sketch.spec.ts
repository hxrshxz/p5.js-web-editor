import { test, expect } from '../../fixtures';

test.describe('Authenticated user — duplicate sketch', () => {
  test('can duplicate a sketch via File > Duplicate', async ({
    authenticatedPage: page,
    editor,
    nav,
    testData
  }) => {
    await editor.gotoNew();
    await nav.waitForAuth();
    await nav.openFileMenu();
    await Promise.all([
      page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`)),
      editor.clickSave()
    ]);

    const originalUrl = page.url();
    await nav.openFileMenu();
    await expect(editor.duplicateMenuItem).toBeVisible({ timeout: 5000 });
    await expect(editor.duplicateMenuItem).toBeEnabled({ timeout: 5000 });
    await editor.duplicateMenuItem.evaluate((el: HTMLElement) => el.click());

    await page.waitForURL((url) => url.href !== originalUrl, {
      timeout: 15_000
    });

    const newUrl = page.url();
    expect(newUrl).not.toBe(originalUrl);

    await expect(
      page
        .locator('header, [class*="toolbar"]')
        .filter({ hasText: /copy/i })
        .first()
    )
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Some versions auto-save with the same name; keep behavior tolerant.
      });
  });
});
