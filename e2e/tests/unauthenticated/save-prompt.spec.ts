import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — save prompt', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.gotoNew();
  });

  test('sees a sign-in prompt when attempting to save', async ({
    editor,
    modal
  }) => {
    await editor.pressCtrlS();
    await modal.waitForOverlay();
    await modal.expectTitleMatches(/error/i);
    await modal.expectBodyText(/in order to save sketches/i);
    await modal.expectLoginAndSignupLinks();
  });

  test('overlay contains login and sign-up links', async ({
    editor,
    modal
  }) => {
    await editor.pressCtrlS();
    await modal.waitForOverlay();
    await modal.expectLoginAndSignupLinks();
  });

  test('editor content is preserved after dismissing the save prompt', async ({
    editor,
    modal
  }) => {
    await expect(editor.editorArticle).toBeVisible();
    await editor.pressCtrlS();
    await modal.waitForOverlay();
    await expect(editor.editorArticle).toBeAttached();
  });
});
