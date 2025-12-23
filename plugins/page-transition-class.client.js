import { useSiteSettings } from '~/composables/useSiteSettings'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const router = useRouter()
  const { disablePageTransition } = useSiteSettings()

  router.beforeEach((to, from, next) => {
    if (!disablePageTransition.value) {
      document.body.classList.add('page-out')
    }
    next()
  })

  router.afterEach(() => {
    if (disablePageTransition.value) {
      // Ensure classes are cleaned up if the setting was toggled on
      document.body.classList.remove('page-out')
      document.body.classList.remove('page-in')
      return
    }

    document.body.classList.remove('page-out')
    document.body.classList.add('page-in')
    setTimeout(() => {
      document.body.classList.remove('page-in')
    }, 500) // Adjust duration to match your transition
  })
})