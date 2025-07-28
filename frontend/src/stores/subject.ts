import { defineStore } from 'pinia'
import type { Subject, CreateSubjectDto } from '@/types/subject'
import { subjectApi } from '@/api/subject'

interface SubjectState {
  subjects: Subject[]
  currentSubject: Subject | null
  loading: boolean
  error: string | null
}

export const useSubjectStore = defineStore('subject', {
  state: (): SubjectState => ({
    subjects: [],
    currentSubject: null,
    loading: false,
    error: null
  }),

  getters: {
    subjectList: (state) => state.subjects,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    subjectCount: (state) => state.subjects.length
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    async fetchSubjects() {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await subjectApi.getSubjects()
        this.subjects = response.data.data
      } catch (error: any) {
        this.setError(error.message || '获取学科列表失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async createSubject(data: CreateSubjectDto) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await subjectApi.createSubject(data)
        this.subjects.unshift(response.data.data)
        return response.data.data
      } catch (error: any) {
        this.setError(error.message || '创建学科失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async getSubjectById(id: number) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await subjectApi.getSubjectById(id)
        this.currentSubject = response.data.data
        return response.data.data
      } catch (error: any) {
        this.setError(error.message || '获取学科详情失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    clearCurrentSubject() {
      this.currentSubject = null
    }
  }
})
