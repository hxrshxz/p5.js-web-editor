import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — fullscreen preview', () => {
  test('fullscreen preview page loads at /full/:id', async ({
    page,
    fullscreen,
    testData
  }) => {
    await fullscreen.gotoById(testData.seededProjectId);
    await expect(page).toHaveURL(
      new RegExp(`/full/${testData.seededProjectId}$`)
    );
    await fullscreen.waitForPreview();
  });

  test('fullscreen preview has no editor toolbar or file panel', async ({
    page,
    fullscreen,
    testData
  }) => {
    await fullscreen.gotoById(testData.seededProjectId);
    await expect(page).toHaveURL(
      new RegExp(`/full/${testData.seededProjectId}$`)
    );
    await fullscreen.expectNoEditorChrome();
    await fullscreen.waitForPreview();
  });

  test('fullscreen preview URL with username also loads', async ({
    page,
    fullscreen,
    testData
  }) => {
    await fullscreen.gotoByUsernameAndId(
      testData.authUsername,
      testData.seededProjectId
    );
    await expect(page).toHaveURL(
      new RegExp(`/${testData.authUsername}/full/${testData.seededProjectId}$`)
    );
    await fullscreen.waitForPreview();
  });
});
