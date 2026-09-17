import { expect, test } from '../../src/fixtures';

test.describe('Profile', () => {
  test('authenticated player sees profile stats @smoke', async ({ page }) => {
    await page.goto('/profile.html');

    await expect(page.locator('[data-test="profile-page"]')).toBeVisible();
    await expect(page.locator('[data-test="profile-username"]')).not.toHaveText('-');
    await expect(page.locator('[data-test="profile-email"]')).toContainText('@arcade.test');
    await expect(page.locator('[data-test="profile-games-played"]')).toBeVisible();
  });
});
