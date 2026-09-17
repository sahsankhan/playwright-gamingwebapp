import { uniquePlayer } from '../../src/api/gaming-api';
import { expect, test } from '../../src/fixtures';

test.describe('Player journey', () => {
  test.describe.configure({ mode: 'serial' });

  test('full gaming web flow from register to leaderboard @e2e', async ({
    page,
    registerPage,
    lobbyPage,
    shopPage,
    gamePage,
    settingsPage,
    profilePage,
    leaderboardPage,
  }) => {
    const player = uniquePlayer('journey');

    await test.step('Register and land in lobby', async () => {
      await registerPage.open();
      await registerPage.register(player.username, player.email, player.password);
      await lobbyPage.expectLoaded(player.username);
    });

    await test.step('Claim daily bonus and buy a cosmetic', async () => {
      await lobbyPage.claimDailyBonus();
      await lobbyPage.goToShop();
      await shopPage.buyItem('neon-trail');
      await shopPage.expectPurchaseMessage('Neon Trail');
    });

    await test.step('Browse arcade titles and launch a session', async () => {
      await lobbyPage.open();
      await lobbyPage.filterGames('Arcade');
      await lobbyPage.openGameDetails('brick-blitz');
      await lobbyPage.launchFromModal();
      await gamePage.selectDifficulty('normal');
      await gamePage.startSession();
      await gamePage.expectPlaying();
      await gamePage.expectScoreGreaterThan(0);
      await gamePage.endSession();
      await gamePage.expectResultsModal();
    });

    await test.step('Update avatar and verify profile inventory', async () => {
      await settingsPage.open();
      await settingsPage.selectAvatar('legend');
      await settingsPage.save();
      await settingsPage.expectSaved('legend');

      await profilePage.open();
      await profilePage.expectPlayer(player.username, player.email);
      await profilePage.expectAvatar('legend');
      await profilePage.expectInventoryItem('neon-trail');
      await expect(page.locator('[data-test="profile-high-score"]')).not.toHaveText('0');
    });

    await test.step('Verify leaderboard entry', async () => {
      await leaderboardPage.open();
      await leaderboardPage.expectPlayerListed(player.username);
      await leaderboardPage.expectRankVisible();
    });
  });
});
