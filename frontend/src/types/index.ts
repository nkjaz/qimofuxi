// 通用类型定义

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: string
  timestamp: string
  requestId: string
}

export interface ApiError {
  success: false
  message: string
  code?: string
  timestamp: string
  requestId: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 导出所有类型
export * from './subject'
