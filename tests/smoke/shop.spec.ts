import { uniquePlayer } from '../../src/api/gaming-api';
import { expect, test } from '../../src/fixtures';

test.describe('Shop', () => {
  test('player can buy a shop item with coins @smoke', async ({ page, gamingApi, loginPage, lobbyPage, shopPage, profilePage }) => {
    const player = uniquePlayer('shop');
    await gamingApi.register(player.username, player.email, player.password);

    await loginPage.open();
    await loginPage.login(player.email, player.password);
    await lobbyPage.expectLoaded(player.username);
    await lobbyPage.claimDailyBonus();
    await lobbyPage.goToShop();

    await shopPage.buyItem('vip-badge');
    await shopPage.expectPurchaseMessage('VIP Badge');

    await profilePage.open();
    await profilePage.expectInventoryItem('vip-badge');
    await expect(page.locator('[data-test="coin-balance"]')).toBeVisible();
  });
});
