import type { Page } from '@playwright/test';

/**
 * BasePage — minimal shared plumbing for every page object.
 *
 * All page objects extend this class. It exposes the raw `page` so tests can
 * drop down to low-level Playwright when needed, while page-specific helpers
 * live in subclasses.
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Force a JS click, bypassing pointer-event overlays such as the Redux
   * DevTools widget that appears in NODE_ENV=development.
   */
  protected async forceClick(
    locator: ReturnType<Page['locator']>
  ): Promise<void> {
    await locator.evaluate((el: HTMLElement) => el.click());
  }

  /**
   * Dismiss the cookie consent dialog by setting the p5-cookie-consent cookie.
   * Call this before navigation to prevent the dialog from blocking interactions.
   */
  async dismissCookieConsent(baseURL?: string): Promise<void> {
    const domain = new URL(baseURL ?? 'http://localhost:8000').hostname;
    await this.page.context().addCookies([
      {
        name: 'p5-cookie-consent',
        value: 'essential',
        domain,
        path: '/'
      }
    ]);
  }
}
