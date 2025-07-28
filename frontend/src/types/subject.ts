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

// 组件相关类型定义
export interface SubjectCardProps {
  subject: Subject
}

export interface SubjectCardEmits {
  click: [subject: Subject]
  edit: [subject: Subject]
  delete: [subject: Subject]
}

export interface CreateSubjectModalProps {
  open: boolean
}

export interface CreateSubjectModalEmits {
  'update:open': [value: boolean]
  'success': [subject: Subject]
  'cancel': []
}

export interface SubjectManagerState {
  subjects: Subject[]
  loading: boolean
  searchKeyword: string
  viewMode: 'grid' | 'list'
}

// 表格列定义
export interface SubjectTableColumn {
  title: string
  key: string
  dataIndex?: string
  width?: number
}

// 视图模式类型
export type ViewMode = 'grid' | 'list'

// 排序类型
export interface SortOption {
  key: keyof Subject
  order: 'asc' | 'desc'
  label: string
}
