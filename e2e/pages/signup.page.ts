import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * SignupPage — the /signup route.
 */
export class SignupPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────

  get heading() {
    return this.page.getByRole('heading', { name: /sign up/i });
  }

  get usernameField() {
    return this.page.getByLabel(/username/i);
  }

  get emailField() {
    return this.page.getByLabel(/email/i);
  }

  get passwordField() {
    return this.page.getByLabel(/^password$/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /sign up/i });
  }

  /** Any visible validation/error element. */
  get validationError() {
    return this.page
      .locator('.form-error, [role="alert"], .error-message, [class*="error"]')
      .first();
  }

  get loginLink() {
    return this.page.locator('p:has-text("Already have an account") a');
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/signup');
    await this.page.waitForSelector('form');
  }

  async submitEmpty(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectValidationError(timeout = 5_000): Promise<void> {
    await expect(this.validationError).toBeVisible({ timeout });
  }
}
