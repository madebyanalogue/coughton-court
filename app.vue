<template>
  <ClientOnly>
    <Preloader 
      @preloader-complete="onPreloaderComplete" 
      @preloader-ready="onPreloaderReady" 
    />
  </ClientOnly>
  
  <!-- Instant page transitions: hold current page until new content is ready -->
  <div v-if="preloaderReady" class="app-shell-wrapper">
    <VisibleGrid />
    <Header :page-data="page" />
    <div class="app-shell" :key="route.fullPath">
      <div class="page-container">
        <main :style="{ paddingTop: mainPaddingVar }" class="main-content">
          <div class="page-wrapper">
            <!-- Old page HTML - captured before navigation, stays visible until new page is ready -->
            <div v-if="oldPageHtml && oldPageHtml.trim().length > 0" 
                 class="page-old" 
                 v-html="oldPageHtml">
            </div>
            
            <!-- New page - loads in background, appears over old when ready -->
            <div class="page-new" 
                 :class="{ 'page-new-ready': pageReady }"
                 :key="route.fullPath"
                 ref="pageNewRef">
              <Suspense>
                <NuxtPage :key="route.fullPath" />
                <template #fallback>
                  <div v-if="!oldPageHtml || oldPageHtml.trim().length === 0" class="page-loading-placeholder" style="min-height: calc(100vh - var(--header-height, 80px));"></div>
                </template>
              </Suspense>
            </div>
          </div>
        </main>
        <ClientOnly>
          <template #default>
            <Footer
              v-if="!page?.value?.hideFooter"
              :page-data="page"
              :key="route.path"
            />
          </template>
          <template #fallback>
            <!-- No footer during SSR -->
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
import Preloader from '~/components/Preloader.vue';
import { useDarkMode } from '~/composables/usePageUi.js';
import { useFavicon } from '~/composables/useFavicon.js';
import { usePageSettings } from '~/composables/usePageSettings';
import { useScrollTrigger } from '~/composables/useScrollTrigger.js';
import { computed, onMounted, ref, nextTick, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router'
import { useHead, useRouter } from '#app'
import { useSiteSettings } from '~/composables/useSiteSettings'

// Initialize page settings first
const { isDark, page } = usePageSettings();
const route = useRoute();
const router = useRouter();
const { disablePreloader } = useSiteSettings()

// Initialize scroll trigger system
const { enableScrollAnimations } = useScrollTrigger();

// Preloader state
const preloaderReady = ref(false)
const isPageTransitioning = ref(false)
const previousRouteKey = ref(null)
const pageReady = ref(false)
const pageNewRef = ref(null)
const oldPageHtml = ref('')
let unwatchRouter = null

// Handle page transitions - capture old page HTML before navigation
onMounted(() => {
  unwatchRouter = router.beforeEach((to, from, next) => {
    isPageTransitioning.value = true
    pageReady.value = false
    
    // Store the previous route key to keep old page mounted
    if (from.fullPath) {
      previousRouteKey.value = from.fullPath
    }
    
    // Capture current page HTML before it unmounts
    if (typeof document !== 'undefined') {
      const pageWrapper = document.querySelector('main .page-wrapper .page-new')
      if (pageWrapper) {
        // Use requestAnimationFrame to ensure content is painted before capture
        requestAnimationFrame(() => {
          const clone = pageWrapper.cloneNode(true)
          clone.classList.remove('page-new-hidden')
          oldPageHtml.value = clone.innerHTML
        })
      } else {
        oldPageHtml.value = '' // Clear if no content to capture
      }
    }
    
    // Add class to body to prevent footer scroll trigger during transitions
    if (typeof document !== 'undefined') {
      document.body.classList.add('page-transitioning')
    }
    next()
  })
})

onBeforeUnmount(() => {
  if (unwatchRouter) {
    unwatchRouter()
  }
})

router.afterEach(async (to) => {
  // Wait for new page to be fully loaded
  if (typeof window !== 'undefined') {
    await nextTick()
    await nextTick() // Extra tick for async components
    
    // Check immediately and very frequently
    await new Promise((resolve) => {
      let attempts = 0
      const maxAttempts = 300
      
      const checkReady = () => {
        attempts++
        
        // Check the new page container specifically
        const newPageContainer = pageNewRef.value
        if (!newPageContainer) {
          if (attempts < maxAttempts) {
            setTimeout(checkReady, 5)
          } else {
            resolve()
          }
          return
        }
        
        // Check for loading placeholder
        const fallback = newPageContainer.querySelector('.page-loading-placeholder')
        
        // Check for actual content
        const hasContent = newPageContainer && (
          newPageContainer.querySelectorAll('section, .page-builder, .page-content, .garden-page, .page-hero, .garden-hero, .wrapper, h1').length > 0 ||
          (newPageContainer.children.length > 0 && !fallback)
        )
        
        // Page is ready when it has content and no loading state
        if (hasContent && !fallback) {
          // New page is ready - show it over old page
          nextTick(() => {
            pageReady.value = true
            
            // Wait a frame for the CSS transition, then remove old page
            requestAnimationFrame(() => {
              setTimeout(() => {
                oldPageHtml.value = ''
                previousRouteKey.value = null
                isPageTransitioning.value = false
                
                if (typeof document !== 'undefined') {
                  document.body.classList.remove('page-transitioning')
                }
                
                window.scrollTo({ top: 0, behavior: 'instant' })
                
                if (window.gsap && window.gsap.ScrollTrigger) {
                  window.gsap.ScrollTrigger.refresh()
                }
                
                document.dispatchEvent(new CustomEvent('page-transition-in-complete'))
                document.dispatchEvent(new CustomEvent('route-changed'))
                
                resolve()
              }, 300) // Small delay to ensure visual swap is complete
            })
          })
        } else if (attempts >= maxAttempts) {
          // Timeout - show page anyway
          pageReady.value = true
          oldPageHtml.value = ''
          previousRouteKey.value = null
          isPageTransitioning.value = false
          if (typeof document !== 'undefined') {
            document.body.classList.remove('page-transitioning')
          }
          resolve()
        } else {
          // Check very quickly
          setTimeout(checkReady, 5)
        }
      }
      
      // Start immediately
      checkReady()
    })
  }
})

// Use header height padding unless hero is enabled
const mainPaddingVar = computed(() => {
  if (page.value?.enableHeroImage) {
    return '0'
  }
  return 'var(--header-height)'
});

// Update favicon based on dark mode
useFavicon(isDark);

// Add script to head to prevent flash of incorrect mode
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap' }
  ],
  script: [
    {
      children: `
        (function() {
          // CDN scripts loaded
        })();
      `,
      type: 'text/javascript'
    }
  ],
  style: [
    {
      children: `
        :root {
          --initial-bg: var(--initial-bg-light);
        }
        :root.dark-mode {
          --initial-bg: var(--initial-bg-dark);
        }
        body {
          background-color: var(--initial-bg);
        }
      `
    }
  ]
})

// Preloader ready handler
const onPreloaderReady = () => {
  // Preloader is ready to start, show content
  preloaderReady.value = true
  
  // Enable scrolling on body
  if (typeof document !== 'undefined') {
    document.body.classList.add('preloader-ready')
  }
}

// Preloader complete handler
const onPreloaderComplete = () => {
  // Preloader animation finished, site is ready
  
  // Enable scroll animations for all elements
  enableScrollAnimations()
}

// Initialize page ready state
onMounted(() => {
  // Ensure page starts at top on mount
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  
  // Initial page is ready
  pageReady.value = true
})
</script>

<style>
/* Ensure main always has background and content */
main.main-content {
  position: relative;
  min-height: calc(100vh - var(--header-height, 80px));
  background-color: var(--background-color);
}

/* Page wrapper - contains both old and new pages */
.page-wrapper {
  position: relative;
  min-height: calc(100vh - var(--header-height, 80px));
  background-color: var(--background-color);
}

/* Old page - stays visible during transition */
.page-old {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1;
  pointer-events: none;
  min-height: calc(100vh - var(--header-height, 80px));
  background-color: var(--background-color);
  overflow: hidden;
  /* Ensure it covers everything and is visible */
  will-change: auto;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Ensure old page content is visible */
.page-old,
.page-old > * {
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* New page - loads behind old, appears on top when ready */
.page-new {
  position: relative;
  z-index: 2;
  opacity: 1;
  visibility: visible;
  min-height: calc(100vh - var(--header-height, 80px));
  background-color: var(--background-color);
  transition: opacity 0s ease 0.25s;
}

/* New page not ready yet - hide it */
.page-new:not(.page-new-ready) {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  width: 100%;
  pointer-events: none;
  z-index: 0;
}

/* Hide Suspense fallback during transitions when old page is visible */
body.page-transitioning .page-old .page-loading-placeholder,
body.page-transitioning .page-new:not(.page-new-ready) .page-loading-placeholder {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
}
</style>
