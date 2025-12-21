<template>
  <section :class="['section-dual-carousel', { 'section-border-top': section.borderTop }]">
    <!-- Desktop Dual Carousel -->
    <div class="dual-carousel-container desktop-carousel">
      <!-- Left Carousel -->
      <div class="carousel-wrapper left-carousel">
        <div 
          v-if="leftImages.length > 1" 
          class="carousel-container"
          :style="{ '--carousel-speed': `${carouselSpeed}s`, '--transition-duration': `${transitionDuration}s` }"
        >
          <div 
            v-for="(media, index) in leftImages" 
            :key="`left-${index}`"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
          >
            <img 
              v-if="!isVideo(media)"
              :src="getMediaUrl(media)" 
              :alt="media.alt || 'Carousel image'"
              class="carousel-image"
            />
            <video 
              v-else
              :src="getMediaUrl(media)" 
              :alt="media.alt || 'Carousel video'"
              class="carousel-video"
              muted
              loop
              autoplay
              playsinline
            />
          </div>
        </div>
        <div v-else-if="leftImages.length === 1" class="single-image">
          <img 
            v-if="!isVideo(leftImages[0])"
            :src="getMediaUrl(leftImages[0])" 
            :alt="leftImages[0].alt || 'Carousel image'"
            class="carousel-image"
          />
          <video 
            v-else
            :src="getMediaUrl(leftImages[0])" 
            :alt="leftImages[0].alt || 'Carousel video'"
            class="carousel-video"
            muted
            loop
            autoplay
            playsinline
          />
        </div>
        
        <!-- Left Overlay -->
        <div v-if="leftOverlay" class="overlay-image left-overlay">
          <img 
            :src="getMediaUrl(leftOverlay)" 
            :alt="leftOverlay.alt || 'Overlay image'"
            class="overlay-img"
          />
        </div>
      </div>

      <!-- Right Carousel -->
      <div class="carousel-wrapper right-carousel">
        <div 
          v-if="rightImages.length > 1" 
          class="carousel-container"
          :style="{ '--carousel-speed': `${carouselSpeed}s`, '--transition-duration': `${transitionDuration}s` }"
        >
          <div 
            v-for="(media, index) in rightImages" 
            :key="`right-${index}`"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
          >
            <img 
              v-if="!isVideo(media)"
              :src="getMediaUrl(media)" 
              :alt="media.alt || 'Carousel image'"
              class="carousel-image"
            />
            <video 
              v-else
              :src="getMediaUrl(media)" 
              :alt="media.alt || 'Carousel video'"
              class="carousel-video"
              muted
              loop
              autoplay
              playsinline
            />
          </div>
        </div>
        <div v-else-if="rightImages.length === 1" class="single-image">
          <img 
            v-if="!isVideo(rightImages[0])"
            :src="getMediaUrl(rightImages[0])" 
            :alt="rightImages[0].alt || 'Carousel image'"
            class="carousel-image"
          />
          <video 
            v-else
            :src="getMediaUrl(rightImages[0])" 
            :alt="rightImages[0].alt || 'Carousel video'"
            class="carousel-video"
            muted
            loop
            autoplay
            playsinline
          />
        </div>
        
        <!-- Right Overlay -->
        <div v-if="rightOverlay" class="overlay-image right-overlay">
          <img 
            :src="getMediaUrl(rightOverlay)" 
            :alt="rightOverlay.alt || 'Overlay image'"
            class="overlay-img"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Single Carousel -->
    <div class="mobile-carousel-container">
      <div 
        v-if="allImages.length > 1" 
        class="carousel-container"
        :style="{ '--carousel-speed': `${carouselSpeed}s`, '--transition-duration': `${transitionDuration}s` }"
      >
        <div 
          v-for="(media, index) in allImages" 
          :key="`mobile-${index}`"
          class="carousel-slide"
          :class="{ active: currentSlide === index }"
        >
          <img 
            v-if="!isVideo(media)"
            :src="getMediaUrl(media)" 
            :alt="media.alt || 'Carousel image'"
            class="carousel-image"
          />
          <video 
            v-else
            :src="getMediaUrl(media)" 
            :alt="media.alt || 'Carousel video'"
            class="carousel-video"
            muted
            loop
            autoplay
            playsinline
          />
        </div>
      </div>
      <div v-else-if="allImages.length === 1" class="single-image">
        <img 
          v-if="!isVideo(allImages[0])"
          :src="getMediaUrl(allImages[0])" 
          :alt="allImages[0].alt || 'Carousel image'"
          class="carousel-image"
        />
        <video 
          v-else
          :src="getMediaUrl(allImages[0])" 
          :alt="allImages[0].alt || 'Carousel video'"
          class="carousel-video"
          muted
          loop
          autoplay
          playsinline
        />
      </div>
      
      <!-- Mobile Overlay (show left overlay if available, otherwise right overlay) -->
      <div v-if="mobileOverlay" class="overlay-image mobile-overlay">
        <img 
          :src="getMediaUrl(mobileOverlay)" 
          :alt="mobileOverlay.alt || 'Overlay image'"
          class="overlay-img"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

// Extract data from section
const leftImages = computed(() => props.section?.dualCarouselContent?.leftCarousel || [])
const rightImages = computed(() => props.section?.dualCarouselContent?.rightCarousel || [])
const leftOverlay = computed(() => props.section?.dualCarouselContent?.leftOverlay)
const rightOverlay = computed(() => props.section?.dualCarouselContent?.rightOverlay)
const carouselSpeed = computed(() => props.section?.dualCarouselContent?.carouselSpeed || 3)
const transitionDuration = computed(() => props.section?.dualCarouselContent?.transitionDuration || 0.5)

// Carousel state
const currentSlide = ref(0)
let carouselInterval = null

// Get the maximum number of slides between both carousels
const maxSlides = computed(() => Math.max(leftImages.value.length, rightImages.value.length))

// Mobile carousel: combine all images from both carousels
const allImages = computed(() => [...leftImages.value, ...rightImages.value])

// Mobile overlay: prefer left overlay, fallback to right overlay
const mobileOverlay = computed(() => leftOverlay.value || rightOverlay.value)

// Get the maximum number of slides for mobile (all images combined)
const maxMobileSlides = computed(() => allImages.value.length)

// Media URL helper
const getMediaUrl = (media) => {
  if (!media?.asset?.url) return ''
  return media.asset.url
}

// Check if media is a video
const isVideo = (media) => {
  return media?._type === 'file' || media?.asset?.url?.includes('.mp4')
}

// Start carousel if we have multiple images
const startCarousel = () => {
  // Check if we should animate (multiple images in either desktop or mobile)
  const shouldAnimate = maxSlides.value > 1 || maxMobileSlides.value > 1
  
  if (!shouldAnimate) return
  
  carouselInterval = setInterval(() => {
    // For desktop: use maxSlides (max of left/right)
    // For mobile: use maxMobileSlides (all images combined)
    const maxSlidesToUse = window.innerWidth <= 800 ? maxMobileSlides.value : maxSlides.value
    currentSlide.value = (currentSlide.value + 1) % maxSlidesToUse
  }, carouselSpeed.value * 1000)
}

// Stop carousel
const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

onMounted(() => {
  startCarousel()
  
  // Listen for window resize to restart carousel with correct slide count
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopCarousel()
  window.removeEventListener('resize', handleResize)
})

// Handle resize to restart carousel with correct slide count
const handleResize = () => {
  stopCarousel()
  currentSlide.value = 0 // Reset to first slide
  startCarousel()
}
</script>

<style scoped>
.dual-carousel-section {
  width: 100%;
}

.dual-carousel-container {
  display: flex;
}

/* Mobile carousel - hidden by default */
.mobile-carousel-container {
  display: none;
  position: relative;
  aspect-ratio: 8/9.8;
  overflow: hidden;
  width: 100%;
}

.carousel-wrapper {
  flex: 1;
  position: relative;
  aspect-ratio: 8/9.8;
  overflow: hidden;
  width:100%;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--transition-duration) ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-image,
.carousel-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.single-image {
  width: 100%;
  height: 100%;
}

.single-image .carousel-image,
.single-image .carousel-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.overlay-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

/* Responsive adjustments */
@media (max-width: 800px) {
  /* Hide desktop carousel */
  .desktop-carousel {
    display: none;
  }
  
  /* Show mobile carousel */
  .mobile-carousel-container {
    display: block;
  }
}
</style>
