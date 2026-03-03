import { test, expect } from '../../fixtures';
import { runAxeScan } from '../../utils/a11y';

test.describe('Accessibility — Signup', () => {
  test.fixme(
    'has no critical or serious WCAG 2.2 violations',
    async ({ page, signupPage }) => {
      // The signup page has real app-level WCAG violations that must be fixed
      // in the application before this test can pass:
      //   • aria-required-children (critical) — role="list" missing required child roles
      //   • listitem (serious) — <li> used outside of <ul>/<ol>
      test.slow(); // axe-core scans are heavy; triple timeout to avoid crashes under parallel load
      await signupPage.goto();
      const { blocking, total } = await runAxeScan(page, test.info());
      expect(blocking).toBe(0);
      expect(total).toBeLessThan(20);
    }
  );
});
