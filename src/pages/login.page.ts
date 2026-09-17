import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/login.html');
    await expect(this.page.locator('[data-test="login-page"]')).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillTestId('login-email', email);
    await this.fillTestId('login-password', password);
    await this.clickTestId('login-submit');
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.page.locator('[data-test="login-error"]')).toHaveText(message);
  }
}
