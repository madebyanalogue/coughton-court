import { ref, watch } from 'vue'

// Single source of truth for dark mode
const isDark = ref(false)
export const useRemoveTopPadding = ref(false) // false = normal padding

// Watch for dark mode changes and update DOM
watch(isDark, (val) => {
  if (typeof window !== 'undefined') {
    if (val) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }
}, { immediate: true })

// Export a function to use dark mode
export function useDarkMode() {
  // Default to light mode - let Sanity CMS control dark mode per page
  return { isDark }
}

// Export isDark ref for direct access when needed
export { isDark } 