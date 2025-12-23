<template>
  <div class="event-page">
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
    <template v-else-if="event">
      <!-- Hero with featured image and title (with parallax similar to PageHero) -->
      <section class="event-hero scheme overlay" ref="eventHeroRef">
        <div class="event-hero__image-wrapper">
          <div class="event-hero__image" :class="{ 'event-hero__image--no-image': !event.featuredImage }">
            <NuxtImg 
              v-if="event.featuredImage"
              :src="getImageUrl(event.featuredImage)" 
              :alt="event.title"
              class="event-hero__img"
              loading="eager"
              preload
            />
          </div>
        </div>
        <div class="event-hero__overlay">
          <h1 class="event-hero__title h1 px4">{{ event.title }}</h1>
        </div>
      </section>
      
      <!-- Introduction -->
      <PageIntroduction 
        v-if="event.introduction"
        :enabled="true"
        :title="event.introductionTitle || 'Introduction'"
        :content="event.introduction"
      />

      <!-- Two Column Layout: Event Details + Gallery Carousel -->
      <section class="event-details-section section-border-top section-padding">
        <div class="wrapper">
          <div class="grid grid-1 grid-md-2 gap-3">
            <!-- Left: Event Details -->
            <div class="event-details flex column gap-3 px-md-3">
              
              <dl class="event-meta grid grid-2">
                <div v-if="event.startDate" class="event-meta-item">
                  <dt class="h5">{{ isSameDate ? 'Date' : 'Start Date' }}</dt>
                  <dd>{{ formatDate(event.startDate) }}</dd>
                </div>
                <div v-if="event.startDate && !isSameDate" class="event-meta-item">
                  <dt class="h5">End Date</dt>
                  <dd>{{ formatDate(event.endDate) }}</dd>
                </div>
                <div v-if="event.cost" class="event-meta-item">
                  <dt class="h5">Cost</dt>
                  <dd>{{ event.cost }}</dd>
                </div>
                <div v-if="event.category" class="event-meta-item">
                  <dt class="h5">Category</dt>
                  <dd>{{ event.category }}</dd>
                </div>
              </dl>

              <!-- Tabs Section -->
              <div v-if="hasTabContent" class="event-tabs-section">
                <div class="event-tabs grid grid-1 gap-2">
                  <!-- Tab Headers (only show if both tabs have content) -->
                  <div v-if="showTabHeaders" class="event-tabs__headers">
                    <button 
                      v-for="tab in tabs" 
                      :key="tab.id"
                      @click="activeTab = tab.id"
                      class="event-tabs__header h5 "
                      :class="{ 'event-tabs__header--active': activeTab === tab.id }"
                    >
                      {{ tab.title }}
                    </button>
                  </div>

                  <!-- Tab Content -->
                  <div class="event-tabs__content">
                    <div v-if="activeTab === 'tab1' && event.tab1Content" class="event-tab-panel">
                      <SanityBlocks :blocks="event.tab1Content" />
                    </div>
                    <div v-if="activeTab === 'tab2' && event.tab2Content" class="event-tab-panel">
                      <SanityBlocks :blocks="event.tab2Content" />
                    </div>
                  </div>

                  <!-- Booking Button -->
                  <div v-if="event.bookingUrl" class="event-booking">
                    <a :href="event.bookingUrl" target="_blank" rel="noopener" class="button min-180">
                      <span class="btn__text">{{ bookingTitle || 'Book Now' }}</span>
                      <div class="btn__circle"></div>
                    </a>
                  </div>
                  
                </div>
              </div>

            </div>

            <!-- Right: Gallery Carousel -->
            <div v-if="event.gallery?.length" class="event-gallery">
              <div class="event-carousel" ref="carouselRef">
                <div 
                  class="event-carousel__track"
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
                    v-for="(image, index) in event.gallery" 
                    :key="index"
                    class="event-carousel__slide"
                  >
                    <div class="event-carousel__image-wrapper">
                      <NuxtImg 
                        :src="getGalleryImageUrl(image)" 
                        :alt="image.alt || event.title"
                        class="event-carousel__image"
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
                    v-for="(image, index) in event.gallery"
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
import PageIntroduction from '~/components/PageIntroduction.vue'

const route = useRoute()
const { getImageUrl } = useSanityImage()
const { title: websiteTitle, bookingTitle } = useSiteSettings()

const slug = computed(() => route.params.slug)

// Fetch single event
const { data: event, error, pending } = await useAsyncData(
  `event-${slug.value}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'event',
      slug: slug.value
    } 
  })
)

// Page title
useHead(() => ({
  title: `${websiteTitle.value} | ${event.value?.title || 'Event'}`
}))

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Check if start and end dates are the same
const isSameDate = computed(() => {
  if (!event.value?.startDate || !event.value?.endDate) return false
  const start = new Date(event.value.startDate)
  const end = new Date(event.value.endDate)
  return start.toDateString() === end.toDateString()
})

// Event hero parallax (match PageHero behavior)
const eventHeroRef = ref(null)
let eventHeroScrollHandler = null

const handleEventHeroScroll = () => {
  if (!eventHeroRef.value) return
  const wrapper = eventHeroRef.value.querySelector('.event-hero__image-wrapper')
  if (!wrapper) return

  const scrollY = window.scrollY || window.pageYOffset
  const parallaxOffset = scrollY * 0.3
  wrapper.style.transform = `translateY(${parallaxOffset}px)`
}

onMounted(() => {
  if (typeof window !== 'undefined' && event.value?.featuredImage) {
    eventHeroScrollHandler = handleEventHeroScroll
    window.addEventListener('scroll', eventHeroScrollHandler, { passive: true })
    handleEventHeroScroll()
  }
})

onUnmounted(() => {
  if (eventHeroScrollHandler && typeof window !== 'undefined') {
    window.removeEventListener('scroll', eventHeroScrollHandler)
  }
})

// Gallery carousel
const currentSlide = ref(0)
const carouselRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const dragOffset = ref(0)

const getGalleryImageUrl = (image) => {
  if (image?.asset?.url) return image.asset.url
  return getImageUrl(image)
}

const nextSlide = () => {
  if (!event.value?.gallery?.length) return
  currentSlide.value = (currentSlide.value + 1) % event.value.gallery.length
}

const prevSlide = () => {
  if (!event.value?.gallery?.length) return
  currentSlide.value = currentSlide.value === 0 
    ? event.value.gallery.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  if (!event.value?.gallery?.length) return
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

// Tabs
const activeTab = ref('tab1')

const tabs = computed(() => [
  { id: 'tab1', title: event.value?.tab1Title || 'What to Expect' },
  { id: 'tab2', title: event.value?.tab2Title || 'What\'s Included' }
])

const hasTabContent = computed(() => {
  return !!(event.value?.tab1Content || event.value?.tab2Content)
})

const showTabHeaders = computed(() => {
  return !!(event.value?.tab1Content && event.value?.tab2Content)
})

// Set initial active tab based on available content
onMounted(() => {
  if (!event.value?.tab1Content && event.value?.tab2Content) {
    activeTab.value = 'tab2'
  }
})
</script>

<style scoped>
.event-page {
  margin-top: calc(var(--header-height, 80px) * -1);
}

.event-hero {
  position: relative;
  height: 31vw;
  min-height: 400px;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
}

.event-hero__image-wrapper {
  position: absolute;
  top: -20%;
  left: 0;
  width: 100%;
  height: 140%;
  will-change: transform;
}

.event-hero__image {
  position: absolute;
  inset: 0;
}

.event-hero__image--no-image {
  background-color: var(--dark-green);
}

.event-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-hero__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--header-bar-height, 80px);
  background: rgba(0, 0, 0, 0.3);
}

.event-hero__title {
  text-align: center;
}


.event-meta {
  gap: calc(var(--pad-1) * 1.5);
}

.event-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}


.event-meta-item dd {
  margin: 0;
}

.event-gallery {
  position: relative;
}

.event-carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 8 / 7;
}

.event-carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.event-carousel__track:active {
  cursor: grabbing;
}

.event-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-carousel__image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.event-carousel__image {
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
  display: none;
}

.event-tabs__headers {
  display: flex;
}

.event-tabs__header {
  padding: var(--h5) calc(calc(var(--h5) * 1.5)) calc(calc(var(--h5) * .8));
  background: none;
  border: none;
  background: rgba(var(--mid-green), 0.3);
  color: var(--dark-green);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.event-tabs__header:not(.event-tabs__header--active):hover {
  background: rgba(var(--mid-green), 0.6);
}
.event-tabs__header--active {
  background: rgba(var(--mid-green), 1);
  color: rgba(var(--light-green), 1);
}
.event-tabs__header--active:hover {
  color: var(--white);
}

.event-tab-panel {
  max-width: 800px;
  margin: 0 auto;
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

@media (max-width: 799px) {
  .event-tabs__headers {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

