export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const router = useRouter()

  // Prefetch pages on link hover for instant navigation
  if (typeof document !== 'undefined') {
    document.addEventListener('mouseenter', (e) => {
      const link = e.target.closest('a[href]')
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin)
          // Only prefetch same-origin links
          if (url.origin === window.location.origin) {
            const path = url.pathname + url.search
            // Prefetch the route
            router.prefetch(path).catch(() => {
              // Ignore prefetch errors
            })
          }
        } catch (err) {
          // Ignore URL parsing errors
        }
      }
    }, true) // Use capture phase to catch early
  }
})

