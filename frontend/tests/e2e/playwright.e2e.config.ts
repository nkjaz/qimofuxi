// 端到端测试专用Playwright配置
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: '.',

  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report/e2e' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }]
  ],

  // 全局配置
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 等待策略
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // 浏览器设置
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // 自定义用户代理
    userAgent: 'E2E-Test-Agent/1.0'
  },

  // 项目配置 - 多浏览器测试
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    // 移动设备测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // 平板设备测试
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // Web服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,

    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:3001'
    }
  },

  // 输出目录
  outputDir: 'test-results/e2e',

  // 测试超时
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000
  },

  // 全局设置和清理
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts'
})
