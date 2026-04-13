<template>
  <section ref="sectionRef" :class="['section-text-and-images', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      
      <div 
        class="grid grid-1 gap-3 gap-4-md px-md-4" 
        :class="[
          useNarrowText ? 'grid-md-8' : 'grid-md-2',
          { 'grid-reverse': !textRight && !isMobile }
        ]"
      >
        
        <!-- Images Column (Carousel) - Always first on mobile -->
        <div 
          v-if="images && images.length > 0" 
          class="text-and-images-images"
          :class="useNarrowText ? 'col-span-12 col-span-5-md' : ''"
        >
          <!-- Single Image (No Carousel) -->
          <div v-if="images.length === 1" class="single-image">
            <div
              class="carousel__image-wrapper"
              :class="{ 'carousel__image-wrapper--natural': unrestrictImageRatio }"
            >
              <NuxtImg 
                :src="getGalleryImageUrl(images[0])" 
                :alt="images[0].alt || 'Image'"
                class="carousel__image"
                width="1200"
                quality="85"
                format="webp"
                loading="eager"
              />
            </div>
            <p v-if="images[0].caption" class="carousel__caption">{{ images[0].caption }}</p>
          </div>

          <!-- Carousel (Multiple Images) -->
          <div v-else class="carousel" ref="carouselRef">
            <div 
              class="carousel__track"
              @mousedown="startDrag"
              @touchstart="startDrag"
              @mousemove="onDrag"
              @touchmove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
              @touchend="endDrag"
              :style="{ 
                transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }"
            >
              <div 
                v-for="(image, index) in images" 
                :key="index"
                class="carousel__slide"
              >
                <div
                  class="carousel__image-wrapper"
                  :class="{ 'carousel__image-wrapper--natural': unrestrictImageRatio }"
                >
                  <NuxtImg 
                    :src="getGalleryImageUrl(image)" 
                    :alt="image.alt || 'Image'"
                    class="carousel__image"
                    width="1200"
                    quality="85"
                    format="webp"
                    loading="eager"
                  />
                </div>
                <p v-if="image.caption" class="carousel__caption">{{ image.caption }}</p>
              </div>
            </div>
            <button 
              @click="prevSlide" 
              class="carousel__btn carousel__btn--prev" 
              aria-label="Previous"
            >
              <div class="arrow">←</div>
            </button>
            <button 
              @click="nextSlide" 
              class="carousel__btn carousel__btn--next" 
              aria-label="Next"
            >
              <div class="arrow">→</div>
            </button>
            <div class="carousel__dots">
              <button
                v-for="(image, index) in images"
                :key="index"
                @click="goToSlide(index)"
                class="carousel__dot"
                :class="{ 'carousel__dot--active': currentSlide === index }"
                :aria-label="`Go to slide ${index + 1}`"
              ></button>
            </div>
          </div>
        </div>

        <!-- Text Column - Always second on mobile -->
        <div 
          class="text-and-images-text grid grid-1 gap-1 center-xs"
          :class="useNarrowText ? 'col-span-12 col-span-3-md' : ''"
        >
        <div class="grid grid-1 gap-1 center-xs">
          <div v-if="title" class="">
            <h2 class="section-title h4">{{ title }}</h2>
          </div>
          <div v-if="text && text.length > 0" class="text-content">
            <SanityBlocks :blocks="text" />
          </div>
        </div>
      </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage.js'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const sectionRef = ref(null)
const carouselRef = ref(null)
const currentSlide = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const dragOffset = ref(0)

const title = computed(() => props.section?.textAndImagesContent?.title || null)
const text = computed(() => {
  const content = props.section?.textAndImagesContent?.text
  // Handle both array and null/undefined
  return content && Array.isArray(content) && content.length > 0 ? content : null
})
const images = computed(() => {
  const imgs = props.section?.textAndImagesContent?.images
  return imgs && Array.isArray(imgs) ? imgs : []
})
const textRight = computed(() => props.section?.textAndImagesContent?.textRight || false)
const useNarrowText = computed(() => props.section?.textAndImagesContent?.useNarrowText || false)
const unrestrictImageRatio = computed(
  () => props.section?.textAndImagesContent?.unrestrictImageRatio === true
)

// Check if mobile (for conditional grid-reverse)
const isMobile = ref(false)
if (typeof window !== 'undefined') {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 800
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
}

// Debug logging
if (process.env.NODE_ENV === 'development') {
  watch(() => props.section, (section) => {
    console.log('[SectionTextAndImages] Section data:', section)
    console.log('[SectionTextAndImages] textAndImagesContent:', section?.textAndImagesContent)
    console.log('[SectionTextAndImages] text:', text.value)
    console.log('[SectionTextAndImages] images:', images.value)
  }, { immediate: true, deep: true })
}

const getGalleryImageUrl = (image) => {
  if (image?.asset?.url) return image.asset.url
  return getImageUrl(image, { width: 1200, quality: 85 })
}

const nextSlide = () => {
  if (!images.value?.length) return
  currentSlide.value = (currentSlide.value + 1) % images.value.length
}

const prevSlide = () => {
  if (!images.value?.length) return
  currentSlide.value = currentSlide.value === 0 
    ? images.value.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  if (!images.value?.length) return
  currentSlide.value = index
}

const startDrag = (e) => {
  isDragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  startX.value = clientX
  dragOffset.value = 0
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  dragOffset.value = clientX - startX.value
}

const endDrag = () => {
  if (!isDragging.value) return
  
  const threshold = 50 // Minimum drag distance to change slide
  const slideWidth = carouselRef.value?.offsetWidth || 0
  
  if (Math.abs(dragOffset.value) > threshold) {
    if (dragOffset.value > 0) {
      prevSlide()
    } else {
      nextSlide()
    }
  }
  
  isDragging.value = false
  dragOffset.value = 0
}

onMounted(() => {
  if (sectionRef.value) {
    registerSection(`text-and-images-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
          })
        }
      }
    })
  }
})

onUnmounted(() => {
  unregisterSection(`text-and-images-${props.section._id}`)
})
</script>

<style scoped>
.section-text-and-images {
  opacity: 0;
  padding: 4rem 0;
}

.section-title-wrapper {
  width: 100%;
  margin-bottom: var(--pad-3);
  text-align: center;
}

.section-title {
  margin: 0;
}

.text-and-images-text {
  width: 100%;
}

.text-content {
  width: 100%;
}

.text-and-images-images {
  width: 100%;
}

/* Carousel Styles */
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel__track {
  display: flex;
  transition: transform 0.3s ease;
  will-change: transform;
}

.carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.carousel__image-wrapper {
  width: 100%;
  aspect-ratio: 5 / 4;
  overflow: hidden;
}

.carousel__image-wrapper--natural {
  aspect-ratio: unset;
}

.carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.carousel__image-wrapper--natural .carousel__image {
  height: auto;
  display: block;
  object-fit: unset;
  object-position: unset;
}

.carousel__caption {
  text-align: center;
  padding: var(--pad-1) 0 0;
  font-size: 0.875rem;
  color: var(--dark-grey);
}

.carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--dark-grey);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s ease;
}

.carousel__btn:hover {
  background: var(--dark-grey);
  color: var(--white);
}

.carousel__btn--prev {
  left: var(--pad-1);
}

.carousel__btn--next {
  right: var(--pad-1);
}

.carousel__btn .arrow {
  font-size: 1.2rem;
  line-height: 1;
}

.carousel__dots {
  display: flex;
  justify-content: center;
  gap: var(--pad-1);
  margin-top: var(--pad-2);
}

.carousel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--dark-grey);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel__dot:hover {
  background: var(--dark-grey);
}

.carousel__dot--active {
  background: var(--dark-grey);
}

@media (max-width: 768px) {
  .carousel__btn {
    width: 32px;
    height: 32px;
  }
  
  .carousel__btn .arrow {
    font-size: 1rem;
  }
}
</style>

