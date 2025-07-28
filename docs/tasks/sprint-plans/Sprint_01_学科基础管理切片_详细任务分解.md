# Sprint 01 - 学科基础管理切片 详细任务分解

## 基本信息

| 项目 | 内容 |
|------|------|
| **切片名称** | 学科基础管理切片 |
| **任务ID** | 56f62da7-6e48-4e29-816c-23471a5fecb3 |
| **优先级** | P0 (最高优先级) |
| **预计工期** | 2-3天 |
| **负责人** | Alex (工程师) |
| **创建日期** | 2025-01-28 |
| **基于文档** | PRD_期末复习平台_v1.0.md, Task_Planning_期末复习平台_v1.0.md, Overall_Architecture_期末复习平台.md |

## 切片目标

实现完整的学科创建和列表展示功能，为整个平台提供基础的内容分类能力。这是整个平台的基础功能，必须确保稳定可靠。

### 核心功能需求
- 管理员能通过主页创建学科，30秒内完成操作
- 学科名称验证正常(空值、重复、长度限制)
- 主页以卡片形式展示所有学科，按创建时间倒序排列
- 响应式布局在各设备上正常显示

### 技术实现要点
- **数据库层**：设计subjects表(id, name, created_at)，确保学科名称唯一性
- **后端API**：POST /api/subjects (创建学科) 和 GET /api/subjects (获取列表)
- **前端界面**：主页学科列表组件(卡片式布局) + 创建学科弹窗组件

## 详细任务分解

### 任务1.1: 环境与数据模型准备 (Setup)

**描述**: 初始化项目数据库（SQLite），并根据《总体架构蓝图》创建所需的数据表（subjects表）。

**具体实施步骤**:
1. 创建项目根目录结构：`/backend`, `/frontend`, `/data`
2. 初始化SQLite数据库文件：`/data/database.sqlite`
3. 创建subjects表，严格按照架构蓝图设计：
   ```sql
   CREATE TABLE subjects (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) UNIQUE NOT NULL,
       description TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   
   -- 创建索引
   CREATE INDEX idx_subjects_name ON subjects(name);
   CREATE INDEX idx_subjects_created_at ON subjects(created_at);
   ```
4. 插入测试数据（3-5条学科记录）用于开发测试

**验收标准**: 
- 数据库文件创建成功，路径为 `/data/database.sqlite`
- subjects表结构完全符合架构设计
- 索引创建成功，查询性能优化到位
- 测试数据插入成功，可通过SQL查询验证

**预计时间**: 0.5天

---

### 任务1.2: 后端API开发与测试闭环 (Backend Loop)

#### 任务1.2.1 开发: 实现所有只读API接口

**描述**: 实现学科管理的核心API接口，包括创建学科和获取学科列表。

**具体实施步骤**:
1. 搭建Node.js + Express基础框架
2. 配置better-sqlite3数据库连接
3. 实现API接口：
   - `GET /api/subjects` - 获取所有学科列表
   - `POST /api/subjects` - 创建新学科
   - `GET /api/subjects/:id` - 获取指定学科详情
4. 添加输入验证中间件：
   - 学科名称长度验证（1-50字符）
   - 学科名称唯一性验证
   - 危险字符过滤
5. 实现统一的错误处理和响应格式
6. 添加CORS支持和安全头设置

**技术要求**:
- 严格遵循RESTful API设计规范
- 响应格式必须符合架构蓝图定义
- 错误处理要友好且具体
- 所有输入都要进行安全验证

**验收标准**:
- 所有API接口开发完成，能正常启动服务
- API响应格式符合架构设计规范
- 输入验证和错误处理机制完善
- 代码结构清晰，符合模块化设计

**预计时间**: 1天

#### 任务1.2.2 测试: 使用 Playwright 编写并执行针对以上API的自动化测试脚本

**描述**: 使用Playwright编写完整的API自动化测试，验证所有接口的正确性。

**具体实施步骤**:
1. 配置Playwright测试环境
2. 编写API测试脚本：
   ```javascript
   // 测试GET /api/subjects
   test('获取学科列表', async ({ request }) => {
     const response = await request.get('/api/subjects');
     expect(response.status()).toBe(200);
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(Array.isArray(data.data)).toBe(true);
   });
   
   // 测试POST /api/subjects
   test('创建学科', async ({ request }) => {
     const response = await request.post('/api/subjects', {
       data: { name: '测试学科', description: '测试描述' }
     });
     expect(response.status()).toBe(201);
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(data.data.name).toBe('测试学科');
   });
   ```
3. 编写边界条件测试：
   - 空名称测试
   - 重复名称测试
   - 超长名称测试
   - 特殊字符测试
4. 编写错误场景测试：
   - 无效参数测试
   - 数据库连接失败测试

**验收标准**:
- 所有API测试脚本编写完成
- 测试覆盖率达到90%以上
- 包含正常场景和异常场景测试
- 测试报告清晰，易于理解

**预计时间**: 0.5天

#### 任务1.2.3 修复与验证: 如果测试失败，立即修复API的Bug

**描述**: 根据测试结果修复发现的问题，确保所有测试100%通过。

**具体实施步骤**:
1. 运行完整的API测试套件
2. 分析测试失败的原因：
   - 逻辑错误
   - 数据验证问题
   - 响应格式不符合规范
   - 性能问题
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行回归测试，确保修复没有引入新问题

**验收标准**: 
- 所有后端API都已开发完成，并通过了对应的Playwright自动化测试
- 测试通过率100%
- 性能指标符合要求（响应时间<200ms）
- 代码质量良好，无明显技术债务

**预计时间**: 0.5天

---

### 任务1.3: 前端UI开发与测试闭环 (Frontend Loop)

#### 任务1.3.1 开发: 创建核心的前端页面组件骨架

**描述**: 创建学科管理相关的前端组件，包括学科列表和创建学科功能。

**具体实施步骤**:
1. 搭建Vue3 + TypeScript + Vben Admin基础框架
2. 配置UnoCSS和Ant Design Vue
3. 创建核心组件：
   - `SubjectList.vue` - 学科列表页面
   - `SubjectCard.vue` - 学科卡片组件
   - `CreateSubjectModal.vue` - 创建学科弹窗
   - `SubjectManager.vue` - 学科管理容器组件
4. 实现响应式布局：
   - 桌面端：多列卡片布局
   - 平板端：双列布局
   - 移动端：单列布局
5. 添加基础交互：
   - 创建学科按钮
   - 学科卡片点击事件
   - 表单验证和提交
6. 配置路由和状态管理

**技术要求**:
- 严格使用TypeScript类型定义
- 组件设计要模块化和可复用
- 响应式设计要适配所有设备
- 代码要符合Vue3最佳实践

**验收标准**:
- 所有核心组件创建完成
- 组件结构清晰，符合设计规范
- TypeScript类型定义完整
- 响应式布局在各设备上正常显示

**预计时间**: 1天

#### 任务1.3.2 测试: 使用 Playwright 编写测试脚本，确保组件正确渲染

**描述**: 使用Playwright编写前端组件测试，验证组件在各种情况下都能正确渲染。

**具体实施步骤**:
1. 配置Playwright前端测试环境
2. 编写组件渲染测试：
   ```javascript
   test('学科列表页面渲染', async ({ page }) => {
     await page.goto('/subjects');
     await expect(page.locator('.subject-list')).toBeVisible();
     await expect(page.locator('.create-subject-btn')).toBeVisible();
   });
   
   test('创建学科弹窗渲染', async ({ page }) => {
     await page.goto('/subjects');
     await page.click('.create-subject-btn');
     await expect(page.locator('.create-subject-modal')).toBeVisible();
     await expect(page.locator('input[name="name"]')).toBeVisible();
   });
   ```
3. 编写响应式测试：
   - 不同屏幕尺寸下的布局测试
   - 移动端触摸交互测试
4. 编写无数据状态测试：
   - 空列表状态显示
   - 加载状态显示
   - 错误状态显示

**验收标准**:
- 所有组件渲染测试编写完成
- 测试覆盖各种屏幕尺寸
- 包含正常状态和异常状态测试
- 测试稳定可靠，无随机失败

**预计时间**: 0.5天

#### 任务1.3.3 修复与验证: 如果组件渲染失败或报错，立即修复

**描述**: 根据测试结果修复前端组件问题，确保所有组件都能成功渲染。

**具体实施步骤**:
1. 运行完整的前端测试套件
2. 分析组件渲染失败的原因：
   - 组件逻辑错误
   - 样式问题
   - 响应式布局问题
   - TypeScript类型错误
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行跨浏览器兼容性测试

**验收标准**: 
- 所有核心前端组件已创建，并通过了基础的渲染测试
- 组件在各种设备和浏览器上都能正常显示
- 无控制台错误和警告
- 用户体验流畅自然

**预计时间**: 0.5天

---

### 任务1.4: 系统集成与端到端测试闭环 (E2E Loop)

#### 任务1.4.1 集成: 进行前后端数据联调

**描述**: 将前端组件与后端API进行集成，实现完整的数据流。

**具体实施步骤**:
1. 配置前端API客户端（axios或fetch）
2. 实现API调用服务：
   ```typescript
   // subjectService.ts
   export class SubjectService {
     async getSubjects(): Promise<Subject[]> {
       const response = await api.get('/api/subjects');
       return response.data.data;
     }
     
     async createSubject(subject: CreateSubjectDto): Promise<Subject> {
       const response = await api.post('/api/subjects', subject);
       return response.data.data;
     }
   }
   ```
3. 在组件中集成API调用：
   - 学科列表数据加载
   - 创建学科表单提交
   - 错误处理和用户反馈
4. 实现状态管理：
   - 加载状态管理
   - 数据缓存策略
   - 错误状态处理
5. 添加用户反馈机制：
   - 成功提示
   - 错误提示
   - 加载指示器

**验收标准**:
- 前后端数据联调成功
- 所有API调用都有适当的错误处理
- 用户操作有及时的反馈
- 数据状态管理合理

**预计时间**: 0.5天

#### 任务1.4.2 端到端测试: 使用 Playwright 编写完整的用户故事测试脚本

**描述**: 编写端到端测试，模拟用户完整的操作流程。

**具体实施步骤**:
1. 编写完整的用户故事测试：
   ```javascript
   test('用户创建和查看学科的完整流程', async ({ page }) => {
     // 1. 访问首页
     await page.goto('/');
     await expect(page.locator('.subject-list')).toBeVisible();
     
     // 2. 点击创建学科按钮
     await page.click('.create-subject-btn');
     await expect(page.locator('.create-subject-modal')).toBeVisible();
     
     // 3. 填写学科信息
     await page.fill('input[name="name"]', '高等数学');
     await page.fill('textarea[name="description"]', '数学基础课程');
     
     // 4. 提交创建
     await page.click('.submit-btn');
     await expect(page.locator('.success-message')).toBeVisible();
     
     // 5. 验证学科出现在列表中
     await expect(page.locator('.subject-card:has-text("高等数学")')).toBeVisible();
     
     // 6. 点击学科卡片
     await page.click('.subject-card:has-text("高等数学")');
     // 这里暂时只验证点击事件，后续切片会实现详情页
   });
   ```
2. 编写边界条件测试：
   - 创建重复名称学科
   - 创建空名称学科
   - 网络错误情况处理
3. 编写性能测试：
   - 页面加载时间测试
   - 大量数据渲染测试
4. 编写兼容性测试：
   - 不同浏览器测试
   - 不同设备尺寸测试

**验收标准**:
- 端到端测试脚本编写完成
- 测试覆盖完整的用户操作流程
- 包含正常场景和异常场景
- 测试稳定可靠，可重复执行

**预计时间**: 0.5天

#### 任务1.4.3 修复与验证: 如果流程中出现任何Bug，立即进行修复

**描述**: 根据端到端测试结果，修复发现的集成问题。

**具体实施步骤**:
1. 运行完整的端到端测试套件
2. 分析测试失败的原因：
   - 前后端数据格式不匹配
   - API调用错误
   - 用户交互问题
   - 性能问题
3. 逐一修复发现的问题：
   - 修复API接口问题
   - 修复前端组件问题
   - 优化用户体验
4. 重新运行测试，确保修复有效
5. 进行完整的回归测试

**验收标准**: 
- 用户可以顺畅地完成整个浏览流程，端到端测试100%通过
- 所有用户操作都有适当的反馈
- 性能指标符合要求（页面加载<3秒）
- 用户体验流畅自然

**预计时间**: 0.5天

---

### 任务1.5: 最终审查与文档同步 (Final Review & Doc Sync)

**描述**: 这是任务交付前的最后一步，必须确保代码和所有相关文档完全同步。

**验收标准**: 以下所有文档都已按要求更新完毕。

#### 文档同步清单:

##### ✅ 更新后端指南 (/docs/architecture/Backend_Architecture_and_Guide.md):

**具体要求**: 请在该文档中，新增 "学科管理模块" 章节，并详细描述：
1. subjects表的结构与字段含义
2. SubjectService的核心方法和业务逻辑
3. 学科管理API的实现细节和错误处理机制
4. 数据验证规则和安全考虑
5. 性能优化策略（索引使用、查询优化）

##### ✅ 更新API参考 (/docs/architecture/API_Reference.md):

**具体要求**: 请在该文档中，正式添加本次开发的学科管理API的详细说明：
1. `GET /api/subjects` - 获取学科列表
   - 请求参数：无
   - 响应体结构：包含学科数组的标准响应格式
   - 成功示例：200状态码的完整响应
   - 失败示例：500错误的响应格式
2. `POST /api/subjects` - 创建学科
   - 请求参数：name（必填）、description（可选）
   - 请求体示例：JSON格式的创建请求
   - 响应体结构：包含新创建学科信息的响应
   - 成功示例：201状态码的响应
   - 失败示例：400验证错误、409重复名称错误
3. `GET /api/subjects/:id` - 获取学科详情
   - 路径参数：id（学科ID）
   - 响应体结构：单个学科的详细信息
   - 成功示例：200状态码的响应
   - 失败示例：404学科不存在错误

##### ✅ 更新前端指南 (/docs/development/Frontend_Development_Guide.md):

**具体要求**: 请在该文档中，新增 "学科管理组件" 章节，记录：
1. SubjectList组件的设计模式和使用方法
2. SubjectCard组件的props接口和事件处理
3. CreateSubjectModal组件的表单验证逻辑
4. 响应式布局的实现策略和断点设置
5. 状态管理的最佳实践（Pinia store的使用）
6. API调用的错误处理模式

##### ✅ 更新变更日志 (/docs/CHANGELOG.md):

**具体要求**: 在文件顶部新增一条记录：
```markdown
## [v0.1.0] - 2025-01-28

### Added
- feat(subjects): 完成学科基础管理功能
  - 实现学科创建、列表展示和详情查看
  - 添加学科名称唯一性验证和输入安全检查
  - 实现响应式卡片布局，支持桌面端、平板端和移动端
  - 完成前后端API集成和端到端测试
  - 建立完整的Playwright自动化测试体系
```

**预计时间**: 0.5天

## 总体时间安排

| 任务 | 预计时间 | 累计时间 |
|------|----------|----------|
| 1.1 环境与数据模型准备 | 0.5天 | 0.5天 |
| 1.2 后端API开发与测试闭环 | 2天 | 2.5天 |
| 1.3 前端UI开发与测试闭环 | 2天 | 4.5天 |
| 1.4 系统集成与端到端测试闭环 | 1天 | 5.5天 |
| 1.5 最终审查与文档同步 | 0.5天 | 6天 |

**总计**: 6天（考虑到这是第一个切片，需要建立基础框架，时间略长于预期的2-3天）

## 质量保证

### 测试策略
- **单元测试**: 后端服务层和前端组件的核心逻辑测试
- **集成测试**: API接口的完整功能测试
- **端到端测试**: 用户完整操作流程的自动化测试
- **兼容性测试**: 多浏览器和多设备的兼容性验证
- **性能测试**: 页面加载速度和API响应时间测试

### 代码质量标准
- **TypeScript**: 前端代码100%使用TypeScript，类型定义完整
- **ESLint**: 代码风格统一，通过所有lint检查
- **代码覆盖率**: 测试覆盖率达到90%以上
- **文档完整性**: 所有公共API和组件都有完整的文档说明

### 性能指标
- **页面加载时间**: 首屏加载时间 < 3秒
- **API响应时间**: 所有API响应时间 < 200ms
- **内存使用**: 前端内存使用合理，无内存泄漏
- **数据库性能**: 查询响应时间 < 50ms

## 风险评估与缓解

### 技术风险
1. **SQLite并发性能**: 
   - 风险：多用户同时创建学科可能导致性能问题
   - 缓解：使用数据库连接池，添加性能监控
2. **前端框架学习曲线**: 
   - 风险：Vue3 + TypeScript + Vben Admin的复杂性
   - 缓解：提前准备技术文档，分步骤实现
3. **响应式布局复杂性**: 
   - 风险：多设备适配可能出现布局问题
   - 缓解：使用成熟的CSS框架，充分测试

### 进度风险
1. **测试时间不足**: 
   - 风险：Playwright测试编写和调试耗时较长
   - 缓解：并行开发和测试，提前准备测试环境
2. **集成问题**: 
   - 风险：前后端集成可能出现意外问题
   - 缓解：早期进行接口联调，及时发现问题

## 交付物清单

### 代码交付物
- [ ] 后端API服务（Node.js + Express + SQLite）
- [ ] 前端学科管理页面（Vue3 + TypeScript + Ant Design Vue）
- [ ] 完整的Playwright测试套件
- [ ] 数据库初始化脚本
- [ ] 项目配置文件（package.json, tsconfig.json等）

### 文档交付物
- [ ] 更新的后端架构指南
- [ ] 更新的API参考文档
- [ ] 更新的前端开发指南
- [ ] 更新的变更日志
- [ ] 测试报告和覆盖率报告

### 部署交付物
- [ ] Docker配置文件
- [ ] 环境配置说明
- [ ] 部署脚本和说明文档

---

**文档状态**: ✅ 已完成  
**下一步行动**: 提交给Mike审核，通过后Alex开始执行第一个任务