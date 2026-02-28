import { test } from '../../fixtures';

test.describe('Authenticated user — edit and save sketch', () => {
  test('can rename a sketch and the new name persists after reload', async ({
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

    await editor.renameSketch('Edited E2E Sketch');
    await nav.openFileMenu();
    await Promise.all([
      page.waitForResponse((response) => {
        const method = response.request().method();
        return (
          response.url().includes('/editor/projects/') &&
          method === 'PUT' &&
          response.ok()
        );
      }),
      editor.clickSave()
    ]);
    await editor.expectSketchName('Edited E2E Sketch');
    await page.reload();
    await editor.waitForReady();
    await editor.expectSketchName('Edited E2E Sketch');
  });
});
