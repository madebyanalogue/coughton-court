<template>
  <div>
    <footer class="scheme dark">
      <div id="footer" class="py2 py-sm-3 py-md-4 grid grid-1 gap-2">



        <div class="wrapper">

          <div class="grid grid-1 grid-md-3 gap-2">

            <!-- FOOTER MENUS LEFT -->
            <div v-if="footerMenusLeft?.length > 0" class="footer-menus-left grid grid-3 gap-2">
              <div v-for="menu in footerMenusLeft" :key="menu._id" class="footer-menu">
                <div class="grid grid-1 gap-1">
                  <h5 v-if="menu.title" class="footer-menu-title h5">{{ menu.title }}</h5>
                  <ul v-if="menu.items && menu.items.length > 0" class="footer-menu-list">
                    <li v-for="item in menu.items" :key="item._key || item.text" class="footer-menu-item">
                      <NuxtLink 
                        v-if="getMenuItemUrl(item) && !isExternalUrl(item.to?.url)" 
                        :to="getMenuItemUrl(item)" 
                        class="footer-menu-link"
                      >
                        {{ item.text }}
                      </NuxtLink>
                      <a 
                        v-else-if="getMenuItemUrl(item) && isExternalUrl(item.to?.url)"
                        :href="getMenuItemUrl(item)" 
                        target="_blank"
                        rel="noopener"
                        class="footer-menu-link"
                      >
                        {{ item.text }}
                      </a>
                      <span v-else class="footer-menu-link">{{ item.text }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- COPYRIGHT -->
            <div class="">
              <div class="flex flex-col flex-center gap-1 text-center uppercase medium">
                <div class="flex flex-center">
                  <NuxtLink to="/">
                    <div class="footer-logo">
                      <Logo />
                    </div>
                  </NuxtLink>
                </div>
                <div class="h7 medium">© <span>{{ websiteTitle }}</span> {{ new Date().getFullYear() }}. All Rights Reserved.</div>
              </div>
            </div>

            <!--FOOTER RIGHT-->
            <div class="footer-right grid grid-1 gap-2">

                <!-- FOOTER MENUS RIGHT -->
                <div v-if="footerMenusRight?.length > 0" class="footer-menus-right grid grid-3 gap-2">

                  <div v-for="menu in footerMenusRight" :key="menu._id" class="footer-menu">
                    <div class="grid grid-1 gap-1">
                      <h3 v-if="menu.title" class="footer-menu-title h5 uppercase medium">{{ menu.title }}</h3>
                      <ul v-if="menu.items && menu.items.length > 0" class="footer-menu-list">
                        <li v-for="item in menu.items" :key="item._key || item.text" class="footer-menu-item">
                          <NuxtLink 
                            v-if="getMenuItemUrl(item) && !isExternalUrl(item.to?.url)" 
                            :to="getMenuItemUrl(item)" 
                            class="footer-menu-link"
                          >
                            {{ item.text }}
                          </NuxtLink>
                          <a 
                            v-else-if="getMenuItemUrl(item) && isExternalUrl(item.to?.url)"
                            :href="getMenuItemUrl(item)" 
                            target="_blank"
                            rel="noopener"
                            class="footer-menu-link"
                          >
                            {{ item.text }}
                          </a>
                          <span v-else class="footer-menu-link">{{ item.text }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <NewsletterSignup 
                  :title="newsletterTitleFooter" 
                  :action="newsletterActionUrl"
                  :placeholder="newsletterPlaceholder"
                />


            </div>
                
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useSiteSettings } from '~/composables/useSiteSettings';
import { useMenu } from '~/composables/useMenu';
import imageUrlBuilder from '@sanity/image-url'
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import SanityBlocks from '~/components/SanityBlocks.vue';

const props = defineProps({
  pageData: {
    type: Object,
    required: false,
    default: null
  }
});

// Sanity image URL builder
const builder = imageUrlBuilder({ projectId: '4dgj84d5', dataset: 'production' })
const $urlFor = (source) => builder.image(source)

const route = useRoute();
const { 
  contactInfo, 
  facebookUrl,
  linkedinUrl,
  instagramUrl,
  openingTimes,
  title,
  disablePreloader,
  footerMenusLeft,
  footerMenusRight,
  newsletterActionUrl,
  newsletterTitleFooter,
  newsletterPlaceholder
} = useSiteSettings();

// Website title from Sanity
const websiteTitle = computed(() => title.value || 'Coughton Court');

const { 
  mainMenu, 
  footerMenu, 
  mainMenuPending, 
  footerMenuPending, 
  mainMenuError, 
  footerMenuError 
} = useMenu();

// Computed properties for menu items
const mainMenuItems = computed(() => mainMenu?.value?.items || []);
const footerMenuItems = computed(() => footerMenu?.value?.items || []);

// Helper function to check if URL is external (including mailto/tel/custom domains)
const isExternalUrl = (url) => {
  if (!url) return false
  // Explicit external protocols
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return true
  // Treat any URL that doesn't start with "/" or "#" as external (e.g. example.com)
  return !url.startsWith('/') && !url.startsWith('#')
}

// Helper function to get menu item URL
const getMenuItemUrl = (item) => {
  if (item.to?.page?._type === 'garden' && item.to?.page?.slug?.current) {
    // Garden detail pages live under /gardens/:slug
    let url = `/gardens/${item.to.page.slug.current}`
    if (item.to?.anchor) {
      const anchor = item.to.anchor.startsWith('#') ? item.to.anchor : `#${item.to.anchor}`
      url += anchor
    }
    return url
  }

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
    return getProcessedUrl(item.to.url)
  }
  return null
}

// Function to process external URLs consistently
const getProcessedUrl = (url) => {
  if (!url) return '#'
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  } else if (url.startsWith('//')) {
    // Protocol-relative URL
    return `https:${url}`
  } else if (url.startsWith('/')) {
    // Absolute path on same domain
    return url
  } else {
    // Relative URL or domain without protocol - treat as external
    return `https://${url}`
  }
}

// Function to format day names for display
const formatDay = (day) => {
  const dayMap = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }
  return dayMap[day] || day
}

// Split contact info into two halves for equal distribution across columns
const firstHalfContactInfo = computed(() => {
  if (!contactInfo?.value) return [];
  const midPoint = Math.ceil(contactInfo.value.length / 2);
  return contactInfo.value.slice(0, midPoint);
});

const secondHalfContactInfo = computed(() => {
  if (!contactInfo?.value) return [];
  const midPoint = Math.ceil(contactInfo.value.length / 2);
  return contactInfo.value.slice(midPoint);
});

// Subfooter reveal on scroll
const subfooterRef = ref(null)
const footerRootRef = ref(null)
let onScrollHandler = null

onMounted(() => {
  nextTick(() => {
    const subfooterEl = subfooterRef.value
    const footerRoot = document.getElementById('footer')
    footerRootRef.value = footerRoot || null
    if (!subfooterEl || !footerRoot) return

    // If preloader is disabled, reveal immediately and skip gating
    if (disablePreloader.value) {
      // Reveal subfooter
      subfooterEl.style.transform = 'scaleY(1)'
      const subContentImmediate = subfooterEl.querySelector('.wrapper')
      if (subContentImmediate) subContentImmediate.style.opacity = '1'
      subfooterEl.dataset.revealed = '1'
      // Reveal footer wrappers
      const immediateBlocks = footerRoot.querySelectorAll(':scope > .wrapper')
      immediateBlocks.forEach((blk) => {
        blk.style.opacity = '1'
      })
      footerRoot.dataset.revealed = '1'
      return
    }

    // Initial state for subfooter container and its content
    subfooterEl.style.transformOrigin = 'bottom'
    subfooterEl.style.transform = 'scaleY(0)'
    const subContent = subfooterEl.querySelector('.wrapper')
    if (subContent) subContent.style.opacity = '0'

    // Initial state for footer contents (wrappers)
    const footerBlocks = footerRoot.querySelectorAll(':scope > .wrapper')
    footerBlocks.forEach((blk) => {
      blk.style.opacity = '0'
    })

    const revealFooter = () => {
      // Skip if page is transitioning (footer will be revealed via fade-in)
      if (document.body.classList.contains('page-transitioning')) {
        return
      }
      
      // Reveal subfooter (scale then fade its content)
      if (subfooterEl && !subfooterEl.dataset.revealed) {
        subfooterEl.dataset.revealed = '1'
        subfooterEl.style.transition = 'transform 700ms cubic-bezier(0.5, 0.5, 0, 1)'
        subfooterEl.style.transform = 'scaleY(1)'
        setTimeout(() => {
          if (subContent) {
            subContent.style.transition = 'opacity 600ms ease'
            subContent.style.opacity = '1'
          }
        }, 720)
      }

      // Sequentially fade in footer blocks
      if (footerRoot && !footerRoot.dataset.revealed) {
        footerRoot.dataset.revealed = '1'
        const blocks = footerRoot.querySelectorAll(':scope > .wrapper')
        blocks.forEach((blk, i) => {
          setTimeout(() => {
            blk.style.transition = 'opacity 600ms ease'
            blk.style.opacity = '1'
          }, i * 180)
        })
      }
    }

    const bottomReached = () => {
      const doc = document.documentElement
      const reached = window.innerHeight + window.scrollY >= (doc.scrollHeight - 300)
      return reached
    }

    const onScroll = () => {
      if (bottomReached()) {
        revealFooter()
        window.removeEventListener('scroll', onScrollHandler)
      }
    }
    onScrollHandler = onScroll

    // Hook into global section flow: after preloader completes, start listening for bottom reach
    const startListening = () => {
      window.addEventListener('scroll', onScrollHandler)
      // Check immediately in case we're already at bottom (short pages)
      onScrollHandler()
    }

    if (document.body.classList.contains('preloader-complete')) {
      startListening()
    } else {
      document.addEventListener('preloader-complete', startListening, { once: true })
    }
  })
})

onUnmounted(() => {
  if (onScrollHandler) {
    window.removeEventListener('scroll', onScrollHandler)
  }
})
</script>

<style scoped>

.opening-times-table {
  width: 100%;
  border-collapse: collapse;
  border: none;
}

.opening-times-table td {
  border: none;
  vertical-align: top;
}

.opening-times-table .day {
  font-weight: 500;
  padding-right: 1rem;
  white-space: nowrap;
}

.opening-times-table .time {
  color: inherit;
}

.footer-menu-list {
  line-height: 1.6;
}
</style> 