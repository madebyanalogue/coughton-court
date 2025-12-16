<template>
  <!-- Colored background layers - siblings to preloader -->
  <div v-if="!disablePreloader" class="preloader-bg">
    <div ref="bgPanel1" class="bg-panel first"></div>
    <div ref="bgPanel2" class="bg-panel second"></div>
    <div ref="bgPanel3" class="bg-panel third"></div>
  </div>
  
  <div 
    v-show="showPreloader" 
    class="preloader-container"
    data-loading-container
  >
    <div class="preloader-content" :class="{ 'has-images': preloaderImages.length > 0 }">
      <!-- Image sequence container -->
      <div 
        class="image-sequence"
        data-loading-words
      >
          <div class="image-container">
            <img 
              v-if="currentImageSource && currentImageIndex < preloaderImages.length"
              :src="getImageUrl(currentImageSource)"
              :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
              class="preloader-image"
            />
            <img 
              v-if="currentImageSource && currentImageIndex < preloaderImages.length && preloaderImages[currentImageIndex]?.repeatLeftRight"
              :src="getImageUrl(currentImageSource)"
              :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
              class="preloader-image"
            />
            <img 
              v-if="currentImageSource && currentImageIndex < preloaderImages.length && preloaderImages[currentImageIndex]?.repeatLeftRight"
              :src="getImageUrl(currentImageSource)"
              :alt="(preloaderImages[currentImageIndex]?.alt) || 'Preloader image'"
              class="preloader-image"
            />
          </div>
      </div>

      <div class="website-icon-container">
        <!-- Show SVG content if it's an SVG, otherwise show as image -->
        <div 
          v-if="logotypeSvgContent"
          v-html="logotypeSvgContent"
          class="logotype-svg"
        />
        <img 
          v-else-if="logotypeImageUrl"
          :src="logotypeImageUrl"
          :alt="websiteTitle"
          class="logotype-image"
        />
      </div>
      
      <!-- Website title container -->
      <div 
        class="title-sequence"
        data-loading-words
      >
        <div class="title-container">
          <h1 class="website-title">{{ websiteTitle }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  autoHide: {
    type: Boolean,
    default: true
  },
  imageDuration: {
    type: Number,
    default: 0 // milliseconds per image (instant transitions)
  },
  titleDuration: {
    type: Number,
    default: 0 // milliseconds for title display (instant)
  }
})

const emit = defineEmits(['preloader-complete', 'preloader-ready'])

const { getImageUrl } = useSanityImage()
const { settings: siteSettings, disablePreloader } = useSiteSettings()

// Preloader state - respect disablePreloader flag
const showPreloader = ref(true)
const currentImageIndex = ref(0)
const animationInitialized = ref(false)

// Refs for background panels
const bgPanel1 = ref(null)
const bgPanel2 = ref(null)
const bgPanel3 = ref(null)

// Computed properties
const preloaderImages = computed(() => siteSettings.value?.preloaderImages || [])
const websiteTitle = computed(() => siteSettings.value?.title || 'Coughton Court')
const logotypeImageUrl = computed(() => {
  const logotype = siteSettings.value?.logotype
  if (!logotype?.asset?.url) return null
  return getImageUrl(logotype)
})

const logotypeSvgContent = ref(null)

// Check if logotype is SVG and fetch its content
const fetchLogotypeSvg = async () => {
  const logotype = siteSettings.value?.logotype
  if (!logotype?.asset?.url) return
  
  const url = getImageUrl(logotype)
  const isSvg = url.toLowerCase().includes('.svg') || logotype.asset.extension === 'svg'
  
  if (isSvg) {
    try {
      // Use the proxy endpoint to avoid CORS issues
      const proxyUrl = `/api/proxy-svg?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      if (response.ok) {
        const svgText = await response.text()
        logotypeSvgContent.value = svgText
      } else {
        console.warn('Failed to fetch SVG content via proxy:', response.status)
        logotypeSvgContent.value = null
      }
    } catch (error) {
      console.warn('Failed to fetch SVG content:', error)
      logotypeSvgContent.value = null
    }
  } else {
    logotypeSvgContent.value = null
  }
}
// Support two data shapes: [{ image, alt }] or directly [image]
const currentImageSource = computed(() => {
  const item = preloaderImages.value?.[currentImageIndex.value]
  if (!item) return null
  // API returns objects with normalized image field
  if (item?.image) return item.image
  // If array of images was returned
  return item
})

// Animation timeline
let animationTimeline = null

// Initialize preloader animation
const initPreloaderAnimation = () => {
  if (typeof window === 'undefined' || animationInitialized.value) return
  // gsap is provided by plugin
  // @ts-ignore
  const gsap = window.gsap

  // Prevent page scrolling during intro
  const htmlEl = document.documentElement
  const bodyEl = document.body
  if (htmlEl && bodyEl) {
    htmlEl.style.overflow = 'hidden'
    bodyEl.style.overflow = 'hidden'
  }
  
  // Create timeline
  animationTimeline = gsap.timeline({
    onComplete: () => {
      if (props.autoHide) {
        hidePreloader()
      }
      emit('preloader-complete')
    }
  })
  
  if (preloaderImages.value.length > 0) {
    // New logic: Single randomized preloader image + logotype overlay
    // Select random image
    const randomIndex = Math.floor(Math.random() * preloaderImages.value.length)
    currentImageIndex.value = randomIndex
    
    // Stage 1: Random preloader image fades in
    animationTimeline.set('.image-sequence', { opacity: 0 })
    animationTimeline.to('.image-sequence', { 
      opacity: 1, 
      duration: 1.5, 
      ease: "power2.in" 
    })
    
    // Stage 2: Logotype fades in overlaid (after image)
    const logotypeStart = 1 // Start after image fade in
    animationTimeline.set('.website-icon-container', { opacity: 0, visibility: 'visible' }, logotypeStart)
    animationTimeline.to('.website-icon-container', { 
      opacity: 1, 
      duration: 1.5, 
      ease: "power2.in" 
    }, logotypeStart)
    
    // Stage 3: Transform up and out (after logotype)
    const holdTime = logotypeStart + 1.2 // Hold for 1 second after logotype appears
    const exitTime = holdTime + 0.6 // Exit animation duration
    
    // Animate preloader container up and out
    animationTimeline.to('.preloader-container', {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      onComplete: () => {
        // Hide preloader but keep in DOM
        showPreloader.value = false
        // Emit preloader complete event for section triggers
        document.dispatchEvent(new CustomEvent('preloader-complete'))
        // Add class to body so plugins can detect completion
        document.body.classList.add('preloader-complete')
      }
    }, holdTime)
    
    // Animate background panels with slight delay
    animationTimeline.to([bgPanel1.value, bgPanel2.value, bgPanel3.value], {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      stagger: 0.05 // Very slight stagger between panels
    }, holdTime + 0.1) // Start 0.1s after preloader starts
  } else {
    // No preloader images - just show logotype
    // Hide image sequence immediately
    animationTimeline.set('.image-sequence', { opacity: 0 })
    
    // Show logotype with fade in
    animationTimeline.set('.website-icon-container', { opacity: 0, visibility: 'visible' })
    animationTimeline.to('.website-icon-container', { 
      opacity: 1, 
      duration: 1.0, 
      ease: "power2.out" 
    })
    
    // Hold for a moment then translate up and out
    const holdTime = 1.0 // Hold for 1 second after fade in
    const exitTime = holdTime + 0.8 // Exit animation duration
    
     // Animate preloader container up and out
     animationTimeline.to('.preloader-container', {
       y: '-100%',
       duration: exitTime,
       ease: "power2.inOut",
       onComplete: () => {
         // Hide preloader but keep in DOM
         showPreloader.value = false
         // Emit preloader complete event for section triggers
         document.dispatchEvent(new CustomEvent('preloader-complete'))
         // Add class to body so plugins can detect completion
         document.body.classList.add('preloader-complete')
       }
     }, holdTime)
    
    // Animate background panels with slight delay
    animationTimeline.to([bgPanel1.value, bgPanel2.value, bgPanel3.value], {
      y: '-100%',
      duration: exitTime,
      ease: "power2.inOut",
      stagger: 0.05 // Very slight stagger between panels
    }, holdTime + 0.1) // Start 0.1s after preloader starts
  }
}

// Hide preloader manually
const hidePreloader = () => {
  showPreloader.value = false
  // Re-enable scrolling
  const htmlEl = document.documentElement
  const bodyEl = document.body
  if (htmlEl && bodyEl) {
    htmlEl.style.overflow = ''
    bodyEl.style.overflow = ''
  }
}

// Watch for site settings to be loaded
watch(siteSettings, async (newSettings) => {
  if (disablePreloader.value) {
    // Immediately hide and mark complete, skip animations
    showPreloader.value = false
    document.body.classList.add('preloader-complete')
    emit('preloader-ready')
    emit('preloader-complete')
    return
  }
  if (newSettings && !animationInitialized.value) {
    // Fetch SVG content if logotype is SVG
    await fetchLogotypeSvg()
    
    // Preloader is ready
    // eslint-disable-next-line no-console
    //console.log('[Preloader] Ready - starting animation')
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Emit ready event before starting animation
      emit('preloader-ready')
      initPreloaderAnimation()
      animationInitialized.value = true
    }, 100)
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
  animationInitialized.value = false
})
</script>

<style scoped>
.preloader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  background: transparent; /* Remove white background so layers show through */
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  color:var(--color-text);
}

.preloader-bg {
  z-index: 99998; /* Just below preloader */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  pointer-events: none; /* Don't interfere with interactions */
}

.bg-panel {
  z-index: 1;
  background-color: var(--white);
  position: absolute;
  inset: 0%;
  height: 100%;
  width: 100%;
}

.bg-panel.first {
  background-color: var(--yellow); /* Red for debugging */
  z-index: 3;
  opacity: 1;
}

.bg-panel.second {
  background-color: var(--dark-grey); /* Green for debugging */
  z-index: 2;
  opacity: 0;
}

.bg-panel.third {
  background-color: var(--light-grey); /* Blue for debugging */
  z-index: 1;
  opacity: 0;
}

.preloader-content {
  z-index: 10;
  text-align: center;
  position: relative;
  width:100%;
}
.has-images.preloader-content,
.has-images.preloader-content .image-sequence {
  height:100%;
  width:100%;
  position: absolute;
  top:0;
  left:0;
}

.image-sequence,
.title-sequence {
  display: flex;
  align-items: center;
  justify-content: center;
}

.has-images .image-sequence {
  opacity: 0; /* Start hidden when there are preloader images */
}

.title-sequence {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  max-width: 133vh;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.website-icon-container {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  height: auto;
}

.has-images .website-icon-container {
 top:84%;
}


svg > * {
  fill:currentColor;
  width: 100%;
  height: 100%;
}

.preloader-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0px;
  max-width: unset;
}

.preloader-image.repeat-right {
  position: absolute;
  top: 0;
  left: 0;
  transform: scaleX(-1); /* Flip horizontally for left-right repeat */
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Hide preloader in design mode */
:is(.wf-design-mode, .w-editor) .preloader-container {
  display: none;
}

/* Ensure preloader covers everything */
.preloader-container {
  background: rgba(255, 255, 255, 1) !important; /* Force 0.5 opacity for debugging */
}

/* Dark mode support */
:root.dark-mode .preloader-container {
  background: rgba(0, 0, 0, 1) !important; /* Force 0.5 opacity for debugging */
}
</style>
