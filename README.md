# Playwright gaming web automation

 **API sets up state, UI proves the gaming journey**. Auth, lobby, shop, gameplay session, profile, and leaderboard.

Target app: bundled **Arcade Portal** demo (`demo-app/`) — runs at `http://localhost:3000` via Playwright `webServer`.

## What this shows

| Piece | Where |
|---|---|
| POM | `src/pages` |
| Fixtures | `src/fixtures` (`gamingApi`, `seededShopper`, page objects) |
| Typed config + env switch | `src/config` (`TEST_ENV=local` or `staging`) |
| API seeding | `src/api/gaming-api.ts` — register, wallet, shop, session setup |
| Hybrid flows | `tests/hybrid/` — API setup → UI verification |
| Negative cases | `tests/smoke/negative.spec.ts` |
| Auth reuse | `tests/auth.setup.ts` + `storageState` |
| Self-heal | `src/healing/locator.ts` — try `data-test`, then fallbacks |
| E2E journey | Register → bonus → shop → game → profile → leaderboard |

## E2E flow

1. `POST /api/register` (unique player each run)
2. Claim daily bonus or seed wallet via API
3. Inject `arcade-token` + `arcade-user` (localStorage) when using hybrid fixtures
4. UI: lobby → shop purchase / game session → profile / leaderboard
5. Game session: select difficulty → start → pause → end → results modal

Hybrid example:

```typescript
const seed = await gamingApi.seedShopReadyPlayer();
await injectSession(page, seed.token, seed.user);
await shopPage.open();
await shopPage.buyItem('coin-doubler');
```

Test wallet seeding: `PATCH /api/test/wallet` (set `ALLOW_TEST_SEED=false` to disable).

## Setup

```bash
npm install
npx playwright install chromium firefox webkit
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`.

## Run

```bash
npm run demo            # Arcade Portal only
npm test                # Chromium suite (starts demo via webServer)
npm run test:cross-browser   # same smoke, hybrid, and e2e tests on Chromium, Firefox, and WebKit
npm run test:smoke      # smoke + authenticated tests
npm run test:hybrid     # API seed + UI flows
npm run test:negative   # edge cases
npm run test:e2e        # serial player journey
npm run test:sequential # one worker, one test at a time
npm run test:headed
npm run report          # open HTML report
```

## Cross-browser

`npm test` stays on Chromium. That includes the signed-in tests.

`npm run test:cross-browser` runs the same smoke, hybrid, and end-to-end tests on three browsers:

| Project | Browser |
|---|---|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `webkit` | Desktop Safari |

The signed-in project is Chromium only. It reuses a saved login, so it is not repeated on Firefox or WebKit.

CI installs Chromium, Firefox, and WebKit, runs `npm test`, then runs the Firefox and WebKit projects.

Switch environment:

```bash
# PowerShell
$env:TEST_ENV="staging"; npm test
```

`staging` uses `BASE_URL` / `DEMO_PORT` from `.env`.

Sequential run (local debugging):

```bash
npm run test:sequential
```

Or:

```powershell
$env:SEQUENTIAL="1"; npx playwright test --workers=1
```

## Report

Every `npm test` run generates a Playwright HTML report. Failed tests attach screenshot, video, and trace (on retry).

| Output | Path |
|---|---|
| HTML report | `playwright-report/index.html` |
| Trace / screenshot / video | `test-results/` |

Open the last HTML report:

```bash
npm run report
```

On Windows:

```powershell
start playwright-report\index.html
```

On macOS: `open playwright-report/index.html`. On Linux: `xdg-open playwright-report/index.html`.

## Layout

```
demo-app/           Arcade Portal (login, lobby, shop, canvas game)
src/config          typed env
src/api             GamingApi client + seed helpers
src/fixtures        Playwright fixtures
src/healing         locator fallback helper
src/pages           page objects
tests/smoke         auth, lobby, shop, negative
tests/hybrid        API setup + UI verification
tests/e2e           serial player journey
tests/authenticated gameplay + profile (storageState)
tests/auth.setup.ts auth state for authenticated project
```

## CI

GitHub Actions runs the Chromium suite, then the same smoke, hybrid, and end-to-end tests on Firefox and WebKit. `CI=true` adds retries and the GitHub reporter. Artifacts:

| Artifact | Contents |
|---|---|
| `playwright-report` | `playwright-report/` (HTML) + `test-results/` (trace, screenshots, video) |

Download the artifact from the Actions run → open `playwright-report/index.html` in a browser.
