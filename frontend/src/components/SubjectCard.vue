<template>
  <div 
    class="subject-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
    @click="handleClick"
  >
    <div class="p-6">
      <!-- 学科标题 -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ subject.name }}
        </h3>
        <div class="flex items-center space-x-2">
          <!-- 学科ID标识 -->
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{{ subject.id }}
          </span>
        </div>
      </div>

      <!-- 学科描述 -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ subject.description || '暂无描述' }}
      </p>

      <!-- 底部信息 -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center space-x-4">
          <!-- 创建时间 -->
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatDate(subject.created_at) }}</span>
          </div>
          
          <!-- 更新时间 -->
          <div v-if="subject.updated_at !== subject.created_at" class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ formatDate(subject.updated_at) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-2">
          <button 
            @click.stop="handleEdit"
            class="text-blue-500 hover:text-blue-700 transition-colors"
            title="编辑学科"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button 
            @click.stop="handleDelete"
            class="text-red-500 hover:text-red-700 transition-colors"
            title="删除学科"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 悬停效果指示器 -->
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
  </div>
</template>

<script setup lang="ts">
import type { Subject } from '@/types/subject'

// Props定义
interface Props {
  subject: Subject
}

const props = defineProps<Props>()

// Emits定义
const emit = defineEmits<{
  click: [subject: Subject]
  edit: [subject: Subject]
  delete: [subject: Subject]
}>()

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 事件处理
const handleClick = () => {
  emit('click', props.subject)
}

const handleEdit = () => {
  emit('edit', props.subject)
}

const handleDelete = () => {
  emit('delete', props.subject)
}
</script>

<style scoped>
.subject-card {
  position: relative;
  overflow: hidden;
}

.subject-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subject-card {
    margin-bottom: 1rem;
  }
  
  .subject-card .p-6 {
    padding: 1rem;
  }
}
</style>
