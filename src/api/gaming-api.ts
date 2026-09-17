import { APIRequestContext } from '@playwright/test';
import { config } from '../config/env';

export type RegisteredPlayer = {
  username: string;
  email: string;
  password: string;
  token: string;
};

export type SeededPlayer = RegisteredPlayer & {
  user: {
    email: string;
    username: string;
    highScore: number;
    coins: number;
    avatar: string;
    inventory: string[];
    dailyBonusClaimedAt: string | null;
    gamesPlayed: number;
    totalScore: number;
    activeBoost: string | null;
  };
};

export class GamingApi {
  constructor(private readonly request: APIRequestContext) {}

  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async register(username: string, email: string, password: string): Promise<RegisteredPlayer> {
    const response = await this.request.post(`${config.baseUrl}/api/register`, {
      data: { username, email, password },
    });

    if (!response.ok()) {
      throw new Error(`Register failed: ${response.status()} ${await response.text()}`);
    }

    const body = await response.json();
    return {
      username,
      email,
      password,
      token: body.token,
    };
  }

  async login(email: string, password: string): Promise<{ token: string; username: string }> {
    const response = await this.request.post(`${config.baseUrl}/api/login`, {
      data: { email, password },
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
    }

    const body = await response.json();
    return {
      token: body.token,
      username: body.user.username,
    };
  }

  async getMe(token: string): Promise<SeededPlayer['user']> {
    const response = await this.request.get(`${config.baseUrl}/api/me`, {
      headers: this.authHeaders(token),
    });

    if (!response.ok()) {
      throw new Error(`Profile fetch failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  async claimDailyBonus(token: string): Promise<{ coins: number; coinsAwarded: number }> {
    const response = await this.request.post(`${config.baseUrl}/api/daily-bonus`, {
      headers: this.authHeaders(token),
    });

    if (!response.ok()) {
      throw new Error(`Daily bonus failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  async purchaseItem(token: string, itemId: string): Promise<{ item: { name: string }; inventory: string[] }> {
    const response = await this.request.post(`${config.baseUrl}/api/shop/purchase`, {
      headers: this.authHeaders(token),
      data: { itemId },
    });

    if (!response.ok()) {
      throw new Error(`Purchase failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  async setWalletCoins(token: string, coins: number): Promise<SeededPlayer['user']> {
    const response = await this.request.patch(`${config.baseUrl}/api/test/wallet`, {
      headers: this.authHeaders(token),
      data: { coins },
    });

    if (!response.ok()) {
      throw new Error(`Wallet seed failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  async seedShopReadyPlayer(prefix = 'seed_shop'): Promise<SeededPlayer> {
    const player = uniquePlayer(prefix);
    const registered = await this.register(player.username, player.email, player.password);
    await this.claimDailyBonus(registered.token);
    const user = await this.getMe(registered.token);

    return {
      ...registered,
      user,
    };
  }

  async seedLowBalancePlayer(coins = 10, prefix = 'seed_low'): Promise<SeededPlayer> {
    const player = uniquePlayer(prefix);
    const registered = await this.register(player.username, player.email, player.password);
    const user = await this.setWalletCoins(registered.token, coins);

    return {
      ...registered,
      user,
    };
  }

  async seedGameReadyPlayer(prefix = 'seed_game'): Promise<SeededPlayer> {
    const seeded = await this.seedShopReadyPlayer(prefix);
    const user = await this.setWalletCoins(seeded.token, 1000);
    return { ...seeded, user };
  }
}

export function uniquePlayer(prefix = 'player'): { username: string; email: string; password: string } {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
  return {
    username: `${prefix}_${stamp}`,
    email: `${prefix}_${stamp}@arcade.test`,
    password: 'Passw0rd!',
  };
}

export async function injectSession(
  page: { addInitScript: (script: (...args: unknown[]) => void, arg: unknown) => Promise<void> },
  token: string,
  user: SeededPlayer['user'],
): Promise<void> {
  await page.addInitScript(
    ({ sessionToken, sessionUser }) => {
      window.localStorage.setItem('arcade-token', sessionToken);
      window.localStorage.setItem('arcade-user', JSON.stringify(sessionUser));
    },
    { sessionToken: token, sessionUser: user },
  );
}
