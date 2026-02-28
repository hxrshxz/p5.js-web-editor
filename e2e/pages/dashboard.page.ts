import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * DashboardPage — the /:username/sketches route (My Sketches list).
 */
export class DashboardPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get sketchListContainer() {
    return this.page.locator('table, [class*="sketch-list"], ul').first();
  }

  /** The page heading — shows the owner's username, not "sketches". */
  get heading() {
    return this.page.locator('.dashboard-header__header__title');
  }

  /** A sketch row/item matching a given name. */
  sketchRow(name: string) {
    return this.page
      .locator('tr, [class*="sketch-list__item"]')
      .filter({ hasText: name })
      .first();
  }

  /** The options/kebab menu button within a specific sketch row. */
  sketchOptionsButton(name: string) {
    return this.sketchRow(name).getByRole('button', {
      name: /toggle|options|more|menu|\.\.\./i
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async goto(username: string): Promise<void> {
    await this.page.goto(`/${username}/sketches`);
    await this.waitForList();
  }

  async waitForList(timeout = 10_000): Promise<void> {
    await this.page.waitForSelector('table, [class*="sketch-list"], ul', {
      timeout
    });
  }

  async expectSketchVisible(name: string, timeout = 10_000): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible({ timeout });
  }

  async expectSketchHidden(name: string, timeout = 10_000): Promise<void> {
    await expect(this.page.getByText(name)).toBeHidden({ timeout });
  }

  /**
   * Delete a sketch by name via the options dropdown.
   * Opens the row's kebab menu, clicks Delete, and auto-accepts the
   * window.confirm() dialog that the app uses for confirmation.
   */
  async deleteSketch(name: string): Promise<void> {
    const optionsBtn = this.sketchOptionsButton(name);
    await optionsBtn.evaluate((el: HTMLElement) => el.click());

    // The delete action triggers window.confirm(); accept it automatically
    this.page.once('dialog', (dialog) => dialog.accept());

    const deleteButton = this.page
      .locator('li[role="menuitem"]')
      .filter({ hasText: /delete/i })
      .locator('button, a')
      .first();
    await expect(deleteButton).toBeVisible({ timeout: 5_000 });
    await deleteButton.evaluate((el: HTMLElement) => el.click());
  }
}
