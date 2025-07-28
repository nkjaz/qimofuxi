import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono'
      }
    })
  ],
  shortcuts: [
    // 布局相关
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['flex-around', 'flex items-center justify-around'],
    
    // 按钮样式
    ['btn', 'px-4 py-2 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors'],
    ['btn-primary', 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors'],
    ['btn-success', 'px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors'],
    ['btn-danger', 'px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors'],
    
    // 卡片样式
    ['card', 'bg-white rounded-lg shadow-sm border border-gray-200 p-4'],
    ['card-hover', 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'],
    
    // 文本样式
    ['text-title', 'text-lg font-semibold text-gray-900'],
    ['text-subtitle', 'text-base font-medium text-gray-700'],
    ['text-body', 'text-sm text-gray-600'],
    ['text-caption', 'text-xs text-gray-500']
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    }
  }
})
