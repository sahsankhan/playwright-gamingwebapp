import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LeaderboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/leaderboard.html');
    await expect(this.page.locator('[data-test="leaderboard-page"]')).toBeVisible();
  }

  async expectPlayerListed(username: string): Promise<void> {
    await expect(this.page.locator(`[data-test="leaderboard-player-${username}"]`)).toBeVisible();
  }

  async expectRankVisible(): Promise<void> {
    await expect(this.page.locator('[data-test="player-rank"]')).not.toHaveText('-');
  }
}
