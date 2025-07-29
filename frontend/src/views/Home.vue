<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">期末复习平台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/subjects"
              class="btn-primary"
              data-testid="subjects-link"
            >
              学科管理
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- 欢迎区域 -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          欢迎使用期末复习平台
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          高效管理学科内容，助力期末复习。创建学科分类，上传复习资料，让学习更有条理。
        </p>
      </div>

      <!-- 功能卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="card-hover text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex-center mx-auto mb-4">
            <i class="i-carbon-folder text-2xl text-blue-600"></i>
          </div>
          <h3 class="text-title mb-2">学科管理</h3>
          <p class="text-body mb-4">
            创建和管理不同学科分类，为复习资料提供清晰的组织结构。
          </p>
          <router-link to="/subjects" class="btn-primary" data-testid="start-manage-link">
            开始管理
          </router-link>
        </div>

        <div class="card text-center opacity-60">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex-center mx-auto mb-4">
            <i class="i-carbon-document text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-title mb-2 text-gray-500">文件上传</h3>
          <p class="text-body mb-4">
            上传各种格式的复习资料，支持文档、图片、视频等多种文件类型。
          </p>
          <button class="btn" disabled>
            即将推出
          </button>
        </div>

        <div class="card text-center opacity-60">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex-center mx-auto mb-4">
            <i class="i-carbon-search text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-title mb-2 text-gray-500">资料浏览</h3>
          <p class="text-body mb-4">
            快速浏览和搜索已上传的复习资料，支持多种查看模式。
          </p>
          <button class="btn" disabled>
            即将推出
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-16 bg-white rounded-lg shadow-sm p-8">
        <h3 class="text-title text-center mb-8">平台统计</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ subjectCount }}</div>
            <div class="text-body">学科数量</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">0</div>
            <div class="text-body">上传文件</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div class="text-body">浏览次数</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useSubjectStore } from '@/stores'

const subjectStore = useSubjectStore()

// 获取学科数量
const subjectCount = computed(() => subjectStore.subjectCount)

// 页面加载时获取学科列表以更新统计
onMounted(() => {
  subjectStore.fetchSubjects().catch(() => {
    // 静默处理错误，不影响首页展示
  })
})
</script>
