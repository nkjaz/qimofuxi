# 前端开发指南

## 文档信息
- **版本**: v1.1.0
- **最后更新**: 2025-01-28
- **维护者**: Alex (工程师)
- **状态**: 基础框架已完成

## 项目概述
期末复习平台前端应用，基于Vue3 + TypeScript + Vben Admin构建，提供现代化、响应式的用户界面和优秀的用户体验。

## 技术栈

### 核心框架
- **前端框架**: Vue 3.x (Composition API)
- **构建工具**: Vite 5.x
- **路由管理**: Vue Router 4.x
- **状态管理**: Pinia
- **UI组件库**: Ant Design Vue 4.x
- **样式方案**: UnoCSS (原子化CSS)
- **管理模板**: Vben Admin

### 开发工具
- **包管理器**: npm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript 5.x
- **自动导入**: unplugin-auto-import + unplugin-vue-components
- **端到端测试**: Playwright (强制使用)
- **版本控制**: Git
- **HTTP客户端**: Axios

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口层
│   │   ├── index.ts       # Axios配置和拦截器
│   │   └── subject.ts     # 学科相关API
│   ├── components/        # 通用组件
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义和守卫
│   ├── stores/           # Pinia状态管理
│   │   └── subject.ts    # 学科状态管理
│   ├── styles/           # 全局样式
│   │   └── index.css     # 全局CSS样式
│   ├── types/            # TypeScript类型定义
│   │   └── subject.ts    # 学科相关类型
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── 404.vue       # 404页面
│   │   └── subjects/     # 学科管理页面
│   │       ├── index.vue # 学科列表
│   │       ├── create.vue# 创建学科
│   │       └── detail.vue# 学科详情
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── index.html            # HTML模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
├── uno.config.ts         # UnoCSS配置
├── .eslintrc.js          # ESLint配置
├── .prettierrc           # Prettier配置
├── auto-imports.d.ts     # 自动导入类型声明
└── .eslintrc-auto-import.json # ESLint自动导入配置
```

## 核心功能模块

### 学科管理模块 (已实现)
- 学科列表展示
- 学科创建功能
- 学科详情查看
- 学科信息编辑

### 复习材料模块 (待开发)
- 材料列表展示
- 材料详情查看
- 材料搜索过滤
- 材料收藏管理

### 学习进度模块 (待开发)
- 进度可视化
- 学习统计
- 学习计划
- 成就系统

### 用户中心模块 (待开发)
- 个人信息管理
- 学习偏好设置
- 通知设置
- 账户安全

## 开发规范

### 组件开发规范
- 使用Vue3 Composition API
- 组件名称使用PascalCase
- 文件名使用kebab-case
- 单文件组件(.vue)格式
- 使用`<script setup>`语法糖

### 代码风格规范
- 使用TypeScript进行严格类型检查
- 遵循ESLint和Prettier配置
- 使用语义化的变量和函数命名
- 添加必要的代码注释
- 自动导入Vue API和组件

### 状态管理规范
- 全局状态使用Pinia
- 组件内部状态使用ref/reactive
- 异步状态使用专门的composable
- 避免过度使用全局状态
- 使用storeToRefs解构响应式数据

### API调用规范
- 统一的Axios服务封装
- 错误处理和重试机制
- 请求和响应拦截器
- 加载状态管理
- 统一的API响应格式

## 样式开发指南

### 设计系统
- 基于Ant Design Vue的设计规范
- UnoCSS原子化CSS类
- 统一的颜色规范
- 标准化的字体大小和间距

### CSS规范
- 优先使用UnoCSS原子类
- 组件内使用scoped样式
- 避免全局样式污染
- 响应式设计支持
- 支持深色模式切换

## 性能优化

### 代码分割
- 路由级别的代码分割
- 组件懒加载
- 第三方库按需引入
- 动态导入优化

### 渲染优化
- 使用v-memo优化重渲染
- 合理使用computed和watchEffect
- 虚拟滚动处理大列表
- 图片懒加载和组件懒加载

### 缓存策略
- HTTP缓存配置
- Service Worker缓存
- 本地存储优化
- API响应缓存

## 测试策略

### 单元测试
- 组件测试覆盖率 > 80%
- 工具函数100%覆盖
- 使用Vitest + Vue Test Utils
- Mock外部依赖

### 集成测试
- 页面级别的集成测试
- API集成测试
- Pinia状态管理测试
- Vue Router路由测试

### 端到端测试 (Playwright - 强制使用)
- 关键用户流程测试
- 跨浏览器兼容性测试
- 移动端适配测试
- 性能测试

## 部署与构建

### 构建配置
- 生产环境优化
- 资源压缩和合并
- 环境变量配置
- 构建产物分析

### 部署流程
- 自动化部署流程
- 多环境部署策略
- 回滚机制
- 监控和告警

## 开发工作流

### Git工作流
- Feature分支开发
- Pull Request代码审查
- 自动化测试检查
- 合并前的质量门禁

### 开发环境
- 本地开发服务器
- 热重载配置
- 代理API配置
- 开发工具集成

## 常见问题与解决方案

### 性能问题
- 组件重渲染优化
- 内存泄漏排查
- 包体积优化
- 首屏加载优化

### 兼容性问题
- 浏览器兼容性处理
- 移动端适配
- 第三方库兼容
- Polyfill配置

## 开发环境配置

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器 (端口3000)
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 环境变量
- `VITE_API_BASE_URL`: API基础URL (默认: http://localhost:3001)
- `VITE_APP_TITLE`: 应用标题

### 代理配置
开发环境下，前端(3000端口)通过Vite代理转发API请求到后端(3001端口)

## 已实现功能

### 基础框架 ✅
- Vue3 + TypeScript + Vben Admin基础框架
- Vite构建配置和开发服务器
- UnoCSS原子化CSS框架
- Ant Design Vue UI组件库
- 自动导入配置(API和组件)

### 路由系统 ✅
- Vue Router 4配置
- 路由守卫和页面标题设置
- 404错误页面处理

### 状态管理 ✅
- Pinia状态管理配置
- 学科管理store实现
- 响应式数据处理

### API服务 ✅
- Axios HTTP客户端配置
- 请求/响应拦截器
- 统一错误处理
- 学科管理API接口

### 页面组件 ✅
- 首页展示和导航
- 学科列表页面
- 学科创建页面
- 学科详情页面

## 更新日志
- 2025-01-28: 完成Vue3 + TypeScript + Vben Admin基础框架搭建
- 2025-01-28: 实现学科管理功能和前后端数据联调
- 2025-01-28: 创建前端开发指南模板

---
**注意**: 此指南将随着项目开发进展持续更新和完善。