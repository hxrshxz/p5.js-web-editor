import { test, expect } from '../../fixtures';

test.describe('Authenticated user — save sketch', () => {
  test('saving a new sketch changes the URL to a persistent project route', async ({
    authenticatedPage: page,
    nav,
    editor,
    testData
  }) => {
    await page.goto('/');
    await nav.waitForAuth();
    await nav.openFileMenu();
    await Promise.all([
      page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`)),
      editor.clickSave()
    ]);

    const savedUrl = page.url();
    expect(savedUrl).toMatch(new RegExp(`/${testData.authUsername}/sketches/`));

    // Navigate away then back — the URL must still serve the project
    await page.goto('/');
    await nav.waitForAuth();
    await page.goto(savedUrl);
    await editor.waitForReady();
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
  });

  test('code changes are reflected when re-navigating to the saved sketch', async ({
    authenticatedPage: page,
    nav,
    editor,
    testData
  }) => {
    // Start with a fresh sketch and save to get a project URL
    await page.goto('/');
    await nav.waitForAuth();
    await nav.openFileMenu();
    await Promise.all([
      page.waitForURL(new RegExp(`/${testData.authUsername}/sketches/`)),
      editor.clickSave()
    ]);

    const savedUrl = page.url();

    // Write distinctive code, then save again (PUT to persist content)
    const uniqueMarker = `/* e2e-save-content-${Date.now()} */`;
    await editor.setCode(
      `${uniqueMarker}\nfunction setup() { createCanvas(200, 200); }\nfunction draw() {}`
    );
    await nav.openFileMenu();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/editor/projects/') &&
          res.request().method() === 'PUT' &&
          res.ok()
      ),
      editor.clickSave()
    ]);

    // Navigate away then reload the saved URL
    await page.goto('/');
    await nav.waitForAuth();
    await editor.gotoProject(
      savedUrl.split('/').at(-1) as string,
      testData.authUsername
    );

    // The editor must contain the code we wrote — not the original default
    const reloadedCode = await editor.getCode();
    expect(reloadedCode).toContain(uniqueMarker);
  });
});
