// 端到端测试环境配置
import { test as base, expect, Page, BrowserContext } from '@playwright/test'

// 扩展测试上下文
export const test = base.extend<{
  // 自定义页面对象，包含常用的页面操作
  appPage: AppPage
}>({
  appPage: async ({ page }, use) => {
    const appPage = new AppPage(page)
    await use(appPage)
  }
})

export { expect }

// 应用页面对象模型
export class AppPage {
  constructor(public readonly page: Page) {}

  // 导航到首页
  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  // 等待页面加载完成
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForTimeout(1000) // 等待动画完成
  }

  // 获取页面标题
  async getTitle() {
    return await this.page.title()
  }

  // 检查元素是否可见
  async isVisible(selector: string) {
    return await this.page.isVisible(selector)
  }

  // 点击元素
  async click(selector: string) {
    await this.page.click(selector)
  }

  // 填写表单字段
  async fill(selector: string, value: string) {
    await this.page.fill(selector, value)
  }

  // 等待元素出现
  async waitForSelector(selector: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(selector, options)
  }

  // 等待文本出现
  async waitForText(text: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(`text=${text}`, options)
  }

  // 获取元素文本
  async getText(selector: string) {
    return await this.page.textContent(selector)
  }

  // 获取元素数量
  async getElementCount(selector: string) {
    return await this.page.locator(selector).count()
  }

  // 截图
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` })
  }

  // 等待API响应
  async waitForAPIResponse(url: string) {
    return await this.page.waitForResponse(response => 
      response.url().includes(url) && response.status() === 200
    )
  }

  // 模拟网络错误
  async simulateNetworkError() {
    await this.page.route('**/api/**', route => route.abort())
  }

  // 恢复网络连接
  async restoreNetwork() {
    await this.page.unroute('**/api/**')
  }
}

// 测试数据工厂
export class TestDataFactory {
  static createSubjectData(overrides: Partial<{
    name: string
    description: string
  }> = {}) {
    return {
      name: overrides.name || `测试学科_${Date.now()}`,
      description: overrides.description || `这是一个端到端测试创建的学科，创建时间：${new Date().toLocaleString()}`
    }
  }

  static createInvalidSubjectData() {
    return {
      name: '', // 空名称
      description: 'A'.repeat(1001) // 超长描述
    }
  }

  static createDuplicateSubjectData() {
    return {
      name: '重复学科名称',
      description: '用于测试重复名称验证的学科'
    }
  }
}

// 测试工具函数
export class TestUtils {
  // 等待指定时间
  static async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 生成随机字符串
  static randomString(length: number = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 格式化时间戳
  static formatTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-')
  }
}

// 页面选择器常量
export const SELECTORS = {
  // 导航相关
  HOME_LINK: '[data-testid="home-link"]',
  SUBJECTS_LINK: '[data-testid="subjects-link"]',
  
  // 学科列表页面
  SUBJECT_LIST_CONTAINER: '[data-testid="subject-list-container"]',
  SUBJECT_COUNT: '[data-testid="subject-count"]',
  CREATE_SUBJECT_BUTTON: '[data-testid="create-subject-button"]',
  SEARCH_INPUT: '[data-testid="search-input"]',
  VIEW_TOGGLE_GRID: '[data-testid="view-toggle-grid"]',
  VIEW_TOGGLE_LIST: '[data-testid="view-toggle-list"]',
  
  // 学科卡片
  SUBJECT_CARD: '[data-testid="subject-card"]',
  SUBJECT_CARD_TITLE: '[data-testid="subject-card-title"]',
  SUBJECT_CARD_DESCRIPTION: '[data-testid="subject-card-description"]',
  SUBJECT_CARD_EDIT: '[data-testid="subject-card-edit"]',
  SUBJECT_CARD_DELETE: '[data-testid="subject-card-delete"]',
  
  // 创建学科弹窗
  CREATE_MODAL: '[data-testid="create-subject-modal"]',
  MODAL_TITLE: '[data-testid="modal-title"]',
  NAME_INPUT: '[data-testid="name-input"]',
  DESCRIPTION_INPUT: '[data-testid="description-input"]',
  NAME_COUNTER: '[data-testid="name-counter"]',
  DESCRIPTION_COUNTER: '[data-testid="description-counter"]',
  PREVIEW_SECTION: '[data-testid="preview-section"]',
  PREVIEW_NAME: '[data-testid="preview-name"]',
  PREVIEW_DESCRIPTION: '[data-testid="preview-description"]',
  SUBMIT_BUTTON: '[data-testid="submit-button"]',
  CANCEL_BUTTON: '[data-testid="cancel-button"]',
  
  // 消息提示
  SUCCESS_MESSAGE: '.ant-message-success',
  ERROR_MESSAGE: '.ant-message-error',
  LOADING_SPINNER: '.ant-spin-spinning',
  
  // 通用
  MODAL_MASK: '.ant-modal-mask',
  MODAL_CLOSE: '.ant-modal-close'
} as const

// 测试配置常量
export const TEST_CONFIG = {
  DEFAULT_TIMEOUT: 10000,
  NETWORK_TIMEOUT: 5000,
  ANIMATION_TIMEOUT: 500,
  API_TIMEOUT: 3000,
  
  // 测试数据限制
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  
  // 性能基准
  PAGE_LOAD_TIME_LIMIT: 3000,
  API_RESPONSE_TIME_LIMIT: 2000
} as const
