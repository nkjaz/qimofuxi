import { defineStore } from 'pinia'

interface AppState {
  loading: boolean
  title: string
  theme: 'light' | 'dark'
  collapsed: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    loading: false,
    title: '期末复习平台',
    theme: 'light',
    collapsed: false
  }),

  getters: {
    isLoading: (state) => state.loading,
    appTitle: (state) => state.title,
    isDark: (state) => state.theme === 'dark',
    isCollapsed: (state) => state.collapsed
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setTitle(title: string) {
      this.title = title
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },

    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },

    setCollapsed(collapsed: boolean) {
      this.collapsed = collapsed
    }
  }
})
