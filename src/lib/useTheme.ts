import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const init = () => {
    isDark.value = localStorage.getItem('admin_theme') === 'dark'
    applyTheme()
  }

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('admin_theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  onMounted(init)
  watch(isDark, applyTheme)

  return { isDark, toggle }
}
