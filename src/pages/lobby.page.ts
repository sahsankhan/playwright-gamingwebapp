import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LobbyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/lobby.html');
    await expect(this.page.locator('[data-test="lobby-page"]')).toBeVisible();
  }

  async expectLoaded(username: string): Promise<void> {
    await expect(this.page.locator('[data-test="lobby-page"]')).toBeVisible();
    await expect(this.page.locator('[data-test="portal-username"]')).toHaveText(username);
  }

  async claimDailyBonus(): Promise<void> {
    await this.clickTestId('claim-daily-bonus');
  }

  async expectDailyBonusClaimed(): Promise<void> {
    await expect(this.page.locator('[data-test="daily-bonus-message"]')).toContainText(/Bonus claimed/i);
    await expect(this.page.locator('[data-test="claim-daily-bonus"]')).toBeDisabled();
  }

  async expectDailyBonusError(message: string | RegExp): Promise<void> {
    await expect(this.page.locator('[data-test="daily-bonus-message"]')).toHaveText(message);
  }

  async filterGames(genre: 'all' | 'Arcade' | 'Runner'): Promise<void> {
    const map = {
      all: 'filter-all',
      Arcade: 'filter-arcade',
      Runner: 'filter-runner',
    } as const;
    await this.clickTestId(map[genre]);
  }

  async openGameDetails(slug: string): Promise<void> {
    await this.clickTestId(`details-${slug}`);
    await expect(this.page.locator('[data-test="game-details-modal"]')).toHaveClass(/open/);
  }

  async launchFromModal(): Promise<void> {
    await this.clickTestId('launch-from-modal');
  }

  async playGame(slug: string): Promise<void> {
    await this.clickTestId(`play-${slug}`);
  }

  async goToShop(): Promise<void> {
    await this.clickTestId('nav-shop');
  }
}
