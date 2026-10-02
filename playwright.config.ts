import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';

const isCi = Boolean(process.env.CI);
const isSequential = process.env.SEQUENTIAL === '1' || process.env.SEQUENTIAL === 'true';
const authFile = 'playwright/.auth/player.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: !isSequential,
  forbidOnly: isCi,
  retries: isCi ? 2 : 1,
  workers: isSequential ? 1 : isCi ? 2 : undefined,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: isCi ? [['html', { open: 'never' }], ['github'], ['list']] : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: config.baseUrl,
    actionTimeout: config.timeouts.actionMs,
    navigationTimeout: config.timeouts.navigationMs,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  webServer: {
    command: 'node demo-app/server.js',
    url: `${config.baseUrl}/health`,
    reuseExistingServer: !isCi,
    timeout: 120_000,
    env: {
      PORT: String(config.demoPort),
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /(smoke|e2e|hybrid)\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      testMatch: /(smoke|e2e|hybrid)\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testMatch: /(smoke|e2e|hybrid)\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'chromium-authenticated',
      testMatch: /authenticated\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },
  ],
});
