<template>
  <div>
    <SectionMarquee />
    
    <footer class="scheme dark">
    <div id="footer" class="py2 py-sm-3 py-md-2 grid grid-1 gap-2">


      <div class="wrapper">
        <div class="grid gap-1 py-md-1 ptop">

          <!--ICON-->
          <div class="">
            
              <NuxtLink to="/">
                <div class="footer-logo">
                  <Logo />
                </div>
              </NuxtLink>
          </div>

          <!--COLUMN 1-->
          <div class="col-span-12 col-span-6-sm col-span-4-md grid grid-1 gap-1">

            <!--CONTACT INFO-->
            <div class="col-span-3-md">
              <div class="grid grid-1-auto gap-1">

                <div class="grid grid-1 gap-1 underline-links reverse">

                  <!--CONTACT BLOCKS-->
                  <div class="rte">
                    <div v-for="item in firstHalfContactInfo" :key="item._key">
                      <SanityBlocks :blocks="item.value" />
                    </div>
                  </div>

                  <!--CONTACT BLOCKS-->
                  <div class="rte">
                    <div v-for="item in secondHalfContactInfo" :key="item._key">
                      <SanityBlocks :blocks="item.value" />
                    </div>
                  </div>

                </div>

                <!--SOCIAL ICONS-->
                <div class="flex flex-row flex-bottom gap-1">
                  <SocialIcons :facebookUrl="facebookUrl" :linkedinUrl="linkedinUrl" :instagramUrl="instagramUrl" />
                </div>


              </div>
            </div>

          </div>

          <!--COLUMN 2-->
          <div class="col-span-12 col-span-6-sm col-span-3-md grid grid-1 gap-1 col-start-7-sm">

            <div class="grid grid-1-auto gap-2">

              <div class="hide-md"></div>

              <!--OPENING TIMES-->
              <div v-if="openingTimes && openingTimes.length > 0" class="opening-times">
                <table class="opening-times-table">
                  <tbody>
                    <tr v-for="time in openingTimes" :key="time.day">
                      <td class="day">{{ formatDay(time.day) }}</td>
                      <td class="time">{{ time.time }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- FOOTER LINKS -->
              <template v-if="footerMenuItems.length > 0">
                <div class="flex flex-row gap-2">
                  <template v-for="item in footerMenuItems" :key="item.text">
                    <NuxtLink 
                      v-if="item.to?.page?.slug?.current" 
                      :to="`/${item.to.page.slug.current}`"
                      class="button"
                    >
                      {{ item.text }}
                    </NuxtLink>
                    <a 
                      v-else-if="item.to?.url" 
                      class="button"
                      :href="getProcessedUrl(item.to.url)" 
                      target="_blank" 
                      rel="noopener"
                    >
                      {{ item.text }}
                    </a>
                  </template>
                </div>
              </template>

            </div>

          </div>

        </div>
      </div>

      <div class="wrapper">

        <div class="grid h7">

          <div class="col-span-12 col-span-2-md">
          </div>

          <!-- COPYRIGHT -->
          <div class="col-span-12 col-span-6-sm col-start-7-sm col-start-1-md col-span-10-md">
            <div class="">© <span>{{ websiteTitle }}</span> {{ new Date().getFullYear() }}. All Rights Reserved.</div>
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
  disablePreloader
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
</style> 