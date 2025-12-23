import { useAsyncData } from '#app'
import { useRoute } from 'vue-router'
import { isDark, useRemoveTopPadding } from './usePageUi'
import { watch, computed } from 'vue'

// Default page settings
const defaultSettings = {
  darkMode: false,
  removeTopPadding: false
}

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const usePageSettings = () => {
  const route = useRoute()
  // Always recompute slug from the current route
  const pageSlug = computed(() => route.path.replace(/^\//, '') || 'index')

           const { data: pageData, pending, error } = useAsyncData(
           `page-settings-${route.fullPath}`,
           async () => {
             // For non-"page" routes like events and gardens, skip the API call entirely
             const slug = pageSlug.value
             if (slug.startsWith('events/') || slug.startsWith('gardens/')) {
               useRemoveTopPadding.value = defaultSettings.removeTopPadding
               isDark.value = defaultSettings.darkMode
               return null
             }

             try {
               const result = await $fetch('/api/sanity', {
                 params: {
                   type: 'page',
                   identifier: slug,
                   identifierType: 'slug'
                 }
               })
        
               // Set initial values based on Sanity data or defaults
               if (result && Object.keys(result).length > 0) {
                 useRemoveTopPadding.value = result.removeTopPadding !== undefined ? !!result.removeTopPadding : defaultSettings.removeTopPadding
                 isDark.value = result.darkMode !== undefined ? !!result.darkMode : defaultSettings.darkMode
               } else {
                 useRemoveTopPadding.value = defaultSettings.removeTopPadding
                 isDark.value = defaultSettings.darkMode
               }
        
               return result
             } catch (err) {
               // Set defaults on error and don't log 404 errors
               if (err.statusCode !== 404) {
                 console.warn('Failed to fetch page settings, using defaults:', err)
               }
               useRemoveTopPadding.value = defaultSettings.removeTopPadding
               isDark.value = defaultSettings.darkMode
               return null
             }
    },
    {
      watch: [() => route.fullPath],
      immediate: true,
      server: true
    }
  )

  // Watch for page data changes and update settings
  watch(() => pageData.value, (newData) => {
    if (newData) {
      isDark.value = newData.darkMode ?? false
      useRemoveTopPadding.value = newData.removeTopPadding ?? false
    }
  }, { immediate: true })

  // Only modify DOM in browser environment
  watch(() => isDark.value, (newValue) => {
    if (isBrowser) {
      if (newValue) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    }
  }, { immediate: true })

  return {
    page: pageData,
    isDark,
    useRemoveTopPadding,
    pending,
    error
  }
} 