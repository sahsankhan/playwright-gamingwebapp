import { uniquePlayer } from '../../src/api/gaming-api';
import { expect, test } from '../../src/fixtures';

test.describe('Lobby interactions', () => {
  test('player can claim daily bonus and filter arcade games @smoke', async ({
    page,
    gamingApi,
    loginPage,
    lobbyPage,
  }) => {
    const player = uniquePlayer('lobby');
    await gamingApi.register(player.username, player.email, player.password);

    await loginPage.open();
    await loginPage.login(player.email, player.password);
    await lobbyPage.expectLoaded(player.username);
    await lobbyPage.claimDailyBonus();
    await lobbyPage.expectDailyBonusClaimed();

    await lobbyPage.filterGames('Arcade');
    await expect(page.locator('[data-test="game-card-brick-blitz"]')).toBeVisible();
    await expect(page.locator('[data-test="game-card-star-dodge"]')).toHaveCount(0);
  });

  test('game details modal launches a title @smoke', async ({ gamingApi, loginPage, lobbyPage, gamePage }) => {
    const player = uniquePlayer('modal');
    await gamingApi.register(player.username, player.email, player.password);

    await loginPage.open();
    await loginPage.login(player.email, player.password);
    await lobbyPage.openGameDetails('brick-blitz');
    await lobbyPage.launchFromModal();

    await gamePage.expectCanvasVisible();
  });
});
