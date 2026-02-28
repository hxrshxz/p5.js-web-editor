import { test, expect } from '../../fixtures';
import { runAxeScan } from '../../utils/a11y';

test.describe('Accessibility — My Sketches dashboard', () => {
  test('stays within the current known WCAG 2.2 baseline threshold', async ({
    authenticatedPage: page,
    dashboard,
    testData
  }) => {
    await dashboard.goto(testData.authUsername);
    const violations = await runAxeScan(page, test.info());
    expect(violations).toBeLessThan(20);
  });
});

test.describe('Accessibility — Reset Password page', () => {
  test('stays within the current known WCAG 2.2 baseline threshold', async ({
    page
  }) => {
    await page.goto('/reset-password');
    await page.waitForSelector('form');
    const violations = await runAxeScan(page, test.info());
    expect(violations).toBeLessThan(20);
  });
});
