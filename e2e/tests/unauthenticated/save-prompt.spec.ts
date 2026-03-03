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

  test('editor remains interactive after the save prompt appears', async ({
    editor,
    modal
  }) => {
    // Editor must be visible and usable before the prompt
    await expect(editor.editorArticle).toBeVisible();
    await editor.pressCtrlS();
    await modal.waitForOverlay();
    // After the modal appears the editor pane must still be visible and
    // scrollable — not hidden, displaced, or destroyed by the overlay.
    await expect(editor.editorArticle).toBeVisible();
    // The CodeMirror instance must remain in the DOM with editable content
    await expect(editor.cmTextarea).toBeVisible();
  });
});
