// Playwright配置文件
// 配置API测试环境和参数

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // 测试目录
  testDir: './tests',

  // 测试文件匹配模式
  testMatch: '**/*.test.js',

  // 全局超时设置
  timeout: 30000,

  // 期望超时设置
  expect: {
    timeout: 5000
  },

  // 并发设置
  fullyParallel: false,

  // 失败重试次数
  retries: 2,

  // 工作进程数
  workers: 1,

  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // 输出目录
  outputDir: 'test-results/',

  // 全局设置
  use: {
    // API测试基础URL
    baseURL: 'http://localhost:3001',

    // 请求超时
    timeout: 10000,

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 额外HTTP头
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },

  // 项目配置
  projects: [
    {
      name: 'API Tests',
      testDir: './tests/api',
      use: {
        baseURL: 'http://localhost:3001'
      }
    }
  ],

  // 全局设置和清理
  globalSetup: require.resolve('./tests/global-setup.js'),
  globalTeardown: require.resolve('./tests/global-teardown.js')
});
