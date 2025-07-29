import { test, expect } from '@playwright/test'

test.describe('CreateSubjectModal Component', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到学科列表页面
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
  })

  test('should open modal when create button is clicked', async ({ page }) => {
    // 查找并点击创建学科按钮
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await expect(createButton).toBeVisible()
    await createButton.click()
    
    // 验证弹窗是否打开
    const modal = page.locator('.ant-modal').or(page.locator('[role="dialog"]'))
    await expect(modal).toBeVisible()
    
    // 检查弹窗标题
    const modalTitle = page.locator('.ant-modal-title').or(page.locator('h2, h3').filter({ hasText: /创建|新增/i }))
    await expect(modalTitle).toBeVisible()
  })

  test('should display form fields correctly', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    // 等待弹窗加载
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 检查学科名称输入框
    const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
    await expect(nameInput).toBeVisible()
    
    // 检查描述输入框
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
    await expect(descriptionInput).toBeVisible()
    
    // 检查提交按钮
    const submitButton = page.locator('button').filter({ hasText: /确定|提交|创建/i })
    await expect(submitButton).toBeVisible()
    
    // 检查取消按钮
    const cancelButton = page.locator('button').filter({ hasText: /取消|关闭/i })
    await expect(cancelButton).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 尝试提交空表单
    const submitButton = page.locator('button').filter({ hasText: /确定|提交|创建/i })
    await submitButton.click()
    
    // 检查验证错误信息
    const errorMessage = page.locator('.ant-form-item-explain-error, .error-message, .text-red-500')
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
  })

  test('should show character count for name field', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 在名称输入框中输入文本
    const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
    await nameInput.fill('测试学科名称')
    
    // 检查字符计数显示
    const charCount = page.locator('text=/\\d+\\/\\d+/')
    await expect(charCount).toBeVisible()
  })

  test('should show character count for description field', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 在描述输入框中输入文本
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
    await descriptionInput.fill('这是一个测试学科的描述信息')
    
    // 检查字符计数显示
    const charCount = page.locator('text=/\\d+\\/\\d+/')
    await expect(charCount).toBeVisible()
  })

  test('should show real-time preview', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 填写表单数据
    const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
    await nameInput.fill('测试学科')
    
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
    await descriptionInput.fill('这是测试学科的描述')
    
    // 检查预览区域是否显示输入的内容
    const preview = page.locator('.preview, .ant-card').filter({ hasText: /预览|Preview/i })
    if (await preview.isVisible()) {
      await expect(preview).toContainText('测试学科')
      await expect(preview).toContainText('这是测试学科的描述')
    }
  })

  test('should create subject successfully', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 填写有效的表单数据
    const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
    await nameInput.fill('Playwright测试学科')
    
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
    await descriptionInput.fill('这是通过Playwright自动化测试创建的学科')
    
    // 提交表单
    const submitButton = page.locator('button').filter({ hasText: /确定|提交|创建/i })
    await submitButton.click()
    
    // 等待提交完成（可能显示加载状态）
    await page.waitForTimeout(2000)
    
    // 验证弹窗关闭
    const modal = page.locator('.ant-modal, [role="dialog"]')
    await expect(modal).not.toBeVisible({ timeout: 5000 })
    
    // 验证成功消息或新学科出现在列表中
    const successMessage = page.locator('.ant-message-success, .success-message')
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible()
    } else {
      // 检查新创建的学科是否出现在列表中
      await page.waitForTimeout(1000)
      const newSubject = page.locator('.subject-card').filter({ hasText: 'Playwright测试学科' })
      await expect(newSubject).toBeVisible({ timeout: 5000 })
    }
  })

  test('should close modal when cancel button is clicked', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 点击取消按钮
    const cancelButton = page.locator('button').filter({ hasText: /取消|关闭/i })
    await cancelButton.click()
    
    // 验证弹窗关闭
    const modal = page.locator('.ant-modal, [role="dialog"]')
    await expect(modal).not.toBeVisible()
  })

  test('should close modal when clicking outside', async ({ page }) => {
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 点击弹窗外部区域
    const modalMask = page.locator('.ant-modal-mask')
    if (await modalMask.isVisible()) {
      await modalMask.click()
      
      // 验证弹窗关闭
      const modal = page.locator('.ant-modal, [role="dialog"]')
      await expect(modal).not.toBeVisible()
    }
  })
})

test.describe('CreateSubjectModal Responsive Design', () => {
  test('should display correctly on mobile devices', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/subjects')
    await page.waitForLoadState('networkidle')
    
    // 打开创建弹窗
    const createButton = page.locator('button').filter({ hasText: /创建|新增|添加/i })
    await createButton.click()
    
    await page.waitForSelector('.ant-modal, [role="dialog"]', { timeout: 5000 })
    
    // 检查弹窗在移动端的显示
    const modal = page.locator('.ant-modal, [role="dialog"]')
    await expect(modal).toBeVisible()
    
    // 检查表单字段是否正确显示
    const nameInput = page.locator('input[placeholder*="名称"], input[name="name"]')
    await expect(nameInput).toBeVisible()
    
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[name="description"]')
    await expect(descriptionInput).toBeVisible()
  })
})
