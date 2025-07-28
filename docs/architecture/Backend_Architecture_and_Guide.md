# 后端架构设计与开发指南

## 文档信息
- **版本**: v1.1.0
- **最后更新**: 2025-07-28
- **维护者**: Bob (架构师) + Alex (工程师)
- **状态**: 部分实现中 - 学科管理API已完成

## 项目概述
期末复习平台后端系统架构设计，提供高性能、可扩展的学习管理服务。

## 技术栈选型

### 核心技术栈 (已实现)
- **运行时**: Node.js 18+ ✅
- **Web框架**: Express.js 4.18.2 ✅
- **数据库**: SQLite (通过sql.js 1.13.0) ✅
- **输入验证**: express-validator 7.0.1 ✅
- **安全中间件**: helmet, cors, express-rate-limit ✅
- **HTTP客户端**: axios 1.11.0 ✅

### 开发工具
- **包管理**: npm / pip
- **代码规范**: ESLint + Prettier / Black + isort
- **测试框架**: Jest / pytest
- **API文档**: Swagger/OpenAPI
- **容器化**: Docker + Docker Compose

## 系统架构

### 整体架构图
```
[前端应用] 
    ↓ HTTP/HTTPS
[负载均衡器]
    ↓
[API网关]
    ↓
[业务服务层]
    ├── 用户服务
    ├── 内容服务
    ├── 学习进度服务
    └── 通知服务
    ↓
[数据访问层]
    ├── PostgreSQL (主数据库)
    ├── Redis (缓存层)
    └── 文件存储系统
```

### 服务模块设计

#### 用户服务 (User Service)
- 用户注册、登录、认证
- 用户信息管理
- 权限控制

#### 内容服务 (Content Service)
- 复习材料管理
- 题库管理
- 内容分类与标签

#### 学习进度服务 (Progress Service)
- 学习记录跟踪
- 进度统计分析
- 学习计划管理

#### 通知服务 (Notification Service)
- 学习提醒
- 系统通知
- 邮件/短信发送

## 数据库设计

### 核心数据表

#### 用户表 (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 复习材料表 (materials)
```sql
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    category_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 学习进度表 (progress)
```sql
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    material_id INTEGER REFERENCES materials(id),
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API设计原则

### RESTful API规范
- 使用标准HTTP方法 (GET, POST, PUT, DELETE)
- 统一的URL命名规范
- 标准化的响应格式
- 适当的HTTP状态码

### 安全设计
- JWT Token认证
- API限流保护
- 输入验证与过滤
- SQL注入防护
- XSS攻击防护

### 性能优化
- 数据库查询优化
- Redis缓存策略
- 分页查询实现
- 异步处理机制

## 开发规范

### 代码结构
```
src/
├── controllers/     # 控制器层
├── services/       # 业务逻辑层
├── models/         # 数据模型层
├── middleware/     # 中间件
├── routes/         # 路由定义
├── utils/          # 工具函数
├── config/         # 配置文件
└── tests/          # 测试文件
```

### 错误处理
- 统一的错误处理中间件
- 标准化的错误响应格式
- 详细的错误日志记录
- 用户友好的错误信息

### 日志管理
- 结构化日志格式
- 不同级别的日志记录
- 日志轮转与归档
- 敏感信息脱敏

## 部署与运维

### 环境配置
- 开发环境 (Development)
- 测试环境 (Testing)
- 生产环境 (Production)

### 监控与告警
- 应用性能监控
- 数据库性能监控
- 错误率监控
- 资源使用监控

## 已实现功能

### 学科管理API (v1.0) - 2025-07-28
- **数据库设计**: subjects表结构，包含id、name、description、时间戳字段
- **API端点**:
  - GET /health - 健康检查
  - GET /api/subjects - 获取学科列表
  - POST /api/subjects - 创建学科
  - GET /api/subjects/:id - 获取学科详情
- **安全特性**: CORS支持、安全头部、请求限制、输入验证、SQL注入防护
- **错误处理**: 统一AppError类，标准化错误响应格式
- **技术实现**: 基于sql.js的纯JavaScript SQLite实现，避免原生模块编译问题

### 项目结构 (已实现)
```
backend/
├── app.js                 # 应用主入口文件 ✅
├── package.json           # 项目依赖配置 ✅
├── config/
│   └── database.js        # 数据库配置和连接管理 ✅
├── middleware/
│   ├── errorHandler.js    # 全局错误处理中间件 ✅
│   └── validation.js      # 输入验证中间件 ✅
├── routes/
│   └── subjects.js        # 学科管理路由 ✅
└── services/
    └── subjectService.js  # 学科业务逻辑服务 ✅
```

## 更新日志
- 2025-07-28: 完成后端问题修复与验证，所有API测试100%通过
  - 修复输入验证问题：空名称、超长名称、重复名称检查
  - 修复404错误处理：正确处理不存在的学科ID
  - 修复Content-Type验证：确保POST请求媒体类型正确
  - 优化端口配置：统一使用3001端口避免冲突
  - 测试结果：14个测试用例全部通过，API响应时间<200ms
- 2025-07-28: 完成学科管理API开发，实现基础CRUD功能和安全防护
- 2025-01-28: 创建后端架构文档模板

---
**注意**: 此文档将随着架构设计的深入持续更新和完善。