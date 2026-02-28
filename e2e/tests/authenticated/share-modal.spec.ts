import { test, expect } from '../../fixtures';

test.describe('Authenticated user — share modal', () => {
  test.beforeEach(
    async ({ authenticatedPage: page, editor, nav, testData }) => {
      await editor.gotoNew();
      await nav.waitForAuth();
      await nav.openFileMenu();
      await Promise.all([
        page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`)),
        editor.clickSave()
      ]);
    }
  );

  test('File > Share opens a modal with a sketch URL', async ({
    authenticatedPage: _page,
    editor,
    nav,
    modal
  }) => {
    await nav.openFileMenu();
    await expect(editor.shareMenuItem).toBeVisible({ timeout: 5000 });
    await expect(editor.shareMenuItem).toBeEnabled({ timeout: 5000 });
    await editor.shareMenuItem.evaluate((el: HTMLElement) => el.click());
    await modal.waitForOverlay();
    await expect(modal.urlInput).toBeVisible({ timeout: 5000 });
    const urlValue = await modal.urlInput.inputValue();
    expect(urlValue).toMatch(/sketches|projects|\/full\//);
  });

  test('Share modal contains an embed snippet', async ({
    authenticatedPage: _page,
    editor,
    nav,
    modal
  }) => {
    await nav.openFileMenu();
    await expect(editor.shareMenuItem).toBeVisible({ timeout: 5000 });
    await expect(editor.shareMenuItem).toBeEnabled({ timeout: 5000 });
    await editor.shareMenuItem.evaluate((el: HTMLElement) => el.click());
    await modal.waitForOverlay();
    await modal.expectEmbedContent();
  });
});
