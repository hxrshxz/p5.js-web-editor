import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * EditorPage — interactions with the main IDE view.
 *
 * Covers:
 *  - Waiting for the editor to be ready
 *  - Running / stopping sketches
 *  - Saving sketches (via File menu)
 *  - Renaming sketches
 *  - Opening the File menu items (Save, Share, Duplicate)
 *  - Console panel
 *  - CodeMirror textarea editing
 */
export class EditorPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get editorHolder() {
    return this.page.locator('article.editor-holder');
  }

  get editorArticle() {
    return this.page.getByRole('article');
  }

  get previewIframe() {
    return this.page.getByTitle('sketch preview');
  }

  get saveTrigger() {
    return this.page.locator('#file-save');
  }

  get downloadTrigger() {
    return this.page.locator('#file-download');
  }

  get editSketchNameButton() {
    return this.page.getByRole('button', { name: 'Edit sketch name' });
  }

  get sketchNameInput() {
    return this.page.getByRole('textbox', { name: 'New sketch name' });
  }

  get runButton() {
    // The play button aria-label is "Play only visual sketch" in the app
    return this.page
      .getByRole('button', { name: /play only visual sketch|run/i })
      .first();
  }

  get consoleToggleButton() {
    return this.page.getByRole('button', { name: /console/i });
  }

  get consolePanel() {
    return this.page.locator('[class*="console"]');
  }

  get cmTextarea() {
    return this.page
      .locator('.CodeMirror-code[contenteditable="true"]')
      .first();
  }

  // File-menu item locators (only valid while File menu is open)
  get duplicateMenuItem() {
    return this.page.getByRole('menuitem', { name: /duplicate/i });
  }

  get shareMenuItem() {
    return this.page.locator('#file-share');
  }

  // ── Waits ────────────────────────────────────────────────────────────────

  /** Wait for the editor chrome (article.editor-holder) to be in the DOM. */
  async waitForReady(): Promise<void> {
    await this.page.waitForSelector('article.editor-holder');
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Navigate to the IDE home (new sketch). */
  async gotoNew(): Promise<void> {
    await this.page.goto('/');
    await this.waitForReady();
  }

  /**
   * Navigate to an existing project by bare ID.
   * Uses the /:username/sketches/:id route when a username is provided,
   * otherwise falls back to /projects/:id (which may not load project data).
   */
  async gotoProject(projectId: string, username?: string): Promise<void> {
    if (username) {
      await Promise.all([
        this.page.waitForResponse(
          (response) =>
            response
              .url()
              .includes(`/editor/${username}/projects/${projectId}`) &&
            response.ok(),
          { timeout: 15_000 }
        ),
        this.page.goto(`/${username}/sketches/${projectId}`)
      ]);
    } else {
      await this.page.goto(`/projects/${projectId}`);
    }
    await this.waitForReady();
  }

  /** Click the Run button. Uses forceClick to bypass dev-mode overlays. */
  async runSketch(): Promise<void> {
    await this.forceClick(this.runButton);
  }

  /**
   * Save the current sketch via File > Save.
   * The File menu must be opened first (via NavPage.openFileMenu).
   */
  async clickSave(): Promise<void> {
    await this.saveTrigger.click();
  }

  /**
   * Open File menu then save in one step.
   * Requires NavPage to be composed in the test.
   *
   * NOTE: preferred approach is to call nav.openFileMenu() + editor.clickSave()
   * explicitly in tests for clarity.
   */

  /**
   * Rename the current sketch.
   * @param newName - the new sketch name to type
   */
  async renameSketch(newName: string): Promise<void> {
    await this.editSketchNameButton.click();
    await this.sketchNameInput.fill(newName);
    await this.sketchNameInput.press('Enter');
  }

  /**
   * Assert that a sketch name is visible somewhere in the header/toolbar.
   */
  async expectSketchName(name: string): Promise<void> {
    await expect(
      this.page
        .locator('[class*="toolbar"], [class*="sketch-name"], header')
        .filter({ hasText: name })
        .first()
    ).toBeVisible();
  }

  /**
   * Ensure the console panel is open.
   * Clicks the toggle button if it is visible and the panel is not yet open.
   */
  async openConsole(): Promise<void> {
    const isConsoleOpen = await this.consolePanel
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (isConsoleOpen) {
      return;
    }

    const isToggleVisible = await this.consoleToggleButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (isToggleVisible) {
      await this.forceClick(this.consoleToggleButton);
    }
  }

  /**
   * Replace the entire editor contents with the given code.
   *
   * Strategy:
   *  1. Call CodeMirror's `setValue` API (synchronous, fires the CM onChange).
   *  2. Poll until CM confirms it holds the new value (instant in practice).
   *  3. Wait 1 500 ms for the app's 1-second debounced `updateFileContent`
   *     Redux action to complete before the caller proceeds (e.g. clicks Run).
   *
   * The `waitForFunction` step eliminates any ambiguity about whether the
   * evaluate call actually reached the CodeMirror instance; the subsequent
   * wait is the minimum needed for the Redux debounce.
   */
  async setCode(code: string): Promise<void> {
    await this.page.evaluate((newCode: string) => {
      const cmEl = document.querySelector('.CodeMirror') as any;
      if (cmEl?.CodeMirror) {
        cmEl.CodeMirror.setValue(newCode);
      }
    }, code);

    // Verify CM actually holds the new value before starting the debounce wait
    await this.page.waitForFunction(
      (expected: string) => {
        const cm = (document.querySelector('.CodeMirror') as any)?.CodeMirror;
        return cm?.getValue() === expected;
      },
      code,
      { timeout: 5_000 }
    );

    // Allow the app's 1-second debounce for updateFileContent to flush
    await this.page.waitForTimeout(1_500);
  }

  /**
   * Read the current CodeMirror editor contents.
   * Useful for asserting code persistence after save + reload.
   */
  async getCode(): Promise<string> {
    return this.page.evaluate(() => {
      const cm = (document.querySelector('.CodeMirror') as any)?.CodeMirror;
      return cm?.getValue() ?? '';
    });
  }

  /**
   * Wait for a text string to appear in the console panel.
   */
  async expectConsoleOutput(
    text: string | RegExp,
    timeout = 15_000
  ): Promise<void> {
    await expect(this.consolePanel.getByText(text).first()).toBeVisible({
      timeout
    });
  }

  /**
   * Trigger a save via the keyboard shortcut.
   * Used when the Save button is aria-disabled (unauthenticated users).
   */
  async pressCtrlS(): Promise<void> {
    await this.page.keyboard.press('Control+s');
  }
}
