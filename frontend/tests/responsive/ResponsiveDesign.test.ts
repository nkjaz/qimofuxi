import { test, expect } from '@playwright/test'

// 定义常用的视口尺寸
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 }
}

test.describe('Responsive Design Testing', () => {
  test.describe('Desktop Layout (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop)
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
    })

    test('should display multi-column grid layout', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 检查网格容器
      const gridContainer = page.locator('.grid')
      await expect(gridContainer).toBeVisible()
      
      // 检查是否有多列布局（桌面端应该显示3-4列）
      const cards = page.locator('.subject-card')
      const cardCount = await cards.count()
      
      if (cardCount >= 4) {
        // 检查第一行是否有多个卡片
        const firstRowCards = cards.locator('nth-child(-n+4)')
        await expect(firstRowCards.first()).toBeVisible()
        await expect(firstRowCards.nth(1)).toBeVisible()
        await expect(firstRowCards.nth(2)).toBeVisible()
      }
    })

    test('should display all UI elements properly', async ({ page }) => {
      // 检查搜索框
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await expect(searchInput).toBeVisible()
      
      // 检查创建按钮
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await expect(createButton).toBeVisible()
      
      // 检查视图切换按钮（如果有）
      const viewToggle = page.locator('button').filter({ hasText: /网格|列表|grid|list/i })
      if (await viewToggle.first().isVisible()) {
        await expect(viewToggle.first()).toBeVisible()
      }
      
      // 检查学科计数显示
      const countDisplay = page.locator('text=/共\\s*\\d+\\s*个学科/')
      await expect(countDisplay).toBeVisible()
    })

    test('should handle hover effects properly', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      const firstCard = page.locator('.subject-card').first()
      
      // 悬停前检查初始状态
      await expect(firstCard).toHaveClass(/shadow-sm/)
      
      // 悬停卡片
      await firstCard.hover()
      
      // 检查悬停效果
      await expect(firstCard).toHaveClass(/hover:shadow-md/)
      
      // 检查操作按钮是否显示
      const operationButtons = firstCard.locator('button')
      const buttonCount = await operationButtons.count()
      
      if (buttonCount > 0) {
        await expect(operationButtons.first()).toBeVisible()
      }
    })
  })

  test.describe('Tablet Layout (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet)
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
    })

    test('should adapt to tablet layout', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 检查平板端布局（应该是2列）
      const gridContainer = page.locator('.grid')
      await expect(gridContainer).toBeVisible()
      
      // 检查卡片是否正确显示
      const cards = page.locator('.subject-card')
      await expect(cards.first()).toBeVisible()
      
      // 检查卡片尺寸是否适合平板
      const firstCard = cards.first()
      const cardBox = await firstCard.boundingBox()
      
      if (cardBox) {
        // 平板端卡片宽度应该合理（大约是视口宽度的一半减去间距）
        expect(cardBox.width).toBeGreaterThan(300)
        expect(cardBox.width).toBeLessThan(400)
      }
    })

    test('should maintain functionality on tablet', async ({ page }) => {
      // 检查搜索功能
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await expect(searchInput).toBeVisible()
      await searchInput.fill('平板测试')
      await page.waitForTimeout(500)
      
      // 检查创建功能
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await expect(createButton).toBeVisible()
      await createButton.click()
      
      // 检查弹窗在平板端的显示
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
      
      // 检查弹窗尺寸是否适合平板
      const modalBox = await modal.boundingBox()
      if (modalBox) {
        expect(modalBox.width).toBeLessThan(viewports.tablet.width)
        expect(modalBox.height).toBeLessThan(viewports.tablet.height)
      }
    })

    test('should handle touch interactions', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      const firstCard = page.locator('.subject-card').first()
      
      // 测试触摸点击
      await firstCard.tap()
      
      // 测试长按（如果实现了）
      await firstCard.tap({ timeout: 1000 })
      
      // 验证触摸交互正常工作
      await expect(firstCard).toBeVisible()
    })
  })

  test.describe('Mobile Layout (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile)
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
    })

    test('should display single column layout', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 检查移动端单列布局
      const gridContainer = page.locator('.grid')
      await expect(gridContainer).toBeVisible()
      
      // 检查卡片是否占据大部分宽度
      const firstCard = page.locator('.subject-card').first()
      const cardBox = await firstCard.boundingBox()
      
      if (cardBox) {
        // 移动端卡片应该接近全宽
        expect(cardBox.width).toBeGreaterThan(300)
      }
    })

    test('should optimize UI for mobile', async ({ page }) => {
      // 检查搜索框在移动端的显示
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await expect(searchInput).toBeVisible()
      
      // 检查创建按钮
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await expect(createButton).toBeVisible()
      
      // 检查按钮是否足够大以便触摸
      const buttonBox = await createButton.boundingBox()
      if (buttonBox) {
        // 移动端按钮应该至少44px高（Apple推荐的最小触摸目标）
        expect(buttonBox.height).toBeGreaterThan(40)
      }
    })

    test('should handle mobile modal correctly', async ({ page }) => {
      // 打开创建弹窗
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await createButton.click()
      
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
      
      // 检查弹窗在移动端的适配
      const modalBox = await modal.boundingBox()
      if (modalBox) {
        // 移动端弹窗应该适合屏幕
        expect(modalBox.width).toBeLessThan(viewports.mobile.width)
        expect(modalBox.height).toBeLessThan(viewports.mobile.height)
      }
      
      // 检查表单字段在移动端的显示
      const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
      await expect(nameInput).toBeVisible()
      
      const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
      await expect(descriptionInput).toBeVisible()
      
      // 测试移动端输入
      await nameInput.tap()
      await nameInput.fill('移动端测试学科')
      
      await descriptionInput.tap()
      await descriptionInput.fill('移动端创建测试')
      
      // 检查输入是否正常
      await expect(nameInput).toHaveValue('移动端测试学科')
      await expect(descriptionInput).toHaveValue('移动端创建测试')
    })

    test('should support mobile gestures', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 测试滚动
      await page.evaluate(() => {
        window.scrollTo(0, 200)
      })
      
      await page.waitForTimeout(500)
      
      // 验证滚动后页面仍然正常
      const cards = page.locator('.subject-card')
      await expect(cards.first()).toBeVisible()
      
      // 测试下拉刷新（如果实现了）
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      
      // 模拟下拉手势
      await page.touchscreen.tap(200, 100)
      await page.touchscreen.tap(200, 200)
    })
  })

  test.describe('Large Desktop Layout (2560x1440)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.largeDesktop)
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
    })

    test('should utilize large screen space effectively', async ({ page }) => {
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 检查大屏幕下的布局（应该显示更多列）
      const gridContainer = page.locator('.grid')
      await expect(gridContainer).toBeVisible()
      
      // 检查是否有更多列的布局
      const cards = page.locator('.subject-card')
      const cardCount = await cards.count()
      
      if (cardCount >= 6) {
        // 检查第一行是否显示更多卡片
        for (let i = 0; i < Math.min(6, cardCount); i++) {
          await expect(cards.nth(i)).toBeVisible()
        }
      }
    })

    test('should maintain readability on large screens', async ({ page }) => {
      // 检查内容是否居中或有合适的最大宽度
      const mainContent = page.locator('main, .main-content, .content')
      await expect(mainContent).toBeVisible()
      
      // 检查文本是否保持可读性
      const firstCard = page.locator('.subject-card').first()
      const cardTitle = firstCard.locator('h3')
      
      // 检查字体大小是否合适
      const titleStyles = await cardTitle.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight
        }
      })
      
      // 字体大小应该在合理范围内
      const fontSize = parseInt(titleStyles.fontSize)
      expect(fontSize).toBeGreaterThan(14)
      expect(fontSize).toBeLessThan(32)
    })
  })

  test.describe('Viewport Transitions', () => {
    test('should handle viewport size changes smoothly', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 从桌面端开始
      await page.setViewportSize(viewports.desktop)
      await page.waitForSelector('.subject-card', { timeout: 10000 })
      
      // 切换到平板端
      await page.setViewportSize(viewports.tablet)
      await page.waitForTimeout(500)
      
      // 验证布局适配
      const cards = page.locator('.subject-card')
      await expect(cards.first()).toBeVisible()
      
      // 切换到移动端
      await page.setViewportSize(viewports.mobile)
      await page.waitForTimeout(500)
      
      // 验证移动端布局
      await expect(cards.first()).toBeVisible()
      
      // 切换回桌面端
      await page.setViewportSize(viewports.desktop)
      await page.waitForTimeout(500)
      
      // 验证回到桌面端布局
      await expect(cards.first()).toBeVisible()
    })

    test('should maintain functionality across viewport changes', async ({ page }) => {
      await page.goto('/subjects')
      await page.waitForLoadState('networkidle')
      
      // 在桌面端执行搜索
      await page.setViewportSize(viewports.desktop)
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]')
      await searchInput.fill('响应式测试')
      await page.waitForTimeout(500)
      
      // 切换到移动端，验证搜索状态保持
      await page.setViewportSize(viewports.mobile)
      await page.waitForTimeout(500)
      
      // 验证搜索框仍然可见且保持搜索内容
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveValue('响应式测试')
      
      // 在移动端打开创建弹窗
      const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
      await createButton.click()
      
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
      
      // 切换回桌面端，验证弹窗仍然打开
      await page.setViewportSize(viewports.desktop)
      await page.waitForTimeout(500)
      
      await expect(modal).toBeVisible()
    })
  })
})
