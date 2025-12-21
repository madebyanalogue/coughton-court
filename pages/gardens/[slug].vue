<template>
  <div class="garden-page">
    <template v-if="error">
      <div class="wrapper py6">
        <h1>Error</h1>
        <p>{{ error.message }}</p>
      </div>
    </template>
    <template v-else-if="pending">
      <div class="wrapper py6">
        <div class="loading-placeholder">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </template>
    <template v-else-if="garden">
      <!-- Hero with featured image and title -->
      <section class="garden-hero">
        <div class="garden-hero__image" :class="{ 'garden-hero__image--no-image': !garden.featuredImage }">
          <NuxtImg 
            v-if="garden.featuredImage"
            :src="getImageUrl(garden.featuredImage)" 
            :alt="garden.title"
            class="garden-hero__img"
            loading="eager"
            preload
          />
        </div>
        <div class="garden-hero__overlay">
          <h1 class="garden-hero__title">{{ garden.title }}</h1>
        </div>
      </section>

      <!-- Garden subnavigation -->
      <section class="garden-subnav">
        <div class="wrapper">
          <nav class="garden-subnav__menu">
            <NuxtLink 
              v-for="g in allGardens" 
              :key="g._id"
              :to="`/gardens/${g.slug?.current}`"
              class="garden-subnav__link"
              :class="{ 'garden-subnav__link--active': g.slug?.current === garden.slug?.current }"
            >
              {{ g.title }}
            </NuxtLink>
          </nav>
        </div>
      </section>

      <!-- Two Column Layout: Description + Gallery Carousel -->
      <section class="garden-content-section">
        <div class="wrapper">
          <div class="grid grid-1 grid-md-2 gap-3">
            <!-- Left: Main Description -->
            <div v-if="garden.mainDescription" class="garden-description">
              <SanityBlocks :blocks="garden.mainDescription" />
            </div>

            <!-- Right: Gallery Carousel -->
            <div v-if="garden.gallery?.length" class="garden-gallery">
              <div class="garden-carousel" ref="carouselRef">
                <div 
                  class="garden-carousel__track"
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
                    v-for="(image, index) in garden.gallery" 
                    :key="index"
                    class="garden-carousel__slide"
                  >
                    <div class="garden-carousel__image-wrapper">
                      <NuxtImg 
                        :src="getGalleryImageUrl(image)" 
                        :alt="image.alt || garden.title"
                        class="garden-carousel__image"
                        loading="lazy"
                      />
                    </div>
                    <p v-if="image.caption" class="garden-carousel__caption">{{ image.caption }}</p>
                  </div>
                </div>
                <button @click="prevSlide" class="garden-carousel__btn garden-carousel__btn--prev" aria-label="Previous">
                  ←
                </button>
                <button @click="nextSlide" class="garden-carousel__btn garden-carousel__btn--next" aria-label="Next">
                  →
                </button>
                <div class="garden-carousel__dots">
                  <button
                    v-for="(image, index) in garden.gallery"
                    :key="index"
                    @click="goToSlide(index)"
                    class="garden-carousel__dot"
                    :class="{ 'garden-carousel__dot--active': currentSlide === index }"
                    :aria-label="`Go to slide ${index + 1}`"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSanityImage } from '~/composables/useSanityImage.js'
import { useSiteSettings } from '~/composables/useSiteSettings'

const route = useRoute()
const { getImageUrl } = useSanityImage()
const { title: websiteTitle } = useSiteSettings()

const slug = computed(() => route.params.slug)

// Fetch single garden
const { data: garden, error, pending } = await useAsyncData(
  `garden-${slug.value}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'garden',
      slug: slug.value
    } 
  })
)

// Fetch all gardens for navigation
const { data: allGardens } = await useAsyncData(
  'all-gardens-nav',
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'garden',
      all: true
    } 
  })
)

// Page title
useHead(() => ({
  title: `${websiteTitle.value} | ${garden.value?.title || 'Garden'}`
}))

// Gallery carousel
const currentSlide = ref(0)
const carouselRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const dragOffset = ref(0)

const getGalleryImageUrl = (image) => {
  if (image?.asset?.url) return image.asset.url
  return getImageUrl(image)
}

const nextSlide = () => {
  if (!garden.value?.gallery?.length) return
  currentSlide.value = (currentSlide.value + 1) % garden.value.gallery.length
}

const prevSlide = () => {
  if (!garden.value?.gallery?.length) return
  currentSlide.value = currentSlide.value === 0 
    ? garden.value.gallery.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  if (!garden.value?.gallery?.length) return
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
</script>

<style scoped>
.garden-page {
  margin-top: calc(var(--header-height, 80px) * -1);
}

.garden-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
}

.garden-hero__image {
  position: absolute;
  inset: 0;
}

.garden-hero__image--no-image {
  background-color: var(--dark-green);
}

.garden-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.garden-hero__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.garden-hero__title {
  color: white;
  text-align: center;
  font-size: clamp(2rem, 5vw, 4rem);
}

.garden-subnav {
  padding: 2rem 0;
  border-bottom: 1px solid var(--gray-200, #e5e5e5);
  background: var(--white, #fff);
}

.garden-subnav__menu {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  justify-content: center;
  align-items: center;
}

.garden-subnav__link {
  text-decoration: none;
  color: var(--gray-600, #666);
  transition: color 0.2s;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0;
  position: relative;
}

.garden-subnav__link:hover {
  color: var(--black, #000);
}

.garden-subnav__link--active {
  color: var(--black, #000);
  font-weight: 600;
}

.garden-subnav__link--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--black, #000);
}

.garden-content-section {
  padding: 4rem 0;
}

.garden-description {
  max-width: 800px;
}

.garden-gallery {
  position: relative;
}

.garden-carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 5 / 4;
}

.garden-carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.garden-carousel__track:active {
  cursor: grabbing;
}

.garden-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.garden-carousel__image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.garden-carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.garden-carousel__caption {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600, #666);
  padding: 0 1rem;
}

.garden-carousel__btn {
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

.garden-carousel__btn:hover {
  background: var(--black, #000);
  color: white;
  border-color: var(--black, #000);
}

.garden-carousel__btn--prev {
  left: 1rem;
}

.garden-carousel__btn--next {
  right: 1rem;
}

.garden-carousel__dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.garden-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.garden-carousel__dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.garden-carousel__dot--active {
  background: white;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200, #e5e5e5);
  border-top-color: var(--black, #000);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

