<template>
  <div class="subject-manager">
    <!-- 头部操作区 -->
    <div class="manager-header bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- 标题和统计 -->
        <div class="flex items-center space-x-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">学科管理</h1>
            <p class="text-gray-600 text-sm mt-1">
              管理和组织您的学科分类，共 {{ subjects.length }} 个学科
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-3">
          <!-- 搜索框 -->
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索学科名称..."
            style="width: 200px"
            @search="handleSearch"
            @change="handleSearchChange"
          />
          
          <!-- 视图切换 -->
          <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
            <a-radio-button value="grid">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </a-radio-button>
            <a-radio-button value="list">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </a-radio-button>
          </a-radio-group>

          <!-- 创建按钮 -->
          <a-button 
            type="primary" 
            size="large"
            @click="showCreateModal"
            :icon="h(PlusOutlined)"
          >
            创建学科
          </a-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="manager-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <a-spin size="large" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredSubjects.length === 0" class="empty-state text-center py-12">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchKeyword ? '未找到相关学科' : '还没有学科' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchKeyword ? '尝试使用其他关键词搜索' : '创建您的第一个学科来开始管理复习内容' }}
        </p>
        <a-button 
          v-if="!searchKeyword"
          type="primary" 
          size="large"
          @click="showCreateModal"
          :icon="h(PlusOutlined)"
        >
          创建第一个学科
        </a-button>
      </div>

      <!-- 学科列表 -->
      <div v-else>
        <!-- 网格视图 -->
        <div 
          v-if="viewMode === 'grid'" 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <SubjectCard
            v-for="subject in filteredSubjects"
            :key="subject.id"
            :subject="subject"
            @click="handleSubjectClick"
            @edit="handleSubjectEdit"
            @delete="handleSubjectDelete"
          />
        </div>

        <!-- 列表视图 -->
        <div v-else class="bg-white rounded-lg shadow-sm">
          <a-table
            :columns="tableColumns"
            :data-source="filteredSubjects"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="flex items-center space-x-3">
                  <div>
                    <div class="font-medium text-gray-900">{{ record.name }}</div>
                    <div class="text-sm text-gray-500">ID: {{ record.id }}</div>
                  </div>
                </div>
              </template>
              
              <template v-if="column.key === 'description'">
                <div class="max-w-xs truncate" :title="record.description">
                  {{ record.description || '暂无描述' }}
                </div>
              </template>
              
              <template v-if="column.key === 'created_at'">
                {{ formatDate(record.created_at) }}
              </template>
              
              <template v-if="column.key === 'actions'">
                <div class="flex items-center space-x-2">
                  <a-button size="small" @click="handleSubjectClick(record)">查看</a-button>
                  <a-button size="small" @click="handleSubjectEdit(record)">编辑</a-button>
                  <a-button size="small" danger @click="handleSubjectDelete(record)">删除</a-button>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 创建学科弹窗 -->
    <CreateSubjectModal
      v-model:open="createModalVisible"
      @success="handleCreateSuccess"
      @cancel="handleCreateCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import SubjectCard from './SubjectCard.vue'
import CreateSubjectModal from './CreateSubjectModal.vue'
import type { Subject } from '@/types/subject'
import { subjectApi } from '@/api/subject'

// 响应式数据
const loading = ref(false)
const subjects = ref<Subject[]>([])
const searchKeyword = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const createModalVisible = ref(false)

// 表格列定义
const tableColumns = [
  { title: '学科名称', key: 'name', dataIndex: 'name' },
  { title: '描述', key: 'description', dataIndex: 'description' },
  { title: '创建时间', key: 'created_at', dataIndex: 'created_at' },
  { title: '操作', key: 'actions', width: 200 }
]

// 过滤后的学科列表
const filteredSubjects = computed(() => {
  if (!searchKeyword.value.trim()) {
    return subjects.value
  }
  
  const keyword = searchKeyword.value.toLowerCase().trim()
  return subjects.value.filter(subject => 
    subject.name.toLowerCase().includes(keyword) ||
    (subject.description && subject.description.toLowerCase().includes(keyword))
  )
})

// 格式化日期
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 加载学科列表
const loadSubjects = async () => {
  loading.value = true
  try {
    // 调用真实的API获取学科列表
    const response = await subjectApi.getSubjects()
    subjects.value = response.data.data
  } catch (error: any) {
    console.error('加载学科列表失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '加载学科列表失败'
    message.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 事件处理
const showCreateModal = () => {
  createModalVisible.value = true
}

const handleCreateSuccess = (newSubject: Subject) => {
  subjects.value.unshift(newSubject)
  // 不需要再次显示成功消息，CreateSubjectModal已经显示了
}

const handleCreateCancel = () => {
  createModalVisible.value = false
}

const handleSearch = (value: string) => {
  searchKeyword.value = value
}

const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  searchKeyword.value = target.value
}

const handleSubjectClick = (subject: Subject) => {
  console.log('查看学科:', subject)
  // 这里可以跳转到学科详情页面
}

const handleSubjectEdit = (subject: Subject) => {
  console.log('编辑学科:', subject)
  // 这里可以打开编辑弹窗
}

const handleSubjectDelete = (subject: Subject) => {
  console.log('删除学科:', subject)
  // 这里可以显示删除确认弹窗
}

// 生命周期
onMounted(() => {
  loadSubjects()
})
</script>

<style scoped>
.subject-manager {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subject-manager {
    padding: 16px;
  }
  
  .manager-header {
    padding: 16px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .manager-header .flex {
    flex-direction: column;
    align-items: stretch;
  }
  
  .manager-header .space-x-3 {
    margin-top: 16px;
    justify-content: center;
  }
}
</style>
