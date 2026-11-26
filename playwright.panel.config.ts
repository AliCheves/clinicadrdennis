import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Pruebas del panel: requieren Supabase LOCAL con la semilla de demo (npm run db:demo).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PUERTO = 3101;

export default defineConfig({
  testDir: "tests/e2e-panel",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "playwright-report-panel" }]] : "list",
  use: { baseURL: `http://localhost:${PUERTO}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
