// 学科管理组件导出
export { default as SubjectCard } from './SubjectCard.vue'
export { default as CreateSubjectModal } from './CreateSubjectModal.vue'
export { default as SubjectManager } from './SubjectManager.vue'

// 组件类型导出
export type {
  SubjectCardProps,
  SubjectCardEmits,
  CreateSubjectModalProps,
  CreateSubjectModalEmits,
  SubjectManagerState,
  SubjectTableColumn,
  ViewMode,
  SortOption
} from '@/types/subject'
