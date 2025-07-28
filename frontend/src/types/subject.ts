// 学科相关类型定义

export interface Subject {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateSubjectDto {
  name: string
  description?: string
}

export interface UpdateSubjectDto {
  name?: string
  description?: string
}

export interface SubjectListResponse {
  success: boolean
  data: Subject[]
  message?: string
  timestamp: string
  requestId: string
}

export interface SubjectDetailResponse {
  success: boolean
  data: Subject
  message?: string
  timestamp: string
  requestId: string
}

export interface CreateSubjectResponse {
  success: boolean
  data: Subject
  message?: string
  timestamp: string
  requestId: string
}
