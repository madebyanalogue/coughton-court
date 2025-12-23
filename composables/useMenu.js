// Helper function to generate anchor ID from section title
const generateAnchorId = (title) => {
  if (!title) return null
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to process menu items and auto-generate anchors
const processMenuItems = (items) => {
  if (!items || !Array.isArray(items)) return items
  
  return items.map(item => {
    if (item.to?.section?.title && !item.to.anchor) {
      // Auto-generate anchor from section title if section is selected but anchor is not set
      item.to.anchor = generateAnchorId(item.to.section.title)
    }
    return item
  })
}

export const useMenu = () => {
  // Fetch main menu from Sanity
  const { data: mainMenu, pending: mainMenuPending, error: mainMenuError } = useAsyncData('mainMenu', async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Main Menu' }
      })
      if (result && result.items) {
        result.items = processMenuItems(result.items)
      }
      return result
    } catch (error) {
      mainMenuError.value = error
      console.error('Error fetching main menu:', error)
      throw error
    }
  })

  // Fetch footer menu from Sanity
  const { data: footerMenu, pending: footerMenuPending, error: footerMenuError } = useAsyncData('footerMenu', async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Footer' }
      })
      if (result && result.items) {
        result.items = processMenuItems(result.items)
      }
      return result
    } catch (error) {
      footerMenuError.value = error
      console.error('Error fetching footer menu:', error)
      throw error
    }
  })

  const updateMenuStates = () => {
    mainMenuPending.value = mainMenuLoading.value
    footerMenuPending.value = footerMenuLoading.value
    mainMenuError.value = mainMenuErrorData.value
    footerMenuError.value = footerMenuErrorData.value
  }

  const fetchMainMenu = async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Main Menu' }
      })
      mainMenu.value = result
    } catch (error) {
      mainMenuErrorData.value = error
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
      footerMenuErrorData.value = error
      console.error('Error fetching footer menu:', error)
    }
  }

  return {
    mainMenu,
    footerMenu,
    mainMenuPending,
    footerMenuPending,
    mainMenuError,
    footerMenuError
  }
} 