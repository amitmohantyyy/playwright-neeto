import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

export const STORAGE_STATE = "./auth/session.json";
dotenv.config({ path: ".env" })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,

  expect: { timeout: 25 * 1000 },

  timeout: 60 * 1000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /*Sets 'data-cy' as the getByTestId*/
    testIdAttribute: 'data-cy',
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://neeto-form-web-playwright.neetodeployapp.com/login',

    trace: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "login",
      use: { ...devices['Desktop Chrome']},
      testMatch: "**/login.setup.ts",
    },

    {
      name: "teardown",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/global.teardown.ts",
    },

    {
      name: "Logged in tests",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["login"],
      teardown: "teardown",
      testMatch: "**/*.spec.ts",
    },
  ],
});
