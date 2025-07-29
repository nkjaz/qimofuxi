// 端到端测试全局设置
import { chromium, FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始端到端测试全局设置...')

  // 创建测试结果目录
  const testResultsDir = path.join(__dirname, '../../test-results/e2e')
  const screenshotsDir = path.join(testResultsDir, 'screenshots')

  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true })
  }

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  // 等待服务启动
  console.log('⏳ 等待前端服务启动...')
  const browser = await chromium.launch()
  const page = await browser.newPage()

  let retries = 0
  const maxRetries = 30

  while (retries < maxRetries) {
    try {
      const response = await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle',
        timeout: 5000
      })

      if (response && response.status() === 200) {
        console.log('✅ 前端服务已启动')
        break
      }
    } catch (error) {
      retries++
      console.log(`⏳ 等待前端服务启动... (${retries}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  if (retries >= maxRetries) {
    throw new Error('❌ 前端服务启动超时')
  }

  // 检查后端API服务
  console.log('⏳ 检查后端API服务...')
  try {
    const response = await page.goto('http://localhost:3001/health', {
      timeout: 5000
    })

    if (response && response.status() === 200) {
      console.log('✅ 后端API服务正常')
    } else {
      console.log('⚠️  后端API服务可能未启动，某些测试可能失败')
    }
  } catch (error) {
    console.log('⚠️  无法连接到后端API服务，某些测试可能失败')
  }

  await browser.close()

  // 设置测试环境变量
  process.env.E2E_TEST_RUNNING = 'true'
  process.env.E2E_START_TIME = Date.now().toString()

  console.log('✅ 端到端测试全局设置完成')
}

export default globalSetup
