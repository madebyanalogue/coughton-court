export const useMenu = () => {
  // Fetch main menu from Sanity
  const { data: mainMenu, pending: mainMenuPending, error: mainMenuError } = useAsyncData('mainMenu', async () => {
    try {
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle: 'Main Menu' }
      })
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