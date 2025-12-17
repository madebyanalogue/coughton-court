<template>
  <div 
    v-if="shouldShow" 
    ref="heroRef"
    class="page-hero"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  featuredImage: {
    type: Object,
    default: null
  },
  enabled: {
    type: Boolean,
    default: false
  }
})

const { getImageUrl } = useSanityImage()
const heroRef = ref(null)

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
  height: 60vh;
  min-height: 400px;
  max-height: 800px;
  overflow: hidden;
  z-index: 1;
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

@media (max-width: 768px) {
  .page-hero {
    height: 50vh;
    min-height: 300px;
  }
}
</style>

