import { injectSession } from '../../src/api/gaming-api';
import { expect, test } from '../../src/fixtures';

test.describe('Negative cases', () => {
  test('hard mode blocks session when wallet is too low @negative', async ({ seededLowBalance, gamePage }) => {
    await gamePage.open('brick-blitz');
    await gamePage.selectDifficulty('hard');
    await gamePage.startSession();
    await gamePage.expectSessionBlocked(/Not enough coins to start this session/i);
  });

  test('shop blocks rebuy when item is already owned @negative', async ({ gamingApi, page, shopPage }) => {
    const seed = await gamingApi.seedShopReadyPlayer('neg_rebuy');
    await gamingApi.purchaseItem(seed.token, 'vip-badge');
    const user = await gamingApi.getMe(seed.token);
    await injectSession(page, seed.token, user);

    await shopPage.open();
    await shopPage.expectItemOwned('vip-badge');
  });

  test('API rejects duplicate daily bonus claim @negative', async ({ gamingApi }) => {
    const seed = await gamingApi.seedShopReadyPlayer('neg_bonus');

    await expect(async () => gamingApi.claimDailyBonus(seed.token)).rejects.toThrow(/Daily bonus already claimed/i);
  });

  test('API rejects duplicate shop purchase @negative', async ({ gamingApi }) => {
    const seed = await gamingApi.seedShopReadyPlayer('neg_purchase');
    await gamingApi.purchaseItem(seed.token, 'neon-trail');

    await expect(async () => gamingApi.purchaseItem(seed.token, 'neon-trail')).rejects.toThrow(/already owned/i);
  });
});
