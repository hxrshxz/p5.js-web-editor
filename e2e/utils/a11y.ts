import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

/**
 * Run an axe-core WCAG 2.2 AA accessibility scan on the current page.
 *
 * Attaches the violations JSON to the test report and logs a human-readable
 * summary to stdout. Returns the violation count so callers can assert on it.
 *
 * Usage:
 *   const count = await runAxeScan(page, testInfo);
 *   expect(count).toBeLessThan(20);
 */
export async function runAxeScan(
  page: Page,
  testInfo: TestInfo
): Promise<number> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  await testInfo.attach('axe-violations', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json'
  });

  if (results.violations.length > 0) {
    console.log(`Found ${results.violations.length} accessibility violations:`);
    results.violations.forEach((v) => {
      console.log(`  [${v.impact ?? 'unknown'}] ${v.id}: ${v.description}`);
    });
  }

  return results.violations.length;
}
