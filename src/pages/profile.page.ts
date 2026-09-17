import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/profile.html');
    await expect(this.page.locator('[data-test="profile-page"]')).toBeVisible();
  }

  async expectPlayer(username: string, email: string): Promise<void> {
    await expect(this.page.locator('[data-test="profile-page"]')).toBeVisible();
    await expect(this.page.locator('[data-test="profile-username"]')).toHaveText(username);
    await expect(this.page.locator('[data-test="profile-email"]')).toHaveText(email);
  }

  async expectInventoryItem(itemId: string): Promise<void> {
    await expect(this.page.locator(`[data-test="inventory-${itemId}"]`)).toBeVisible();
  }

  async expectAvatar(avatar: string): Promise<void> {
    await expect(this.page.locator('[data-test="profile-avatar"]')).toHaveText(avatar);
  }
}
