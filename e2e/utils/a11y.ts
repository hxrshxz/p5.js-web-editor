import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

/** Impact levels axe-core can return. */
type AxeImpact = 'minor' | 'moderate' | 'serious' | 'critical';

const BLOCKING_IMPACTS: Set<AxeImpact> = new Set(['critical', 'serious']);

export interface AxeScanResult {
  /** Violations whose impact is "critical" or "serious" — must be zero. */
  blocking: number;
  /** All violations regardless of impact. */
  total: number;
}

/**
 * Run an axe-core WCAG 2.2 AA accessibility scan on the current page.
 *
 * Attaches a violations JSON attachment to the test report and logs a
 * human-readable summary. Returns {@link AxeScanResult} so callers can
 * distinguish blocking (critical/serious) from informational violations.
 *
 * Two-tier enforcement:
 *   - `blocking` (critical/serious) must always be 0
 *   - `total` is compared against a known baseline to detect regressions
 *
 * Usage:
 *   const { blocking, total } = await runAxeScan(page, testInfo);
 *   expect(blocking).toBe(0);          // zero critical/serious
 *   expect(total).toBeLessThan(20);    // informational baseline
 */
export async function runAxeScan(
  page: Page,
  testInfo: TestInfo
): Promise<AxeScanResult> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  await testInfo.attach('axe-violations', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json'
  });

  const blockingViolations = results.violations.filter((v) =>
    BLOCKING_IMPACTS.has(v.impact as AxeImpact)
  );

  if (results.violations.length > 0) {
    console.log(
      `Axe: ${results.violations.length} violation(s), ${blockingViolations.length} blocking`
    );
    results.violations.forEach((v) => {
      const tag = BLOCKING_IMPACTS.has(v.impact as AxeImpact)
        ? '[BLOCKING]'
        : '[info]    ';
      console.log(
        `  ${tag} [${v.impact ?? 'unknown'}] ${v.id}: ${v.description}`
      );
    });
  }

  return {
    blocking: blockingViolations.length,
    total: results.violations.length
  };
}
