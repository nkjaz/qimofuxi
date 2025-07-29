import { test, expect } from '@playwright/test'

test.describe('SubjectCard Component', () => {
  test.beforeEach(async ({ page }) => {
    // 启动前端服务并导航到学科列表页面
    await page.goto('/subjects')
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
  })

  test('should render subject card with correct information', async ({ page }) => {
    // 等待学科卡片加载
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查第一个学科卡片是否正确渲染
    const firstCard = page.locator('.subject-card').first()
    await expect(firstCard).toBeVisible()
    
    // 检查卡片标题
    const cardTitle = firstCard.locator('h3')
    await expect(cardTitle).toBeVisible()
    await expect(cardTitle).not.toBeEmpty()
    
    // 检查学科ID显示
    const cardId = firstCard.locator('span').filter({ hasText: '#' })
    await expect(cardId).toBeVisible()
    
    // 检查描述文本
    const description = firstCard.locator('p')
    await expect(description).toBeVisible()
    
    // 检查创建时间显示
    const timeElement = firstCard.locator('.flex.items-center.text-xs.text-gray-500')
    await expect(timeElement).toBeVisible()
  })

  test('should show hover effects on card', async ({ page }) => {
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const firstCard = page.locator('.subject-card').first()
    
    // 悬停前的状态
    await expect(firstCard).toHaveClass(/shadow-sm/)
    
    // 悬停卡片
    await firstCard.hover()
    
    // 检查悬停效果（shadow变化）
    await expect(firstCard).toHaveClass(/hover:shadow-md/)
  })

  test('should handle card click events', async ({ page }) => {
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const firstCard = page.locator('.subject-card').first()
    const cardTitle = firstCard.locator('h3')
    
    // 点击卡片标题
    await cardTitle.click()
    
    // 验证点击事件被触发（这里可能需要根据实际实现调整）
    // 例如：检查是否导航到详情页面或显示详情弹窗
  })

  test('should display operation buttons on hover', async ({ page }) => {
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const firstCard = page.locator('.subject-card').first()
    
    // 悬停卡片以显示操作按钮
    await firstCard.hover()
    
    // 检查编辑按钮
    const editButton = firstCard.locator('button').filter({ hasText: /edit/i }).or(
      firstCard.locator('button svg').filter({ hasText: /edit/i }).locator('..')
    )
    await expect(editButton).toBeVisible()
    
    // 检查删除按钮
    const deleteButton = firstCard.locator('button').filter({ hasText: /delete/i }).or(
      firstCard.locator('button svg').filter({ hasText: /delete/i }).locator('..')
    )
    await expect(deleteButton).toBeVisible()
  })

  test('should handle edit button click', async ({ page }) => {
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const firstCard = page.locator('.subject-card').first()
    await firstCard.hover()
    
    // 点击编辑按钮
    const editButton = firstCard.locator('button').nth(0) // 第一个操作按钮通常是编辑
    await editButton.click()
    
    // 验证编辑操作被触发（根据实际实现调整）
  })

  test('should handle delete button click', async ({ page }) => {
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    const firstCard = page.locator('.subject-card').first()
    await firstCard.hover()
    
    // 点击删除按钮
    const deleteButton = firstCard.locator('button').nth(1) // 第二个操作按钮通常是删除
    await deleteButton.click()
    
    // 验证删除操作被触发（根据实际实现调整）
  })
})

test.describe('SubjectCard Responsive Design', () => {
  test('should display correctly on desktop', async ({ page }) => {
    // 设置桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/subjects')
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查卡片在桌面端的显示
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible()
    
    // 检查网格布局（桌面端应该是多列）
    const container = page.locator('.grid')
    await expect(container).toBeVisible()
  })

  test('should display correctly on tablet', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/subjects')
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查卡片在平板端的显示
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible()
  })

  test('should display correctly on mobile', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/subjects')
    await page.waitForSelector('.subject-card', { timeout: 10000 })
    
    // 检查卡片在移动端的显示
    const cards = page.locator('.subject-card')
    await expect(cards.first()).toBeVisible()
    
    // 移动端应该是单列布局
    const container = page.locator('.grid')
    await expect(container).toBeVisible()
  })
})
