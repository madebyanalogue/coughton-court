<template>


  <header 
    ref="headerRef" 
    class="scheme"
    :class="{
      'overlay': shouldUseOverlay,
      'light': !shouldUseOverlay
    }"
  >
  
    <div class="header-bar flex flex-row flex-center flex-middle px1 px-md-2">
      <div class="header-left">
        <div class="page-title-container">
          <div class="page-title mono" :data-page-title="pageTitle" ref="pageTitleRef">{{ displayTitle }}</div>
        </div>
      </div>
      <NuxtLink
        v-if="!pageData?.hideHeaderLogo"
        to="/"
        class="logo-center"
      >
        <div id="logo">
          <Logo />
        </div>
      </NuxtLink>
      <div v-else class="logo-center">
        <div class="logo">
          <!-- Empty div to maintain layout when logo is hidden -->
        </div>
      </div>
      
      <div class="header-right flex flex-row flex-center">
        <a 
          v-if="bookingLink"
          :href="bookingLink"
          target="_blank"
          rel="noopener"
          class="header-booking-btn"
        >
          {{ bookingTitle }}
        </a>
        <MobileMenu 
          :is-open="menuOpen" 
          @close-menu="closeMenu" 
        />
        <MenuButton :is-active="menuOpen" @toggle-menu="toggleMenu" />
      </div>

    </div>

    <nav v-if="mainMenuItems.length > 0" class="header-nav">
      <ul class="header-nav-list">
        <li v-for="item in mainMenuItems" :key="item._key || item.text" class="header-nav-item">
          <NuxtLink 
            v-if="getMenuItemUrl(item)" 
            :to="getMenuItemUrl(item)" 
            class="header-nav-link"
          >
            {{ item.text }}
          </NuxtLink>
          <span v-else class="header-nav-link">{{ item.text }}</span>
        </li>
      </ul>
    </nav>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { gsap } from 'gsap';
import { useRoute } from '#app';
import { useHeaderScroll } from '~/composables/useHeaderScroll';
import { useSiteSettings } from '~/composables/useSiteSettings';
import { useMenu } from '~/composables/useMenu';
import Logo from '~/components/Logo.vue';
import MenuButton from '~/components/MenuButton.vue';
import MobileMenu from '~/components/MobileMenu.vue';

const props = defineProps({
  pageData: {
    type: Object,
    required: false,
    default: null
  }
});

// Header animation state
const headerAnimated = ref(false)

const route = useRoute();
const headerRef = ref(null);
const { isHeaderVisible } = useHeaderScroll()
const { settings: siteSettings, bookingLink, bookingTitle } = useSiteSettings()
const { mainMenu } = useMenu()

// Hero scroll detection
const hasScrolledPastHero = ref(false)

// Check if we're on an event page
const isEventPage = computed(() => {
  return route.path.startsWith('/events/')
})

// Check if we're on a garden page
const isGardenPage = computed(() => {
  return route.path.startsWith('/gardens/')
})

// Determine if we should use overlay scheme
const shouldUseOverlay = computed(() => {
  // Events and gardens always have a hero
  if (isEventPage.value || isGardenPage.value) {
    return !hasScrolledPastHero.value
  }
  if (!props.pageData?.enableHeroImage) {
    return false
  }
  // If we've scrolled past the hero, use light scheme
  return !hasScrolledPastHero.value
})

// Check if we've scrolled past the hero section
const checkHeroScroll = () => {
  // For event pages, always check for hero
  if (isEventPage.value) {
    const heroElement = document.querySelector('.event-hero')
    if (heroElement) {
      const heroRect = heroElement.getBoundingClientRect()
      hasScrolledPastHero.value = heroRect.bottom < 50
      return
    }
    hasScrolledPastHero.value = false
    return
  }

  // For garden pages, always check for hero
  if (isGardenPage.value) {
    const heroElement = document.querySelector('.garden-hero')
    if (heroElement) {
      const heroRect = heroElement.getBoundingClientRect()
      hasScrolledPastHero.value = heroRect.bottom < 50
      return
    }
    hasScrolledPastHero.value = false
    return
  }

  if (!props.pageData?.enableHeroImage) {
    hasScrolledPastHero.value = false
    return
  }

  // Find the hero section element
  const heroElement = document.querySelector('.page-hero')
  if (!heroElement) {
    hasScrolledPastHero.value = false
    return
  }

  const heroRect = heroElement.getBoundingClientRect()
  
  // If hero bottom is above the viewport (negative), we've scrolled past it
  hasScrolledPastHero.value = heroRect.bottom < 50
}

// Watch for route changes and pageData to detect hero
watch([() => route.path, () => props.pageData?.enableHeroImage], () => {
  if (isEventPage.value || isGardenPage.value || props.pageData?.enableHeroImage) {
    nextTick(() => {
      checkHeroScroll()
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', checkHeroScroll, { passive: true })
      }
    })
  } else {
    hasScrolledPastHero.value = false
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', checkHeroScroll)
    }
  }
}, { immediate: true })

// Get menu items from the menu
const mainMenuItems = computed(() => {
  if (!mainMenu.value) return []
  const items = mainMenu.value.items
  if (!items || !Array.isArray(items)) return []
  return items.filter(item => item && item.text) // Filter out any invalid items
})

// Helper function to get the URL for a menu item
const getMenuItemUrl = (item) => {
  if (item.to?.page?.slug?.current) {
    let url = `/${item.to.page.slug.current}`
    // Append anchor if provided
    if (item.to?.anchor) {
      const anchor = item.to.anchor.startsWith('#') ? item.to.anchor : `#${item.to.anchor}`
      url += anchor
    }
    return url
  }
  if (item.to?.url) {
    return item.to.url
  }
  return null
}

// Website title from Sanity
const websiteTitle = computed(() => siteSettings.value?.title || 'Coughton Court')

// Deprecated local menu control (kept for layout logic only)
const menuOpen = ref(false)
const isAnimating = ref(false)

// Simple computed property for page title
const pageTitle = computed(() => {
  // Use the page title from Sanity if available
  if (props.pageData?.title) {
    return props.pageData.title;
  }
  
  // Fallback to route meta (for older pages)
  if (route.meta.pageTitle) {
    return route.meta.pageTitle;
  }
  
  // Default to 'Home' for the root path
  if (route.path === '/') {
    return 'Home';
  }
  
  return '';
});

const displayTitle = ref('');
const pageTitleRef = ref(null);

// Watch for page title changes and let the plugin handle transitions
watch(pageTitle, (newTitle) => {
  // Initialize displayTitle if it's empty
  if (!displayTitle.value && newTitle) {
    displayTitle.value = newTitle
  }
  
  if (pageTitleRef.value) {
    // Let the plugin handle the transition
    if (window.handlePageTitleTransition) {
      window.handlePageTitleTransition(newTitle, pageTitleRef.value, displayTitle)
    } else {
      // Fallback: update immediately if plugin not ready
      displayTitle.value = newTitle
    }
  } else {
    // If ref not available yet, just update the display title
    displayTitle.value = newTitle
  }
}, { immediate: true })

// Initialize displayTitle with current page title
onMounted(() => {
  if (!displayTitle.value && pageTitle.value) {
    displayTitle.value = pageTitle.value
  }
})

const updateHeights = () => {
  if (headerRef.value) {
    const headerHeight = headerRef.value.offsetHeight;
    //document.body.style.setProperty('--header-height', `${headerHeight}px`);
  }
};

const initializeMomentumHover = () => {
  if (typeof window !== 'undefined' && window.initializeMomentumHover) {
    console.log('🔴 [Header] Calling momentum hover initialization...')
    window.initializeMomentumHover()
  } else {
    console.log('🔴 [Header] Momentum hover function not available')
  }
}


onMounted(() => {
  window.addEventListener('resize', updateHeights);
  nextTick(updateHeights);

  // Watch for title changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.tagName === 'TITLE') {
        // Title changed
      }
    });
  });

  const titleElement = document.querySelector('title');
  if (titleElement) {
    observer.observe(titleElement, { childList: true });
  }

  onUnmounted(() => {
    window.removeEventListener('resize', updateHeights);
    observer.disconnect();
  });
});

watch(() => route.path, () => {
  nextTick(updateHeights);
});

// Watch for header visibility changes and animate smoothly
watch(isHeaderVisible, (newValue) => {
  if (headerRef.value && headerAnimated.value) {
    if (newValue) {
      // Animate header in
      gsap.to(headerRef.value, {
        y: '0%',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      })
    } else {
      // Animate header out
      gsap.to(headerRef.value, {
        y: '-100%',
        opacity: 0.8,
        duration: 0.4,
        ease: 'power2.in'
      })
    }
  }
})

// Menu functions
const toggleMenu = () => {
  if (isAnimating.value) return
  
  if (!menuOpen.value) {
    openMenu()
  } else {
    closeMenu()
  }
}

const openMenu = () => {
  isAnimating.value = true
  menuOpen.value = true
  
  // Stop scrolling
  document.body.style.overflow = 'hidden'
  
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

const closeMenu = () => {
  isAnimating.value = true
  
  setTimeout(() => {
    menuOpen.value = false
    isAnimating.value = false
    document.body.style.overflow = ''
  }, 300)
}
</script>

<style scoped>



.header-bar {
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background 0.3s ease, color 0.3s ease;
  justify-content: space-between;
  display:grid;
  grid-template-areas:
        "left center right";
  gap: 10px;
  height: var(--header-bar-height);
  grid-template-rows: auto;
  /* Initial state will be handled entirely by GSAP */
}
@media all and (min-width: 800px) {
  .header-bar {
    grid-template-areas:
        "left center right";
    grid-template-columns: 1fr auto 1fr;
    gap: 10px;
    grid-template-rows: auto;
  }
}
.header-bar.dark {
  color: var(--color-text, #fff);
  background: transparent;
}
.header-left, .header-right {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
}
.logo-center {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-area: center;
  margin-left: calc(var(--pad-1) * -0.12);
}
@media all and (min-width: 800px) {
  .logo-center {
    grid-area: center;
    margin-left: calc(var(--pad-1) * -0);
  }
  
}
.logo {
  z-index: 1003;
  position: relative;
}


.header-left {
  justify-content: flex-start;
  grid-area: left;
  display: none;
}
@media all and (min-width: 800px) {
  .header-left {
    grid-area: left;
    display: flex;
  }
}
.header-right {
  justify-content: flex-end;
  grid-area: right;
  align-self: stretch;
  gap: 1rem;
  align-items: center;
}

.header-booking-btn {
  padding: 0.5rem 1rem;
  background: var(--black, #000);
  color: var(--white, #fff);
  text-decoration: none;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s;
  border-radius: 2px;
  cursor: pointer;
}

.header-booking-btn:hover {
  background: var(--gray-700, #333);
}

header.overlay .header-booking-btn {
  background: var(--white, #fff);
  color: var(--black, #000);
}

header.overlay .header-booking-btn:hover {
  background: var(--gray-100, #f5f5f5);
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1002;
}

.hamburger span {
  display: block;
  width: 28px;
  height: 2px;
  background: currentColor;
  border-radius: 0px;
  transition: all 0.3s;
}

.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger span.open:nth-child(2),
.hamburger span:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.hamburger.menu-active span {
  background: white;
}

/* Replacing the previous CSS rule for .header-bar.no-transform-transition */
.header-bar.no-transform-transition {
  transition: none !important;
  transition: background 0.3s, color 0.3s !important;
}

.page-title {
  display: flex;
  align-items: center;
}

.header-nav {
  display: block;
  width: 100%;
  border-bottom: 1px solid currentColor;
  border-top: 1px solid currentColor;
  height: var(--header-nav-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0.5em 1em;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.header-nav-item {
  margin: 0;
}

.header-nav-link {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.3s ease;
  line-height: 1;
}

.header-nav-link:hover {
  opacity: 0.7;
}


nav {
  border-top: 1px solid var(--color-text);
  border-bottom: 1px solid var(--color-text);
}


</style> 