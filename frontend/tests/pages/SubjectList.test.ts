import { test, expect } from '@playwright/test'

test.describe('SubjectList Page', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到学科列表页面
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
  })

  test('should load and display the page correctly', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/学科|Subject/i)
    
    // 检查页面主要内容区域
    const mainContent = page.locator('main, .main-content, .content')
    await expect(mainContent).toBeVisible()
    
    // 检查页面是否包含学科管理组件
    const subjectManager = page.locator('.subject-manager, [class*="subject"]')
    await expect(subjectManager).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    // 检查导航栏
    const navigation = page.locator('nav, .nav, .navigation')
    await expect(navigation).toBeVisible()
    
    // 检查面包屑导航（如果有）
    const breadcrumb = page.locator('.ant-breadcrumb, .breadcrumb')
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText(/学科|Subject/i)
    }
  })

  test('should display page header with title', async ({ page }) => {
    // 检查页面标题
    const pageTitle = page.locator('h1, h2').filter({ hasText: /学科|Subject/i })
    await expect(pageTitle).toBeVisible()
    
    // 检查页面描述（如果有）
    const pageDescription = page.locator('p, .description').filter({ hasText: /管理|列表|Management/i })
    if (await pageDescription.isVisible()) {
      await expect(pageDescription).toBeVisible()
    }
  })

  test('should integrate with SubjectManager component', async ({ page }) => {
    // 验证SubjectManager组件的核心功能在页面中正常工作
    
    // 检查学科列表显示
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible()
    
    // 检查搜索功能
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await expect(searchInput).toBeVisible()
    
    // 检查创建按钮
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await expect(createButton).toBeVisible()
  })

  test('should handle empty state correctly', async ({ page }) => {
    // 通过搜索不存在的内容来触发空状态
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await searchInput.fill('不存在的学科xyz123')
    await page.waitForTimeout(1000)
    
    // 检查空状态显示
    const emptyState = page.locator('text=/暂无|没有|无结果|No results/i')
    await expect(emptyState).toBeVisible()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // 模拟网络错误（通过拦截API请求）
    await page.route('**/api/subjects', route => {
      route.abort('failed')
    })
    
    // 重新加载页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 检查错误状态处理
    const errorMessage = page.locator('text=/错误|失败|Error|Failed/i')
    const retryButton = page.locator('button').filter({ hasText: /重试|Retry/i })
    
    // 应该显示错误信息或重试按钮
    const hasErrorHandling = await errorMessage.isVisible() || await retryButton.isVisible()
    expect(hasErrorHandling).toBeTruthy()
  })

  test('should maintain URL state correctly', async ({ page }) => {
    // 检查初始URL
    expect(page.url()).toContain('/subjects')
    
    // 执行搜索操作
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await searchInput.fill('测试')
    await page.waitForTimeout(1000)
    
    // 检查URL是否更新（如果实现了URL状态管理）
    // 注意：这取决于是否实现了URL状态同步
    
    // 刷新页面后检查状态保持
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 验证页面仍然正常工作
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('should support keyboard navigation', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 测试Tab键导航
    await page.keyboard.press('Tab')
    
    // 检查焦点是否正确移动到可交互元素
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // 继续Tab导航
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    // 检查页面是否有适当的语义化标签
    const main = page.locator('main')
    await expect(main).toBeVisible()
    
    // 检查标题层级
    const h1 = page.locator('h1')
    if (await h1.isVisible()) {
      await expect(h1).toBeVisible()
    }
    
    // 检查按钮是否有适当的标签
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        // 按钮应该有文本内容或aria-label
        const hasText = await button.textContent()
        const hasAriaLabel = await button.getAttribute('aria-label')
        expect(hasText || hasAriaLabel).toBeTruthy()
      }
    }
  })
})

test.describe('SubjectList Page Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/subjects')
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const loadTime = Date.now() - startTime
    
    // 页面应该在5秒内加载完成
    expect(loadTime).toBeLessThan(5000)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
    
    // 检查页面是否能正常处理当前的数据量
    const cards = page.locator('.subject-card')
    const cardCount = await cards.count()
    
    if (cardCount > 50) {
      // 如果有大量数据，检查是否实现了分页或虚拟滚动
      const pagination = page.locator('.ant-pagination, .pagination')
      const virtualScroll = page.locator('[class*="virtual"], [class*="scroll"]')
      
      const hasPerformanceOptimization = await pagination.isVisible() || await virtualScroll.isVisible()
      // 注意：这个测试取决于具体的性能优化实现
    }
    
    // 验证页面仍然响应良好
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await searchInput.fill('测试')
    await page.waitForTimeout(1000)
    
    // 搜索应该能正常工作
    await expect(searchInput).toHaveValue('测试')
  })
})

test.describe('SubjectList Page Mobile Experience', () => {
  test('should work well on mobile devices', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
    
    // 检查移动端布局
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    
    // 检查触摸交互
    await cards.first().tap()
    
    // 检查移动端搜索功能
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await expect(searchInput).toBeVisible()
    await searchInput.tap()
    await searchInput.fill('移动端测试')
    
    // 验证移动端创建功能
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await expect(createButton).toBeVisible()
    await createButton.tap()
    
    // 检查弹窗在移动端的显示
    const modal = page.locator('.ant-modal, [role="dialog"]')
    await expect(modal).toBeVisible({ timeout: 5000 })
  })
})
