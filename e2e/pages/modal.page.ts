import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ModalPage — generic overlay/modal interactions.
 *
 * Covers both the error modal (force-authentication) and the share modal,
 * both of which use the `.overlay` class in the p5 editor.
 */
export class ModalPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get overlay() {
    return this.page.locator('.overlay');
  }

  get overlayTitle() {
    return this.page.locator('.overlay__title');
  }

  get loginLink() {
    return this.overlay.getByRole('link', { name: /login/i });
  }

  get signupLink() {
    return this.overlay.getByRole('link', { name: /sign.?up/i });
  }

  /** The first read-only / text input inside the overlay (used by share modal). */
  get urlInput() {
    return this.overlay.locator('input[type="text"], input[readonly]').first();
  }

  // ── Waits ────────────────────────────────────────────────────────────────

  async waitForOverlay(timeout = 5_000): Promise<void> {
    await expect(this.overlay).toBeVisible({ timeout });
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async expectTitleMatches(pattern: string | RegExp): Promise<void> {
    await expect(this.overlayTitle).toHaveText(pattern);
  }

  async expectBodyText(pattern: string | RegExp): Promise<void> {
    await expect(this.page.getByText(pattern)).toBeVisible();
  }

  async expectLoginAndSignupLinks(): Promise<void> {
    await expect(this.loginLink).toBeVisible();
    await expect(this.signupLink).toBeVisible();
  }

  async expectEmbedContent(): Promise<void> {
    await expect(this.overlay.getByText(/embed|iframe/i).first()).toBeVisible({
      timeout: 5_000
    });
  }
}
