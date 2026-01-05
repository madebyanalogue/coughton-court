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
        <main :style="{ paddingTop: mainPaddingVar }">
          <Suspense>
            <NuxtPage />
            <template #fallback>
              <div class="page-loading-placeholder" style="min-height: calc(100vh - var(--header-height, 80px));"></div>
            </template>
          </Suspense>
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
import { computed, onMounted, ref, nextTick } from 'vue';
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

// Handle page transitions - instant swap when ready
// Suspense will keep old page visible until new page is ready
router.beforeEach(() => {
  isPageTransitioning.value = true
  
  // Add class to body to prevent footer scroll trigger during transitions
  if (typeof document !== 'undefined') {
    document.body.classList.add('page-transitioning')
  }
})

router.afterEach(async (to) => {
  // Wait for new page to be fully loaded before showing it
  // Suspense keeps the old page visible until the new one resolves
  if (typeof window !== 'undefined') {
    await nextTick()
    
    // Wait for Suspense to resolve by checking if page content is ready
    await new Promise((resolve) => {
      const checkReady = () => {
        // Check if Suspense fallback is gone and page content exists
        const fallback = document.querySelector('.page-loading-placeholder')
        const pageContent = document.querySelector('main > div:not(.page-loading-placeholder)')
        
        if (!fallback && pageContent) {
          // Wait one more tick for rendering to complete
          nextTick(() => {
            // Instant swap - no transition
            isPageTransitioning.value = false
            
            // Remove page-transitioning class
            if (typeof document !== 'undefined') {
              document.body.classList.remove('page-transitioning')
            }
            
            // Refresh scroll triggers
            if (typeof window !== 'undefined' && window.gsap && window.gsap.ScrollTrigger) {
              window.gsap.ScrollTrigger.refresh()
            }
            
            // Dispatch events
            document.dispatchEvent(new CustomEvent('page-transition-in-complete'))
            document.dispatchEvent(new CustomEvent('route-changed'))
            
            resolve()
          })
        } else {
          // Check again after a short delay
          setTimeout(checkReady, 50)
        }
      }
      // Start checking after a brief delay to let Suspense start
      setTimeout(checkReady, 100)
    })
  }

  // For garden detail pages, always reset scroll to top after navigation
  // so we don't land at the footer when moving between /gardens/* routes.
  if (typeof window !== 'undefined' && to.path.startsWith('/gardens/')) {
    window.scrollTo({ top: 0, behavior: 'instant' })
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

// Log initial state for debugging
onMounted(() => {
  // Ensure page starts at top on mount
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
})
</script>

<style>
/* No page transitions - instant swap when ready */
</style>
