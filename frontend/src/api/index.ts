import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '@/types'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加请求ID
    config.headers = {
      ...config.headers,
      'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 检查业务状态码
    if (data.success === false) {
      const error: ApiError = {
        success: false,
        message: data.message || '请求失败',
        code: data.code,
        timestamp: data.timestamp,
        requestId: data.requestId
      }
      return Promise.reject(error)
    }
    
    return response
  },
  (error) => {
    // 处理HTTP错误
    const errorResponse: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || '网络错误',
      code: error.response?.status?.toString(),
      timestamp: new Date().toISOString(),
      requestId: error.config?.headers?.['X-Request-ID'] || 'unknown'
    }
    
    return Promise.reject(errorResponse)
  }
)

export default api
