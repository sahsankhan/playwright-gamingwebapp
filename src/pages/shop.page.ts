import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ShopPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/shop.html');
    await expect(this.page.locator('[data-test="shop-page"]')).toBeVisible();
  }

  async buyItem(itemId: string): Promise<void> {
    await this.clickTestId(`buy-${itemId}`);
  }

  async expectPurchaseMessage(name: string): Promise<void> {
    await expect(this.page.locator('[data-test="shop-message"]')).toContainText(`Purchased ${name}`);
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.page.locator('[data-test="shop-message"]')).toHaveText(message);
  }

  async expectItemOwned(itemId: string): Promise<void> {
    const button = this.page.locator(`[data-test="buy-${itemId}"]`);
    await expect(button).toBeDisabled();
    await expect(button).toHaveText('Owned');
  }
}
