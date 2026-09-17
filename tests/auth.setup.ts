import { test as setup } from '@playwright/test';
import { GamingApi, uniquePlayer } from '../src/api/gaming-api';
import { LoginPage } from '../src/pages/login.page';
import { LobbyPage } from '../src/pages/lobby.page';

const authFile = 'playwright/.auth/player.json';

setup('authenticate player @auth', async ({ page, request }) => {
  const api = new GamingApi(request);
  const player = uniquePlayer('authed');
  await api.register(player.username, player.email, player.password);

  const loginPage = new LoginPage(page);
  const lobbyPage = new LobbyPage(page);

  await loginPage.open();
  await loginPage.login(player.email, player.password);
  await lobbyPage.expectLoaded(player.username);

  await page.context().storageState({ path: authFile });
});
