<template>
  <section class="section-single-carousel" 
    :class="{
        'py2': enablePaddingTopBottom,
        'px1 px-sm-2': enablePaddingLeftRight,
        'section-border-top': section.borderTop
      }">
    <!-- Top Background Section -->
    <div 
      v-if="topBackgroundColor" 
      class="background-section top-background"
      :style="`background-color: var(--${topBackgroundColor})`"
    ></div>
    
    <div 
      class="single-carousel-container"
    >
      <!-- Fixed Background Mode -->
      <div 
        v-if="enableFixedBackground && carouselImages.length > 0"
        class="fixed-background"
        :style="{
          backgroundImage: `url(${getMediaUrl(carouselImages[0])})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }"
      ></div>
      
      <!-- Normal Carousel Mode -->
      <template v-else>
        <div 
          v-if="carouselImages.length > 1" 
          class="carousel-container"
          :style="{ '--carousel-speed': `${carouselSpeed}s`, '--transition-duration': `${transitionDuration}s` }"
        >
          <div 
            v-for="(media, index) in carouselImages" 
            :key="`carousel-${index}`"
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
        <div v-else-if="carouselImages.length === 1" class="single-image">
          <img 
            v-if="!isVideo(carouselImages[0])"
            :src="getMediaUrl(carouselImages[0])" 
            :alt="carouselImages[0].alt || 'Carousel image'"
            class="carousel-image"
          />
          <video 
            v-else
            :src="getMediaUrl(carouselImages[0])" 
            :alt="carouselImages[0].alt || 'Carousel video'"
            class="carousel-video"
            muted
            loop
            autoplay
            playsinline
          />
        </div>
      </template>
      
      <!-- Overlay -->
      <div v-if="overlay" class="overlay-image">
        <img 
          :src="getMediaUrl(overlay)" 
          :alt="overlay.alt || 'Overlay image'"
          class="overlay-img"
        />
      </div>
      
      <!-- Booking Marquee Overlays -->
      <div v-if="enableBookingButton" class="booking-overlays">
        <!-- First marquee - normal direction -->
        <div class="marquee-overlay marquee-top">
          <SectionMarquee 
            :repeat-count="10"
            :marquee-speed="15"
            :reverse="false"
          />
        </div>
        
        <!-- Second marquee - reverse direction -->
        <div class="marquee-overlay marquee-bottom">
          <SectionMarquee 
            :repeat-count="10"
            :marquee-speed="15"
            :reverse="true"
          />
        </div>
      </div>
    </div>
    
    <!-- Bottom Background Section -->
    <div 
      v-if="bottomBackgroundColor" 
      class="background-section bottom-background"
      :class="`bg-${bottomBackgroundColor}`"
    ></div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SectionMarquee from '~/components/SectionMarquee.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

// Extract data from section
const carouselImages = computed(() => props.section?.singleCarouselContent?.carousel || [])
const overlay = computed(() => props.section?.singleCarouselContent?.overlay)
const carouselSpeed = computed(() => props.section?.singleCarouselContent?.carouselSpeed || 3)
const transitionDuration = computed(() => props.section?.singleCarouselContent?.transitionDuration || 0.5)
const enableBookingButton = computed(() => props.section?.singleCarouselContent?.enableBookingButton || false)
const enablePaddingTopBottom = computed(() => props.section?.singleCarouselContent?.enablePaddingTopBottom || false)
const enablePaddingLeftRight = computed(() => props.section?.singleCarouselContent?.enablePaddingLeftRight || false)
const enableFixedBackground = computed(() => props.section?.singleCarouselContent?.enableFixedBackground || false)
const topBackgroundColor = computed(() => props.section?.singleCarouselContent?.topBackgroundColor)
const bottomBackgroundColor = computed(() => props.section?.singleCarouselContent?.bottomBackgroundColor)

// Carousel state
const currentSlide = ref(0)
let carouselInterval = null

// Media URL helper
const getMediaUrl = (media) => {
  if (!media?.asset?.url) return ''
  return media.asset.url
}

// Check if media is a video
const isVideo = (media) => {
  return media?._type === 'file' || media?.asset?.url?.includes('.mp4')
}

// Start carousel if we have multiple images and not in fixed background mode
const startCarousel = () => {
  if (carouselImages.value.length <= 1 || enableFixedBackground.value) return
  
  carouselInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselImages.value.length
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
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>


.section-single-carousel {
  width: 100%;
  position: relative;
  --marquee-text-color: var(--yellow);
  --marquee-hover-color: var(--white);
  --marquee-background: transparent;
}

/* Background sections */
.background-section {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  height: 50%;
}

.top-background {
  margin-bottom: 0;
}

.bottom-background {
  margin-top: 0;
  top:unset;
  bottom: 0;

}


.single-carousel-container {
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
  width: 100%;
}

@media (min-width: 800px) {
  .single-carousel-container {
    aspect-ratio: 16/9.8;
  }
}

.fixed-background {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
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

/* Booking overlays */
.booking-overlays {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.marquee-overlay {
  position: absolute;
  width: 100%;
  pointer-events: auto;
}


.marquee-top {
  top: var(--pad-1);
}

.marquee-bottom {
  bottom: var(--pad-1);
}

/* Mobile responsive - change to square aspect ratio */
@media (max-width: 801px) {
  .single-carousel-container {
    aspect-ratio: 1/1;
  }
  
  .marquee-top {
    top: 5px;
  }
  
  .marquee-bottom {
    bottom: 5px;
  }
}
</style>
