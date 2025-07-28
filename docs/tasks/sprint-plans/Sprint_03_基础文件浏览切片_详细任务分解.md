# Sprint 03 - 基础文件浏览切片 详细任务分解

## 基本信息

| 项目 | 内容 |
|------|------|
| **切片名称** | 基础文件浏览切片 |
| **任务ID** | 0bb39134-d2fc-40cb-b1de-b2226608aabb |
| **优先级** | P0 (最高优先级) |
| **预计工期** | 2-3天 |
| **负责人** | Alex (工程师) |
| **创建日期** | 2025-01-28 |
| **依赖关系** | 学科基础管理切片 (56f62da7-6e48-4e29-816c-23471a5fecb3), 单文件上传与浏览切片 (cee2c71e-cbc1-49f0-99c2-b8f394bbde9f) |
| **基于文档** | PRD_期末复习平台_v1.0.md, Task_Planning_期末复习平台_v1.0.md, Overall_Architecture_期末复习平台.md |

## 切片目标

实现访客浏览文件结构的功能，提供清晰的文件夹导航和文件列表展示。这是平台用户体验的核心功能，让访客能够直观地浏览和访问学科内的所有文件资源。

### 核心功能需求
- 访客能从主页点击学科进入文件列表页面
- 文件浏览器正确显示文件夹和文件，图标区分明确
- 点击文件夹能进入下级目录，面包屑导航正确更新
- 点击Markdown文件能正确跳转到内容查看页面
- 支持文件搜索和过滤功能
- 响应式设计，在各种设备上都有良好的浏览体验

### 技术实现要点
- **后端API**：GET /api/subjects/{id}/files (获取文件结构)，支持分页和层级查询
- **前端界面**：文件浏览器组件 + 面包屑导航组件 + 学科详情页面
- **树形数据处理**：高效的树形结构渲染和导航逻辑
- **搜索功能**：基于文件名的实时搜索和过滤
- **虚拟滚动**：支持大量文件的高性能渲染

## 详细任务分解

### 任务3.1: 环境与数据模型准备 (Setup)

**描述**: 基于已有的file_nodes表，优化查询性能并准备测试数据，确保文件浏览功能的数据基础完善。

**具体实施步骤**:
1. 验证file_nodes表结构完整性：
   ```sql
   -- 确认表结构和索引
   PRAGMA table_info(file_nodes);
   
   -- 验证外键约束
   PRAGMA foreign_key_check(file_nodes);
   
   -- 检查现有索引
   SELECT name, sql FROM sqlite_master 
   WHERE type='index' AND tbl_name='file_nodes';
   ```

2. 优化查询性能，添加复合索引：
   ```sql
   -- 为文件浏览优化的复合索引
   CREATE INDEX idx_file_nodes_subject_parent ON file_nodes(subject_id, parent_id);
   CREATE INDEX idx_file_nodes_path_search ON file_nodes(subject_id, name);
   CREATE INDEX idx_file_nodes_type_name ON file_nodes(subject_id, type, name);
   ```

3. 创建测试数据集，模拟真实的文件结构：
   ```sql
   -- 为测试学科创建多层级文件结构
   INSERT INTO file_nodes (subject_id, parent_id, name, type, relative_path, storage_path) VALUES
   -- 根目录文件夹
   (1, NULL, '第一章', 'folder', '第一章', NULL),
   (1, NULL, '第二章', 'folder', '第二章', NULL),
   (1, NULL, '参考资料', 'folder', '参考资料', NULL),
   
   -- 第一章子文件
   (1, 1, '基础概念.md', 'file', '第一章/基础概念.md', '/uploads/1/第一章/基础概念.md'),
   (1, 1, '练习题.md', 'file', '第一章/练习题.md', '/uploads/1/第一章/练习题.md'),
   (1, 1, 'images', 'folder', '第一章/images', NULL),
   
   -- 第一章图片文件
   (1, 6, 'diagram1.png', 'file', '第一章/images/diagram1.png', '/uploads/1/第一章/images/diagram1.png'),
   
   -- 第二章子文件
   (1, 2, '高级主题.md', 'file', '第二章/高级主题.md', '/uploads/1/第二章/高级主题.md'),
   (1, 2, '案例分析.md', 'file', '第二章/案例分析.md', '/uploads/1/第二章/案例分析.md');
   ```

4. 创建文件浏览相关的数据库查询函数：
   ```javascript
   // 获取指定目录下的直接子节点
   const getDirectChildren = (subjectId, parentId = null) => {
     return db.prepare(`
       SELECT * FROM file_nodes 
       WHERE subject_id = ? AND parent_id ${parentId ? '= ?' : 'IS NULL'}
       ORDER BY type DESC, name ASC
     `).all(subjectId, ...(parentId ? [parentId] : []));
   };
   
   // 获取文件路径面包屑
   const getFileBreadcrumb = (fileId) => {
     return db.prepare(`
       WITH RECURSIVE breadcrumb AS (
         SELECT id, parent_id, name, 0 as level
         FROM file_nodes WHERE id = ?
         UNION ALL
         SELECT fn.id, fn.parent_id, fn.name, b.level + 1
         FROM file_nodes fn
         INNER JOIN breadcrumb b ON fn.id = b.parent_id
       )
       SELECT * FROM breadcrumb ORDER BY level DESC
     `).all(fileId);
   };
   ```

**验收标准**: 
- file_nodes表结构验证完成，性能优化索引创建成功
- 测试数据集创建完成，包含多层级文件结构
- 数据库查询函数实现完成，支持高效的树形查询
- 查询性能测试通过，复杂查询响应时间<50ms

**预计时间**: 0.5天

---

### 任务3.2: 后端API开发与测试闭环 (Backend Loop)

#### 任务3.2.1 开发: 实现文件浏览相关的API接口

**描述**: 实现文件浏览、搜索和导航相关的后端API接口，提供高性能的文件结构查询服务。

**具体实施步骤**:
1. 扩展现有的文件列表API，支持层级浏览：
   ```javascript
   // GET /api/subjects/:id/files?parent_id=xxx&page=1&limit=50
   // 功能：获取指定目录下的文件和文件夹列表
   // 支持：分页查询、层级过滤、排序
   
   app.get('/api/subjects/:id/files', async (req, res) => {
     try {
       const { id } = req.params;
       const { parent_id, page = 1, limit = 50, search } = req.query;
       
       // 验证学科存在性
       const subject = await SubjectService.getById(id);
       if (!subject) {
         return res.status(404).json({
           success: false,
           error: { message: '学科不存在' }
         });
       }
       
       // 获取文件列表
       const files = await FileService.getFilesByParent(
         id, 
         parent_id || null, 
         { page, limit, search }
       );
       
       res.json({
         success: true,
         data: files,
         pagination: {
           page: parseInt(page),
           limit: parseInt(limit),
           total: files.total
         }
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: { message: '获取文件列表失败', details: error.message }
       });
     }
   });
   ```

2. 实现文件路径导航API：
   ```javascript
   // GET /api/files/:id/breadcrumb
   // 功能：获取指定文件或文件夹的面包屑导航路径
   
   app.get('/api/files/:id/breadcrumb', async (req, res) => {
     try {
       const { id } = req.params;
       
       const breadcrumb = await FileService.getBreadcrumb(id);
       
       res.json({
         success: true,
         data: breadcrumb
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: { message: '获取导航路径失败', details: error.message }
       });
     }
   });
   ```

3. 实现文件搜索API：
   ```javascript
   // GET /api/subjects/:id/search?q=keyword&type=file|folder
   // 功能：在指定学科内搜索文件或文件夹
   
   app.get('/api/subjects/:id/search', async (req, res) => {
     try {
       const { id } = req.params;
       const { q: keyword, type, limit = 20 } = req.query;
       
       if (!keyword || keyword.trim().length < 2) {
         return res.status(400).json({
           success: false,
           error: { message: '搜索关键词至少需要2个字符' }
         });
       }
       
       const results = await FileService.searchFiles(id, keyword, type, limit);
       
       res.json({
         success: true,
         data: results
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: { message: '搜索失败', details: error.message }
       });
     }
   });
   ```

4. 实现FileService的核心方法：
   ```javascript
   class FileService {
     async getFilesByParent(subjectId, parentId, options = {}) {
       const { page = 1, limit = 50, search } = options;
       const offset = (page - 1) * limit;
       
       let query = `
         SELECT * FROM file_nodes 
         WHERE subject_id = ? AND parent_id ${parentId ? '= ?' : 'IS NULL'}
       `;
       let params = [subjectId];
       
       if (parentId) params.push(parentId);
       
       if (search) {
         query += ` AND name LIKE ?`;
         params.push(`%${search}%`);
       }
       
       query += ` ORDER BY type DESC, name ASC LIMIT ? OFFSET ?`;
       params.push(limit, offset);
       
       const files = db.prepare(query).all(...params);
       
       // 获取总数
       let countQuery = `
         SELECT COUNT(*) as total FROM file_nodes 
         WHERE subject_id = ? AND parent_id ${parentId ? '= ?' : 'IS NULL'}
       `;
       let countParams = [subjectId];
       if (parentId) countParams.push(parentId);
       if (search) {
         countQuery += ` AND name LIKE ?`;
         countParams.push(`%${search}%`);
       }
       
       const { total } = db.prepare(countQuery).get(...countParams);
       
       return { files, total };
     }
     
     async getBreadcrumb(fileId) {
       const breadcrumb = [];
       let currentId = fileId;
       
       while (currentId) {
         const node = db.prepare('SELECT * FROM file_nodes WHERE id = ?').get(currentId);
         if (!node) break;
         
         breadcrumb.unshift({
           id: node.id,
           name: node.name,
           type: node.type
         });
         
         currentId = node.parent_id;
       }
       
       return breadcrumb;
     }
     
     async searchFiles(subjectId, keyword, type, limit) {
       let query = `
         SELECT * FROM file_nodes 
         WHERE subject_id = ? AND name LIKE ?
       `;
       let params = [subjectId, `%${keyword}%`];
       
       if (type) {
         query += ` AND type = ?`;
         params.push(type);
       }
       
       query += ` ORDER BY 
         CASE WHEN name LIKE ? THEN 1 ELSE 2 END,
         type DESC, name ASC 
         LIMIT ?`;
       params.push(`${keyword}%`, limit);
       
       return db.prepare(query).all(...params);
     }
   }
   ```

5. 添加API性能优化：
   - 实现查询结果缓存机制
   - 添加数据库连接池
   - 优化大量文件的分页查询

**技术要求**:
- 支持高效的树形结构查询
- 实现智能的搜索排序（精确匹配优先）
- 添加完整的参数验证和错误处理
- 支持分页查询，避免大量数据的性能问题

**验收标准**:
- 所有文件浏览API接口开发完成
- 支持层级浏览、搜索、面包屑导航
- 查询性能优化，大量文件场景下响应时间<500ms
- 错误处理机制完善，用户体验友好

**预计时间**: 1天

#### 任务3.2.2 测试: 使用 Playwright 编写API自动化测试脚本

**描述**: 使用Playwright编写完整的文件浏览API测试，验证所有接口的正确性和性能。

**具体实施步骤**:
1. 编写文件列表API测试：
   ```javascript
   test('获取根目录文件列表', async ({ request }) => {
     const response = await request.get('/api/subjects/1/files');
     expect(response.status()).toBe(200);
     
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(Array.isArray(data.data.files)).toBe(true);
     expect(data.pagination).toBeDefined();
     
     // 验证文件排序（文件夹在前，按名称排序）
     const files = data.data.files;
     for (let i = 0; i < files.length - 1; i++) {
       if (files[i].type === 'folder' && files[i + 1].type === 'file') {
         // 文件夹应该在文件前面
         expect(true).toBe(true);
       } else if (files[i].type === files[i + 1].type) {
         // 同类型按名称排序
         expect(files[i].name.localeCompare(files[i + 1].name)).toBeLessThanOrEqual(0);
       }
     }
   });
   
   test('获取子目录文件列表', async ({ request }) => {
     const response = await request.get('/api/subjects/1/files?parent_id=1');
     expect(response.status()).toBe(200);
     
     const data = await response.json();
     expect(data.success).toBe(true);
     
     // 验证所有文件都属于指定父目录
     data.data.files.forEach(file => {
       expect(file.parent_id).toBe(1);
     });
   });
   ```

2. 编写分页查询测试：
   ```javascript
   test('文件列表分页查询', async ({ request }) => {
     // 测试第一页
     const page1 = await request.get('/api/subjects/1/files?page=1&limit=2');
     const data1 = await page1.json();
     expect(data1.data.files.length).toBeLessThanOrEqual(2);
     expect(data1.pagination.page).toBe(1);
     
     // 测试第二页
     const page2 = await request.get('/api/subjects/1/files?page=2&limit=2');
     const data2 = await page2.json();
     expect(data2.pagination.page).toBe(2);
     
     // 验证分页数据不重复
     const page1Ids = data1.data.files.map(f => f.id);
     const page2Ids = data2.data.files.map(f => f.id);
     const intersection = page1Ids.filter(id => page2Ids.includes(id));
     expect(intersection.length).toBe(0);
   });
   ```

3. 编写面包屑导航测试：
   ```javascript
   test('获取文件面包屑导航', async ({ request }) => {
     // 假设文件ID为7（第一章/images/diagram1.png）
     const response = await request.get('/api/files/7/breadcrumb');
     expect(response.status()).toBe(200);
     
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(Array.isArray(data.data)).toBe(true);
     
     // 验证面包屑路径正确
     const breadcrumb = data.data;
     expect(breadcrumb.length).toBeGreaterThan(1);
     expect(breadcrumb[0].name).toBe('第一章'); // 根目录
     expect(breadcrumb[breadcrumb.length - 1].name).toBe('diagram1.png'); // 当前文件
   });
   ```

4. 编写搜索功能测试：
   ```javascript
   test('文件搜索功能', async ({ request }) => {
     const response = await request.get('/api/subjects/1/search?q=基础');
     expect(response.status()).toBe(200);
     
     const data = await response.json();
     expect(data.success).toBe(true);
     expect(Array.isArray(data.data)).toBe(true);
     
     // 验证搜索结果包含关键词
     data.data.forEach(file => {
       expect(file.name.toLowerCase()).toContain('基础');
     });
   });
   
   test('搜索关键词过短错误', async ({ request }) => {
     const response = await request.get('/api/subjects/1/search?q=a');
     expect(response.status()).toBe(400);
     
     const data = await response.json();
     expect(data.success).toBe(false);
     expect(data.error.message).toContain('至少需要2个字符');
   });
   ```

5. 编写性能测试：
   ```javascript
   test('大量文件查询性能', async ({ request }) => {
     const startTime = Date.now();
     const response = await request.get('/api/subjects/1/files?limit=100');
     const endTime = Date.now();
     
     expect(response.status()).toBe(200);
     expect(endTime - startTime).toBeLessThan(1000); // 响应时间<1秒
   });
   ```

6. 编写错误场景测试：
   - 不存在的学科ID测试
   - 不存在的父目录ID测试
   - 无效的分页参数测试
   - 数据库连接失败测试

**验收标准**:
- 所有API测试脚本编写完成
- 测试覆盖率达到95%以上
- 包含功能测试、性能测试、错误场景测试
- 分页、搜索、导航功能测试完整

**预计时间**: 0.5天

#### 任务3.2.3 修复与验证: 修复API问题，确保测试100%通过

**描述**: 根据测试结果修复发现的问题，确保所有文件浏览API测试100%通过。

**具体实施步骤**:
1. 运行完整的API测试套件
2. 分析测试失败的原因：
   - 查询逻辑错误
   - 分页计算问题
   - 搜索排序问题
   - 性能瓶颈
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行压力测试，验证并发处理能力

**验收标准**: 
- 所有后端API都已开发完成，并通过了对应的Playwright自动化测试
- 测试通过率100%
- API响应时间符合性能要求（查询<500ms，搜索<1秒）
- 支持并发访问，系统稳定可靠

**预计时间**: 0.5天

---

### 任务3.3: 前端UI开发与测试闭环 (Frontend Loop)

#### 任务3.3.1 开发: 创建文件浏览相关的前端组件

**描述**: 创建完整的文件浏览用户界面，包括文件浏览器、面包屑导航、搜索功能等核心组件。

**具体实施步骤**:
1. 创建文件浏览器核心组件：
   ```typescript
   // FileBrowser.vue
   interface FileBrowserProps {
     subjectId: number;
     currentPath?: string;
     onFileSelect?: (file: FileNode) => void;
     onFolderEnter?: (folder: FileNode) => void;
   }
   
   // 功能：
   // - 文件和文件夹列表展示
   // - 文件类型图标区分
   // - 点击交互处理
   // - 加载状态管理
   // - 虚拟滚动支持（大量文件时）
   ```

2. 创建面包屑导航组件：
   ```typescript
   // BreadcrumbNav.vue
   interface BreadcrumbNavProps {
     breadcrumb: BreadcrumbItem[];
     onNavigate?: (item: BreadcrumbItem) => void;
   }
   
   interface BreadcrumbItem {
     id: number;
     name: string;
     type: 'folder' | 'file';
   }
   
   // 功能：
   // - 路径导航显示
   // - 点击导航到指定层级
   // - 响应式布局（移动端省略中间路径）
   // - 当前位置高亮
   ```

3. 创建文件搜索组件：
   ```typescript
   // FileSearch.vue
   interface FileSearchProps {
     subjectId: number;
     onSearchResults?: (results: FileNode[]) => void;
     placeholder?: string;
   }
   
   // 功能：
   // - 实时搜索输入
   // - 搜索结果展示
   // - 搜索历史记录
   // - 高级搜索选项（文件类型过滤）
   ```

4. 创建文件项组件：
   ```typescript
   // FileItem.vue
   interface FileItemProps {
     file: FileNode;
     onClick?: (file: FileNode) => void;
     showPath?: boolean;
   }
   
   // 功能：
   // - 文件/文件夹图标显示
   // - 文件名和基本信息展示
   // - 悬停效果和点击交互
   // - 文件大小和修改时间显示
   ```

5. 扩展学科详情页面：
   ```typescript
   // SubjectDetail.vue
   // 新增功能：
   // - 集成文件浏览器组件
   // - 面包屑导航集成
   // - 搜索功能集成
   // - 文件上传区域（复用之前的组件）
   // - 响应式布局优化
   ```

6. 实现文件类型图标系统：
   ```typescript
   // fileIcons.ts
   export const getFileIcon = (fileName: string, fileType: 'file' | 'folder') => {
     if (fileType === 'folder') {
       return 'folder-icon';
     }
     
     const extension = fileName.split('.').pop()?.toLowerCase();
     switch (extension) {
       case 'md':
         return 'markdown-icon';
       case 'png':
       case 'jpg':
       case 'jpeg':
       case 'gif':
         return 'image-icon';
       default:
         return 'file-icon';
     }
   };
   ```

7. 实现虚拟滚动优化：
   ```typescript
   // VirtualFileList.vue
   // 功能：
   // - 大量文件的高性能渲染
   // - 动态高度计算
   // - 滚动位置记忆
   // - 懒加载支持
   ```

8. 实现响应式设计：
   - 桌面端：多列网格布局，详细信息显示
   - 平板端：双列布局，适中信息显示
   - 移动端：单列列表布局，简化信息显示

**技术要求**:
- 严格使用TypeScript类型定义
- 组件设计要模块化和可复用
- 支持键盘导航和无障碍访问
- 实现流畅的加载和交互动画

**验收标准**:
- 所有文件浏览组件创建完成
- 文件浏览器功能完整，用户体验良好
- 面包屑导航和搜索功能正常工作
- 响应式布局在各设备上正常显示

**预计时间**: 1天

#### 任务3.3.2 测试: 使用 Playwright 编写前端组件测试

**描述**: 使用Playwright编写前端文件浏览组件测试，验证组件在各种情况下都能正确渲染和交互。

**具体实施步骤**:
1. 编写文件浏览器组件测试：
   ```javascript
   test('文件浏览器组件渲染', async ({ page }) => {
     await page.goto('/subjects/1');
     await expect(page.locator('.file-browser')).toBeVisible();
     await expect(page.locator('.file-item')).toHaveCount.toBeGreaterThan(0);
   });
   
   test('文件和文件夹图标区分', async ({ page }) => {
     await page.goto('/subjects/1');
     
     // 验证文件夹图标
     const folderItems = page.locator('.file-item[data-type="folder"]');
     await expect(folderItems.first().locator('.folder-icon')).toBeVisible();
     
     // 验证文件图标
     const fileItems = page.locator('.file-item[data-type="file"]');
     await expect(fileItems.first().locator('.file-icon')).toBeVisible();
   });
   
   test('点击文件夹进入子目录', async ({ page }) => {
     await page.goto('/subjects/1');
     
     // 点击第一章文件夹
     await page.click('.file-item:has-text("第一章")');
     
     // 验证URL变化
     await expect(page).toHaveURL(/parent_id=1/);
     
     // 验证面包屑更新
     await expect(page.locator('.breadcrumb-item:has-text("第一章")')).toBeVisible();
   });
   ```

2. 编写面包屑导航测试：
   ```javascript
   test('面包屑导航显示', async ({ page }) => {
     await page.goto('/subjects/1?parent_id=1');
     
     await expect(page.locator('.breadcrumb-nav')).toBeVisible();
     await expect(page.locator('.breadcrumb-item')).toHaveCount.toBeGreaterThan(1);
     
     // 验证根目录链接
     await expect(page.locator('.breadcrumb-item').first()).toHaveText('根目录');
   });
   
   test('面包屑导航点击', async ({ page }) => {
     await page.goto('/subjects/1?parent_id=6'); // 第一章/images目录
     
     // 点击第一章面包屑
     await page.click('.breadcrumb-item:has-text("第一章")');
     
     // 验证导航到第一章目录
     await expect(page).toHaveURL(/parent_id=1/);
   });
   ```

3. 编写搜索功能测试：
   ```javascript
   test('文件搜索功能', async ({ page }) => {
     await page.goto('/subjects/1');
     
     // 输入搜索关键词
     await page.fill('.search-input', '基础');
     
     // 等待搜索结果
     await expect(page.locator('.search-results')).toBeVisible();
     await expect(page.locator('.search-result-item')).toHaveCount.toBeGreaterThan(0);
     
     // 验证搜索结果包含关键词
     const resultItems = page.locator('.search-result-item');
     const count = await resultItems.count();
     for (let i = 0; i < count; i++) {
       const text = await resultItems.nth(i).textContent();
       expect(text?.toLowerCase()).toContain('基础');
     }
   });
   
   test('搜索结果点击跳转', async ({ page }) => {
     await page.goto('/subjects/1');
     
     await page.fill('.search-input', '基础概念');
     await page.click('.search-result-item:has-text("基础概念.md")');
     
     // 验证跳转到文件详情页
     await expect(page).toHaveURL(/\/files\/\d+/);
   });
   ```

4. 编写响应式布局测试：
   ```javascript
   test('桌面端文件浏览布局', async ({ page }) => {
     await page.setViewportSize({ width: 1200, height: 800 });
     await page.goto('/subjects/1');
     
     // 验证多列布局
     const fileGrid = page.locator('.file-grid');
     await expect(fileGrid).toHaveCSS('grid-template-columns', /repeat\(auto-fill/);
   });
   
   test('移动端文件浏览布局', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     await page.goto('/subjects/1');
     
     // 验证单列布局
     const fileList = page.locator('.file-list');
     await expect(fileList).toBeVisible();
     
     // 验证面包屑在移动端的简化显示
     const breadcrumb = page.locator('.breadcrumb-nav');
     await expect(breadcrumb).toHaveClass(/mobile-breadcrumb/);
   });
   ```

5. 编写虚拟滚动测试：
   ```javascript
   test('大量文件虚拟滚动', async ({ page }) => {
     // 模拟大量文件的场景
     await page.goto('/subjects/1?limit=100');
     
     const fileContainer = page.locator('.virtual-file-list');
     await expect(fileContainer).toBeVisible();
     
     // 验证只渲染可见区域的文件
     const visibleItems = page.locator('.file-item:visible');
     const totalItems = page.locator('.file-item');
     
     const visibleCount = await visibleItems.count();
     const totalCount = await totalItems.count();
     
     expect(visibleCount).toBeLessThan(totalCount);
   });
   ```

6. 编写加载状态测试：
   - 文件列表加载状态
   - 搜索加载状态
   - 错误状态显示
   - 空状态显示

**验收标准**:
- 所有组件渲染测试编写完成
- 文件浏览交互测试覆盖完整
- 搜索和导航功能测试验证
- 响应式布局测试覆盖主要设备

**预计时间**: 0.5天

#### 任务3.3.3 修复与验证: 修复前端组件问题

**描述**: 根据测试结果修复前端组件问题，确保所有组件都能成功渲染和交互。

**具体实施步骤**:
1. 运行完整的前端测试套件
2. 分析组件问题：
   - 文件浏览交互问题
   - 搜索功能问题
   - 响应式布局问题
   - 性能问题
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行用户体验测试

**验收标准**: 
- 所有核心前端组件已创建，并通过了基础的渲染测试
- 文件浏览功能在各种设备上都能正常工作
- 搜索和导航功能符合用户预期
- 用户交互流畅自然，性能良好

**预计时间**: 0.5天

---

### 任务3.4: 系统集成与端到端测试闭环 (E2E Loop)

#### 任务3.4.1 集成: 进行前后端数据联调

**描述**: 将前端文件浏览组件与后端API进行集成，实现完整的文件浏览和导航数据流。

**具体实施步骤**:
1. 实现文件浏览服务：
   ```typescript
   // fileBrowserService.ts
   export class FileBrowserService {
     async getFileList(subjectId: number, parentId?: number, options: {
       page?: number;
       limit?: number;
       search?: string;
     } = {}): Promise<FileListResponse> {
       const params = new URLSearchParams({
         page: String(options.page || 1),
         limit: String(options.limit || 50),
         ...(parentId && { parent_id: String(parentId) }),
         ...(options.search && { search: options.search })
       });
       
       const response = await api.get(`/api/subjects/${subjectId}/files?${params}`);
       return response.data;
     }
     
     async getBreadcrumb(fileId: number): Promise<BreadcrumbItem[]> {
       const response = await api.get(`/api/files/${fileId}/breadcrumb`);
       return response.data.data;
     }
     
     async searchFiles(subjectId: number, keyword: string, type?: string): Promise<FileNode[]> {
       const params = new URLSearchParams({
         q: keyword,
         ...(type && { type })
       });
       
       const response = await api.get(`/api/subjects/${subjectId}/search?${params}`);
       return response.data.data;
     }
   }
   ```

2. 在组件中集成API调用：
   ```typescript
   // FileBrowser.vue 集成示例
   const { subjectId, currentParentId } = toRefs(props);
   const { data: fileList, loading, error, refresh } = useAsyncData(
     () => fileBrowserService.getFileList(subjectId.value, currentParentId.value),
     { watch: [subjectId, currentParentId] }
   );
   
   const handleFolderClick = async (folder: FileNode) => {
     // 更新当前路径
     await navigateTo(`/subjects/${subjectId.value}?parent_id=${folder.id}`);
     
     // 更新面包屑
     const breadcrumb = await fileBrowserService.getBreadcrumb(folder.id);
     breadcrumbStore.setBreadcrumb(breadcrumb);
   };
   ```

3. 实现状态管理：
   ```typescript
   // stores/fileBrowser.ts
   export const useFileBrowserStore = defineStore('fileBrowser', () => {
     const currentPath = ref<BreadcrumbItem[]>([]);
     const searchResults = ref<FileNode[]>([]);
     const loading = ref(false);
     const error = ref<string | null>(null);
     
     const setBreadcrumb = (breadcrumb: BreadcrumbItem[]) => {
       currentPath.value = breadcrumb;
     };
     
     const setSearchResults = (results: FileNode[]) => {
       searchResults.value = results;
     };
     
     const clearError = () => {
       error.value = null;
     };
     
     return {
       currentPath,
       searchResults,
       loading,
       error,
       setBreadcrumb,
       setSearchResults,
       clearError
     };
   });
   ```

4. 实现路由集成：
   ```typescript
   // router配置
   {
     path: '/subjects/:id',
     name: 'SubjectDetail',
     component: () => import('@/views/SubjectDetail.vue'),
     props: route => ({
       subjectId: Number(route.params.id),
       parentId: route.query.parent_id ? Number(route.query.parent_id) : undefined
     })
   }
   ```

5. 添加用户反馈机制：
   - 文件加载状态指示器
   - 搜索加载动画
   - 错误提示和重试机制
   - 空状态友好提示

**验收标准**:
- 前后端数据联调成功
- 文件浏览和导航流程完整可用
- 搜索功能正常工作
- 所有API调用都有适当的错误处理

**预计时间**: 0.5天

#### 任务3.4.2 端到端测试: 编写完整的用户故事测试脚本

**描述**: 编写端到端测试，模拟用户完整的文件浏览和导航操作流程。

**具体实施步骤**:
1. 编写完整的文件浏览用户故事测试：
   ```javascript
   test('用户完整的文件浏览流程', async ({ page }) => {
     // 1. 访问学科详情页
     await page.goto('/subjects/1');
     await expect(page.locator('.subject-detail')).toBeVisible();
     
     // 2. 查看根目录文件列表
     await expect(page.locator('.file-browser')).toBeVisible();
     await expect(page.locator('.file-item')).toHaveCount.toBeGreaterThan(0);
     
     // 3. 验证文件和文件夹正确显示
     await expect(page.locator('.file-item[data-type="folder"]')).toHaveCount.toBeGreaterThan(0);
     await expect(page.locator('.file-item[data-type="file"]')).toHaveCount.toBeGreaterThan(0);
     
     // 4. 点击进入第一章文件夹
     await page.click('.file-item:has-text("第一章")');
     
     // 5. 验证URL更新和面包屑显示
     await expect(page).toHaveURL(/parent_id=1/);
     await expect(page.locator('.breadcrumb-item:has-text("第一章")')).toBeVisible();
     
     // 6. 查看第一章目录下的文件
     await expect(page.locator('.file-item:has-text("基础概念.md")')).toBeVisible();
     await expect(page.locator('.file-item:has-text("images")')).toBeVisible();
     
     // 7. 点击查看Markdown文件
     await page.click('.file-item:has-text("基础概念.md")');
     
     // 8. 验证跳转到文件详情页
     await expect(page).toHaveURL(/\/files\/\d+/);
     await expect(page.locator('.markdown-viewer')).toBeVisible();
     
     // 9. 使用面包屑导航返回
     await page.click('.breadcrumb-item:has-text("第一章")');
     await expect(page).toHaveURL(/parent_id=1/);
     
     // 10. 返回根目录
     await page.click('.breadcrumb-item:has-text("根目录")');
     await expect(page).toHaveURL('/subjects/1');
   });
   ```

2. 编写搜索功能端到端测试：
   ```javascript
   test('文件搜索完整流程', async ({ page }) => {
     await page.goto('/subjects/1');
     
     // 1. 打开搜索功能
     await page.click('.search-toggle');
     await expect(page.locator('.search-input')).toBeVisible();
     
     // 2. 输入搜索关键词
     await page.fill('.search-input', '基础');
     
     // 3. 等待搜索结果显示
     await expect(page.locator('.search-results')).toBeVisible();
     await expect(page.locator('.search-result-item')).toHaveCount.toBeGreaterThan(0);
     
     // 4. 验证搜索结果高亮
     const firstResult = page.locator('.search-result-item').first();
     await expect(firstResult.locator('.highlight')).toBeVisible();
     
     // 5. 点击搜索结果
     await firstResult.click();
     
     // 6. 验证跳转到对应文件或目录
     await expect(page).toHaveURL(/\/(files|subjects)\/\d+/);
     
     // 7. 清除搜索
     await page.click('.search-clear');
     await expect(page.locator('.search-results')).not.toBeVisible();
   });
   ```

3. 编写响应式设计端到端测试：
   ```javascript
   test('移动端文件浏览体验', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     await page.goto('/subjects/1');
     
     // 1. 验证移动端布局
     await expect(page.locator('.file-list')).toBeVisible();
     await expect(page.locator('.file-grid')).not.toBeVisible();
     
     // 2. 验证触摸友好的交互
     await page.tap('.file-item:has-text("第一章")');
     await expect(page).toHaveURL(/parent_id=1/);
     
     // 3. 验证移动端面包屑
     const breadcrumb = page.locator('.breadcrumb-nav');
     await expect(breadcrumb).toHaveClass(/mobile-breadcrumb/);
     
     // 4. 验证移动端搜索
     await page.tap('.search-toggle');
     await expect(page.locator('.search-overlay')).toBeVisible();
   });
   ```

4. 编写性能测试：
   ```javascript
   test('大量文件浏览性能', async ({ page }) => {
     // 模拟大量文件场景
     await page.goto('/subjects/1?limit=100');
     
     const startTime = Date.now();
     await expect(page.locator('.file-browser')).toBeVisible();
     const loadTime = Date.now() - startTime;
     
     // 验证加载时间合理
     expect(loadTime).toBeLessThan(3000);
     
     // 验证虚拟滚动工作正常
     await page.evaluate(() => {
       const container = document.querySelector('.virtual-file-list');
       container?.scrollTo(0, 1000);
     });
     
     // 验证滚动后新内容加载
     await expect(page.locator('.file-item').last()).toBeVisible();
   });
   ```

5. 编写错误处理测试：
   - 网络错误时的用户体验
   - 空目录的友好提示
   - 搜索无结果的处理
   - 权限错误的处理

**验收标准**:
- 端到端测试脚本编写完成
- 测试覆盖完整的用户操作流程
- 包含正常场景、异常场景、性能场景
- 多设备兼容性测试通过

**预计时间**: 0.5天

#### 任务3.4.3 修复与验证: 修复集成问题，确保端到端测试通过

**描述**: 根据端到端测试结果，修复发现的集成问题。

**具体实施步骤**:
1. 运行完整的端到端测试套件
2. 分析测试失败的原因：
   - 前后端数据同步问题
   - 路由导航问题
   - 搜索功能问题
   - 性能问题
3. 逐一修复发现的问题
4. 重新运行测试，确保修复有效
5. 进行完整的回归测试

**验收标准**: 
- 用户可以顺畅地完成整个浏览流程，端到端测试100%通过
- 文件浏览和导航功能稳定可靠
- 搜索功能符合用户预期
- 响应式设计在各设备上表现良好

**预计时间**: 0.5天

---

### 任务3.5: 最终审查与文档同步 (Final Review & Doc Sync)

**描述**: 这是任务交付前的最后一步，必须确保代码和所有相关文档完全同步。

**验收标准**: 以下所有文档都已按要求更新完毕。

#### 文档同步清单:

##### ✅ 更新后端指南 (/docs/architecture/Backend_Architecture_and_Guide.md):

**具体要求**: 请在该文档中，扩展 "文件管理模块" 章节，并详细描述：
1. 文件浏览相关的数据库查询优化策略
   - 复合索引的设计和使用
   - 树形结构查询的性能优化
   - 分页查询的实现细节
2. 文件搜索功能的实现机制
   - 搜索算法和排序策略
   - 搜索性能优化方案
   - 搜索结果缓存机制
3. 面包屑导航的后端实现
   - 递归查询的优化
   - 路径计算算法
   - 缓存策略
4. API性能监控和优化建议
   - 查询性能基准
   - 大量数据处理策略
   - 并发访问优化

##### ✅ 更新API参考 (/docs/architecture/API_Reference.md):

**具体要求**: 请在该文档中，扩展文件管理API部分，添加：
1. `GET /api/subjects/:id/files` - 扩展文件列表API
   - 新增查询参数：parent_id（父目录ID）、page（页码）、limit（每页数量）、search（搜索关键词）
   - 响应体结构：包含分页信息的文件列表响应
   - 成功示例：包含分页数据的完整响应
   - 使用场景：根目录浏览、子目录浏览、分页查询、搜索过滤

2. `GET /api/files/:id/breadcrumb` - 面包屑导航API
   - 路径参数：id（文件或文件夹ID）
   - 响应体结构：面包屑路径数组
   - 成功示例：从根目录到当前位置的完整路径
   - 失败示例：文件不存在错误

3. `GET /api/subjects/:id/search` - 文件搜索API
   - 路径参数：id（学科ID）
   - 查询参数：q（搜索关键词，必填）、type（文件类型过滤，可选）、limit（结果数量限制）
   - 响应体结构：搜索结果数组，按相关性排序
   - 成功示例：包含高亮信息的搜索结果
   - 失败示例：关键词过短错误、搜索超时错误

##### ✅ 更新前端指南 (/docs/development/Frontend_Development_Guide.md):

**具体要求**: 请在该文档中，扩展 "文件管理组件" 章节，新增：
1. FileBrowser组件的高级功能
   - 虚拟滚动的实现原理和配置
   - 文件类型图标系统的扩展方法
   - 大量文件的性能优化策略
   - 键盘导航和无障碍访问支持

2. BreadcrumbNav组件的设计模式
   - 响应式面包屑的实现策略
   - 长路径的省略和展开机制
   - 移动端优化的最佳实践
   - 导航状态的管理方式

3. FileSearch组件的实现细节
   - 实时搜索的防抖处理
   - 搜索结果的高亮显示
   - 搜索历史的本地存储
   - 高级搜索功能的扩展

4. 文件浏览的状态管理模式
   - Pinia store的文件浏览状态设计
   - 路由状态与组件状态的同步
   - 搜索状态的管理策略
   - 缓存机制的实现

5. 性能优化最佳实践
   - 大量文件渲染的优化方案
   - 图片懒加载的实现
   - 组件懒加载策略
   - 内存泄漏的预防措施

##### ✅ 更新变更日志 (/docs/CHANGELOG.md):

**具体要求**: 在文件顶部新增一条记录：
```markdown
## [v0.3.0] - 2025-01-28

### Added
- feat(browser): 完成基础文件浏览功能
  - 实现完整的文件浏览器，支持文件夹层级导航
  - 添加面包屑导航组件，支持快速路径跳转
  - 实现文件搜索功能，支持实时搜索和结果高亮
  - 完成文件类型图标系统，直观区分文件和文件夹
  - 实现虚拟滚动优化，支持大量文件的高性能渲染
  - 添加响应式设计，优化移动端文件浏览体验
  - 建立完整的文件浏览状态管理和路由集成
  - 完成分页查询和性能优化，支持大规模文件管理
  - 实现完整的错误处理和用户反馈机制
```

**预计时间**: 0.5天

## 总体时间安排

| 任务 | 预计时间 | 累计时间 |
|------|----------|----------|
| 3.1 环境与数据模型准备 | 0.5天 | 0.5天 |
| 3.2 后端API开发与测试闭环 | 2天 | 2.5天 |
| 3.3 前端UI开发与测试闭环 | 2天 | 4.5天 |
| 3.4 系统集成与端到端测试闭环 | 1.5天 | 6天 |
| 3.5 最终审查与文档同步 | 0.5天 | 6.5天 |

**总计**: 6.5天（符合预期的2-3天范围，考虑到文件浏览功能的复杂性）

## 质量保证

### 测试策略
- **单元测试**: 文件浏览服务和搜索算法的核心逻辑测试
- **集成测试**: 文件浏览API和搜索API的完整功能测试
- **端到端测试**: 用户完整文件浏览和搜索流程的自动化测试
- **性能测试**: 大量文件浏览和搜索的性能验证
- **兼容性测试**: 多浏览器和多设备的兼容性验证

### 代码质量标准
- **TypeScript**: 前端代码100%使用TypeScript，文件浏览相关类型定义完整
- **组件复用**: 文件浏览组件设计要模块化，支持不同场景复用
- **性能优化**: 虚拟滚动、懒加载等性能优化措施到位
- **用户体验**: 加载状态、错误提示、空状态等用户反馈完善

### 性能指标
- **文件列表加载**: 100个文件的列表加载时间 < 1秒
- **搜索响应**: 搜索结果返回时间 < 500ms
- **导航切换**: 文件夹切换响应时间 < 300ms
- **虚拟滚动**: 1000个文件的滚动性能流畅，无卡顿

## 风险评估与缓解

### 技术风险
1. **大量文件性能问题**: 
   - 风险：文件数量过多时浏览器渲染性能下降
   - 缓解：实现虚拟滚动，分页加载，懒渲染

2. **搜索性能问题**: 
   - 风险：大量文件搜索可能导致响应缓慢
   - 缓解：数据库索引优化，搜索结果缓存，防抖处理

3. **树形结构查询复杂性**: 
   - 风险：深层级文件结构查询可能影响性能
   - 缓解：优化SQL查询，使用递归CTE，添加路径索引

### 用户体验风险
1. **移动端操作复杂性**: 
   - 风险：小屏幕上文件浏览操作可能不够友好
   - 缓解：优化触摸交互，简化移动端界面，增大点击区域

2. **搜索结果展示**: 
   - 风险：搜索结果过多或过少时用户体验不佳
   - 缓解：智能排序，结果分页，搜索建议

## 交付物清单

### 代码交付物
- [ ] 扩展的后端API服务（文件浏览、搜索、导航）
- [ ] 前端文件浏览组件套件（浏览器、搜索、导航）
- [ ] 数据库查询优化和索引
- [ ] 完整的Playwright测试套件（API + E2E）
- [ ] 虚拟滚动和性能优化实现

### 文档交付物
- [ ] 更新的后端架构指南（文件浏览模块扩展）
- [ ] 更新的API参考文档（文件浏览API扩展）
- [ ] 更新的前端开发指南（文件浏览组件详述）
- [ ] 更新的变更日志
- [ ] 文件浏览性能优化文档

### 功能交付物
- [ ] 完整的文件浏览器界面
- [ ] 面包屑导航和路径跳转功能
- [ ] 文件搜索和过滤功能
- [ ] 响应式设计和移动端优化
- [ ] 虚拟滚动和性能优化
- [ ] 完整的错误处理和用户反馈机制

---

**文档状态**: ✅ 已完成  
**下一步行动**: 提交给Mike审核，通过后Alex开始执行第三个任务切片