import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import { siteContact } from "./lib/site-contact";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const testEmailInbox = process.env.TEST_EMAIL_INBOX ?? siteContact.email;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 240_000,
  expect: {
    timeout: 30_000,
  },
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      EMAIL_TEST_MODE: "true",
      TEST_EMAIL_INBOX: testEmailInbox,
      E2E_CHECKOUT_EMAIL: process.env.E2E_CHECKOUT_EMAIL ?? testEmailInbox,
    },
  },
});
