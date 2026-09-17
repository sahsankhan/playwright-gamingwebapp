import { uniquePlayer } from '../../src/api/gaming-api';
import { test } from '../../src/fixtures';

test.describe('Login', () => {
  test('valid credentials open the lobby @smoke @auth', async ({ gamingApi, loginPage, lobbyPage }) => {
    const player = uniquePlayer('login_ok');
    await gamingApi.register(player.username, player.email, player.password);

    await loginPage.open();
    await loginPage.login(player.email, player.password);
    await lobbyPage.expectLoaded(player.username);
  });

  test('invalid password shows an error @smoke @auth', async ({ gamingApi, loginPage }) => {
    const player = uniquePlayer('login_bad');
    await gamingApi.register(player.username, player.email, player.password);

    await loginPage.open();
    await loginPage.login(player.email, 'wrong-password');
    await loginPage.expectError(/Invalid email or password/);
  });
});
