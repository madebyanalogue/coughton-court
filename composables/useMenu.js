import { useSiteSettings } from '~/composables/useSiteSettings'
import { watch } from 'vue'

export const useMenu = () => {
  const { mainNavigationMenu, settings, pending: settingsPending } = useSiteSettings()
  
  // Fetch main menu from site settings or fallback to fetching by title
  const { data: mainMenu, pending: mainMenuPending, error: mainMenuError, refresh: refreshMainMenu } = useAsyncData('mainMenu', async () => {
    // First check if a menu is selected in site settings
    const menuFromSettings = settings.value?.mainNavigationMenu || mainNavigationMenu.value
    
    if (menuFromSettings && menuFromSettings._id) {
      // Normalize items to array
      if (!Array.isArray(menuFromSettings.items)) {
        menuFromSettings.items = menuFromSettings.items ? [menuFromSettings.items] : []
      }
      return menuFromSettings
    }
    
    // Fallback to fetching by title if no menu is selected
    const result = await $fetch('/api/sanity', {
      query: { type: 'menu', menuTitle: 'Main Menu' }
    })
    
    // Normalize items to array
    if (result) {
      if (!Array.isArray(result.items)) {
        result.items = result.items ? [result.items] : []
      }
    }
    
    return result || null
  }, {
    watch: [() => settings.value?.mainNavigationMenu, mainNavigationMenu]
  })

  // Fetch footer menu from Sanity
  const { data: footerMenu, pending: footerMenuPending, error: footerMenuError } = useAsyncData('footerMenu', async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Footer' }
      })
      return result
    } catch (error) {
      footerMenuError.value = error
      console.error('Error fetching footer menu:', error)
      throw error
    }
  })

  const fetchMainMenu = async () => {
    try {
      // First check if a menu is selected in site settings
      if (mainNavigationMenu.value) {
        mainMenu.value = mainNavigationMenu.value
        return
      }
      
      // Fallback to fetching by title if no menu is selected
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Main Menu' }
      })
      mainMenu.value = result
    } catch (error) {
      mainMenuError.value = error
      console.error('Error fetching main menu:', error)
    }
  }

  const fetchFooterMenu = async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Footer' }
      })
      footerMenu.value = result
    } catch (error) {
      footerMenuError.value = error
      console.error('Error fetching footer menu:', error)
    }
  }

  // Watch for changes in site settings menu and refresh
  watch([() => settings.value?.mainNavigationMenu, mainNavigationMenu], () => {
    refreshMainMenu()
  })

  return {
    mainMenu,
    footerMenu,
    mainMenuPending,
    footerMenuPending,
    mainMenuError,
    footerMenuError,
    refreshMainMenu
  }
} 