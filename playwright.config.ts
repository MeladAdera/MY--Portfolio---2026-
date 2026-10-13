import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

/* Software WebGL so the three.js scenes can mount in headless Chromium. */
const webglArgs = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 240_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: webglArgs } },
    },
    {
      name: 'chromium-reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
        launchOptions: { args: webglArgs },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { args: webglArgs } },
    },
  ],
});
