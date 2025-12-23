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
  // Global, shared state so menus are fetched once and reused across routes
  const mainMenu = useState('mainMenu', () => null)
  const footerMenu = useState('footerMenu', () => null)
  const mainMenuPending = useState('mainMenuPending', () => false)
  const footerMenuPending = useState('footerMenuPending', () => false)
  const mainMenuError = useState('mainMenuError', () => null)
  const footerMenuError = useState('footerMenuError', () => null)

  const fetchMenu = async (key, menuTitle, targetState, pendingState, errorState) => {
    // If we already have data or are currently loading, don't refetch
    if (targetState.value || pendingState.value) return

    try {
      pendingState.value = true
      const result = await $fetch('/api/sanity', {
        query: { type: 'menu', menuTitle }
      })
      if (result && result.items) {
        result.items = processMenuItems(result.items)
      }
      targetState.value = result || { items: [] }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error)
      errorState.value = error
    } finally {
      pendingState.value = false
    }
  }

  // Kick off fetches on first use; subsequent calls reuse the same state
  fetchMenu('mainMenu', 'Main Menu', mainMenu, mainMenuPending, mainMenuError)
  fetchMenu('footerMenu', 'Footer', footerMenu, footerMenuPending, footerMenuError)

  return {
    mainMenu,
    footerMenu,
    mainMenuPending,
    footerMenuPending,
    mainMenuError,
    footerMenuError
  }
} 