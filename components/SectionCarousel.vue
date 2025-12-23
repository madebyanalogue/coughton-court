<template>
  <section ref="sectionRef" :class="['section-carousel', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="grid grid-1 gap-4 py-md-1">
        
        <div v-if="title || description" class="grid grid-1 gap-1">
          <div v-if="title" class="carousel-header">
            <h2 class="h5">{{ title }}</h2>
          </div>
          <div v-if="description" class="carousel-description rte centered-text-max-width">
            <SanityBlocks :blocks="description" />
          </div>
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
            <div class="arrow">←</div>
          </button>
          <button @click="nextSlide" class="carousel__btn carousel__btn--next" aria-label="Next">
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
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
}

.carousel-header {
  text-align: center;
}

.carousel-description {
  margin: 0 auto;
  text-align: center;
}
</style>

