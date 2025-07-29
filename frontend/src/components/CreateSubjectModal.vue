<template>
  <a-modal
    v-model:open="visible"
    title="创建新学科"
    :confirm-loading="loading"
    :width="600"
    data-testid="create-subject-modal"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <template #footer>
      <a-button @click="handleCancel" data-testid="cancel-button">取消</a-button>
      <a-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
        :disabled="!isFormValid"
        data-testid="submit-button"
      >
        创建学科
      </a-button>
    </template>

    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
      class="mt-4"
    >
      <!-- 学科名称 -->
      <a-form-item
        label="学科名称"
        name="name"
        :required="true"
      >
        <a-input
          v-model:value="formData.name"
          placeholder="请输入学科名称（如：数学、物理、化学等）"
          :maxlength="50"
          show-count
          size="large"
          data-testid="name-input"
          @blur="validateField('name')"
        />
        <div class="text-xs text-gray-500 mt-1">
          学科名称将用于分类和组织复习材料
        </div>
      </a-form-item>

      <!-- 学科描述 -->
      <a-form-item
        label="学科描述"
        name="description"
      >
        <a-textarea
          v-model:value="formData.description"
          placeholder="请输入学科描述（可选）"
          :rows="4"
          :maxlength="200"
          show-count
          data-testid="description-input"
          @blur="validateField('description')"
        />
        <div class="text-xs text-gray-500 mt-1">
          简要描述该学科的内容范围和特点
        </div>
      </a-form-item>

      <!-- 预览区域 -->
      <div v-if="formData.name" class="bg-gray-50 p-4 rounded-lg border" data-testid="preview-section">
        <h4 class="text-sm font-medium text-gray-700 mb-2">预览效果</h4>
        <div class="bg-white p-3 rounded border shadow-sm">
          <h3 class="font-semibold text-gray-900" data-testid="preview-name">{{ formData.name }}</h3>
          <p class="text-gray-600 text-sm mt-1" data-testid="preview-description">
            {{ formData.description || '暂无描述' }}
          </p>
          <div class="text-xs text-gray-500 mt-2">
            创建时间：{{ new Date().toLocaleString('zh-CN') }}
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { CreateSubjectDto } from '@/types/subject'
import { subjectApi } from '@/api/subject'

// Props定义
interface Props {
  open: boolean
}

const props = defineProps<Props>()

// Emits定义
const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [subject: any]
  'cancel': []
}>()

// 响应式数据
const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<CreateSubjectDto>({
  name: '',
  description: ''
})

// 表单验证规则
const formRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请输入学科名称', trigger: 'blur' },
    { min: 1, max: 50, message: '学科名称长度应在1-50个字符之间', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s\-_]+$/, 
      message: '学科名称只能包含中英文、数字、空格、横线和下划线', 
      trigger: 'blur' 
    }
  ],
  description: [
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ]
}

// 表单验证状态
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 && 
         formData.value.name.trim().length <= 50
})

// 验证单个字段
const validateField = async (field: string) => {
  if (formRef.value) {
    try {
      await formRef.value.validateFields([field])
    } catch (error) {
      // 验证失败，错误信息会自动显示
    }
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    description: ''
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    loading.value = true

    // 调用真实的API创建学科
    const createData: CreateSubjectDto = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || ''
    }

    const response = await subjectApi.createSubject(createData)
    const newSubject = response.data.data

    message.success('学科创建成功！')
    emit('success', newSubject)

    // 重置表单并关闭弹窗
    resetForm()
    visible.value = false

  } catch (error: any) {
    console.error('创建学科失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '创建学科失败，请重试'
    message.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  resetForm()
  emit('cancel')
  visible.value = false
}

// 监听弹窗打开状态
watch(() => props.open, (newVal) => {
  if (newVal) {
    // 弹窗打开时重置表单
    resetForm()
  }
})
</script>

<style scoped>
/* 自定义样式 */
.ant-form-item {
  margin-bottom: 24px;
}

.ant-input, .ant-input:focus {
  border-radius: 6px;
}

.ant-btn {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.ant-modal) {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  :deep(.ant-modal-body) {
    padding: 16px;
  }
}
</style>
