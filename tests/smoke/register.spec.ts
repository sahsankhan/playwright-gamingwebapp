import { uniquePlayer } from '../../src/api/gaming-api';
import { test } from '../../src/fixtures';

test.describe('Registration', () => {
  test('new player can register and reach the lobby @smoke @auth', async ({ registerPage, lobbyPage }) => {
    const player = uniquePlayer('register');

    await registerPage.open();
    await registerPage.register(player.username, player.email, player.password);

    await lobbyPage.expectLoaded(player.username);
  });
});
