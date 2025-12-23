import { useAsyncData } from '#app'
import { computed } from 'vue'

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

export const useSiteSettings = () => {
  const { data: settings, error, pending } = useAsyncData('siteSettings-v2', async () => {
    try {
      const result = await $fetch('/api/sanity', { params: { type: 'siteSettings' } })
      
      // Process footer menus to auto-generate anchors
      if (result?.footerMenusLeft) {
        result.footerMenusLeft = result.footerMenusLeft.map(menu => ({
          ...menu,
          items: processMenuItems(menu.items)
        }))
      }
      if (result?.footerMenusRight) {
        result.footerMenusRight = result.footerMenusRight.map(menu => ({
          ...menu,
          items: processMenuItems(menu.items)
        }))
      }
      
      return result || {}
    } catch (err) {
      console.warn('Failed to fetch site settings, using defaults:', err)
      return {}
    }
  }, {
    server: true,
    default: () => ({})
  })

  // Sync a body class when page transitions are disabled so we can
  // hard-disable visual recalibration (header/footer/bg) in CSS.
  if (typeof window !== 'undefined') {
    watch(
      () => settings.value?.disablePageTransition === true,
      (disabled) => {
        if (disabled) {
          document.body.classList.add('no-page-transition')
        } else {
          document.body.classList.remove('no-page-transition')
        }
      },
      { immediate: true }
    )
  }

  return {
    settings,
    error,
    pending,
    title: computed(() => settings.value?.title || 'Coughton Court'),
    contactInfo: computed(() => settings.value?.contactInfo || []),
    openingTimes: computed(() => settings.value?.openingTimes || []),
    facebookUrl: computed(() => settings.value?.facebookUrl || ''),
    linkedinUrl: computed(() => settings.value?.linkedinUrl || ''),
    instagramUrl: computed(() => settings.value?.instagramUrl || ''),
    preloaderImages: computed(() => settings.value?.preloaderImages || []),
    logotype: computed(() => settings.value?.logotype || null),
    bookingTitle: computed(() => settings.value?.bookingTitle || 'Book Your Appointment Now'),
    bookingLink: computed(() => settings.value?.bookingLink || ''),
    favicon: computed(() => settings.value?.favicon || {}),
    faviconUrl: computed(() => settings.value?.favicon?.favicon?.asset?.url || ''),
    faviconPngUrl: computed(() => settings.value?.favicon?.faviconPng?.asset?.url || ''),
    faviconDarkPngUrl: computed(() => settings.value?.favicon?.faviconDarkPng?.asset?.url || ''),
    appleTouchIconUrl: computed(() => settings.value?.favicon?.appleTouchIcon?.asset?.url || ''),
    androidIconUrl: computed(() => settings.value?.favicon?.androidIcon?.asset?.url || ''),
    disablePreloader: computed(() => settings.value?.disablePreloader === true),
    disablePageTransition: computed(() => settings.value?.disablePageTransition === true),
    mainNavigationMenu: computed(() => settings.value?.mainNavigationMenu || null),
    footerMenusLeft: computed(() => settings.value?.footerMenusLeft || []),
    footerMenusRight: computed(() => settings.value?.footerMenusRight || []),
    newsletterActionUrl: computed(() => settings.value?.newsletterActionUrl || ''),
    newsletterTitleFooter: computed(() => settings.value?.newsletterTitleFooter || ''),
    newsletterTitleHero: computed(() => settings.value?.newsletterTitleHero || ''),
    newsletterPlaceholder: computed(() => settings.value?.newsletterPlaceholder || 'Enter your email'),
    cookiesMessage: computed(() => settings.value?.cookiesMessage || []),
    googleAnalyticsId: computed(() => settings.value?.googleAnalyticsId || '')
  }
} 