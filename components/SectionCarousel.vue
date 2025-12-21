<template>
  <section ref="sectionRef" :class="['section-carousel', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 gap-2">
        
        <!-- Title -->
        <div v-if="title" class="carousel-header">
          <h2 class="h2">{{ title }}</h2>
        </div>

        <!-- Carousel -->
        <div v-if="images?.length" class="carousel" ref="carouselRef">
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
              <div class="carousel__image-wrapper">
                <NuxtImg 
                  :src="getGalleryImageUrl(image)" 
                  :alt="image.alt || title || 'Carousel image'"
                  class="carousel__image"
                  loading="lazy"
                />
              </div>
              <p v-if="image.caption" class="carousel__caption">{{ image.caption }}</p>
            </div>
          </div>
          <button @click="prevSlide" class="carousel__btn carousel__btn--prev" aria-label="Previous">
            ←
          </button>
          <button @click="nextSlide" class="carousel__btn carousel__btn--next" aria-label="Next">
            →
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

        <!-- Description -->
        <div v-if="description" class="carousel-description">
          <SanityBlocks :blocks="description" />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage.js'

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

const title = computed(() => props.section?.carouselContent?.title || '')
const description = computed(() => props.section?.carouselContent?.description || null)
const images = computed(() => props.section?.carouselContent?.images || [])

const getGalleryImageUrl = (image) => {
  if (image?.asset?.url) return image.asset.url
  return getImageUrl(image)
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
    registerSection(`carousel-${props.section._id}`, {
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
  unregisterSection(`carousel-${props.section._id}`)
})
</script>

<style scoped>
.section-carousel {
  opacity: 0;
  padding: 2rem 0;
}

.carousel-header {
  text-align: center;
}

.carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.carousel__track:active {
  cursor: grabbing;
}

.carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.carousel__image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.carousel__caption {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600, #666);
  padding: 0 1rem;
}

.carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: 1px solid var(--gray-300, #ccc);
  background: white;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel__btn:hover {
  background: var(--black, #000);
  color: white;
  border-color: var(--black, #000);
}

.carousel__btn--prev {
  left: 1rem;
}

.carousel__btn--next {
  right: 1rem;
}

.carousel__dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.carousel__dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.carousel__dot--active {
  background: white;
}

.carousel-description {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
</style>

