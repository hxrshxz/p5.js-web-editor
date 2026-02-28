import { test, expect } from '../../fixtures';
import { createProject, loginUser } from '../../utils/api-helpers';

test.describe('Authenticated user — My Sketches dashboard', () => {
  test('can navigate to My Sketches from the nav', async ({
    authenticatedPage: page,
    nav,
    dashboard,
    testData
  }) => {
    await page.goto('/');
    await nav.waitForAuth();
    await nav.goToMySketchesViaNav(testData.authUsername);
    await expect(dashboard.heading).toBeVisible();
  });

  test('seeded sketch appears in the sketch list', async ({
    authenticatedPage: _page,
    dashboard,
    testData
  }) => {
    await dashboard.goto(testData.authUsername);
    await dashboard.expectSketchVisible('e2e-test-project');
  });

  test('can delete a sketch from the dashboard', async ({
    authenticatedPage: _page,
    dashboard,
    testData
  }) => {
    const freshCookie = await loginUser({
      email: testData.authEmail,
      password: testData.authPassword
    });
    const cookieHeader = freshCookie.split(';')[0];
    await createProject('tmp-delete-me', cookieHeader);

    await dashboard.goto(testData.authUsername);
    await dashboard.expectSketchVisible('tmp-delete-me');
    await dashboard.deleteSketch('tmp-delete-me');
    await dashboard.expectSketchHidden('tmp-delete-me');
  });
});
