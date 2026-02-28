import { test } from '../../fixtures';

test.describe('Authenticated user — console output', () => {
  test('console panel shows output after running a sketch with print()', async ({
    authenticatedPage: page,
    nav,
    editor
  }) => {
    await editor.gotoNew();
    await nav.waitForAuth();
    await editor.openConsole();

    const sketchCode = `function setup() {
  createCanvas(100, 100);
  print('hello from e2e');
}
function draw() {}`;
    await editor.setCode(sketchCode);
    await editor.runSketch();
    await editor.expectConsoleOutput(/hello from e2e/i);
  });

  test('console panel shows a JavaScript error for invalid code', async ({
    authenticatedPage: page,
    nav,
    editor
  }) => {
    await editor.gotoNew();
    await nav.waitForAuth();
    await editor.openConsole();
    await editor.setCode(`function setup() {
  notDefinedFunction();
}
function draw() {}`);
    await editor.runSketch();
    await editor.expectConsoleOutput(/error|is not defined|ReferenceError/i);
  });
});
