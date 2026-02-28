import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — run sketch', () => {
  test('can load the editor without logging in', async ({ editor }) => {
    await editor.gotoNew();
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
  });

  test('can run a sketch and see the preview without being redirected to login', async ({
    page,
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
