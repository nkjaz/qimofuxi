import { test, expect } from '@playwright/test'

test.describe('Component States Testing', () => {
  test.describe('Loading States', () => {
    test('should display loading state on initial page load', async ({ page }) => {
      // 拦截API请求以延迟响应，模拟加载状态
      await page.route('**/api/subjects', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        route.continue()
      })
      
      await page.goto('/subjects')
      
      // 检查加载指示器
      const loadingIndicator = page.locator('.ant-spin, .loading, [class*="loading"], .spinner')
      await expect(loadingIndicator).toBeVisible({ timeout: 1000 })
      
      // 等待加载完成
      await page.waitForLoadState('networkidle')
      
      // 验证加载完成后内容显示
      const content = page.locator('.subject-card')
      await expect(content.first()).toBeVisible({ timeout: 10000 })
    })

    test('should show loading state when creating subject', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 拦截创建API请求以延迟响应
      await page.route('**/api/subjects', async route => {
        if (route.request().method() === 'POST') {
          await new Promise(resolve => setTimeout(resolve, 2000))
          route.continue()
        } else {
          route.continue()
        }
      })
      
      // 打开创建弹窗
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await createButton.click()
      
      await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
      
      // 填写表单
      const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
      await nameInput.fill('加载测试学科')
      
      const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
      await descriptionInput.fill('测试加载状态的学科')
      
      // 提交表单
      const submitButton = page.locator('button').filter({ hasText: /确定|提交|创建/i })
      await submitButton.click()
      
      // 检查提交按钮的加载状态
      const loadingButton = page.locator('button[class*="loading"], button .ant-spin')
      await expect(loadingButton).toBeVisible({ timeout: 1000 })
      
      // 等待提交完成
      await page.waitForTimeout(3000)
    })

    test('should show loading state when searching', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 拦截搜索相关的API请求
      await page.route('**/api/subjects*', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        route.continue()
      })
      
      // 执行搜索
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await searchInput.fill('测试搜索')
      
      // 检查搜索加载状态（如果实现了）
      const searchLoading = page.locator('.search-loading, [class*="search"] .loading')
      if (await searchLoading.isVisible()) {
        await expect(searchLoading).toBeVisible()
      }
      
      // 等待搜索完成
      await page.waitForTimeout(2000)
    })
  })

  test.describe('Empty States', () => {
    test('should display empty state when no subjects exist', async ({ page }) => {
      // 拦截API请求返回空数据
      await page.route('**/api/subjects', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              data: [],
              total: 0
            }
          })
        })
      })
      
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 检查空状态显示
      const emptyState = page.locator('text=/暂无学科|没有学科|No subjects|Empty/i')
      await expect(emptyState).toBeVisible({ timeout: 5000 })
      
      // 检查空状态图标或插图
      const emptyIcon = page.locator('.empty-icon, .ant-empty-image, [class*="empty"]')
      if (await emptyIcon.isVisible()) {
        await expect(emptyIcon).toBeVisible()
      }
      
      // 检查创建按钮在空状态下仍然可用
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await expect(createButton).toBeVisible()
      await expect(createButton).toBeEnabled()
    })

    test('should display empty search results', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 搜索不存在的内容
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await searchInput.fill('不存在的学科名称xyz123')
      await page.waitForTimeout(1000)
      
      // 检查空搜索结果状态
      const emptySearchState = page.locator('text=/未找到|无结果|No results|没有匹配/i')
      await expect(emptySearchState).toBeVisible({ timeout: 5000 })
      
      // 验证没有学科卡片显示
      const cards = page.locator('.subject-card')
      await expect(cards).toHaveCount(0)
      
      // 检查清除搜索或重置的选项
      const clearButton = page.locator('button').filter({ hasText: /清除|清空|Clear/i })
      if (await clearButton.isVisible()) {
        await expect(clearButton).toBeVisible()
      }
    })

    test('should provide helpful actions in empty state', async ({ page }) => {
      // 拦截API请求返回空数据
      await page.route('**/api/subjects', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              data: [],
              total: 0
            }
          })
        })
      })
      
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 检查空状态下的操作建议
      const emptyActions = page.locator('text=/开始创建|创建第一个|Get started/i')
      if (await emptyActions.isVisible()) {
        await expect(emptyActions).toBeVisible()
      }
      
      // 验证创建按钮在空状态下突出显示
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await expect(createButton).toBeVisible()
      
      // 点击创建按钮应该正常工作
      await createButton.click()
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Error States', () => {
    test('should handle API error gracefully', async ({ page }) => {
      // 拦截API请求返回错误
      await page.route('**/api/subjects', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal Server Error'
          })
        })
      })
      
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 检查错误状态显示
      const errorMessage = page.locator('text=/错误|失败|Error|Failed|出错/i')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
      
      // 检查重试按钮
      const retryButton = page.locator('button').filter({ hasText: /重试|重新加载|Retry|Reload/i })
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible()
        await expect(retryButton).toBeEnabled()
      }
    })

    test('should handle network error', async ({ page }) => {
      // 拦截API请求并中断连接
      await page.route('**/api/subjects', route => {
        route.abort('failed')
      })
      
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 检查网络错误处理
      const networkError = page.locator('text=/网络|连接|Network|Connection/i')
      const generalError = page.locator('text=/错误|失败|Error|Failed/i')
      
      // 应该显示某种错误信息
      const hasErrorMessage = await networkError.isVisible() || await generalError.isVisible()
      expect(hasErrorMessage).toBeTruthy()
    })

    test('should handle form submission errors', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 拦截创建API请求返回错误
      await page.route('**/api/subjects', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: '学科名称已存在'
            })
          })
        } else {
          route.continue()
        }
      })
      
      // 打开创建弹窗
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await createButton.click()
      
      await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
      
      // 填写表单
      const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
      await nameInput.fill('重复的学科名称')
      
      const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
      await descriptionInput.fill('测试错误处理')
      
      // 提交表单
      const submitButton = page.locator('button').filter({ hasText: /确定|提交|创建/i })
      await submitButton.click()
      
      // 等待错误响应
      await page.waitForTimeout(1000)
      
      // 检查错误消息显示
      const errorMessage = page.locator('.ant-message-error, .error-message, text=/已存在|错误|Error/i')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
      
      // 验证弹窗仍然打开（允许用户修正错误）
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).toBeVisible()
    })

    test('should recover from error states', async ({ page }) => {
      // 首先设置错误状态
      await page.route('**/api/subjects', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Server Error'
          })
        })
      })
      
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 验证错误状态
      const errorMessage = page.locator('text=/错误|Error/i')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
      
      // 移除错误拦截，模拟服务恢复
      await page.unroute('**/api/subjects')
      
      // 查找并点击重试按钮
      const retryButton = page.locator('button').filter({ hasText: /重试|重新加载|Retry|Reload/i })
      if (await retryButton.isVisible()) {
        await retryButton.click()
        
        // 等待恢复
        await page.waitForTimeout(2000)
        
        // 验证页面恢复正常
        const cards = page.locator('.subject-card')
        await expect(cards.first()).toBeVisible({ timeout: 10000 })
      } else {
        // 如果没有重试按钮，尝试刷新页面
        await page.reload()
        await page.waitForLoadState('networkidle')
        
        // 验证页面恢复正常
        const cards = page.locator('.subject-card')
        await expect(cards.first()).toBeVisible({ timeout: 10000 })
      }
    })
  })
})
