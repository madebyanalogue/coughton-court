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
      <!-- Hero with featured image and title (with parallax similar to PageHero) -->
      <section class="garden-hero scheme overlay" ref="gardenHeroRef">
        <div class="garden-hero__image-wrapper">
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
        </div>
        <div class="garden-hero__overlay">
          <h1 class="garden-hero__title h1">{{ garden.title }}</h1>
        </div>
      </section>

      <!-- Garden subnavigation -->
      <section class="garden-subnav h6">
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
          <div class="grid grid-1 grid-md-2 gap-3 px-md-3">

            
            <!-- Left: Main Description -->
            <div v-if="garden.mainDescription" class="garden-description flex column gap-2" style="max-width: 480px;">
              <h2 class="h4">{{ garden.title }}</h2>

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
                    v-for="(image, index) in garden.gallery"
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
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Garden hero parallax (match PageHero behavior)
const gardenHeroRef = ref(null)
let gardenHeroScrollHandler = null

const handleGardenHeroScroll = () => {
  if (!gardenHeroRef.value) return
  const wrapper = gardenHeroRef.value.querySelector('.garden-hero__image-wrapper')
  if (!wrapper) return

  const scrollY = window.scrollY || window.pageYOffset
  const parallaxOffset = scrollY * 0.3
  wrapper.style.transform = `translateY(${parallaxOffset}px)`
}

onMounted(() => {
  if (typeof window !== 'undefined' && garden.value?.featuredImage) {
    gardenHeroScrollHandler = handleGardenHeroScroll
    window.addEventListener('scroll', gardenHeroScrollHandler, { passive: true })
    handleGardenHeroScroll()
  }
})

onUnmounted(() => {
  if (gardenHeroScrollHandler && typeof window !== 'undefined') {
    window.removeEventListener('scroll', gardenHeroScrollHandler)
  }
})

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
  height: 37vh;
  min-height: 400px;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
}

.garden-hero__image-wrapper {
  position: absolute;
  top: -20%;
  left: 0;
  width: 100%;
  height: 140%;
  will-change: transform;
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
  padding-top: var(--header-bar-height, 80px);
}

.garden-hero__title {
  text-align: center;
}

.garden-subnav {
  padding: var(--pad-2) 0;
  border-bottom: 1px solid currentColor;
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
  transition: color 0.2s;
  text-transform: uppercase;
  position: relative;
}

.garden-subnav__link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: bottom left;
  background: currentColor;
}
.garden-subnav__link:hover::after,
.garden-subnav__link--active::after {
  transform: scaleX(1);
}

.garden-subnav__link--active {
  font-weight: 500;
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
  aspect-ratio: 8 / 7;
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

.carousel__caption {
  text-align: center;
  padding: 0 1rem;
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

