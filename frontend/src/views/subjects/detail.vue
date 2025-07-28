<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/subjects" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="i-carbon-arrow-left text-xl"></i>
          </router-link>
          <h1 class="text-xl font-bold text-gray-900">学科详情</h1>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex-center py-12">
        <a-spin size="large" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="hasError" class="text-center py-12">
        <i class="i-carbon-warning text-4xl text-red-500 mb-4"></i>
        <p class="text-red-600 mb-4">{{ errorMessage }}</p>
        <button @click="handleRefresh" class="btn-primary">
          重新加载
        </button>
      </div>

      <!-- 学科详情 -->
      <div v-else-if="currentSubject" class="space-y-6">
        <!-- 基本信息卡片 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex-center mr-4">
                <i class="i-carbon-book text-2xl text-blue-600"></i>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ currentSubject.name }}</h2>
                <p class="text-gray-600">学科 ID: {{ currentSubject.id }}</p>
              </div>
            </div>
          </div>

          <!-- 描述 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">学科描述</h3>
            <p v-if="currentSubject.description" class="text-gray-700 leading-relaxed">
              {{ currentSubject.description }}
            </p>
            <p v-else class="text-gray-500 italic">
              暂无描述
            </p>
          </div>

          <!-- 时间信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">创建时间</h4>
              <p class="text-gray-900">{{ formatDateTime(currentSubject.created_at) }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">更新时间</h4>
              <p class="text-gray-900">{{ formatDateTime(currentSubject.updated_at) }}</p>
            </div>
          </div>
        </div>

        <!-- 功能区域 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">相关功能</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="card text-center opacity-60">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex-center mx-auto mb-3">
                <i class="i-carbon-document text-xl text-gray-400"></i>
              </div>
              <h4 class="font-medium text-gray-500 mb-2">文件管理</h4>
              <p class="text-sm text-gray-400 mb-3">管理该学科的复习资料</p>
              <button class="btn" disabled>即将推出</button>
            </div>

            <div class="card text-center opacity-60">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex-center mx-auto mb-3">
                <i class="i-carbon-chart-line text-xl text-gray-400"></i>
              </div>
              <h4 class="font-medium text-gray-500 mb-2">学习统计</h4>
              <p class="text-sm text-gray-400 mb-3">查看学习进度和统计</p>
              <button class="btn" disabled>即将推出</button>
            </div>

            <div class="card text-center opacity-60">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex-center mx-auto mb-3">
                <i class="i-carbon-settings text-xl text-gray-400"></i>
              </div>
              <h4 class="font-medium text-gray-500 mb-2">学科设置</h4>
              <p class="text-sm text-gray-400 mb-3">编辑学科信息和设置</p>
              <button class="btn" disabled>即将推出</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useSubjectStore } from '@/stores'
import dayjs from 'dayjs'

const route = useRoute()
const subjectStore = useSubjectStore()

// 计算属性
const currentSubject = computed(() => subjectStore.currentSubject)
const isLoading = computed(() => subjectStore.isLoading)
const hasError = computed(() => subjectStore.hasError)
const errorMessage = computed(() => subjectStore.errorMessage)

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 刷新数据
const handleRefresh = () => {
  const id = Number(route.params.id)
  if (id) {
    subjectStore.getSubjectById(id)
  }
}

// 页面加载时获取数据
onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    subjectStore.getSubjectById(id)
  }
})

// 页面卸载时清除当前学科
onUnmounted(() => {
  subjectStore.clearCurrentSubject()
})
</script>
