import { defineConfig } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end tests. The "app" project runs offline: the anime APIs are mocked in the browser
 * (see e2e/support/mock-api.ts). The "live" project talks to the real AniList API.
 * Set PW_CHANNEL=msedge or PW_CHANNEL=chrome to use an installed browser instead of
 * Playwright's own Chromium (`npx playwright install chromium`).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PW_CHANNEL || undefined,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "app", testIgnore: /live\.spec\.ts/ },
    { name: "live", testMatch: /live\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
