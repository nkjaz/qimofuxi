import api from './index'
import type { 
  Subject, 
  CreateSubjectDto, 
  SubjectListResponse, 
  SubjectDetailResponse, 
  CreateSubjectResponse 
} from '@/types/subject'

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
