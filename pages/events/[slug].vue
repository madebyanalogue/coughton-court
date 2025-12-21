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
      <!-- Hero with featured image and title -->
      <section class="event-hero">
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
        <div class="event-hero__overlay">
          <h1 class="event-hero__title">{{ event.title }}</h1>
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
      <section class="event-details-section">
        <div class="wrapper">
          <div class="grid grid-1 grid-md-2 gap-3">
            <!-- Left: Event Details -->
            <div class="event-details">
              <h2 class="h2">{{ event.title }}</h2>
              
              <dl class="event-meta">
                <div v-if="event.startDate" class="event-meta-item">
                  <dt>{{ isSameDate ? 'Date' : 'Start Date' }}</dt>
                  <dd>{{ formatDate(event.startDate) }}</dd>
                </div>
                <div v-if="event.startDate && !isSameDate" class="event-meta-item">
                  <dt>End Date</dt>
                  <dd>{{ formatDate(event.endDate) }}</dd>
                </div>
                <div v-if="event.cost" class="event-meta-item">
                  <dt>Cost</dt>
                  <dd>{{ event.cost }}</dd>
                </div>
                <div v-if="event.category" class="event-meta-item">
                  <dt>Category</dt>
                  <dd>{{ event.category }}</dd>
                </div>
              </dl>

              <!-- Tabs Section -->
              <div v-if="hasTabContent" class="event-tabs-section">
                <div class="event-tabs">
                  <!-- Tab Headers (only show if both tabs have content) -->
                  <div v-if="showTabHeaders" class="event-tabs__headers">
                    <button 
                      v-for="tab in tabs" 
                      :key="tab.id"
                      @click="activeTab = tab.id"
                      class="event-tabs__header"
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
                    <a :href="event.bookingUrl" target="_blank" rel="noopener" class="button" data-btn-hover>
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
                    <p v-if="image.caption" class="event-carousel__caption">{{ image.caption }}</p>
                  </div>
                </div>
                <button @click="prevSlide" class="event-carousel__btn event-carousel__btn--prev" aria-label="Previous">
                  ←
                </button>
                <button @click="nextSlide" class="event-carousel__btn event-carousel__btn--next" aria-label="Next">
                  →
                </button>
                <div class="event-carousel__dots">
                  <button
                    v-for="(image, index) in event.gallery"
                    :key="index"
                    @click="goToSlide(index)"
                    class="event-carousel__dot"
                    :class="{ 'event-carousel__dot--active': currentSlide === index }"
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
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
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
  background: rgba(0, 0, 0, 0.3);
}

.event-hero__title {
  color: white;
  text-align: center;
  font-size: clamp(2rem, 5vw, 4rem);
}

.event-details-section {
  padding: 4rem 0;
}

.event-details h2 {
  margin-bottom: 2rem;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-meta-item dt {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600, #666);
}

.event-meta-item dd {
  font-size: 1rem;
  margin: 0;
}

.event-gallery {
  position: relative;
}

.event-carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 5 / 4;
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

.event-carousel__caption {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600, #666);
  padding: 0 1rem;
}

.event-carousel__btn {
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

.event-carousel__btn:hover {
  background: var(--black, #000);
  color: white;
  border-color: var(--black, #000);
}

.event-carousel__btn--prev {
  left: 1rem;
}

.event-carousel__btn--next {
  right: 1rem;
}

.event-carousel__dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.event-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.event-carousel__dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.event-carousel__dot--active {
  background: white;
}

.event-tabs-section {
  padding: 4rem 0;
}

.event-tabs__headers {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--gray-300, #ccc);
  margin-bottom: 2rem;
}

.event-tabs__header {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.event-tabs__header:hover {
  color: var(--black, #000);
}

.event-tabs__header--active {
  border-bottom-color: var(--black, #000);
  font-weight: 600;
}

.event-tab-panel {
  max-width: 800px;
  margin: 0 auto;
}

.event-booking {
  margin-top: 3rem;
  text-align: center;
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

