<template>


  <header 
    ref="headerRef" 
    class="scheme"
    :class="{
      'overlay': shouldUseOverlay,
      'light': !shouldUseOverlay
    }"
  >
  
    <div class="header-bar grid header-grid-area px2">
      <div class="header-left">
        <!-- <div class="page-title-container">
          <div class="page-title mono" :data-page-title="pageTitle" ref="pageTitleRef">{{ displayTitle }}</div>
        </div> -->
        <a 
          v-if="bookingLink"
          :href="bookingLink"
          target="_blank"
          rel="noopener"
          class="button header-booking-button"
        >
          {{ bookingTitle }}
        </a>
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
          class="button header-booking-button"
        >
          {{ bookingTitle }}
        </a>
        <div class="header-mobile-menu">
          <MobileMenu 
            :is-open="menuOpen" 
            @close-menu="closeMenu" 
          />
          <MenuButton :is-active="menuOpen" @toggle-menu="toggleMenu" />
        </div>
      </div>

    </div>

    <!-- Always render nav so it's permanent; list may be empty briefly while menu loads -->
    <nav class="header-nav">
      <ul v-if="mainMenuItems.length > 0" class="header-nav-list h8">
        <li 
          v-for="item in mainMenuItems" 
          :key="item._key || item.text" 
          class="header-nav-item"
          :class="{ 'header-nav-item--current': isCurrentPage(item) }"
        >
          <NuxtLink 
            v-if="getMenuItemUrl(item) && !isExternalUrl(item.to?.url)" 
            :to="getMenuItemUrl(item)" 
            class="header-nav-link"
          >
            {{ item.text }}
          </NuxtLink>
          <a 
            v-else-if="getMenuItemUrl(item)" 
            :href="getMenuItemUrl(item)" 
            target="_blank" 
            rel="noopener"
            class="header-nav-link"
          >
            {{ item.text }}
          </a>
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

// Helper function to determine if a custom URL should be treated as external
const isExternalUrl = (url) => {
  if (!url) return false
  // Explicit external protocols
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return true
  // Treat any URL that doesn't start with "/" or "#" as external (e.g. example.com)
  return !url.startsWith('/') && !url.startsWith('#')
}

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

// Check if a menu item is the current page
const isCurrentPage = (item) => {
  const itemUrl = getMenuItemUrl(item)
  if (!itemUrl) return false
  
  // For external URLs, don't mark as current
  if (isExternalUrl(itemUrl)) return false
  
  // Get current route path without hash/anchor
  const currentPath = route.path.split('#')[0].replace(/\/$/, '') || '/'
  
  // Get menu item path without hash/anchor
  const itemPath = itemUrl.split('#')[0].replace(/\/$/, '') || '/'
  
  // For home page, exact match only
  if (currentPath === '/' && itemPath === '/') {
    return true
  }
  
  // For other pages, exact match or if current path starts with item path (for nested routes)
  if (itemPath === '/') {
    return false // Don't mark home as active when on other pages
  }
  
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/')
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
  nextTick(() => {
    updateHeights();
    // Enable header scroll animation once header is measured
    if (headerRef.value && window.gsap) {
      // Ensure header starts visible at the top
      window.gsap.set(headerRef.value, { y: '0%', opacity: 1 });
    }
    headerAnimated.value = true;
  });

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

.header-bar {
  position: relative;
  grid-template-areas:
        "left center right";
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto;
  gap: 10px;
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

.header-right .header-booking-button {
    display: none;
  }
@media (min-width: 800px) {
  .header-left .header-booking-button {
    display: none;
  }
  .header-right .header-booking-button {
    display: block;
  }
}

.header-nav {
  display: none;
  width: 100%;
  height: var(--header-nav-height);
  position: relative;
}
.header-bar:after,
.header-nav:after {
  content: '';
  position: absolute;
  left: var(--pad-2);
  right: var(--pad-2);
  width: calc(100% - var(--pad-2) * 2);
  border-bottom: 1px solid currentColor;
  bottom: 0;
}
@media (min-width: 800px) {
  .header-nav {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.header-nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0px;
  gap: 90px;
  flex-wrap: wrap;
  justify-content: center;
  height: 100%;
  padding-top: calc(var(--pad-1) * 0.25);
}

.header-nav-item {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
}
.header-nav-item:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 2px;
  transform: scaleY(0);
  transform-origin: bottom center;
  background: currentColor;
  transition: transform 0.3s ease;
}
.header-nav-item.header-nav-item--current:after {
  transform: scaleY(1);
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

/* Hide mobile menu (hamburger) on desktop */
.header-mobile-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 800px) {
  .header-mobile-menu {
    display: none;
  }
}


nav {
  border-top: 1px solid var(--color-text);
  border-bottom: 1px solid var(--color-text);
}


</style> 