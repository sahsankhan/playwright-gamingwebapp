import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class GamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(slug: string, simulate = false): Promise<void> {
    const query = simulate ? `?slug=${slug}&simulate=true` : `?slug=${slug}`;
    await this.page.goto(`/game.html${query}`);
    await expect(this.page.locator('[data-test="game-page"]')).toBeVisible();
  }

  async selectDifficulty(level: 'easy' | 'normal' | 'hard'): Promise<void> {
    await this.page.locator('[data-test="difficulty-select"]').selectOption(level);
  }

  async startSession(): Promise<void> {
    await this.clickTestId('start-game-btn');
  }

  async pauseGame(): Promise<void> {
    await this.clickTestId('pause-game-btn');
  }

  async endSession(): Promise<void> {
    await this.clickTestId('end-game-btn');
  }

  async expectPlaying(): Promise<void> {
    await expect(this.page.locator('[data-test="game-status"]')).toHaveAttribute('data-state', 'playing');
  }

  async expectPaused(): Promise<void> {
    await expect(this.page.locator('[data-test="game-status"]')).toHaveAttribute('data-state', 'paused');
  }

  async expectResultsModal(): Promise<void> {
    await expect(this.page.locator('[data-test="results-modal"]')).toHaveClass(/open/);
  }

  async expectScoreGreaterThan(value: number): Promise<void> {
    await expect
      .poll(async () => Number(await this.page.locator('[data-test="game-score"]').textContent()))
      .toBeGreaterThan(value);
  }

  async expectCanvasVisible(): Promise<void> {
    await expect(this.page.locator('[data-test="game-canvas"]')).toBeVisible();
  }

  async expectSessionBlocked(message: string | RegExp): Promise<void> {
    await expect(this.page.locator('[data-test="session-copy"]')).toHaveText(message);
    await expect(this.page.locator('[data-test="game-status"]')).toHaveAttribute('data-state', 'idle');
  }
}
