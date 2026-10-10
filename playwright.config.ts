import { defineConfig } from "@playwright/test"

// Tests run against the production build (`vite preview`), the same static
// output Firebase serves.
const port = 4173

export default defineConfig({
  testDir: "tests",
  testMatch: /.*\.test\.ts/,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  outputDir: "test-results",
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
})
