import { test, expect } from '../../fixtures';

test.describe('Authenticated user — run sketch', () => {
  test('editor loads and shows username in nav', async ({
    authenticatedPage: _page,
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

  test('running a sketch executes p5.js code and shows output in the console', async ({
    authenticatedPage: _page,
    editor,
    nav
  }) => {
    // Load the editor and confirm auth
    await editor.gotoNew();
    await nav.waitForAuth();

    // Inject a sketch with a unique marker in print() — this proves the JS
    // actually ran inside the sandboxed preview, not just that an iframe
    // appeared in the DOM.
    const marker = 'e2e-auth-run-marker';
    await editor.setCode(
      `function setup() { createCanvas(100, 100); print('${marker}'); }\nfunction draw() {}`
    );

    // Open the console BEFORE running so we catch output the moment it fires
    await editor.openConsole();
    await editor.runSketch();

    await editor.expectConsoleOutput(marker);
  });

  test('running a sketch does not redirect to login', async ({
    authenticatedPage: page,
    editor,
    nav
  }) => {
    await editor.gotoNew();
    await nav.waitForAuth();
    await editor.runSketch();
    await expect(editor.previewIframe).toBeVisible({ timeout: 10_000 });
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/signup');
  });
});
