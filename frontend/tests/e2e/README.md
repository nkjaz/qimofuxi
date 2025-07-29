# 端到端测试文档

## 概述

本目录包含期末复习平台的端到端(E2E)测试，使用Playwright框架实现完整的用户操作流程测试。

## 测试覆盖范围

### 1. 完整用户故事测试
- ✅ 访问首页 → 导航到学科管理 → 创建学科 → 验证列表更新
- ✅ 数据持久化验证（页面刷新测试）
- ✅ 搜索功能测试
- ✅ 视图切换功能测试

### 2. 边界条件和异常场景测试
- ✅ 创建重复名称学科测试
- ✅ 创建空名称学科测试
- ✅ 超长内容测试
- ✅ 网络错误处理测试
- ✅ 弹窗取消和关闭测试

### 3. 性能测试
- ✅ 页面加载性能测试
- ✅ API响应性能测试
- ✅ 大量数据渲染性能测试

### 4. 兼容性测试
- ✅ 多设备兼容性测试（桌面、平板、移动）
- ✅ 多浏览器兼容性测试（Chrome、Firefox、Safari、Edge）
- ✅ 键盘导航兼容性测试
- ✅ 无障碍访问兼容性测试

## 文件结构

```
tests/e2e/
├── setup.ts                    # 测试环境配置和工具类
├── subject-management.test.ts  # 学科管理端到端测试
├── playwright.e2e.config.ts    # Playwright配置文件
├── global-setup.ts             # 全局测试设置
├── global-teardown.ts          # 全局测试清理
├── run-e2e-tests.js            # 测试运行脚本
└── README.md                   # 本文档
```

## 快速开始

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 启动开发服务器
```bash
# 启动前端服务 (端口3000)
npm run dev

# 启动后端服务 (端口3001) - 在另一个终端
cd ../backend
node app.js
```

### 3. 运行端到端测试
```bash
# 运行所有端到端测试
npm run test:e2e

# 显示浏览器窗口运行测试
npm run test:e2e:headed

# 调试模式运行测试
npm run test:e2e:debug

# 只运行完整用户故事测试
npm run test:e2e:story
```

## 测试命令详解

### 基础命令
- `npm run test:e2e` - 运行所有端到端测试
- `npm run test:e2e:headed` - 显示浏览器窗口运行测试
- `npm run test:e2e:debug` - 调试模式，可以逐步执行

### 浏览器特定测试
- `npm run test:e2e:chrome` - 只在Chrome中运行
- `npm run test:e2e:firefox` - 只在Firefox中运行
- `npm run test:e2e:safari` - 只在Safari中运行
- `npm run test:e2e:mobile` - 只在移动设备中运行

### 特定测试场景
- `npm run test:e2e:story` - 只运行完整用户故事测试

### 查看测试报告
- `npm run test:e2e:report` - 查看端到端测试报告

## 高级用法

### 使用测试运行脚本
```bash
# 基本用法
node tests/e2e/run-e2e-tests.js

# 指定浏览器
node tests/e2e/run-e2e-tests.js --browser chromium

# 只运行特定测试
node tests/e2e/run-e2e-tests.js --grep "创建学科"

# 显示浏览器并启用调试
node tests/e2e/run-e2e-tests.js --headed --debug

# 自定义并行度和重试次数
node tests/e2e/run-e2e-tests.js --workers 1 --retries 2
```

### 脚本选项说明
- `--browser <name>` - 指定浏览器 (chromium, firefox, webkit, edge)
- `--grep <pattern>` - 只运行匹配的测试
- `--headed` - 显示浏览器窗口
- `--debug` - 启用调试模式
- `--trace` - 启用追踪模式
- `--workers <num>` - 并行工作进程数
- `--retries <num>` - 失败重试次数
- `--timeout <ms>` - 测试超时时间

## 测试数据和工具

### AppPage 类
提供常用的页面操作方法：
- `goto()` - 导航到首页
- `click(selector)` - 点击元素
- `fill(selector, value)` - 填写表单
- `waitForAPIResponse(url)` - 等待API响应
- `simulateNetworkError()` - 模拟网络错误

### TestDataFactory 类
提供测试数据生成：
- `createSubjectData()` - 创建学科测试数据
- `createInvalidSubjectData()` - 创建无效数据
- `createDuplicateSubjectData()` - 创建重复数据

### 选择器常量 (SELECTORS)
预定义的页面元素选择器，确保测试的稳定性。

## 性能基准

### 页面加载时间
- 首页加载: < 3秒
- 学科列表页面: < 3秒

### API响应时间
- 获取学科列表: < 2秒
- 创建学科: < 2秒

## 故障排除

### 常见问题

1. **测试超时**
   - 检查前端和后端服务是否正常启动
   - 增加超时时间：`--timeout 60000`

2. **元素找不到**
   - 检查页面是否正确加载
   - 验证选择器是否正确
   - 使用 `--headed` 模式查看页面状态

3. **网络连接问题**
   - 确保前端服务运行在 http://localhost:3000
   - 确保后端服务运行在 http://localhost:3001
   - 检查防火墙设置

4. **浏览器启动失败**
   - 运行 `npx playwright install` 安装浏览器
   - 检查系统依赖是否完整

### 调试技巧

1. **使用调试模式**
   ```bash
   npm run test:e2e:debug
   ```

2. **查看测试追踪**
   ```bash
   node tests/e2e/run-e2e-tests.js --trace
   ```

3. **截图和录屏**
   - 失败时自动截图保存在 `test-results/e2e/screenshots/`
   - 失败时自动录屏保存在 `test-results/e2e/`

4. **查看详细日志**
   - 测试运行时会输出详细的操作日志
   - 检查 `test-results/e2e/test-summary.json` 获取测试摘要

## 持续集成

### GitHub Actions 配置示例
```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    npm run test:e2e
  env:
    CI: true
```

### Docker 环境
```dockerfile
# 安装Playwright浏览器
RUN npx playwright install --with-deps
```

## 贡献指南

### 添加新测试
1. 在 `subject-management.test.ts` 中添加新的测试用例
2. 使用 `test.step()` 组织测试步骤
3. 使用预定义的选择器和工具类
4. 添加适当的断言和错误处理

### 最佳实践
1. 每个测试应该独立运行
2. 使用有意义的测试名称和描述
3. 添加适当的等待和超时处理
4. 使用页面对象模式组织代码
5. 定期更新选择器和测试数据
