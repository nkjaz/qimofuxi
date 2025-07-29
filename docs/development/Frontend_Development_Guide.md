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

## 前后端数据联调

### HTTP客户端配置

项目使用axios作为HTTP客户端，配置文件位于`src/api/index.ts`：

```typescript
import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    config.headers['X-Request-ID'] = Date.now().toString()
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
```

### API服务层实现

学科管理API服务位于`src/api/subject.ts`，提供完整的CRUD操作：

```typescript
import api from './index'
import type { Subject, CreateSubjectDto, SubjectListResponse, CreateSubjectResponse, SubjectDetailResponse } from '@/types/subject'

export const subjectApi = {
  // 获取学科列表
  async getSubjects() {
    return api.get<SubjectListResponse>('/subjects')
  },

  // 创建学科
  async createSubject(data: CreateSubjectDto) {
    return api.post<CreateSubjectResponse>('/subjects', data)
  },

  // 获取学科详情
  async getSubjectById(id: number) {
    return api.get<SubjectDetailResponse>(`/subjects/${id}`)
  }
}
```

### 状态管理集成

使用Pinia进行状态管理，学科状态管理位于`src/stores/subject.ts`：

```typescript
import { defineStore } from 'pinia'
import { subjectApi } from '@/api/subject'
import type { Subject } from '@/types/subject'

export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取学科列表
  const fetchSubjects = async () => {
    setLoading(true)
    clearError()
    try {
      const response = await subjectApi.getSubjects()
      subjects.value = response.data.data
    } catch (error: any) {
      setError(error.message || '获取学科列表失败')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 创建学科
  const createSubject = async (data: CreateSubjectDto) => {
    try {
      const response = await subjectApi.createSubject(data)
      const newSubject = response.data.data
      subjects.value.unshift(newSubject) // 添加到列表开头
      return newSubject
    } catch (error: any) {
      setError(error.message || '创建学科失败')
      throw error
    }
  }

  return {
    subjects: readonly(subjects),
    loading: readonly(loading),
    error: readonly(error),
    fetchSubjects,
    createSubject
  }
})
```

### 组件API集成

组件中集成API调用的最佳实践：

**1. CreateSubjectModal.vue - 创建学科模态框**

```typescript
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const createData: CreateSubjectDto = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || ''
    }

    const response = await subjectApi.createSubject(createData)
    const newSubject = response.data.data

    message.success('学科创建成功！')
    emit('success', newSubject)
    resetForm()
    visible.value = false
  } catch (error: any) {
    console.error('创建学科失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '创建学科失败，请重试'
    message.error(errorMessage)
  } finally {
    loading.value = false
  }
}
```

**2. SubjectManager.vue - 学科管理容器**

```typescript
const loadSubjects = async () => {
  loading.value = true
  try {
    const response = await subjectApi.getSubjects()
    subjects.value = response.data.data
  } catch (error: any) {
    console.error('加载学科列表失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '加载学科列表失败'
    message.error(errorMessage)
  } finally {
    loading.value = false
  }
}
```

### 错误处理和用户反馈

**统一错误处理策略：**

1. **API层错误处理**：在axios拦截器中统一处理HTTP错误
2. **组件层错误处理**：在具体操作中捕获并显示用户友好的错误信息
3. **状态管理错误处理**：在store中维护错误状态

**用户反馈机制：**

1. **成功提示**：使用`message.success()`显示操作成功信息
2. **错误提示**：使用`message.error()`显示错误信息
3. **加载状态**：使用loading状态显示操作进度
4. **表单验证**：实时验证用户输入并提供反馈

### 数据流完整性验证

前后端数据联调的完整流程：

1. **用户操作** → 触发组件事件
2. **表单验证** → 验证用户输入数据
3. **API调用** → 发送HTTP请求到后端
4. **数据传输** → 请求/响应数据格式化
5. **状态更新** → 更新前端状态管理
6. **UI更新** → 重新渲染用户界面
7. **用户反馈** → 显示操作结果

**验证要点：**
- API响应格式与TypeScript类型定义一致
- 错误处理覆盖网络错误、服务器错误、业务逻辑错误
- 状态管理与UI组件数据同步
- 用户操作有及时的视觉反馈

**实际验证结果：**
- ✅ 成功创建测试学科"前后端数据联调测试学科"
- ✅ 数据持久化验证：页面刷新后数据仍然存在
- ✅ 用户反馈机制：显示"学科创建成功！"提示
- ✅ 状态同步：学科总数从104增加到105
- ✅ UI更新：新学科显示为列表中的#105项

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
# 进入前端目录
cd frontend

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

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 环境变量
- `VITE_API_BASE_URL`: API基础URL (默认: http://localhost:3001)
- `VITE_APP_TITLE`: 应用标题

### 代理配置
开发环境下，前端(3000端口)通过Vite代理转发API请求到后端(3001端口)

```typescript
// vite.config.ts
server: {
  port: 3000,
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

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

### 学科管理组件体系 ✅
- **SubjectCard.vue**: 学科卡片组件，支持响应式布局和交互操作
- **CreateSubjectModal.vue**: 创建学科弹窗，包含表单验证和实时预览
- **SubjectManager.vue**: 学科管理容器，提供搜索和视图切换功能
- **SubjectList.vue**: 学科列表页面，集成所有管理功能

## 学科管理组件开发详解

### 组件架构设计
学科管理采用组件化架构，将功能拆分为独立、可复用的组件：

```
SubjectList (页面级)
└── SubjectManager (容器组件)
    ├── CreateSubjectModal (弹窗组件)
    └── SubjectCard[] (卡片组件数组)
```

### 核心组件实现

#### 1. SubjectCard 组件
**功能特性**:
- 响应式设计：桌面多列网格、平板双列、移动端单列
- 悬停效果和操作按钮
- 事件处理：点击、编辑、删除
- TypeScript类型安全

**关键代码**:
```vue
<template>
  <div class="subject-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-lg font-semibold text-gray-900 cursor-pointer" @click="handleClick">
        {{ subject.name }}
      </h3>
      <span class="text-sm text-gray-500">#{{ subject.id }}</span>
    </div>
    <!-- 更多内容... -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  subject: Subject
}
const emit = defineEmits<{
  click: [subject: Subject]
  edit: [subject: Subject]
  delete: [subject: Subject]
}>()
</script>
```

#### 2. CreateSubjectModal 组件
**功能特性**:
- 表单验证和字符计数
- 实时预览功能
- API集成和错误处理
- 加载状态管理

**数据持久化解决方案**:
组件已修复数据持久化问题，确保创建的学科在页面刷新后仍然存在：
```typescript
// 修复前：使用模拟数据
await new Promise(resolve => setTimeout(resolve, 1000))

// 修复后：使用真实API
const response = await subjectApi.createSubject(createData)
const newSubject = response.data.data
```

#### 3. SubjectManager 组件
**功能特性**:
- 搜索功能实现
- 网格/列表视图切换
- 空状态处理
- 数据加载和状态管理

**API集成修复**:
```typescript
// 修复前：使用硬编码数据
subjects.value = [
  { id: 1, name: '示例学科1', description: '示例描述1' },
  { id: 2, name: '示例学科2', description: '示例描述2' }
]

// 修复后：调用真实API
const response = await subjectApi.getSubjects()
subjects.value = response.data.data
```

### 响应式设计实现
使用UnoCSS实现响应式布局：
```css
/* 桌面端：多列网格 */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* 平板端：双列布局 */
md:grid-cols-2

/* 移动端：单列布局 */
grid-cols-1
```

### TypeScript类型定义
完整的类型系统确保代码质量：
```typescript
// 基础类型
export interface Subject {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

// 组件Props类型
export interface SubjectCardProps {
  subject: Subject
}

// 组件Emits类型
export interface SubjectCardEmits {
  click: [subject: Subject]
  edit: [subject: Subject]
  delete: [subject: Subject]
}
```

### 性能优化措施
1. **组件懒加载**: 使用动态导入减少初始包体积
2. **事件防抖**: 搜索功能使用防抖优化性能
3. **虚拟滚动**: 大量数据时使用虚拟滚动
4. **缓存策略**: API响应缓存减少重复请求

### 测试覆盖
- **单元测试**: 组件逻辑和交互测试
- **集成测试**: 组件间协作测试
- **E2E测试**: 完整用户流程测试（使用Playwright）

#### 端到端测试详情
**测试文件位置**: `frontend/tests/e2e/`

**测试覆盖范围**:
1. **完整用户故事测试**
   - 访问首页 → 导航到学科管理 → 创建学科 → 验证列表更新
   - 数据持久化验证（页面刷新测试）
   - 搜索功能测试
   - 视图切换功能测试

2. **边界条件和异常场景测试**
   - 创建重复名称学科测试
   - 创建空名称学科测试
   - 超长内容测试
   - 网络错误处理测试
   - 弹窗取消和关闭测试

3. **性能测试**
   - 页面加载性能测试（< 3秒）
   - API响应性能测试（< 2秒）
   - 大量数据渲染性能测试

4. **兼容性测试**
   - 多设备兼容性测试（桌面、平板、移动）
   - 多浏览器兼容性测试（Chrome、Firefox、Safari、Edge）
   - 键盘导航兼容性测试
   - 无障碍访问兼容性测试

**测试运行命令**:
```bash
# 运行所有端到端测试
npm run test:e2e

# 显示浏览器窗口运行测试
npm run test:e2e:headed

# 调试模式运行测试
npm run test:e2e:debug

# 只运行完整用户故事测试
npm run test:e2e:story

# 查看测试报告
npm run test:e2e:report
```

## 更新日志
- 2025-01-28: 完成Vue3 + TypeScript + Vben Admin基础框架搭建
- 2025-01-28: 实现学科管理功能和前后端数据联调
- 2025-01-28: 创建前端开发指南模板
- 2025-01-28: 完成学科管理组件体系开发，解决数据持久化问题
- 2025-01-28: 完成端到端测试开发，包含完整用户故事测试、边界条件测试、性能测试和兼容性测试

---
**注意**: 此指南将随着项目开发进展持续更新和完善。