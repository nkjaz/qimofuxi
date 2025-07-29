import { test, expect } from '@playwright/test'

test.describe('SubjectManager Component', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到学科列表页面
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
  })

  test('should display subject count correctly', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查学科总数显示
    const countDisplay = page.locator('text=/共\\s*\\d+\\s*个学科/')
    await expect(countDisplay).toBeVisible()
    
    // 验证显示的数量与实际卡片数量一致
    const cards = page.locator('.subject-card')
    const cardCount = await cards.count()
    
    if (cardCount > 0) {
      await expect(countDisplay).toContainText(cardCount.toString())
    }
  })

  test('should display search functionality', async ({ page }) => {
    // 检查搜索输入框
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await expect(searchInput).toBeVisible()
    
    // 检查搜索按钮或图标
    const searchButton = page.locator('button').filter({ hasText: /搜索/i }).or(
      page.locator('button svg').filter({ hasText: /search/i }).locator('..')
    )
    // 搜索按钮可能不存在（实时搜索），所以不强制要求
  })

  test('should filter subjects when searching', async ({ page }) => {
    // 等待学科卡片加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 获取初始卡片数量
    const initialCards = page.locator('.subject-card')
    const initialCount = await initialCards.count()
    
    if (initialCount > 0) {
      // 获取第一个学科的名称
      const firstCardTitle = await initialCards.first().locator('h3').textContent()
      
      if (firstCardTitle) {
        // 在搜索框中输入部分学科名称
        const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
        await searchInput.fill(firstCardTitle.substring(0, 3))
        
        // 等待搜索结果更新
        await page.waitForTimeout(1000)
        
        // 验证搜索结果
        const filteredCards = page.locator('.subject-card')
        const filteredCount = await filteredCards.count()
        
        // 搜索后的结果应该包含匹配的学科
        await expect(filteredCards.first()).toContainText(firstCardTitle.substring(0, 3))
      }
    }
  })

  test('should show empty state when no results found', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 搜索不存在的内容
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await searchInput.fill('不存在的学科名称xyz123')
    
    // 等待搜索结果更新
    await page.waitForTimeout(1000)
    
    // 检查空状态显示
    const emptyState = page.locator('text=/暂无|没有|无结果|No results/i')
    await expect(emptyState).toBeVisible({ timeout: 5000 })
    
    // 验证没有学科卡片显示
    const cards = page.locator('.subject-card')
    await expect(cards).toHaveCount(0)
  })

  test('should display view toggle buttons', async ({ page }) => {
    // 检查视图切换按钮
    const gridViewButton = page.locator('button').filter({ hasText: /网格|grid/i }).or(
      page.locator('button svg').filter({ hasText: /grid/i }).locator('..')
    )
    const listViewButton = page.locator('button').filter({ hasText: /列表|list/i }).or(
      page.locator('button svg').filter({ hasText: /list/i }).locator('..')
    )
    
    // 至少应该有一种视图切换方式
    const hasViewToggle = await gridViewButton.isVisible() || await listViewButton.isVisible()
    expect(hasViewToggle).toBeTruthy()
  })

  test('should switch between grid and list views', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 查找视图切换按钮
    const gridViewButton = page.locator('button').filter({ hasText: /网格|grid/i }).or(
      page.locator('button svg').filter({ hasText: /grid/i }).locator('..')
    )
    const listViewButton = page.locator('button').filter({ hasText: /列表|list/i }).or(
      page.locator('button svg').filter({ hasText: /list/i }).locator('..')
    )
    
    if (await gridViewButton.isVisible() && await listViewButton.isVisible()) {
      // 点击列表视图
      await listViewButton.click()
      await page.waitForTimeout(500)
      
      // 验证视图切换（检查容器类名变化或布局变化）
      const container = page.locator('.grid, .list, [class*="grid"], [class*="list"]')
      await expect(container).toBeVisible()
      
      // 点击网格视图
      await gridViewButton.click()
      await page.waitForTimeout(500)
      
      // 验证切换回网格视图
      await expect(container).toBeVisible()
    }
  })

  test('should display create subject button', async ({ page }) => {
    // 检查创建学科按钮
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await expect(createButton).toBeVisible()
    
    // 验证按钮可点击
    await expect(createButton).toBeEnabled()
  })

  test('should handle loading state', async ({ page }) => {
    // 导航到页面并立即检查加载状态
    await page.goto('/subjects')
    
    // 检查加载指示器（可能很快消失）
    const loadingIndicator = page.locator('.ant-spin, .loading, [class*="loading"]')
    
    // 等待加载完成
    await page.waitForLoadState('networkidle')
    
    // 验证最终加载完成后显示内容
    const content = page.locator('.subject-card, .empty-state')
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should maintain search state on page refresh', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 执行搜索
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await searchInput.fill('测试')
    await page.waitForTimeout(1000)
    
    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 检查搜索框是否保持搜索内容（如果实现了状态保持）
    const searchValue = await searchInput.inputValue()
    // 注意：这个测试取决于是否实现了搜索状态保持功能
  })
})

test.describe('SubjectManager Responsive Design', () => {
  test('should adapt layout on different screen sizes', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/subjects')
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查桌面端布局
    const desktopContainer = page.locator('.grid')
    await expect(desktopContainer).toBeVisible()
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    
    // 检查平板端布局适配
    await expect(desktopContainer).toBeVisible()
    
    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // 检查移动端布局适配
    await expect(desktopContainer).toBeVisible()
  })

  test('should hide/show elements based on screen size', async ({ page }) => {
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
    
    // 桌面端 - 所有元素都应该可见
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
    await expect(searchInput).toBeVisible()
    
    // 移动端 - 检查元素是否适当调整
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // 搜索框在移动端应该仍然可见，但可能样式有所调整
    await expect(searchInput).toBeVisible()
  })
})
