// 学科管理端到端测试
import { test, expect, AppPage, TestDataFactory, TestUtils, SELECTORS, TEST_CONFIG } from './setup'

test.describe('学科管理 - 端到端用户故事测试', () => {
  test.beforeEach(async ({ appPage }) => {
    // 每个测试前都导航到首页
    await appPage.goto()
  })

  test('完整用户故事：访问首页 → 创建学科 → 查看列表', async ({ appPage }) => {
    // 步骤1: 验证首页加载
    await test.step('验证首页正确加载', async () => {
      await appPage.waitForPageLoad()
      expect(await appPage.getTitle()).toContain('期末复习平台')

      // 验证导航链接存在
      await expect(appPage.page.locator(SELECTORS.SUBJECTS_LINK)).toBeVisible()
    })

    // 步骤2: 导航到学科管理页面
    await test.step('导航到学科管理页面', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()

      // 验证页面元素
      await expect(appPage.page.locator(SELECTORS.SUBJECT_LIST_CONTAINER)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.CREATE_SUBJECT_BUTTON)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.SUBJECT_COUNT)).toBeVisible()
    })

    // 步骤3: 记录创建前的学科数量
    let initialCount: number
    await test.step('记录初始学科数量', async () => {
      const countText = await appPage.getText(SELECTORS.SUBJECT_COUNT)
      initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0')
      console.log(`创建前学科数量: ${initialCount}`)
    })

    // 步骤4: 打开创建学科弹窗
    await test.step('打开创建学科弹窗', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)

      // 验证弹窗打开
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.MODAL_TITLE)).toContainText('创建学科')
      await expect(appPage.page.locator(SELECTORS.NAME_INPUT)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.DESCRIPTION_INPUT)).toBeVisible()
    })

    // 步骤5: 填写学科信息
    const testData = TestDataFactory.createSubjectData({
      name: `E2E测试学科_${TestUtils.formatTimestamp()}`,
      description: '这是一个端到端测试创建的学科，用于验证完整的用户操作流程。'
    })

    await test.step('填写学科信息', async () => {
      // 填写学科名称
      await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
      await expect(appPage.page.locator(SELECTORS.NAME_INPUT)).toHaveValue(testData.name)

      // 填写学科描述
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, testData.description)
      await expect(appPage.page.locator(SELECTORS.DESCRIPTION_INPUT)).toHaveValue(testData.description)

      // 验证字符计数器
      await expect(appPage.page.locator(SELECTORS.NAME_COUNTER)).toContainText(`${testData.name.length}`)
      await expect(appPage.page.locator(SELECTORS.DESCRIPTION_COUNTER)).toContainText(`${testData.description.length}`)
    })

    // 步骤6: 验证实时预览
    await test.step('验证实时预览功能', async () => {
      await expect(appPage.page.locator(SELECTORS.PREVIEW_SECTION)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.PREVIEW_NAME)).toContainText(testData.name)
      await expect(appPage.page.locator(SELECTORS.PREVIEW_DESCRIPTION)).toContainText(testData.description)
    })

    // 步骤7: 提交创建学科
    await test.step('提交创建学科', async () => {
      // 点击创建按钮
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      // 等待API响应
      await appPage.waitForAPIResponse('/api/subjects')

      // 验证成功提示
      await expect(appPage.page.locator(SELECTORS.SUCCESS_MESSAGE)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.SUCCESS_MESSAGE)).toContainText('学科创建成功')

      // 验证弹窗关闭
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()
    })

    // 步骤8: 验证学科出现在列表中
    await test.step('验证新学科出现在列表中', async () => {
      // 等待页面更新
      await appPage.waitForPageLoad()

      // 验证学科数量增加
      const newCountText = await appPage.getText(SELECTORS.SUBJECT_COUNT)
      const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0')
      expect(newCount).toBe(initialCount + 1)
      console.log(`创建后学科数量: ${newCount}`)

      // 验证新学科在列表中可见
      const subjectCards = appPage.page.locator(SELECTORS.SUBJECT_CARD)
      const cardCount = await subjectCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // 查找包含新学科名称的卡片
      const newSubjectCard = appPage.page.locator(SELECTORS.SUBJECT_CARD).filter({
        hasText: testData.name
      })
      await expect(newSubjectCard).toBeVisible()

      // 验证学科信息正确显示
      await expect(newSubjectCard.locator(SELECTORS.SUBJECT_CARD_TITLE)).toContainText(testData.name)
      await expect(newSubjectCard.locator(SELECTORS.SUBJECT_CARD_DESCRIPTION)).toContainText(testData.description)
    })

    // 步骤9: 验证数据持久化
    await test.step('验证数据持久化（页面刷新测试）', async () => {
      // 刷新页面
      await appPage.page.reload()
      await appPage.waitForPageLoad()

      // 验证学科仍然存在
      const persistedSubjectCard = appPage.page.locator(SELECTORS.SUBJECT_CARD).filter({
        hasText: testData.name
      })
      await expect(persistedSubjectCard).toBeVisible()

      // 验证学科数量保持一致
      const persistedCountText = await appPage.getText(SELECTORS.SUBJECT_COUNT)
      const persistedCount = parseInt(persistedCountText?.match(/\d+/)?.[0] || '0')
      expect(persistedCount).toBe(initialCount + 1)
    })
  })

  test('搜索功能测试', async ({ appPage }) => {
    await test.step('导航到学科列表页面', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()
    })

    await test.step('测试搜索功能', async () => {
      // 获取第一个学科的名称
      const firstSubjectCard = appPage.page.locator(SELECTORS.SUBJECT_CARD).first()
      await expect(firstSubjectCard).toBeVisible()

      const firstSubjectName = await firstSubjectCard.locator(SELECTORS.SUBJECT_CARD_TITLE).textContent()
      expect(firstSubjectName).toBeTruthy()

      // 搜索该学科
      await appPage.fill(SELECTORS.SEARCH_INPUT, firstSubjectName!)
      await appPage.waitForTimeout(TEST_CONFIG.ANIMATION_TIMEOUT)

      // 验证搜索结果
      const visibleCards = appPage.page.locator(SELECTORS.SUBJECT_CARD + ':visible')
      const visibleCount = await visibleCards.count()
      expect(visibleCount).toBeGreaterThan(0)

      // 验证搜索结果包含搜索关键词
      for (let i = 0; i < visibleCount; i++) {
        const cardTitle = await visibleCards.nth(i).locator(SELECTORS.SUBJECT_CARD_TITLE).textContent()
        expect(cardTitle?.toLowerCase()).toContain(firstSubjectName!.toLowerCase())
      }
    })
  })

  test('视图切换功能测试', async ({ appPage }) => {
    await test.step('导航到学科列表页面', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()
    })

    await test.step('测试网格视图和列表视图切换', async () => {
      // 验证默认为网格视图
      await expect(appPage.page.locator(SELECTORS.VIEW_TOGGLE_GRID)).toHaveClass(/active/)

      // 切换到列表视图
      await appPage.click(SELECTORS.VIEW_TOGGLE_LIST)
      await appPage.waitForTimeout(TEST_CONFIG.ANIMATION_TIMEOUT)
      await expect(appPage.page.locator(SELECTORS.VIEW_TOGGLE_LIST)).toHaveClass(/active/)

      // 切换回网格视图
      await appPage.click(SELECTORS.VIEW_TOGGLE_GRID)
      await appPage.waitForTimeout(TEST_CONFIG.ANIMATION_TIMEOUT)
      await expect(appPage.page.locator(SELECTORS.VIEW_TOGGLE_GRID)).toHaveClass(/active/)
    })
  })
})

test.describe('学科管理 - 边界条件和异常场景测试', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto()
    await appPage.click(SELECTORS.SUBJECTS_LINK)
    await appPage.waitForPageLoad()
  })

  test('创建重复名称学科测试', async ({ appPage }) => {
    // 创建第一个学科
    const testData = TestDataFactory.createDuplicateSubjectData()

    await test.step('创建第一个学科', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, testData.description)
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      await expect(appPage.page.locator(SELECTORS.SUCCESS_MESSAGE)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()
    })

    await test.step('尝试创建重复名称学科', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, '不同的描述内容')
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      // 验证错误提示
      await expect(appPage.page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.ERROR_MESSAGE)).toContainText('已存在')

      // 验证弹窗仍然打开
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()
    })
  })

  test('创建空名称学科测试', async ({ appPage }) => {
    await test.step('尝试创建空名称学科', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      // 只填写描述，名称留空
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, '只有描述没有名称的学科')
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      // 验证表单验证错误
      const nameInput = appPage.page.locator(SELECTORS.NAME_INPUT)
      await expect(nameInput).toHaveClass(/ant-input-status-error/)

      // 验证弹窗仍然打开
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()
    })
  })

  test('超长内容测试', async ({ appPage }) => {
    await test.step('测试超长名称和描述', async () => {
      const longName = 'A'.repeat(TEST_CONFIG.MAX_NAME_LENGTH + 10)
      const longDescription = 'B'.repeat(TEST_CONFIG.MAX_DESCRIPTION_LENGTH + 10)

      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      // 填写超长内容
      await appPage.fill(SELECTORS.NAME_INPUT, longName)
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, longDescription)

      // 验证字符计数器显示超限
      const nameCounter = await appPage.getText(SELECTORS.NAME_COUNTER)
      const descCounter = await appPage.getText(SELECTORS.DESCRIPTION_COUNTER)

      expect(nameCounter).toContain(`${longName.length}`)
      expect(descCounter).toContain(`${longDescription.length}`)

      // 尝试提交
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      // 验证表单验证阻止提交
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()
    })
  })

  test('网络错误处理测试', async ({ appPage }) => {
    await test.step('模拟网络错误', async () => {
      // 模拟网络错误
      await appPage.simulateNetworkError()

      const testData = TestDataFactory.createSubjectData({
        name: `网络错误测试_${TestUtils.formatTimestamp()}`
      })

      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, testData.description)
      await appPage.click(SELECTORS.SUBMIT_BUTTON)

      // 验证错误提示
      await expect(appPage.page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible()
      await expect(appPage.page.locator(SELECTORS.ERROR_MESSAGE)).toContainText('网络')

      // 恢复网络连接
      await appPage.restoreNetwork()
    })
  })

  test('弹窗取消和关闭测试', async ({ appPage }) => {
    await test.step('测试取消按钮', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      // 填写一些内容
      await appPage.fill(SELECTORS.NAME_INPUT, '测试取消功能')
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, '这些内容应该被清除')

      // 点击取消按钮
      await appPage.click(SELECTORS.CANCEL_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()

      // 重新打开弹窗，验证内容已清除
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      const nameValue = await appPage.page.locator(SELECTORS.NAME_INPUT).inputValue()
      const descValue = await appPage.page.locator(SELECTORS.DESCRIPTION_INPUT).inputValue()

      expect(nameValue).toBe('')
      expect(descValue).toBe('')
    })

    await test.step('测试点击遮罩关闭', async () => {
      // 点击遮罩关闭弹窗
      await appPage.page.locator(SELECTORS.MODAL_MASK).click()
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()
    })

    await test.step('测试ESC键关闭', async () => {
      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      // 按ESC键关闭
      await appPage.page.keyboard.press('Escape')
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()
    })
  })
})

test.describe('学科管理 - 性能测试', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto()
  })

  test('页面加载性能测试', async ({ appPage }) => {
    await test.step('测试首页加载时间', async () => {
      const startTime = Date.now()
      await appPage.goto()
      await appPage.waitForPageLoad()
      const loadTime = Date.now() - startTime

      console.log(`首页加载时间: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(TEST_CONFIG.PAGE_LOAD_TIME_LIMIT)
    })

    await test.step('测试学科列表页面加载时间', async () => {
      const startTime = Date.now()
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()
      const loadTime = Date.now() - startTime

      console.log(`学科列表页面加载时间: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(TEST_CONFIG.PAGE_LOAD_TIME_LIMIT)
    })
  })

  test('API响应性能测试', async ({ appPage }) => {
    await test.step('测试获取学科列表API性能', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)

      const startTime = Date.now()
      const response = await appPage.waitForAPIResponse('/api/subjects')
      const responseTime = Date.now() - startTime

      console.log(`获取学科列表API响应时间: ${responseTime}ms`)
      expect(responseTime).toBeLessThan(TEST_CONFIG.API_RESPONSE_TIME_LIMIT)
      expect(response.status()).toBe(200)
    })

    await test.step('测试创建学科API性能', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()

      const testData = TestDataFactory.createSubjectData({
        name: `性能测试学科_${TestUtils.formatTimestamp()}`
      })

      await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
      await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
      await appPage.fill(SELECTORS.DESCRIPTION_INPUT, testData.description)

      const startTime = Date.now()
      await appPage.click(SELECTORS.SUBMIT_BUTTON)
      const response = await appPage.waitForAPIResponse('/api/subjects')
      const responseTime = Date.now() - startTime

      console.log(`创建学科API响应时间: ${responseTime}ms`)
      expect(responseTime).toBeLessThan(TEST_CONFIG.API_RESPONSE_TIME_LIMIT)
      expect(response.status()).toBe(200)
    })
  })

  test('大量数据渲染性能测试', async ({ appPage }) => {
    await test.step('测试大量学科卡片渲染性能', async () => {
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()

      // 获取当前学科数量
      const subjectCards = appPage.page.locator(SELECTORS.SUBJECT_CARD)
      const cardCount = await subjectCards.count()

      console.log(`当前学科数量: ${cardCount}`)

      // 测试滚动性能
      const startTime = Date.now()
      await appPage.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await appPage.waitForTimeout(500)
      await appPage.page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      const scrollTime = Date.now() - startTime

      console.log(`滚动操作时间: ${scrollTime}ms`)
      expect(scrollTime).toBeLessThan(2000) // 滚动操作应在2秒内完成
    })
  })
})

test.describe('学科管理 - 兼容性测试', () => {
  const devices = [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Mobile', viewport: { width: 375, height: 667 } }
  ]

  devices.forEach(device => {
    test(`${device.name} 设备兼容性测试`, async ({ appPage, browser }) => {
      // 设置视口大小
      await appPage.page.setViewportSize(device.viewport)

      await test.step(`${device.name} - 导航和基本功能测试`, async () => {
        await appPage.goto()
        await appPage.waitForPageLoad()

        // 验证页面在不同设备上正确显示
        await expect(appPage.page.locator('body')).toBeVisible()

        // 导航到学科列表
        await appPage.click(SELECTORS.SUBJECTS_LINK)
        await appPage.waitForPageLoad()

        // 验证学科列表在不同设备上正确显示
        await expect(appPage.page.locator(SELECTORS.SUBJECT_LIST_CONTAINER)).toBeVisible()
        await expect(appPage.page.locator(SELECTORS.CREATE_SUBJECT_BUTTON)).toBeVisible()
      })

      await test.step(`${device.name} - 创建学科功能测试`, async () => {
        const testData = TestDataFactory.createSubjectData({
          name: `${device.name}兼容性测试_${TestUtils.formatTimestamp()}`
        })

        // 打开创建弹窗
        await appPage.click(SELECTORS.CREATE_SUBJECT_BUTTON)
        await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

        // 填写表单
        await appPage.fill(SELECTORS.NAME_INPUT, testData.name)
        await appPage.fill(SELECTORS.DESCRIPTION_INPUT, testData.description)

        // 提交表单
        await appPage.click(SELECTORS.SUBMIT_BUTTON)
        await expect(appPage.page.locator(SELECTORS.SUCCESS_MESSAGE)).toBeVisible()

        // 验证学科出现在列表中
        const newSubjectCard = appPage.page.locator(SELECTORS.SUBJECT_CARD).filter({
          hasText: testData.name
        })
        await expect(newSubjectCard).toBeVisible()
      })

      await test.step(`${device.name} - 响应式布局测试`, async () => {
        // 验证学科卡片在不同设备上的布局
        const subjectCards = appPage.page.locator(SELECTORS.SUBJECT_CARD)
        const cardCount = await subjectCards.count()

        if (cardCount > 0) {
          // 验证第一个卡片可见
          await expect(subjectCards.first()).toBeVisible()

          // 在移动设备上测试触摸交互
          if (device.name === 'Mobile') {
            await subjectCards.first().tap()
            await appPage.waitForTimeout(500)
          }
        }
      })

      // 截图记录不同设备的显示效果
      await appPage.screenshot(`${device.name.toLowerCase()}-compatibility-test`)
    })
  })

  test('键盘导航兼容性测试', async ({ appPage }) => {
    await test.step('测试键盘导航功能', async () => {
      await appPage.goto()
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()

      // 使用Tab键导航
      await appPage.page.keyboard.press('Tab')
      await appPage.page.keyboard.press('Tab')

      // 使用Enter键激活创建按钮
      await appPage.page.keyboard.press('Enter')
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).toBeVisible()

      // 使用Escape键关闭弹窗
      await appPage.page.keyboard.press('Escape')
      await expect(appPage.page.locator(SELECTORS.CREATE_MODAL)).not.toBeVisible()
    })
  })

  test('无障碍访问兼容性测试', async ({ appPage }) => {
    await test.step('测试ARIA标签和语义化标签', async () => {
      await appPage.goto()
      await appPage.click(SELECTORS.SUBJECTS_LINK)
      await appPage.waitForPageLoad()

      // 验证页面标题
      const title = await appPage.getTitle()
      expect(title).toBeTruthy()

      // 验证主要区域有适当的语义化标签
      await expect(appPage.page.locator('main, [role="main"]')).toBeVisible()

      // 验证按钮有适当的标签
      const createButton = appPage.page.locator(SELECTORS.CREATE_SUBJECT_BUTTON)
      const buttonText = await createButton.textContent()
      expect(buttonText).toBeTruthy()
    })
  })
})
