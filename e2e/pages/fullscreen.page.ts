import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * FullscreenPage — the /full/:id and /:username/full/:id routes.
 *
 * The fullscreen view renders only the sketch iframe with no editor chrome.
 */
export class FullscreenPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get previewIframe() {
    return this.page
      .locator('iframe[title="sketch preview"], iframe[name="sketch"]')
      .first();
  }

  get editorHolder() {
    return this.page.locator('article.editor-holder');
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async gotoById(projectId: string): Promise<void> {
    await this.page.goto(`/full/${projectId}`);
    await this.waitForPreview();
  }

  async gotoByUsernameAndId(
    username: string,
    projectId: string
  ): Promise<void> {
    await this.page.goto(`/${username}/full/${projectId}`);
    await this.waitForPreview();
  }

  async waitForPreview(timeout = 15_000): Promise<void> {
    await expect(this.previewIframe).toBeVisible({ timeout });
  }

  async expectNoEditorChrome(): Promise<void> {
    await this.waitForPreview();
    await expect(this.editorHolder).toBeHidden({ timeout: 10_000 });
  }
}
