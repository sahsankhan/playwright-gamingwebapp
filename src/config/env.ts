import 'dotenv/config';
import type { AppConfig, EnvironmentName } from './types';

const environments: Record<EnvironmentName, Omit<AppConfig, 'timeouts'>> = {
  local: {
    name: 'local',
    baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
    demoPort: Number(process.env.DEMO_PORT ?? 3000),
  },
  staging: {
    name: 'staging',
    baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
    demoPort: Number(process.env.DEMO_PORT ?? 3000),
  },
};

function resolveEnvName(): EnvironmentName {
  const raw = (process.env.TEST_ENV ?? 'local').toLowerCase();
  if (raw === 'local' || raw === 'staging') {
    return raw;
  }
  throw new Error(`Unknown TEST_ENV "${raw}". Use local or staging.`);
}

export function loadConfig(): AppConfig {
  const name = resolveEnvName();
  const base = environments[name];

  return {
    ...base,
    baseUrl: process.env.BASE_URL ?? base.baseUrl,
    demoPort: Number(process.env.DEMO_PORT ?? base.demoPort),
    timeouts: {
      actionMs: Number(process.env.ACTION_TIMEOUT_MS ?? 15_000),
      navigationMs: Number(process.env.NAVIGATION_TIMEOUT_MS ?? 30_000),
      healMs: Number(process.env.HEAL_TIMEOUT_MS ?? 3_000),
    },
  };
}

export const config = loadConfig();
