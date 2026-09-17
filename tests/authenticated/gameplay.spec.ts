import { test } from '../../src/fixtures';

test.describe('Gameplay smoke', () => {
  test('authenticated player can start, pause, and finish a session @smoke', async ({ page, gamePage }) => {
    await page.goto('/lobby.html');
    await page.locator('[data-test="play-brick-blitz"]').click();

    await gamePage.expectCanvasVisible();
    await gamePage.selectDifficulty('normal');
    await gamePage.startSession();
    await gamePage.expectPlaying();
    await gamePage.expectScoreGreaterThan(0);
    await gamePage.pauseGame();
    await gamePage.expectPaused();
    await gamePage.endSession();
    await gamePage.expectResultsModal();
  });

  test('simulate mode completes a session for CI @smoke', async ({ gamePage }) => {
    await gamePage.open('brick-blitz', true);
    await gamePage.expectCanvasVisible();
    await gamePage.expectPlaying();
    await gamePage.expectScoreGreaterThan(0);
    await gamePage.expectResultsModal();
  });
});
