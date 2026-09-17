import { injectSession } from '../../src/api/gaming-api';
import { test } from '../../src/fixtures';

test.describe('Hybrid game flow', () => {
  test('API seeds player state, UI runs game session @hybrid', async ({ gamingApi, page, gamePage }) => {
    const seed = await gamingApi.seedGameReadyPlayer('hybrid_game');
    await injectSession(page, seed.token, seed.user);

    await gamePage.open('brick-blitz');
    await gamePage.selectDifficulty('normal');
    await gamePage.startSession();
    await gamePage.expectPlaying();
    await gamePage.expectScoreGreaterThan(0);
    await gamePage.endSession();
    await gamePage.expectResultsModal();
  });
});
