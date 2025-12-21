import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
  if (process.server) return

  // Function to load Google Analytics
  const loadGoogleAnalytics = async (gaId) => {
    if (!gaId || typeof window === 'undefined') return

    // Check if already loaded
    if (window.gtag) {
      window.gtag('config', gaId)
      return
    }

    // Load gtag.js script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    // Configure GA
    gtag('js', new Date())
    gtag('config', gaId)
  }

  // Function to check cookies acceptance and initialize GA
  const initializeGA = async () => {
    const cookiesAccepted = localStorage.getItem('cookies-accepted')
    
    if (cookiesAccepted === 'true') {
      // Fetch site settings to get GA ID
      try {
        const settings = await $fetch('/api/sanity', { params: { type: 'siteSettings' } })
        const gaId = settings?.googleAnalyticsId
        
        if (gaId) {
          loadGoogleAnalytics(gaId)
        }
      } catch (error) {
        console.warn('Failed to fetch site settings for GA:', error)
      }
    }
  }

  // Initialize on mount if cookies already accepted
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGA)
  } else {
    initializeGA()
  }

  // Listen for cookie acceptance events
  window.addEventListener('cookies-accepted', () => {
    initializeGA()
  })
})

