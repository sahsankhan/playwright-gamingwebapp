import { test as base } from '@playwright/test';
import { GamingApi, injectSession, type SeededPlayer } from '../api/gaming-api';
import { GamePage } from '../pages/game.page';
import { LeaderboardPage } from '../pages/leaderboard.page';
import { LobbyPage } from '../pages/lobby.page';
import { LoginPage } from '../pages/login.page';
import { ProfilePage } from '../pages/profile.page';
import { RegisterPage } from '../pages/register.page';
import { SettingsPage } from '../pages/settings.page';
import { ShopPage } from '../pages/shop.page';

type GamingFixtures = {
  gamingApi: GamingApi;
  seededShopper: SeededPlayer;
  seededLowBalance: SeededPlayer;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  lobbyPage: LobbyPage;
  shopPage: ShopPage;
  settingsPage: SettingsPage;
  leaderboardPage: LeaderboardPage;
  gamePage: GamePage;
  profilePage: ProfilePage;
};

export const test = base.extend<GamingFixtures>({
  gamingApi: async ({ request }, use) => {
    await use(new GamingApi(request));
  },

  seededShopper: async ({ gamingApi, page }, use) => {
    const seed = await gamingApi.seedShopReadyPlayer();
    await injectSession(page, seed.token, seed.user);
    await use(seed);
  },

  seededLowBalance: async ({ gamingApi, page }, use) => {
    const seed = await gamingApi.seedLowBalancePlayer(10);
    await injectSession(page, seed.token, seed.user);
    await use(seed);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  lobbyPage: async ({ page }, use) => {
    await use(new LobbyPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  leaderboardPage: async ({ page }, use) => {
    await use(new LeaderboardPage(page));
  },
  gamePage: async ({ page }, use) => {
    await use(new GamePage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});

export { expect } from '@playwright/test';
