import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/settings.html');
    await expect(this.page.locator('[data-test="settings-page"]')).toBeVisible();
  }

  async selectAvatar(avatar: 'rookie' | 'veteran' | 'legend'): Promise<void> {
    await this.page.locator('[data-test="avatar-select"]').selectOption(avatar);
  }

  async save(): Promise<void> {
    await this.clickTestId('save-settings');
  }

  async expectSaved(avatar: string): Promise<void> {
    await expect(this.page.locator('[data-test="settings-message"]')).toContainText(`Avatar updated to ${avatar}`);
  }
}
