import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/register.html');
    await expect(this.page.locator('[data-test="register-page"]')).toBeVisible();
  }

  async register(username: string, email: string, password: string): Promise<void> {
    await this.fillTestId('register-username', username);
    await this.fillTestId('register-email', email);
    await this.fillTestId('register-password', password);
    await this.clickTestId('register-submit');
  }
}
