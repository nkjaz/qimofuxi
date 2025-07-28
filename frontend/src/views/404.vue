<template>
  <div class="min-h-screen bg-gray-50 flex-col-center">
    <div class="text-center">
      <!-- 404图标 -->
      <div class="mb-8">
        <i class="i-carbon-warning text-8xl text-gray-400"></i>
      </div>
      
      <!-- 错误信息 -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">页面未找到</h2>
      <p class="text-gray-600 mb-8 max-w-md">
        抱歉，您访问的页面不存在或已被移动。请检查URL是否正确，或返回首页继续浏览。
      </p>
      
      <!-- 操作按钮 -->
      <div class="space-x-4">
        <button 
          @click="goBack"
          class="btn"
        >
          返回上页
        </button>
        <router-link 
          to="/"
          class="btn-primary"
        >
          回到首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>
