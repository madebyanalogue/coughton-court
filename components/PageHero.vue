<template>
  <div 
    v-if="shouldShow" 
    ref="heroRef"
    :class="['page-hero', 'scheme', 'overlay', { 'page-hero--custom-content': enableCustomTitleAndButton }]"
  >
    <div v-if="imageUrl" class="page-hero-image-wrapper">
      <NuxtImg
        :src="imageUrl"
        :alt="alt"
        class="page-hero-image"
        loading="eager"
        format="webp"
        width="1920"
        height="1080"
      />
    </div>
    <div v-else class="page-hero-placeholder">
      <!-- Placeholder while image loads -->
    </div>
    <div class="page-hero-overlay"></div>
    
    <!-- Custom Title and Button -->
    <div v-if="enableCustomTitleAndButton" class="page-hero-custom-content">
      <div v-if="customTitle?.length" class="page-hero-custom-title h1">
        <SanityBlocks :blocks="customTitle" />
      </div>
      <NuxtLink 
        v-if="customButtonTitle && customButtonLink?.page?.slug?.current" 
        :to="`/${customButtonLink.page.slug.current}`"
        class="page-hero-custom-button"
      >
        {{ customButtonTitle }}
      </NuxtLink>
      <a 
        v-else-if="customButtonTitle && customButtonLink?.url" 
        :href="getProcessedUrl(customButtonLink.url)"
        class="page-hero-custom-button"
        :target="isExternalUrl(customButtonLink.url) ? '_blank' : '_self'"
        :rel="isExternalUrl(customButtonLink.url) ? 'noopener noreferrer' : ''"
      >
        {{ customButtonTitle }}
      </a>
      <button
        v-else-if="customButtonTitle"
        class="page-hero-custom-button button"
        type="button"
      >
        {{ customButtonTitle }}
      </button>
    </div>
    
    <!-- Default Title -->
    <h1 v-else-if="showTitle && title" class="page-hero-title h1">{{ title }}</h1>
    
    <!-- Newsletter Signup -->
    <div v-if="enableNewsletterSignup && showHeroNewsletter" class="page-hero-newsletter scheme dark">
        <div class="page-hero-newsletter-inner">
            <button 
                type="button" 
                class="page-hero-newsletter-close"
                @click="showHeroNewsletter = false"
                aria-label="Close newsletter signup"
            >
                ×
            </button>
            <NewsletterSignup 
                :title="newsletterTitleHero" 
                :action="newsletterActionUrl"
                :placeholder="newsletterPlaceholder"
            />
        </div>
    </div>
    
    <!-- Cookies Banner -->
    <div v-if="enableCookiesBanner" class="page-hero-cookies">
      <HeroCookiesBanner />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import { useSiteSettings } from '~/composables/useSiteSettings'

const props = defineProps({
  featuredImage: {
    type: Object,
    default: null
  },
  enabled: {
    type: Boolean,
    default: false
  },
  showTitle: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  enableCustomTitleAndButton: {
    type: Boolean,
    default: false
  },
  customTitle: {
    type: Array,
    default: () => []
  },
  customButtonTitle: {
    type: String,
    default: ''
  },
  customButtonLink: {
    type: Object,
    default: () => ({})
  },
  enableNewsletterSignup: {
    type: Boolean,
    default: false
  },
  enableCookiesBanner: {
    type: Boolean,
    default: false
  }
})

const { newsletterActionUrl, newsletterTitleHero, newsletterPlaceholder } = useSiteSettings()

const { getImageUrl } = useSanityImage()
const heroRef = ref(null)
const showHeroNewsletter = ref(true)

// Debug logging for button visibility
if (process.env.NODE_ENV === 'development') {
  watch(() => [props.enableCustomTitleAndButton, props.customButtonTitle, props.customButtonLink], ([enabled, title, link]) => {
    console.log('[PageHero] Button Debug:', {
      enabled,
      title,
      link,
      hasPageLink: !!link?.page?.slug?.current,
      hasUrl: !!link?.url,
      shouldShow: enabled && title && (link?.page?.slug?.current || link?.url || title)
    })
  }, { immediate: true })
}

// Helper function to check if URL is external
const isExternalUrl = (url) => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
}

// Helper function to process external URLs consistently
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

const imageUrl = computed(() => {
  if (!props.featuredImage) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PageHero] No featuredImage prop')
    }
    return null
  }
  try {
    const url = getImageUrl(props.featuredImage)
    if (process.env.NODE_ENV === 'development') {
      console.log('[PageHero] Image URL:', url, 'FeaturedImage:', props.featuredImage)
    }
    return url
  } catch (error) {
    console.error('[PageHero] Error generating image URL:', error)
    return null
  }
})

const alt = computed(() => {
  return props.featuredImage?.alt || 'Hero image'
})

const shouldShow = computed(() => {
  const show = props.enabled && (props.featuredImage !== null && props.featuredImage !== undefined)
  if (process.env.NODE_ENV === 'development') {
    console.log('[PageHero] shouldShow:', show, 'enabled:', props.enabled, 'featuredImage:', props.featuredImage)
  }
  return show
})

let scrollHandler = null
let parallaxOffset = 0

const handleScroll = () => {
  if (!heroRef.value) return
  
  const rect = heroRef.value.getBoundingClientRect()
  const scrollY = window.scrollY || window.pageYOffset
  
  // Calculate parallax offset (slight movement as you scroll)
  // Adjust the speed factor (0.3) to make it more or less pronounced
  parallaxOffset = scrollY * 0.3
  
  const imageWrapper = heroRef.value.querySelector('.page-hero-image-wrapper')
  if (imageWrapper) {
    imageWrapper.style.transform = `translateY(${parallaxOffset}px)`
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && props.enabled && imageUrl.value) {
    scrollHandler = handleScroll
    window.addEventListener('scroll', scrollHandler, { passive: true })
    // Initial call
    handleScroll()
  }
})

onUnmounted(() => {
  if (scrollHandler && typeof window !== 'undefined') {
    window.removeEventListener('scroll', scrollHandler)
  }
})
</script>

<style scoped>
.page-hero {
  position: relative;
  width: 100%;
  height: 37vh;
  min-height: 400px;
  max-height: 800px;
  overflow: hidden;
  z-index: 1;
  padding-top: var(--header-height);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.page-hero--custom-content {
  height: 60vh;
}

.page-hero-image-wrapper {
  position: absolute;
  top: -20%;
  left: 0;
  width: 100%;
  height: 140%;
  will-change: transform;
}

.page-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.page-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(43, 46, 41, 0.3);
  z-index: 1;
  pointer-events: none;
}

.page-hero-title {
  z-index: 2;
}

.page-hero-custom-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 var(--wrapper-padding);
  gap: var(--pad-2);
  padding-bottom: var(--wrapper-padding);
}

.page-hero-custom-title {
  z-index: 2;
}

.page-hero-custom-button {
  position: relative;
  visibility: visible;
  opacity: 1;
}

.page-hero-newsletter {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 300px;
    padding: var(--pad-2);
    position: absolute;
    right: var(--wrapper-padding);
    top: unset;
    bottom: var(--pad-6);
}
.cookies-accepted .page-hero-newsletter {
    bottom: calc(var(--wrapper-padding) * 1);
}
.page-hero-newsletter-inner {
    position: relative;
}
.page-hero-newsletter-close {
position: absolute;
top: 0px;
right: 0px;
background: transparent;
border: none;
cursor: pointer;
font-size: var(--h8);
line-height: 1;
transition: color 0.3s ease;
}
.page-hero-newsletter-close:hover {
    color: var(--white);
}

.page-hero-cookies {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 var(--wrapper-padding);

  position: absolute;
bottom: 0;
width: 100%;
}

@media (max-width: 768px) {
  .page-hero {
    height: 50vh;
    min-height: 300px;
  }
}
</style>

