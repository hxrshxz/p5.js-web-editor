import { test, expect } from '../../fixtures';

test.describe('Unauthenticated user — download sketch', () => {
  test('page URL does not redirect to login when visiting a public sketch', async ({
    page,
    editor,
    testData
  }) => {
    await editor.gotoProject(testData.seededProjectId, testData.authUsername);
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/signup');
    await expect(editor.editorArticle).toBeVisible();
    await expect(editor.previewIframe).toBeVisible();
  });
});
