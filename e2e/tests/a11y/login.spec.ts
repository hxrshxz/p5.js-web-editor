import { test, expect } from '../../fixtures';
import { runAxeScan } from '../../utils/a11y';

test.describe('Accessibility — Login', () => {
  test('stays within the current known WCAG 2.2 baseline threshold', async ({
    page,
    loginPage
  }) => {
    await loginPage.goto();
    const violations = await runAxeScan(page, test.info());
    expect(violations).toBeLessThan(20);
  });
});
