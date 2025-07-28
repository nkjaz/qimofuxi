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
            <h1 class="text-xl font-bold text-gray-900">期末复习平台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">学科管理</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 - 使用SubjectManager组件 -->
    <main class="min-h-screen">
      <SubjectManager />
    </main>
  </div>
</template>

<script setup lang="ts">
import SubjectManager from '@/components/SubjectManager.vue'

// 页面标题设置
onMounted(() => {
  document.title = '学科管理 - 期末复习平台'
})
</script>

<style scoped>
/* 页面特定样式 */
nav {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
