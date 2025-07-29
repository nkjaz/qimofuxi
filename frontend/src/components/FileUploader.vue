<template>
  <div class="file-uploader">
    <!-- 文件选择区域 -->
    <div class="upload-area">
      <a-upload-dragger
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        :custom-request="handleUpload"
        accept=".md,.markdown"
        :multiple="false"
        :disabled="disabled || uploadStatus.status === 'uploading'"
        class="upload-dragger"
        @change="handleChange"
      >
        <div class="upload-content">
          <div class="upload-icon">
            <i
              :class="getIconClass"
              class="text-4xl"
            ></i>
          </div>

          <p class="upload-text">
            {{ getUploadText }}
          </p>

          <p class="upload-hint">
            仅支持 .md 和 .markdown 格式文件，最大 {{ formatFileSize(props.maxSize) }}
          </p>

          <!-- 明确的上传按钮 -->
          <div class="upload-buttons" v-if="fileList.length === 0">
            <a-button
              type="primary"
              size="large"
              :loading="uploadStatus.status === 'uploading'"
              :disabled="disabled"
              class="upload-btn"
            >
              <i class="i-carbon-cloud-upload mr-2"></i>
              选择文件上传
            </a-button>
          </div>
        
        <!-- 上传进度 -->
        <div v-if="uploadStatus.status === 'uploading'" class="upload-progress">
          <a-progress 
            :percent="uploadStatus.progress" 
            :show-info="true"
            status="active"
          />
          <p class="progress-text">正在上传中...</p>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="uploadStatus.status === 'error'" class="upload-error">
          <a-alert 
            :message="uploadStatus.error" 
            type="error" 
            show-icon 
            closable
            @close="clearError"
          />
        </div>
        
        <!-- 成功信息 -->
        <div v-if="uploadStatus.status === 'success'" class="upload-success">
          <a-alert 
            message="文件上传成功！" 
            type="success" 
            show-icon 
            closable
            @close="clearSuccess"
          />
        </div>
      </div>
    </a-upload-dragger>
    </div>

    <!-- 文件选择后的操作区域 -->
    <div v-if="fileList.length > 0 && uploadStatus.status !== 'uploading'" class="file-actions">
      <div class="selected-file">
        <div class="file-info">
          <i class="i-carbon-document text-blue-600 mr-2"></i>
          <span class="file-name">{{ fileList[0]?.name }}</span>
          <span class="file-size">({{ formatFileSize(fileList[0]?.size || 0) }})</span>
        </div>
        <div class="action-buttons">
          <a-button
            type="primary"
            size="large"
            :loading="uploadStatus.status === 'uploading'"
            @click="confirmUpload"
            class="confirm-upload-btn"
          >
            <i class="i-carbon-cloud-upload mr-2"></i>
            确认上传
          </a-button>
          <a-button
            size="large"
            @click="clearFileList"
            class="cancel-btn"
          >
            <i class="i-carbon-close mr-2"></i>
            取消
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { fileApi } from '@/api/file'
import type { FileUploaderProps, FileUploaderEmits, UploadStatus, FileNode } from '@/types'
import type { UploadFile } from 'ant-design-vue'

// Props定义
interface Props extends FileUploaderProps {}

const props = withDefaults(defineProps<Props>(), {
  accept: '.md,.markdown',
  maxSize: 10 * 1024 * 1024, // 10MB
  disabled: false
})

// Emits定义
const emit = defineEmits<FileUploaderEmits>()

// 响应式数据
const fileList = ref<UploadFile[]>([])
const uploadStatus = ref<UploadStatus>({
  status: 'idle',
  progress: 0
})

// 计算属性
const getIconClass = computed(() => {
  switch (uploadStatus.value.status) {
    case 'uploading':
      return 'i-carbon-cloud-upload text-blue-500'
    case 'success':
      return 'i-carbon-checkmark-filled text-green-500'
    case 'error':
      return 'i-carbon-warning-filled text-red-500'
    default:
      return 'i-carbon-document-add text-gray-400'
  }
})

const getUploadText = computed(() => {
  switch (uploadStatus.value.status) {
    case 'uploading':
      return '正在上传文件...'
    case 'success':
      return '文件上传成功！'
    case 'error':
      return '文件上传失败'
    default:
      return '点击或拖拽 Markdown 文件到此区域上传'
  }
})

// 方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const beforeUpload = (file: UploadFile): boolean => {
  // 重置状态
  resetUploadStatus()

  // 检查文件类型
  const isMarkdown = file.type === 'text/markdown' ||
                    file.name?.toLowerCase().endsWith('.md') ||
                    file.name?.toLowerCase().endsWith('.markdown')

  if (!isMarkdown) {
    const error = '只能上传 Markdown 文件！'
    setError(error)
    message.error(error)
    return false
  }

  // 检查文件大小
  const isLtMaxSize = (file.size || 0) < props.maxSize
  if (!isLtMaxSize) {
    const error = `文件大小不能超过 ${formatFileSize(props.maxSize)}！`
    setError(error)
    message.error(error)
    return false
  }

  return false // 阻止自动上传，等待用户确认
}

// 确认上传方法
const confirmUpload = async () => {
  if (fileList.value.length === 0) return

  const file = fileList.value[0]
  await handleUpload({ file: file.originFileObj || file })
}

// 清除文件列表
const clearFileList = () => {
  fileList.value = []
  resetUploadStatus()
}

const handleUpload = async (options: any) => {
  const { file } = options
  
  try {
    // 开始上传
    uploadStatus.value = {
      status: 'uploading',
      progress: 0
    }
    emit('uploadStart')
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadStatus.value.progress < 90) {
        uploadStatus.value.progress += 10
        emit('uploadProgress', uploadStatus.value.progress)
      }
    }, 200)
    
    // 调用API上传文件
    const response = await fileApi.uploadFile(props.subjectId, file as File)

    // 清除进度定时器
    clearInterval(progressInterval)

    // 上传成功
    uploadStatus.value = {
      status: 'success',
      progress: 100
    }

    emit('uploadProgress', 100)

    // 调试：打印响应数据结构
    console.log('上传响应数据:', response.data)

    // 转换响应数据为FileNode格式
    const fileNode: FileNode = {
      id: response.data.data?.id || response.data.id,
      subject_id: response.data.data?.subjectId || response.data.subjectId,
      parent_id: null,
      name: response.data.data?.name || response.data.name,
      type: 'file',
      file_path: response.data.data?.originalName || response.data.originalName,
      file_size: response.data.data?.size || response.data.size,
      mime_type: response.data.data?.mimeType || response.data.mimeType,
      created_at: response.data.data?.uploadTime || response.data.uploadTime,
      updated_at: response.data.data?.uploadTime || response.data.uploadTime
    }

    console.log('转换后的FileNode:', fileNode)
    emit('uploadSuccess', fileNode)
    message.success('文件上传成功！')
    
    // 3秒后自动清除成功状态
    setTimeout(() => {
      if (uploadStatus.value.status === 'success') {
        resetUploadStatus()
      }
    }, 3000)
    
  } catch (error: any) {
    const errorMessage = error.message || '文件上传失败，请重试'
    setError(errorMessage)
    emit('uploadError', errorMessage)
    message.error(errorMessage)
  }
}

const handleChange = (info: { fileList: UploadFile[] }) => {
  // 限制文件列表只保留最新的一个文件
  fileList.value = info.fileList.slice(-1)
}

const resetUploadStatus = () => {
  uploadStatus.value = {
    status: 'idle',
    progress: 0
  }
}

const setError = (error: string) => {
  uploadStatus.value = {
    status: 'error',
    progress: 0,
    error
  }
}

const clearError = () => {
  resetUploadStatus()
}

const clearSuccess = () => {
  resetUploadStatus()
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-dragger {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-dragger:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.upload-dragger.ant-upload-drag-hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.upload-content {
  padding: 24px;
  text-align: center;
}

.upload-icon {
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.upload-progress {
  margin-top: 16px;
}

.progress-text {
  font-size: 14px;
  color: #1890ff;
  margin-top: 8px;
}

.upload-error,
.upload-success {
  margin-top: 16px;
}

.upload-buttons {
  margin-top: 20px;
}

.upload-btn {
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.file-actions {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.file-name {
  font-weight: 500;
  color: #333;
  margin-right: 8px;
}

.file-size {
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.confirm-upload-btn {
  height: 40px;
  font-size: 14px;
  border-radius: 6px;
}

.cancel-btn {
  height: 40px;
  font-size: 14px;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .selected-file {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>
