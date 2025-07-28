# 总体架构蓝图 - 期末复习平台

## 文档信息

| 项目 | 内容 |
|------|------|
| **产品名称** | 期末复习平台 |
| **架构版本** | v1.0 |
| **创建日期** | 2025-01-28 |
| **负责人** | Bob (架构师) |
| **基于文档** | PRD_期末复习平台_v1.0.md, Task_Planning_期末复习平台_v1.0.md |
| **架构模式** | 分层架构 + 前后端分离 |

## 架构概述

### 设计原则
1. **分层解耦**：清晰的层次划分，降低组件间耦合度
2. **可扩展性**：支持功能扩展和技术栈升级
3. **高性能**：优化文件处理和数据查询性能
4. **易维护**：模块化设计，便于开发和维护
5. **用户体验**：响应式设计，支持多设备访问

### 核心特性
- **无需认证**：完全开放的访问模式
- **文件结构保持**：100%保留原始文件夹层级
- **在线渲染**：Markdown文件直接在线阅读
- **批量上传**：支持文件夹整体上传
- **跨设备支持**：响应式布局适配各种设备

## 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   桌面端    │  │   平板端    │  │   移动端    │          │
│  │  (>1024px)  │  │ (768-1024px)│  │  (<768px)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      展示层 (Frontend)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Vue3 + TypeScript + Vben Admin               │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │  学科管理   │ │  文件浏览   │ │ Markdown    │      │ │
│  │  │   组件      │ │    组件     │ │  渲染组件   │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │  文件上传   │ │  响应式布局 │ │  路由管理   │      │ │
│  │  │   组件      │ │   组件      │ │   组件      │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    接口层 (API Gateway)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Nginx 反向代理                          │ │
│  │  • 静态资源服务  • 负载均衡  • SSL终止  • 压缩         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Node.js + Express/Koa                     │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │ Subject API │ │ Upload API  │ │  Files API  │      │ │
│  │  │ /subjects   │ │ /upload     │ │ /files      │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │ Static API  │ │ 错误处理    │ │ CORS 中间件 │      │ │
│  │  │ /static     │ │  中间件     │ │             │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   业务逻辑层 (Business Logic)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  学科管理   │ │  文件处理   │ │ Markdown    │          │
│  │   服务      │ │   服务      │ │  处理服务   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  路径解析   │ │  树形结构   │ │  文件系统   │          │
│  │   服务      │ │   服务      │ │   服务      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  数据访问层 (Data Access)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Subject DAO │ │FileNode DAO │ │  查询优化   │          │
│  │             │ │             │ │   工具      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     存储层 (Storage)                        │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│  │        SQLite 数据库        │ │      文件系统存储       │ │
│  │  ┌─────────────────────────┐ │ │  ┌─────────────────────┐ │ │
│  │  │     subjects 表         │ │ │  │   /uploads/         │ │ │
│  │  │  • id                   │ │ │  │  ├─ subject_1/     │ │ │
│  │  │  • name                 │ │ │  │  ├─ subject_2/     │ │ │
│  │  │  • created_at           │ │ │  │  └─ ...            │ │ │
│  │  └─────────────────────────┘ │ │  └─────────────────────┘ │ │
│  │  ┌─────────────────────────┐ │ │                         │ │
│  │  │    file_nodes 表        │ │ │                         │ │
│  │  │  • id                   │ │ │                         │ │
│  │  │  • subject_id           │ │ │                         │ │
│  │  │  • parent_id            │ │ │                         │ │
│  │  │  • name                 │ │ │                         │ │
│  │  │  • type                 │ │ │                         │ │
│  │  │  • relative_path        │ │ │                         │ │
│  │  │  • storage_path         │ │ │                         │ │
│  │  └─────────────────────────┘ │ │                         │ │
│  └─────────────────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈详述

### 前端技术栈
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **Vue3** | ^3.3.0 | 前端框架 | 组合式API，更好的TypeScript支持 |
| **TypeScript** | ^5.0.0 | 类型系统 | 提供类型安全，减少运行时错误 |
| **Vben Admin** | ^2.10.0 | 管理后台框架 | 完整的后台解决方案，开箱即用 |
| **Ant Design Vue** | ^4.0.0 | UI组件库 | 丰富的组件，良好的设计规范 |
| **UnoCSS** | ^0.58.0 | CSS框架 | 原子化CSS，高性能，可定制 |
| **Vite** | ^5.0.0 | 构建工具 | 快速的开发服务器和构建 |
| **Vue Router** | ^4.2.0 | 路由管理 | 官方路由解决方案 |
| **Pinia** | ^2.1.0 | 状态管理 | Vue3官方推荐的状态管理 |

### 后端技术栈
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **Node.js** | ^18.0.0 | 运行时环境 | 高性能，丰富的生态系统 |
| **Express** | ^4.18.0 | Web框架 | 成熟稳定，中间件丰富 |
| **better-sqlite3** | ^9.0.0 | SQLite驱动 | 同步API，高性能，易于使用 |
| **multer** | ^1.4.5 | 文件上传 | 成熟的文件上传中间件 |
| **markdown-it** | ^14.0.0 | Markdown解析 | 功能强大，插件丰富 |
| **cors** | ^2.8.5 | 跨域处理 | 标准的CORS中间件 |
| **helmet** | ^7.0.0 | 安全中间件 | 设置安全相关的HTTP头 |

### 部署技术栈
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **Docker** | ^24.0.0 | 容器化 | 环境一致性，易于部署 |
| **Docker Compose** | ^2.20.0 | 容器编排 | 简化多容器应用管理 |
| **Nginx** | ^1.24.0 | 反向代理 | 高性能，静态资源服务 |

## 数据库设计

### 表结构设计

#### subjects 表 - 学科信息
```sql
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_created_at ON subjects(created_at);
```

#### file_nodes 表 - 文件节点（树形结构）
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

-- 索引
CREATE INDEX idx_file_nodes_subject_id ON file_nodes(subject_id);
CREATE INDEX idx_file_nodes_parent_id ON file_nodes(parent_id);
CREATE INDEX idx_file_nodes_type ON file_nodes(type);
CREATE INDEX idx_file_nodes_relative_path ON file_nodes(relative_path);
```

### 数据库查询优化

#### 树形结构查询
```sql
-- 获取指定目录下的直接子节点
SELECT * FROM file_nodes 
WHERE subject_id = ? AND parent_id = ?
ORDER BY type DESC, name ASC;

-- 获取完整的文件树（使用递归CTE）
WITH RECURSIVE file_tree AS (
    SELECT id, subject_id, parent_id, name, type, relative_path, 0 as level
    FROM file_nodes 
    WHERE subject_id = ? AND parent_id IS NULL
    
    UNION ALL
    
    SELECT fn.id, fn.subject_id, fn.parent_id, fn.name, fn.type, fn.relative_path, ft.level + 1
    FROM file_nodes fn
    INNER JOIN file_tree ft ON fn.parent_id = ft.id
)
SELECT * FROM file_tree ORDER BY level, type DESC, name ASC;
```

## 核心组件设计

### 前端核心组件

#### 1. SubjectManager - 学科管理组件
```typescript
interface SubjectManagerProps {
  mode: 'list' | 'create' | 'edit';
  onSubjectCreated?: (subject: Subject) => void;
}

// 功能：
// - 学科列表展示（卡片式布局）
// - 学科创建弹窗
// - 响应式布局适配
// - 加载状态和错误处理
```

#### 2. FileUploader - 文件上传组件
```typescript
interface FileUploaderProps {
  subjectId: number;
  onUploadComplete?: (result: UploadResult) => void;
  onProgress?: (progress: UploadProgress) => void;
}

// 功能：
// - webkitdirectory文件夹选择
// - 批量文件上传
// - 上传进度显示
// - 错误处理和重试
// - 兼容性检测和降级
```

#### 3. FileBrowser - 文件浏览器组件
```typescript
interface FileBrowserProps {
  subjectId: number;
  currentPath?: string;
  onFileSelect?: (file: FileNode) => void;
}

// 功能：
// - 文件夹层级导航
// - 面包屑导航
// - 文件和文件夹图标区分
// - 虚拟滚动（大量文件时）
// - 搜索和过滤
```

#### 4. MarkdownViewer - Markdown渲染组件
```typescript
interface MarkdownViewerProps {
  content: string;
  baseUrl?: string;
  onImageLoad?: (src: string) => void;
}

// 功能：
// - Markdown语法渲染
// - 图片懒加载
// - 代码高亮
// - 表格响应式处理
// - 目录导航
```

### 后端核心服务

#### 1. SubjectService - 学科管理服务
```javascript
class SubjectService {
  async createSubject(name, description) {
    // 验证学科名称唯一性
    // 创建学科记录
    // 创建对应的文件存储目录
  }
  
  async getSubjects() {
    // 获取所有学科列表
    // 包含文件统计信息
  }
  
  async getSubjectById(id) {
    // 获取指定学科详情
  }
}
```

#### 2. FileService - 文件处理服务
```javascript
class FileService {
  async uploadFiles(subjectId, files) {
    // 批量处理上传文件
    // 解析文件夹结构
    // 存储文件到磁盘
    // 更新数据库记录
  }
  
  async getFileTree(subjectId, parentId) {
    // 获取文件树结构
    // 支持分页和懒加载
  }
  
  async getFileContent(fileId) {
    // 获取文件内容
    // 处理Markdown图片路径
  }
}
```

#### 3. MarkdownProcessor - Markdown处理服务
```javascript
class MarkdownProcessor {
  async processContent(content, basePath) {
    // 解析Markdown内容
    // 替换相对路径图片为绝对URL
    // 渲染HTML
  }
  
  resolveImagePath(imagePath, basePath) {
    // 解析相对路径
    // 生成访问URL
  }
}
```

#### 4. PathResolver - 路径解析服务
```javascript
class PathResolver {
  resolvePath(relativePath, basePath) {
    // 处理 ./、../、直接文件名等格式
    // 返回规范化的绝对路径
  }
  
  generateStoragePath(subjectId, relativePath) {
    // 生成文件存储路径
    // 确保路径安全性
  }
}
```

## API接口设计

### RESTful API规范

#### 学科管理接口
```
POST   /api/subjects           # 创建学科
GET    /api/subjects           # 获取学科列表
GET    /api/subjects/:id       # 获取学科详情
PUT    /api/subjects/:id       # 更新学科信息
DELETE /api/subjects/:id       # 删除学科
```

#### 文件管理接口
```
POST   /api/subjects/:id/upload    # 上传文件到指定学科
GET    /api/subjects/:id/files     # 获取学科文件树
GET    /api/subjects/:id/files/:nodeId  # 获取指定节点的子文件
GET    /api/files/:id              # 获取文件内容
GET    /api/files/:id/download     # 下载文件
```

#### 静态资源接口
```
GET    /api/static/:subjectId/*    # 访问静态资源（图片等）
```

### API响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2025-01-28T10:00:00Z"
}
```

### 错误处理格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": []
  },
  "timestamp": "2025-01-28T10:00:00Z"
}
```

## 文件存储策略

### 存储目录结构
```
/uploads/
├── subject_1/
│   ├── folder1/
│   │   ├── file1.md
│   │   └── images/
│   │       └── pic1.png
│   └── folder2/
│       └── file2.md
├── subject_2/
│   └── notes/
│       ├── chapter1.md
│       └── assets/
│           └── diagram.jpg
└── .metadata/
    ├── checksums.json
    └── backup_info.json
```

### 文件命名策略
- **保持原名**：尽可能保持用户原始文件名
- **冲突处理**：同名文件添加时间戳后缀
- **编码处理**：统一使用UTF-8编码
- **安全检查**：过滤危险字符和路径

### 存储优化
- **文件压缩**：对文本文件进行gzip压缩
- **重复检测**：基于MD5哈希检测重复文件
- **定期清理**：清理孤立文件和临时文件
- **备份策略**：定期备份重要数据

## 性能优化策略

### 前端性能优化

#### 1. 代码分割和懒加载
```javascript
// 路由懒加载
const routes = [
  {
    path: '/subjects',
    component: () => import('@/views/SubjectList.vue')
  },
  {
    path: '/subjects/:id',
    component: () => import('@/views/SubjectDetail.vue')
  }
];

// 组件懒加载
const MarkdownViewer = defineAsyncComponent(() => 
  import('@/components/MarkdownViewer.vue')
);
```

#### 2. 虚拟滚动
```javascript
// 大量文件列表使用虚拟滚动
<VirtualList
  :items="fileList"
  :item-height="60"
  :visible-count="20"
/>
```

#### 3. 图片懒加载
```javascript
// 图片懒加载指令
const lazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      });
    });
    observer.observe(el);
  }
};
```

### 后端性能优化

#### 1. 数据库查询优化
```javascript
// 使用索引优化查询
const getFilesBySubject = async (subjectId, limit = 50, offset = 0) => {
  return db.prepare(`
    SELECT * FROM file_nodes 
    WHERE subject_id = ? 
    ORDER BY type DESC, name ASC 
    LIMIT ? OFFSET ?
  `).all(subjectId, limit, offset);
};

// 批量插入优化
const insertFileNodes = async (nodes) => {
  const stmt = db.prepare(`
    INSERT INTO file_nodes (subject_id, parent_id, name, type, relative_path, storage_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const transaction = db.transaction((nodes) => {
    for (const node of nodes) {
      stmt.run(node.subjectId, node.parentId, node.name, node.type, node.relativePath, node.storagePath);
    }
  });
  
  transaction(nodes);
};
```

#### 2. 文件处理优化
```javascript
// 流式文件处理
const processLargeFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(targetPath);
    
    readStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};

// 并发控制
const pLimit = require('p-limit');
const limit = pLimit(5); // 最多5个并发

const uploadPromises = files.map(file => 
  limit(() => processFile(file))
);
```

#### 3. 缓存策略
```javascript
// 内存缓存热点数据
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10分钟过期

const getSubjectWithCache = async (id) => {
  const cacheKey = `subject_${id}`;
  let subject = cache.get(cacheKey);
  
  if (!subject) {
    subject = await SubjectService.getById(id);
    cache.set(cacheKey, subject);
  }
  
  return subject;
};
```

## 安全性设计

### 输入验证
```javascript
// 参数验证中间件
const validateSubject = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || name.length < 1 || name.length > 50) {
    return res.status(400).json({
      success: false,
      error: { message: '学科名称长度必须在1-50字符之间' }
    });
  }
  
  // 过滤危险字符
  req.body.name = name.replace(/[<>\"'&]/g, '');
  next();
};
```

### 文件安全
```javascript
// 文件类型验证
const allowedTypes = ['.md', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
const isAllowedFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

// 路径安全检查
const isSecurePath = (filePath) => {
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes('../') && !normalizedPath.startsWith('/');
};
```

### HTTP安全头
```javascript
// 使用helmet设置安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));
```

## 部署架构

### Docker容器化

#### 前端容器 (Dockerfile.frontend)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 后端容器 (Dockerfile.backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Docker Compose配置
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - DB_PATH=/app/data/database.sqlite
      - UPLOAD_PATH=/app/uploads
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

### Nginx配置
```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # 前端静态资源
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API接口
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传大小限制
        client_max_body_size 500M;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 监控和运维

### 应用监控
```javascript
// 性能监控中间件
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // 记录慢查询
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

### 错误监控
```javascript
// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 发送告警通知
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 发送告警通知
});
```

### 健康检查
```javascript
// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    const dbStatus = await checkDatabase();
    
    // 检查磁盘空间
    const diskStatus = await checkDiskSpace();
    
    // 检查内存使用
    const memoryStatus = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        disk: diskStatus,
        memory: memoryStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 扩展性考虑

### 水平扩展
- **负载均衡**：Nginx支持多个后端实例
- **数据库分离**：SQLite迁移到PostgreSQL集群
- **文件存储**：本地存储迁移到分布式对象存储
- **缓存层**：引入Redis缓存热点数据

### 功能扩展
- **用户系统**：添加用户认证和权限管理
- **搜索功能**：集成Elasticsearch全文搜索
- **实时通知**：WebSocket实时更新
- **API版本控制**：支持多版本API共存

### 技术升级
- **微服务架构**：拆分为独立的微服务
- **容器编排**：使用Kubernetes管理容器
- **CI/CD流水线**：自动化构建和部署
- **监控告警**：完整的APM监控体系

---

**架构状态**: ✅ 已完成  
**下一步行动**: 提交给Mike审核，通过后开始详细的切片级架构设计