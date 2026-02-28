import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LoginPage — the /login route.
 */
export class LoginPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get emailField() {
    return this.page.getByLabel(/email/i);
  }

  get passwordField() {
    return this.page.getByLabel(/^password$/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /log in/i });
  }

  get heading() {
    return this.page.getByRole('heading', { name: /log.?in/i });
  }

  get errorMessage() {
    return this.page.getByText(/invalid email or password/i);
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForSelector('form');
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.emailField).toBeVisible();
    await expect(this.passwordField).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Fill in email + password and click Log In.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async expectErrorVisible(timeout = 10_000): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout });
  }
}
