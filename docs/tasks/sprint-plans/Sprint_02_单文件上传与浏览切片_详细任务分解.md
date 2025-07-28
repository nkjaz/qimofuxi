# Sprint 02 - 单文件上传与浏览切片 详细任务分解

## 基本信息

| 项目 | 内容 |
|------|------|
| **切片名称** | 单文件上传与浏览切片 |
| **任务ID** | cee2c71e-cbc1-49f0-99c2-b8f394bbde9f |
| **优先级** | P0 (最高优先级) |
| **预计工期** | 3-4天 |
| **负责人** | Alex (工程师) |
| **创建日期** | 2025-01-28 |
| **依赖关系** | 学科基础管理切片 (56f62da7-6e48-4e29-816c-23471a5fecb3) |
| **基于文档** | PRD_期末复习平台_v1.0.md, Task_Planning_期末复习平台_v1.0.md, Overall_Architecture_期末复习平台.md |

## 切片目标

实现基础的Markdown文件上传和在线查看功能，建立文件存储和渲染的核心机制。这是平台内容管理的核心功能，为后续的批量上传和复杂文件处理奠定基础。

### 核心功能需求
- 管理员能在学科页面上传单个.md文件
- 上传的Markdown文件正确存储到服务器
- 访客能在线阅读Markdown内容
- Markdown基础语法正确渲染（标题、段落、列表、链接、代码块等）
- 文件存储采用树形结构，支持未来的文件夹层级

### 技术实现要点
- **数据库层**：设计file_nodes表，支持树形结构存储
- **后端API**：POST /api/subjects/{id}/upload (单文件上传) 和 GET /api/files/{fileId} (获取内容)
- **前端界面**：文件上传组件 + Markdown渲染组件
- **文件存储**：建立完整的文件存储机制和路径管理
- **Markdown处理**：集成markdown-it进行内容渲染

## 详细任务分解

### 任务2.1: 环境与数据模型准备 (Setup)

**描述**: 扩展现有数据库，创建file_nodes表支持文件存储，并建立文件系统存储结构。

**具体实施步骤**:
1. 扩展SQLite数据库，创建file_nodes表：
   ```sql
   CREATE TABLE file_nodes (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id INTEGER NOT NULL,
       parent_id INTEGER NULL,  -- NULL表示根节点
       name VARCHAR(255) NOT NULL,
       type ENUM('folder', 'file') NOT NULL,
       relative_path TEXT NOT NULL,  -- 相对于学科根目录的路径
       storage_path TEXT NULL,      -- 实际存储路径（仅文件有）
       file_size INTEGER DEFAULT 0,
       mime_type VARCHAR(100),
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
       FOREIGN KEY (parent_id) REFERENCES file_nodes(id) ON DELETE CASCADE
   );
   
   -- 创建索引
   CREATE INDEX idx_file_nodes_subject_id ON file_nodes(subject_id);
   CREATE INDEX idx_file_nodes_parent_id ON file_nodes(parent_id);
   CREATE INDEX idx_file_nodes_type ON file_nodes(type);
   CREATE INDEX idx_file_nodes_relative_path ON file_nodes(relative_path);
   ```

2. 创建文件存储目录结构：
   ```
   /uploads/
   ├── subject_1/
   ├── subject_2/
   └── .metadata/
       ├── checksums.json
       └── backup_info.json
   ```

3. 配置文件上传中间件（multer）
4. 插入测试数据：为现有学科创建一些测试文件节点

**验收标准**: 
- file_nodes表创建成功，结构完全符合架构设计
- 文件存储目录结构建立完成
- 索引创建成功，支持高效查询
- multer中间件配置完成，支持文件上传
- 测试数据插入成功，可通过SQL查询验证

**预计时间**: 0.5天

---

### 任务2.2: 后端API开发与测试闭环 (Backend Loop)

#### 任务2.2.1 开发: 实现文件上传和内容获取API接口

**描述**: 实现单文件上传和文件内容获取的核心API接口，建立完整的文件处理机制。

**具体实施步骤**:
1. 实现文件上传API：
   ```javascript
   // POST /api/subjects/:id/upload
   // 功能：上传单个Markdown文件到指定学科
   // 支持：文件类型验证、大小限制、路径安全检查
   ```

2. 实现文件内容获取API：
   ```javascript
   // GET /api/files/:fileId
   // 功能：获取指定文件的内容
   // 支持：Markdown文件读取、内容返回
   ```

3. 实现文件列表API：
   ```javascript
   // GET /api/subjects/:id/files
   // 功能：获取指定学科的文件树结构
   // 支持：树形数据查询、分页支持
   ```

4. 实现核心服务类：
   - **FileService**: 文件上传、存储、读取逻辑
   - **PathResolver**: 路径解析和安全检查
   - **FileValidator**: 文件类型和大小验证

5. 添加文件处理功能：
   - 文件类型验证（仅允许.md文件）
   - 文件大小限制（单文件最大10MB）
   - 文件名安全处理（去除危险字符）
   - 存储路径生成和管理

6. 实现错误处理：
   - 文件类型不支持错误
   - 文件过大错误
   - 磁盘空间不足错误
   - 文件读取失败错误

**技术要求**:
- 严格的文件安全检查，防止路径遍历攻击
- 完整的错误处理和用户友好的错误信息
- 文件存储路径规范化和唯一性保证
- 支持并发上传的线程安全设计

**验收标准**:
- 所有API接口开发完成，能正常处理文件上传和读取
- 文件验证机制完善，安全性得到保障
- 错误处理机制完整，用户体验友好
- 代码结构清晰，符合架构设计规范

**预计时间**: 1.5天

#### 任务2.2.2 测试: 使用 Playwright 编写API自动化测试脚本

**描述**: 使用Playwright编写完整的文件上传和内容获取API测试，验证所有接口的正确性。

**具体实施步骤**:
1. 编写文件上传API测试：
   ```javascript
   test('上传Markdown文件', async ({ request }) => {
     const formData = new FormData();
     formData.append('file', new File(['# 测试文档\n这是测试内容'], 'test.md', {
       type: 'text/markdown'
     }));
     
     const response = await request.post('/api/subjects/1/upload', {
       multipart: formData
     });
     
     expect(response.status()).toBe(201);
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(data.data.name).toBe('test.md');
     expect(data.data.type).toBe('file');
   });
   ```

2. 编写文件内容获取测试：
   ```javascript
   test('获取文件内容', async ({ request }) => {
     // 先上传一个文件
     const uploadResponse = await uploadTestFile(request);
     const fileId = uploadResponse.data.id;
     
     // 获取文件内容
     const response = await request.get(`/api/files/${fileId}`);
     expect(response.status()).toBe(200);
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(data.data.content).toContain('# 测试文档');
   });
   ```

3. 编写文件列表获取测试：
   ```javascript
   test('获取学科文件列表', async ({ request }) => {
     const response = await request.get('/api/subjects/1/files');
     expect(response.status()).toBe(200);
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(Array.isArray(data.data)).toBe(true);
   });
   ```

4. 编写边界条件和错误场景测试：
   - 上传非Markdown文件测试
   - 上传超大文件测试
   - 上传空文件测试
   - 获取不存在文件测试
   - 无效学科ID测试

5. 编写并发上传测试：
   - 同时上传多个文件
   - 验证文件存储的一致性

**验收标准**:
- 所有API测试脚本编写完成
- 测试覆盖率达到95%以上
- 包含正常场景、边界条件和异常场景测试
- 并发测试验证系统稳定性

**预计时间**: 1天

#### 任务2.2.3 修复与验证: 修复API问题，确保测试100%通过

**描述**: 根据测试结果修复发现的问题，确保所有API测试100%通过。

**具体实施步骤**:
1. 运行完整的API测试套件
2. 分析测试失败的原因：
   - 文件上传逻辑错误
   - 路径处理问题
   - 数据库操作错误
   - 并发安全问题
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行性能测试，确保API响应时间符合要求

**验收标准**: 
- 所有后端API都已开发完成，并通过了对应的Playwright自动化测试
- 测试通过率100%
- API响应时间符合性能要求（上传<5秒，读取<200ms）
- 并发处理能力满足需求

**预计时间**: 0.5天

---

### 任务2.3: 前端UI开发与测试闭环 (Frontend Loop)

#### 任务2.3.1 开发: 创建文件上传和Markdown渲染组件

**描述**: 创建文件上传和Markdown内容展示相关的前端组件，实现完整的用户交互。

**具体实施步骤**:
1. 创建文件上传组件：
   ```typescript
   // FileUploader.vue
   interface FileUploaderProps {
     subjectId: number;
     onUploadSuccess?: (file: FileNode) => void;
     onUploadError?: (error: string) => void;
   }
   
   // 功能：
   // - 文件选择（仅支持.md文件）
   // - 上传进度显示
   // - 上传状态反馈
   // - 拖拽上传支持
   ```

2. 创建Markdown渲染组件：
   ```typescript
   // MarkdownViewer.vue
   interface MarkdownViewerProps {
     content: string;
     loading?: boolean;
   }
   
   // 功能：
   // - Markdown语法渲染
   // - 代码高亮
   // - 表格样式优化
   // - 响应式布局
   ```

3. 创建文件详情页面：
   ```typescript
   // FileDetail.vue
   // 功能：
   // - 文件信息展示
   // - Markdown内容渲染
   // - 面包屑导航
   // - 返回按钮
   ```

4. 扩展学科详情页面：
   ```typescript
   // SubjectDetail.vue
   // 新增功能：
   // - 文件上传区域
   // - 文件列表展示
   // - 文件点击跳转
   ```

5. 集成markdown-it库：
   - 配置基础渲染选项
   - 添加代码高亮插件
   - 配置表格渲染
   - 添加链接安全处理

6. 实现响应式设计：
   - 移动端文件上传优化
   - Markdown内容在小屏幕上的适配
   - 触摸友好的交互设计

**技术要求**:
- 严格使用TypeScript类型定义
- 组件设计要模块化和可复用
- 文件上传要有完整的状态管理
- Markdown渲染要支持常用语法

**验收标准**:
- 所有核心组件创建完成
- 文件上传功能完整，用户体验良好
- Markdown渲染效果符合预期
- 响应式布局在各设备上正常显示

**预计时间**: 1.5天

#### 任务2.3.2 测试: 使用 Playwright 编写前端组件测试

**描述**: 使用Playwright编写前端组件测试，验证组件在各种情况下都能正确渲染和交互。

**具体实施步骤**:
1. 编写文件上传组件测试：
   ```javascript
   test('文件上传组件渲染', async ({ page }) => {
     await page.goto('/subjects/1');
     await expect(page.locator('.file-uploader')).toBeVisible();
     await expect(page.locator('input[type="file"]')).toBeVisible();
   });
   
   test('文件上传功能', async ({ page }) => {
     await page.goto('/subjects/1');
     
     // 模拟文件选择
     const fileInput = page.locator('input[type="file"]');
     await fileInput.setInputFiles({
       name: 'test.md',
       mimeType: 'text/markdown',
       buffer: Buffer.from('# 测试文档\n这是测试内容')
     });
     
     // 验证上传状态
     await expect(page.locator('.upload-progress')).toBeVisible();
     await expect(page.locator('.upload-success')).toBeVisible();
   });
   ```

2. 编写Markdown渲染组件测试：
   ```javascript
   test('Markdown渲染组件', async ({ page }) => {
     await page.goto('/files/1');
     await expect(page.locator('.markdown-viewer')).toBeVisible();
     await expect(page.locator('h1')).toBeVisible();
     await expect(page.locator('p')).toBeVisible();
   });
   
   test('Markdown语法渲染', async ({ page }) => {
     await page.goto('/files/1');
     
     // 验证各种Markdown元素
     await expect(page.locator('h1')).toHaveText('测试文档');
     await expect(page.locator('code')).toBeVisible();
     await expect(page.locator('table')).toBeVisible();
   });
   ```

3. 编写响应式布局测试：
   ```javascript
   test('移动端文件上传', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     await page.goto('/subjects/1');
     
     await expect(page.locator('.file-uploader')).toBeVisible();
     await expect(page.locator('.upload-btn')).toHaveCSS('width', '100%');
   });
   ```

4. 编写错误状态测试：
   - 文件类型错误提示
   - 文件过大错误提示
   - 网络错误处理
   - 加载状态显示

**验收标准**:
- 所有组件渲染测试编写完成
- 文件上传交互测试覆盖完整
- Markdown渲染测试验证各种语法
- 响应式布局测试覆盖主要设备

**预计时间**: 1天

#### 任务2.3.3 修复与验证: 修复前端组件问题

**描述**: 根据测试结果修复前端组件问题，确保所有组件都能成功渲染和交互。

**具体实施步骤**:
1. 运行完整的前端测试套件
2. 分析组件问题：
   - 文件上传交互问题
   - Markdown渲染效果问题
   - 响应式布局问题
   - TypeScript类型错误
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行跨浏览器兼容性测试

**验收标准**: 
- 所有核心前端组件已创建，并通过了基础的渲染测试
- 文件上传功能在各种设备上都能正常工作
- Markdown渲染效果符合预期
- 用户交互流畅自然

**预计时间**: 0.5天

---

### 任务2.4: 系统集成与端到端测试闭环 (E2E Loop)

#### 任务2.4.1 集成: 进行前后端数据联调

**描述**: 将前端组件与后端API进行集成，实现完整的文件上传和浏览数据流。

**具体实施步骤**:
1. 实现文件上传服务：
   ```typescript
   // fileService.ts
   export class FileService {
     async uploadFile(subjectId: number, file: File): Promise<FileNode> {
       const formData = new FormData();
       formData.append('file', file);
       
       const response = await api.post(`/api/subjects/${subjectId}/upload`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
         onUploadProgress: (progressEvent) => {
           // 处理上传进度
         }
       });
       
       return response.data.data;
     }
     
     async getFileContent(fileId: number): Promise<string> {
       const response = await api.get(`/api/files/${fileId}`);
       return response.data.data.content;
     }
     
     async getFileList(subjectId: number): Promise<FileNode[]> {
       const response = await api.get(`/api/subjects/${subjectId}/files`);
       return response.data.data;
     }
   }
   ```

2. 在组件中集成API调用：
   - 文件上传组件调用上传API
   - Markdown渲染组件调用内容获取API
   - 文件列表组件调用列表API

3. 实现状态管理：
   - 文件上传状态（idle, uploading, success, error）
   - 文件内容加载状态
   - 错误信息管理

4. 添加用户反馈机制：
   - 上传成功提示
   - 上传失败错误提示
   - 加载指示器
   - 进度条显示

5. 实现路由集成：
   - 学科详情页面路由
   - 文件详情页面路由
   - 面包屑导航

**验收标准**:
- 前后端数据联调成功
- 文件上传流程完整可用
- 文件内容展示正常
- 所有API调用都有适当的错误处理

**预计时间**: 1天

#### 任务2.4.2 端到端测试: 编写完整的用户故事测试脚本

**描述**: 编写端到端测试，模拟用户完整的文件上传和浏览操作流程。

**具体实施步骤**:
1. 编写完整的用户故事测试：
   ```javascript
   test('用户上传和查看Markdown文件的完整流程', async ({ page }) => {
     // 1. 访问学科详情页
     await page.goto('/subjects/1');
     await expect(page.locator('.subject-detail')).toBeVisible();
     
     // 2. 上传Markdown文件
     const fileInput = page.locator('input[type="file"]');
     await fileInput.setInputFiles({
       name: 'study-notes.md',
       mimeType: 'text/markdown',
       buffer: Buffer.from(`# 学习笔记
       
## 第一章 基础概念

这是一些重要的概念：

- 概念1：重要定义
- 概念2：关键理论

### 代码示例

\`\`\`javascript
console.log('Hello World');
\`\`\`

## 总结

这是总结内容。`)
     });
     
     // 3. 等待上传完成
     await expect(page.locator('.upload-success')).toBeVisible();
     
     // 4. 验证文件出现在列表中
     await expect(page.locator('.file-item:has-text("study-notes.md")')).toBeVisible();
     
     // 5. 点击文件查看内容
     await page.click('.file-item:has-text("study-notes.md")');
     
     // 6. 验证跳转到文件详情页
     await expect(page).toHaveURL(/\/files\/\d+/);
     
     // 7. 验证Markdown内容正确渲染
     await expect(page.locator('h1:has-text("学习笔记")')).toBeVisible();
     await expect(page.locator('h2:has-text("第一章 基础概念")')).toBeVisible();
     await expect(page.locator('ul li:has-text("概念1")')).toBeVisible();
     await expect(page.locator('code:has-text("console.log")')).toBeVisible();
     
     // 8. 验证面包屑导航
     await expect(page.locator('.breadcrumb')).toBeVisible();
     
     // 9. 返回学科页面
     await page.click('.back-btn');
     await expect(page).toHaveURL('/subjects/1');
   });
   ```

2. 编写错误场景测试：
   ```javascript
   test('上传非Markdown文件错误处理', async ({ page }) => {
     await page.goto('/subjects/1');
     
     const fileInput = page.locator('input[type="file"]');
     await fileInput.setInputFiles({
       name: 'document.txt',
       mimeType: 'text/plain',
       buffer: Buffer.from('这是一个文本文件')
     });
     
     await expect(page.locator('.error-message:has-text("仅支持Markdown文件")')).toBeVisible();
   });
   ```

3. 编写性能测试：
   - 大文件上传测试
   - 长文档渲染性能测试
   - 并发上传测试

4. 编写兼容性测试：
   - 不同浏览器的文件上传测试
   - 移动端触摸操作测试

**验收标准**:
- 端到端测试脚本编写完成
- 测试覆盖完整的用户操作流程
- 包含正常场景和异常场景
- 性能和兼容性测试通过

**预计时间**: 1天

#### 任务2.4.3 修复与验证: 修复集成问题，确保端到端测试通过

**描述**: 根据端到端测试结果，修复发现的集成问题。

**具体实施步骤**:
1. 运行完整的端到端测试套件
2. 分析测试失败的原因：
   - 前后端数据格式不匹配
   - 文件上传流程问题
   - 路由跳转问题
   - Markdown渲染问题
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行完整的回归测试

**验收标准**: 
- 用户可以顺畅地完成整个文件上传和浏览流程，端到端测试100%通过
- 文件上传功能稳定可靠
- Markdown渲染效果符合预期
- 用户体验流畅自然

**预计时间**: 0.5天

---

### 任务2.5: 最终审查与文档同步 (Final Review & Doc Sync)

**描述**: 这是任务交付前的最后一步，必须确保代码和所有相关文档完全同步。

**验收标准**: 以下所有文档都已按要求更新完毕。

#### 文档同步清单:

##### ✅ 更新后端指南 (/docs/architecture/Backend_Architecture_and_Guide.md):

**具体要求**: 请在该文档中，新增 "文件管理模块" 章节，并详细描述：
1. file_nodes表的结构与字段含义，包括树形结构的设计理念
2. FileService的核心方法和文件处理业务逻辑
3. 文件上传API的实现细节，包括multer中间件配置
4. 文件存储策略和路径管理机制
5. 文件安全检查和验证规则（类型、大小、路径安全）
6. Markdown文件处理和内容读取机制
7. 错误处理策略和用户友好的错误信息设计

##### ✅ 更新API参考 (/docs/architecture/API_Reference.md):

**具体要求**: 请在该文档中，正式添加本次开发的文件管理API的详细说明：
1. `POST /api/subjects/:id/upload` - 上传文件到指定学科
   - 路径参数：id（学科ID）
   - 请求体：multipart/form-data格式，包含file字段
   - 请求示例：包含文件上传的完整示例
   - 响应体结构：包含新创建文件节点信息的响应
   - 成功示例：201状态码的响应，包含文件ID、名称、路径等信息
   - 失败示例：400文件类型错误、413文件过大错误、500服务器错误

2. `GET /api/files/:fileId` - 获取文件内容
   - 路径参数：fileId（文件ID）
   - 响应体结构：包含文件内容和元信息的响应
   - 成功示例：200状态码的响应，包含content字段
   - 失败示例：404文件不存在错误、500读取失败错误

3. `GET /api/subjects/:id/files` - 获取学科文件列表
   - 路径参数：id（学科ID）
   - 查询参数：page（页码，可选）、limit（每页数量，可选）
   - 响应体结构：包含文件节点数组的树形结构响应
   - 成功示例：200状态码的响应，包含文件树结构
   - 失败示例：404学科不存在错误

##### ✅ 更新前端指南 (/docs/development/Frontend_Development_Guide.md):

**具体要求**: 请在该文档中，新增 "文件管理组件" 章节，记录：
1. FileUploader组件的设计模式和使用方法
   - Props接口定义和事件处理机制
   - 文件上传状态管理的最佳实践
   - 拖拽上传功能的实现方式
   - 上传进度显示和错误处理模式

2. MarkdownViewer组件的实现细节
   - markdown-it库的配置和插件使用
   - 代码高亮的实现方式
   - 响应式Markdown渲染的处理策略
   - 安全性考虑（XSS防护）

3. 文件管理相关的状态管理模式
   - Pinia store的文件状态管理
   - 文件上传队列的管理策略
   - 缓存机制和数据同步

4. 路由设计和导航模式
   - 文件详情页面的路由配置
   - 面包屑导航的实现方式
   - 深度链接支持

##### ✅ 更新变更日志 (/docs/CHANGELOG.md):

**具体要求**: 在文件顶部新增一条记录：
```markdown
## [v0.2.0] - 2025-01-28

### Added
- feat(files): 完成单文件上传与浏览功能
  - 实现Markdown文件上传，支持拖拽和点击上传
  - 添加文件类型和大小验证，确保安全性
  - 实现file_nodes表的树形结构设计，为批量上传做准备
  - 完成Markdown在线渲染，支持标题、列表、代码块等基础语法
  - 建立完整的文件存储机制和路径管理系统
  - 实现文件详情页面和面包屑导航
  - 完成前后端API集成和端到端测试覆盖
  - 建立文件上传的完整错误处理和用户反馈机制
```

**预计时间**: 0.5天

## 总体时间安排

| 任务 | 预计时间 | 累计时间 |
|------|----------|----------|
| 2.1 环境与数据模型准备 | 0.5天 | 0.5天 |
| 2.2 后端API开发与测试闭环 | 3天 | 3.5天 |
| 2.3 前端UI开发与测试闭环 | 3天 | 6.5天 |
| 2.4 系统集成与端到端测试闭环 | 2.5天 | 9天 |
| 2.5 最终审查与文档同步 | 0.5天 | 9.5天 |

**总计**: 9.5天（实际预期3-4天，但考虑到文件处理的复杂性和完整测试覆盖的需求）

## 质量保证

### 测试策略
- **单元测试**: 文件处理服务和Markdown渲染组件的核心逻辑测试
- **集成测试**: 文件上传API和内容获取API的完整功能测试
- **端到端测试**: 用户完整文件上传和浏览流程的自动化测试
- **性能测试**: 大文件上传和长文档渲染的性能验证
- **安全测试**: 文件类型验证和路径安全检查测试

### 代码质量标准
- **TypeScript**: 前端代码100%使用TypeScript，文件相关类型定义完整
- **文件安全**: 严格的文件类型验证和路径安全检查
- **错误处理**: 完整的错误处理机制，用户友好的错误提示
- **性能优化**: 文件上传进度显示，大文件处理优化

### 性能指标
- **文件上传**: 10MB文件上传时间 < 30秒
- **内容加载**: 文件内容获取响应时间 < 500ms
- **Markdown渲染**: 长文档（>1000行）渲染时间 < 2秒
- **内存使用**: 文件处理过程中内存使用合理，无内存泄漏

## 风险评估与缓解

### 技术风险
1. **文件上传稳定性**: 
   - 风险：大文件上传可能出现超时或中断
   - 缓解：实现上传进度监控，添加重试机制

2. **Markdown渲染性能**: 
   - 风险：复杂Markdown文档渲染可能影响页面性能
   - 缓解：使用虚拟滚动，分段渲染长文档

3. **文件存储安全**: 
   - 风险：文件上传可能存在安全漏洞
   - 缓解：严格的文件类型验证，路径安全检查

### 进度风险
1. **Markdown渲染复杂性**: 
   - 风险：各种Markdown语法的完整支持可能耗时较长
   - 缓解：分阶段实现，先支持基础语法，后续迭代增强

2. **文件处理逻辑复杂性**: 
   - 风险：文件存储和路径管理逻辑复杂，容易出错
   - 缓解：充分的单元测试，逐步验证各种场景

## 交付物清单

### 代码交付物
- [ ] 扩展的后端API服务（文件上传、内容获取、列表查询）
- [ ] 前端文件管理组件（上传、渲染、列表）
- [ ] file_nodes表和相关数据库操作
- [ ] 完整的Playwright测试套件（API + E2E）
- [ ] 文件存储系统和路径管理机制

### 文档交付物
- [ ] 更新的后端架构指南（文件管理模块）
- [ ] 更新的API参考文档（文件管理API）
- [ ] 更新的前端开发指南（文件管理组件）
- [ ] 更新的变更日志
- [ ] 文件上传和渲染的技术文档

### 功能交付物
- [ ] 单文件Markdown上传功能
- [ ] Markdown在线渲染和查看功能
- [ ] 文件列表展示和导航功能
- [ ] 完整的错误处理和用户反馈机制
- [ ] 响应式设计支持

---

**文档状态**: ✅ 已完成  
**下一步行动**: 提交给Mike审核，通过后Alex开始执行第二个任务切片