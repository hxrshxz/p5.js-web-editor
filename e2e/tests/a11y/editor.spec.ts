import { test, expect } from '../../fixtures';
import { runAxeScan } from '../../utils/a11y';

test.describe('Accessibility — Editor (unauthenticated)', () => {
  test.fixme(
    'has no critical or serious WCAG 2.2 violations on the default editor view',
    async ({ page, editor }) => {
      // The editor page has real app-level WCAG violations that must be fixed
      // in the application before this test can pass:
      //   • aria-required-children (critical)
      //   • aria-required-parent (critical)
      //   • listitem (serious)
      //   • scrollable-region-focusable (serious)
      //   • target-size (serious)
      test.slow(); // axe-core scans are heavy; triple timeout to avoid crashes under parallel load
      await editor.gotoNew();
      const { blocking, total } = await runAxeScan(page, test.info());
      expect(blocking).toBe(0);
      expect(total).toBeLessThan(20);
    }
  );
});
