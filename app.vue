<template>
  <ClientOnly>
    <Preloader 
      @preloader-complete="onPreloaderComplete" 
      @preloader-ready="onPreloaderReady" 
    />
  </ClientOnly>
  
  <!-- Page transitions (entire app-shell transitions as one unit) -->
  <div v-if="preloaderReady" class="app-shell-wrapper">
    <VisibleGrid />
    <Header :page-data="page" />
    <Transition
      v-if="!disablePageTransition && pageReady"
      name="page"
      appear
      @before-enter="onPageBeforeEnter"
      @after-enter="onPageEnter"
      @leave="onPageLeave"
    >
      <div v-if="pageReady" class="app-shell" :key="route.fullPath">
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
    </Transition>
    
    <!-- Fallback when transition is disabled or page not ready -->
    <div v-else class="app-shell">
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

  <!-- No page transitions: render instantly with no animation -->
  <div v-else-if="preloaderReady" class="app-shell" :key="route.fullPath">
    <VisibleGrid />
    <Header :page-data="page" />
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
            v-if="shouldShowFooter"
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
</template>

<script setup>
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
import Preloader from '~/components/Preloader.vue';
import { useDarkMode } from '~/composables/usePageUi.js';
import { useFavicon } from '~/composables/useFavicon.js';
import { usePageSettings } from '~/composables/usePageSettings';
import { useScrollTrigger } from '~/composables/useScrollTrigger.js';
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router'
import { useHead, useRouter } from '#app'
import { useSiteSettings } from '~/composables/useSiteSettings'

// Initialize page settings first
const { isDark, page } = usePageSettings();
const route = useRoute();
const router = useRouter();
const { disablePreloader, disablePageTransition } = useSiteSettings()

// Initialize scroll trigger system
const { enableScrollAnimations } = useScrollTrigger();

// Preloader state
const preloaderReady = ref(false)
const isPageTransitioning = ref(false)
const pageReady = ref(true)

// Use custom transition hooks to control scroll position instead of router.scrollBehavior

// Handle page transitions
router.beforeEach(() => {
  if (!disablePageTransition.value) {
    isPageTransitioning.value = true
    pageReady.value = false
    // Add class to body to prevent footer scroll trigger during transitions
    if (typeof document !== 'undefined') {
      document.body.classList.add('page-transitioning')
    }
  } else {
    // Ensure any stale state is cleared when transitions are disabled
    isPageTransitioning.value = false
    if (typeof document !== 'undefined') {
      document.body.classList.remove('page-transitioning')
    }
  }
})

router.afterEach(async (to) => {
  // Keep footer hidden until page transition is complete
  // The footer will be shown again in onPageEnter after fade-in completes

  // Wait for page to load before starting transition
  if (!disablePageTransition.value && typeof window !== 'undefined') {
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
            pageReady.value = true
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
    //console.log('Added preloader-ready class to body')
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

// Called when page fade-in completes; refresh scroll-based systems
const onPageEnter = () => {
  // Show footer again after page transition completes
  isPageTransitioning.value = false
  
  // Remove page-transitioning class to re-enable footer scroll trigger
  if (typeof document !== 'undefined') {
    document.body.classList.remove('page-transitioning')
  }
  
  if (typeof window !== 'undefined' && window.gsap && window.gsap.ScrollTrigger) {
    window.gsap.ScrollTrigger.refresh()
  }
  
  // Let fade-in system and others know page content is visible
  document.dispatchEvent(new CustomEvent('page-transition-in-complete'))
  
  // Dispatch route-changed event for other plugins
  document.dispatchEvent(new CustomEvent('route-changed'))
}

const onPageBeforeEnter = () => {
  // Intentionally left empty: we no longer force scroll position on route changes
  // so the footer doesn't appear to "jump" to the top on short pages.
}

const onPageLeave = () => {
  // Fade out the old page (header and content, but body background stays)
}
</script>

<style>

</style>
