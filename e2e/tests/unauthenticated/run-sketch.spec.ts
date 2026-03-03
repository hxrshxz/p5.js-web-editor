import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — run sketch', () => {
  test('can load the editor without logging in', async ({ editor }) => {
    await editor.gotoNew();
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
  });

  test('running a sketch executes p5.js code and shows output in the console', async ({
    page,
    editor
  }) => {
    await editor.gotoNew();
    await expect(editor.editorHolder).toBeVisible();

    // Inject a sketch with a unique marker — proves JS actually executed
    // inside the sandboxed preview, not just that the iframe mounted.
    const marker = 'e2e-unauth-run-marker';
    await editor.setCode(
      `function setup() { createCanvas(100, 100); print('${marker}'); }\nfunction draw() {}`
    );

    // Open console before running to capture output immediately
    await editor.openConsole();
    await editor.runSketch();

    await editor.expectConsoleOutput(marker);

    // Confirm the app did not redirect an unauthenticated user away from the editor
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/signup');
  });
});
