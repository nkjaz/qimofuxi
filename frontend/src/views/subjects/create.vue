<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/subjects" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="i-carbon-arrow-left text-xl"></i>
          </router-link>
          <h1 class="text-xl font-bold text-gray-900">创建学科</h1>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="handleSubmit">
          <!-- 学科名称 -->
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              学科名称 <span class="text-red-500">*</span>
            </label>
            <a-input
              id="name"
              v-model:value="form.name"
              placeholder="请输入学科名称"
              size="large"
              :maxlength="50"
              show-count
              :status="errors.name ? 'error' : ''"
            />
            <div v-if="errors.name" class="text-red-500 text-sm mt-1">
              {{ errors.name }}
            </div>
          </div>

          <!-- 学科描述 -->
          <div class="mb-6">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              学科描述
            </label>
            <a-textarea
              id="description"
              v-model:value="form.description"
              placeholder="请输入学科描述（可选）"
              :rows="4"
              :maxlength="200"
              show-count
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-4">
            <router-link to="/subjects" class="btn">
              取消
            </router-link>
            <button
              type="submit"
              class="btn-primary"
              :disabled="isLoading"
            >
              <a-spin v-if="isLoading" size="small" class="mr-2" />
              {{ isLoading ? '创建中...' : '创建学科' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useSubjectStore } from '@/stores'
import type { CreateSubjectDto } from '@/types/subject'

const router = useRouter()
const subjectStore = useSubjectStore()

// 表单数据
const form = reactive<CreateSubjectDto>({
  name: '',
  description: ''
})

// 表单验证错误
const errors = reactive({
  name: ''
})

// 加载状态
const isLoading = computed(() => subjectStore.isLoading)

// 表单验证
const validateForm = (): boolean => {
  // 重置错误
  errors.name = ''

  // 验证学科名称
  if (!form.name.trim()) {
    errors.name = '学科名称不能为空'
    return false
  }

  if (form.name.trim().length > 50) {
    errors.name = '学科名称长度不能超过50个字符'
    return false
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const submitData: CreateSubjectDto = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined
    }

    await subjectStore.createSubject(submitData)
    
    message.success('学科创建成功！')
    router.push('/subjects')
  } catch (error: any) {
    message.error(error.message || '创建学科失败')
  }
}

// 监听名称输入，清除错误
watch(() => form.name, () => {
  if (errors.name) {
    errors.name = ''
  }
})
</script>
