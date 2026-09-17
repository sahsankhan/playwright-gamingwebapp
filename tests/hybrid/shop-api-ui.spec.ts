import { expect, test } from '../../src/fixtures';

test.describe('Hybrid shop flow', () => {
  test('API seeds wallet and daily bonus, UI completes purchase @hybrid', async ({
    seededShopper,
    shopPage,
    profilePage,
    page,
  }) => {
    await shopPage.open();
    await shopPage.buyItem('coin-doubler');
    await shopPage.expectPurchaseMessage('Coin Doubler');

    await profilePage.open();
    await profilePage.expectPlayer(seededShopper.username, seededShopper.email);
    await profilePage.expectInventoryItem('coin-doubler');

    await expect
      .poll(async () => Number((await page.locator('#coin-balance').textContent()) ?? '0'))
      .toBeGreaterThanOrEqual(300);
  });
});
