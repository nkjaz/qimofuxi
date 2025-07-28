<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-gray-500 hover:text-gray-700 mr-4">
              <i class="i-carbon-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold text-gray-900">学科管理</h1>
          </div>
          <div class="flex items-center">
            <router-link
              to="/subjects/create"
              class="btn-primary"
            >
              <i class="i-carbon-add text-sm mr-2"></i>
              创建学科
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

      <!-- 学科列表 -->
      <div v-else>
        <!-- 空状态 -->
        <div v-if="subjectList.length === 0" class="text-center py-12">
          <i class="i-carbon-folder text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无学科</h3>
          <p class="text-gray-600 mb-6">
            还没有创建任何学科，点击下方按钮创建第一个学科吧！
          </p>
          <router-link to="/subjects/create" class="btn-primary">
            <i class="i-carbon-add text-sm mr-2"></i>
            创建学科
          </router-link>
        </div>

        <!-- 学科网格 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="subject in subjectList"
            :key="subject.id"
            class="card-hover cursor-pointer"
            @click="handleSubjectClick(subject.id)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex-center">
                <i class="i-carbon-book text-xl text-blue-600"></i>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(subject.created_at) }}
              </div>
            </div>
            
            <h3 class="text-title mb-2 text-ellipsis">{{ subject.name }}</h3>
            
            <p v-if="subject.description" class="text-body text-ellipsis-2 mb-4">
              {{ subject.description }}
            </p>
            <p v-else class="text-body text-gray-400 mb-4">
              暂无描述
            </p>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>ID: {{ subject.id }}</span>
              <span>{{ formatDate(subject.updated_at) }}</span>
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

const router = useRouter()
const subjectStore = useSubjectStore()

// 计算属性
const subjectList = computed(() => subjectStore.subjectList)
const isLoading = computed(() => subjectStore.isLoading)
const hasError = computed(() => subjectStore.hasError)
const errorMessage = computed(() => subjectStore.errorMessage)

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 处理学科点击
const handleSubjectClick = (id: number) => {
  router.push(`/subjects/${id}`)
}

// 刷新数据
const handleRefresh = () => {
  subjectStore.fetchSubjects()
}

// 页面加载时获取数据
onMounted(() => {
  subjectStore.fetchSubjects()
})
</script>
