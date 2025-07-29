#!/usr/bin/env node

// 端到端测试运行脚本
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置选项
const config = {
  // 测试配置文件
  configFile: path.join(__dirname, 'playwright.e2e.config.ts'),

  // 默认选项
  defaultOptions: [
    '--config', 'playwright.e2e.config.ts',
    '--reporter=html,json,junit'
  ],

  // 环境变量
  env: {
    ...process.env,
    NODE_ENV: 'test',
    E2E_TEST_MODE: 'true'
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    browsers: [],
    grep: null,
    headed: false,
    debug: false,
    trace: false,
    workers: null,
    retries: null,
    timeout: null,
    help: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--browser':
      case '-b':
        options.browsers.push(args[++i])
        break
      case '--grep':
      case '-g':
        options.grep = args[++i]
        break
      case '--headed':
        options.headed = true
        break
      case '--debug':
        options.debug = true
        break
      case '--trace':
        options.trace = true
        break
      case '--workers':
      case '-w':
        options.workers = parseInt(args[++i])
        break
      case '--retries':
      case '-r':
        options.retries = parseInt(args[++i])
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i])
        break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        if (arg.startsWith('--')) {
          console.log(`未知选项: ${arg}`)
          process.exit(1)
        }
    }
  }

  return options
}

// 显示帮助信息
function showHelp() {
  console.log(`
端到端测试运行器

用法: node run-e2e-tests.js [选项]

选项:
  -b, --browser <name>     指定浏览器 (chromium, firefox, webkit, edge)
  -g, --grep <pattern>     只运行匹配的测试
  --headed                 显示浏览器窗口
  --debug                  启用调试模式
  --trace                  启用追踪模式
  -w, --workers <num>      并行工作进程数
  -r, --retries <num>      失败重试次数
  -t, --timeout <ms>       测试超时时间
  -h, --help               显示帮助信息

示例:
  node run-e2e-tests.js                           # 运行所有测试
  node run-e2e-tests.js --browser chromium        # 只在Chrome中运行
  node run-e2e-tests.js --grep "创建学科"          # 只运行包含"创建学科"的测试
  node run-e2e-tests.js --headed --debug          # 显示浏览器并启用调试
  node run-e2e-tests.js --workers 1 --retries 2   # 单进程运行，失败重试2次
`)
}

// 构建Playwright命令
function buildCommand(options) {
  const cmd = ['npx', 'playwright', 'test']

  // 添加配置文件
  cmd.push('--config', config.configFile)

  // 添加浏览器选项
  if (options.browsers.length > 0) {
    options.browsers.forEach(browser => {
      cmd.push('--project', browser)
    })
  }

  // 添加grep选项
  if (options.grep) {
    cmd.push('--grep', options.grep)
  }

  // 添加其他选项
  if (options.headed) {
    cmd.push('--headed')
  }

  if (options.debug) {
    cmd.push('--debug')
  }

  if (options.trace) {
    cmd.push('--trace', 'on')
  }

  if (options.workers) {
    cmd.push('--workers', options.workers.toString())
  }

  if (options.retries !== null) {
    cmd.push('--retries', options.retries.toString())
  }

  if (options.timeout) {
    cmd.push('--timeout', options.timeout.toString())
  }

  return cmd
}

// 运行测试
function runTests(command) {
  console.log('🚀 启动端到端测试...')
  console.log('📋 执行命令:', command.join(' '))
  console.log('')

  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    env: config.env,
    cwd: path.join(__dirname, '../..')
  })

  child.on('close', (code) => {
    console.log('')
    if (code === 0) {
      console.log('✅ 端到端测试完成')
      console.log('📊 查看测试报告: npx playwright show-report playwright-report/e2e')
    } else {
      console.log('❌ 端到端测试失败')
      console.log('🔍 查看失败详情: npx playwright show-report playwright-report/e2e')
      process.exit(code)
    }
  })

  child.on('error', (error) => {
    console.error('❌ 启动测试失败:', error.message)
    process.exit(1)
  })
}

// 主函数
function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  // 检查配置文件是否存在
  if (!fs.existsSync(config.configFile)) {
    console.error('❌ 配置文件不存在:', config.configFile)
    process.exit(1)
  }

  // 构建并运行命令
  const command = buildCommand(options)
  runTests(command)
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1])) {
  main()
}

export { parseArgs, buildCommand, runTests }
