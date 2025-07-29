// 端到端测试全局清理
import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始端到端测试全局清理...')

  // 计算测试总时间
  const startTime = parseInt(process.env.E2E_START_TIME || '0')
  const endTime = Date.now()
  const totalTime = endTime - startTime

  console.log(`⏱️  端到端测试总耗时: ${Math.round(totalTime / 1000)}秒`)

  // 生成测试摘要报告
  const summaryReport = {
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    totalTime: totalTime,
    testEnvironment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    configuration: {
      baseURL: config.use?.baseURL,
      browsers: config.projects?.map(p => p.name) || [],
      workers: config.workers,
      retries: config.retries
    }
  }

  // 保存测试摘要
  const summaryPath = path.join(__dirname, '../../test-results/e2e/test-summary.json')
  try {
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2))
    console.log('📊 测试摘要已保存到:', summaryPath)
  } catch (error) {
    console.log('⚠️  无法保存测试摘要:', error)
  }

  // 清理临时文件
  const tempDir = path.join(__dirname, '../../test-results/temp')
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
      console.log('🗑️  临时文件已清理')
    } catch (error) {
      console.log('⚠️  清理临时文件失败:', error)
    }
  }

  // 清理环境变量
  delete process.env.E2E_TEST_RUNNING
  delete process.env.E2E_START_TIME

  console.log('✅ 端到端测试全局清理完成')
}

export default globalTeardown
