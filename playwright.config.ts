import type { PlaywrightTestConfig } from "@playwright/test"

const port = process.env.CI ? 4173 : 5173
const baseURL = `http://localhost:${port}`

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  outputDir: "test-results",
  testDir: "tests",
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI ? "npm run preview" : "npm run dev",
    port,
    reuseExistingServer: !process.env.CI,
  },
}
export default config
