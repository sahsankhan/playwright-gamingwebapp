import { expect, test } from '../../src/fixtures';

test.describe('Route protection', () => {
  test('guest is redirected away from the lobby @smoke', async ({ page }) => {
    await page.goto('/lobby.html');
    await expect(page).toHaveURL(/login\.html$/);
    await expect(page.locator('[data-test="login-page"]')).toBeVisible();
  });
});
