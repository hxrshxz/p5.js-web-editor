import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * NavPage — interactions with the top navigation bar.
 *
 * Covers:
 *  - Waiting for the authenticated user menu ("Hello, <username>")
 *  - Opening/using the user dropdown
 *  - Logout
 *  - Navigating to My Sketches
 *  - Links visible to unauthenticated users (Log In, Sign Up)
 */
export class NavPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get userMenuItem() {
    return this.page.getByRole('menuitem', { name: /hello/i });
  }

  get fileMenuItem() {
    return this.page.getByRole('menuitem', { name: /^file$/i });
  }

  get logoutLink() {
    return this.page.locator('#account-logout');
  }

  get loginLink() {
    return this.page.getByRole('link', { name: /log.?in/i });
  }

  get signupLink() {
    return this.page.getByRole('link', { name: /sign.?up/i });
  }

  get mySketchesMenuItem() {
    return this.page.getByRole('menuitem', { name: /my sketches/i });
  }

  // ── Waits ────────────────────────────────────────────────────────────────

  /**
   * Wait until the "Hello, <username>" menu item is visible.
   * This confirms that Redux has dispatched AUTH_USER (i.e. the session API
   * call has resolved and the UI has re-rendered with the user's info).
   */
  async waitForAuth(timeout = 15_000): Promise<void> {
    await expect(this.userMenuItem).toBeVisible({ timeout });
  }

  async expectUsernameVisible(username: string): Promise<void> {
    await expect(
      this.page.getByRole('menuitem', { name: new RegExp(username, 'i') })
    ).toBeVisible();
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Open the user dropdown menu. */
  async openUserMenu(): Promise<void> {
    await this.forceClick(this.userMenuItem);
  }

  /** Open the File dropdown menu. */
  async openFileMenu(): Promise<void> {
    // Use forceClick to bypass DevTools overlay, then wait for menu to appear
    await this.forceClick(this.fileMenuItem);
    // Give the menu time to render
    await this.page.waitForSelector('[role="menu"]', { timeout: 5000 });
  }

  /** Perform a full logout and wait for the Log In link to appear. */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await expect(this.logoutLink).toBeVisible();
    await this.forceClick(this.logoutLink);
    await expect(this.loginLink).toBeVisible();
  }

  /**
   * Navigate to My Sketches via the user dropdown.
   * Waits for the URL to change to /:username/sketches.
   */
  async goToMySketchesViaNav(username: string): Promise<void> {
    await this.openUserMenu();
    await expect(this.mySketchesMenuItem).toBeVisible({ timeout: 5000 });
    await this.forceClick(this.mySketchesMenuItem);
    await expect(this.page).toHaveURL(new RegExp(`/${username}/sketches`), {
      timeout: 10_000
    });
  }
}
