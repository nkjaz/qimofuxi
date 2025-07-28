# API 参考文档

## 文档信息
- **版本**: v1.1.0
- **最后更新**: 2025-07-28
- **维护者**: Bob (架构师) + Alex (工程师)
- **状态**: 部分实现 - 学科管理API已完成

## 概述
本文档提供期末复习平台的完整API参考，包括所有端点、请求/响应格式、认证方式和错误处理。

## 基础信息

### 基础URL
```
开发环境: http://localhost:3000
生产环境: https://api.qimofuxi.com
```

### 认证方式
- 当前版本: 无认证（开发阶段）
- 计划实现: JWT Token认证、API Key认证

### 通用响应格式
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "timestamp": string,
  "requestId": string,
  "responseTime": string
}
```

## API 端点

### 系统管理 API

#### 健康检查 ✅
- **端点**: `GET /health`
- **描述**: 检查API服务运行状态
- **状态**: 已实现
- **响应示例**:
```json
{
  "success": true,
  "message": "期末复习平台API服务运行正常",
  "timestamp": "2025-07-28T05:17:02.596Z",
  "version": "1.0.0"
}
```

### 学科管理 API ✅

#### 获取所有学科
- **端点**: `GET /api/subjects`
- **描述**: 获取所有学科列表
- **状态**: 已实现
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "数学",
      "description": "高等数学、线性代数、概率论等数学相关课程",
      "created_at": "2025-07-28 04:49:18",
      "updated_at": "2025-07-28 04:49:18"
    }
  ],
  "total": 1,
  "message": "获取学科列表成功",
  "timestamp": "2025-07-28T05:17:02.639Z",
  "requestId": "unknown",
  "responseTime": "27ms"
}
```

#### 创建学科
- **端点**: `POST /api/subjects`
- **描述**: 创建新学科
- **状态**: 已实现
- **请求体**:
```json
{
  "name": "学科名称",
  "description": "学科描述（可选）"
}
```
- **验证规则**:
  - name: 必填，1-50字符，只能包含中文、英文、数字、空格、连字符和下划线
  - description: 可选，最多500字符
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "name": "新学科",
    "description": "这是一个测试学科"
  },
  "message": "创建学科成功",
  "timestamp": "2025-07-28T05:17:02.666Z",
  "requestId": "unknown",
  "responseTime": "8ms"
}
```

#### 获取学科详情
- **端点**: `GET /api/subjects/:id`
- **描述**: 根据ID获取学科详细信息
- **状态**: 已实现
- **参数**:
  - id: 学科ID（整数）
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "数学",
    "description": "高等数学、线性代数、概率论等数学相关课程",
    "created_at": "2025-07-28 04:49:18",
    "updated_at": "2025-07-28 04:49:18"
  },
  "message": "获取学科详情成功",
  "timestamp": "2025-07-28T05:17:02.666Z",
  "requestId": "unknown",
  "responseTime": "5ms"
}
```

### 用户管理 API
#### 用户注册
- **端点**: `POST /auth/register`
- **描述**: 用户注册接口
- **状态**: 待实现

#### 用户登录
- **端点**: `POST /auth/login`
- **描述**: 用户登录接口
- **状态**: 待实现

### 复习内容管理 API
#### 获取复习材料列表
- **端点**: `GET /materials`
- **描述**: 获取复习材料列表
- **状态**: 待实现

#### 创建复习材料
- **端点**: `POST /materials`
- **描述**: 创建新的复习材料
- **状态**: 待实现

### 学习进度 API
#### 获取学习进度
- **端点**: `GET /progress/:userId`
- **描述**: 获取用户学习进度
- **状态**: 待实现

#### 更新学习进度
- **端点**: `PUT /progress/:userId`
- **描述**: 更新用户学习进度
- **状态**: 待实现

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE",
  "timestamp": "2025-07-28T05:17:02.666Z",
  "requestId": "unknown"
}
```

### 已实现错误代码
| 错误代码 | HTTP状态码 | 描述 | 状态 |
|---------|-----------|------|------|
| VALIDATION_ERROR | 400 | 输入验证失败 | ✅ |
| SUBJECT_NAME_EXISTS | 400 | 学科名称已存在 | ✅ |
| SUBJECT_NOT_FOUND | 404 | 学科不存在 | ✅ |
| DATABASE_ERROR | 500 | 数据库操作失败 | ✅ |

### 计划实现错误代码
| 错误代码 | HTTP状态码 | 描述 | 状态 |
|---------|-----------|------|------|
| 1002 | 401 | 未授权访问 | 待实现 |
| 1003 | 403 | 权限不足 | 待实现 |

## 更新日志
- 2025-07-28: 完成学科管理API文档，添加健康检查和错误处理规范
- 2025-01-28: 创建API文档模板框架

---
**注意**: 此文档将随着开发进度持续更新，请关注版本变更。