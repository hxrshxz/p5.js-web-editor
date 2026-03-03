import { test, expect } from '../../fixtures';
import { runAxeScan } from '../../utils/a11y';

test.describe('Accessibility — My Sketches dashboard', () => {
  test.fixme(
    'has no critical or serious WCAG 2.2 violations',
    async ({ authenticatedPage: page, dashboard, testData }) => {
      // The dashboard page has real app-level WCAG violations that must be fixed
      // in the application before this test can pass:
      //   • aria-required-children (critical)
      //   • listitem (serious)
      //   • scrollable-region-focusable (serious)
      test.slow(); // axe-core scans are heavy; triple timeout to avoid crashes under parallel load
      await dashboard.goto(testData.authUsername);
      const { blocking, total } = await runAxeScan(page, test.info());
      expect(blocking).toBe(0);
      expect(total).toBeLessThan(20);
    }
  );
});

test.describe('Accessibility — Reset Password page', () => {
  test.fixme(
    'has no critical or serious WCAG 2.2 violations',
    async ({ page }) => {
      // Known app bugs on this page (not test bugs):
      //   • aria-required-children (critical) — role="list" missing required
      //     child roles in the password-reset form component.
      //   • listitem (serious) — <li> used outside of a <ul>/<ol> context.
      // These must be fixed in the application before this test can pass.
      await page.goto('/reset-password');
      await page.waitForSelector('form');
      const { blocking, total } = await runAxeScan(page, test.info());
      expect(blocking).toBe(0);
      expect(total).toBeLessThan(20);
    }
  );
});
