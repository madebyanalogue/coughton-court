<template>
  <div class="news-page">
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
    <template v-else-if="newsItem">
      <section class="news-hero scheme overlay" ref="newsHeroRef">
        <div class="news-hero__image-wrapper">
          <div class="news-hero__image" :class="{ 'news-hero__image--no-image': !newsItem.featuredImage }">
            <NuxtImg 
              v-if="newsItem.featuredImage"
              :src="getImageUrl(newsItem.featuredImage, { width: 1920, quality: 85 })" 
              :alt="newsItem.title"
              class="news-hero__img"
              width="1920"
              height="1080"
              quality="85"
              format="webp"
              loading="eager"
              preload
            />
          </div>
        </div>
        <div class="news-hero__overlay">
          <h1 class="news-hero__title h1 px4">{{ newsItem.title }}</h1>
        </div>
      </section>
      
      <PageIntroduction 
        v-if="newsItem.introduction"
        :enabled="true"
        :title="newsItem.introductionTitle || 'Introduction'"
        :content="newsItem.introduction"
      />

      <section class="news-details-section section-border-top section-padding">
        <div class="wrapper">
          <div class="grid grid-1 grid-md-2 gap-3">
            <div class="news-details flex column gap-3 px-md-3">
              
              <dl class="news-meta grid grid-2">
                <div v-if="newsItem.publishedAt" class="news-meta-item">
                  <dt class="h5">Date</dt>
                  <dd>{{ formatDate(newsItem.publishedAt) }}</dd>
                </div>
                <div v-if="newsItem.cost" class="news-meta-item">
                  <dt class="h5">Cost</dt>
                  <dd>{{ newsItem.cost }}</dd>
                </div>
                <div v-if="newsItem.category" class="news-meta-item">
                  <dt class="h5">Category</dt>
                  <dd>{{ newsItem.category }}</dd>
                </div>
              </dl>

              <div v-if="hasTabContent" class="news-tabs-section">
                <div class="news-tabs grid grid-1 gap-2">
                  <div v-if="showTabHeaders" class="news-tabs__headers">
                    <button 
                      v-for="tab in tabs" 
                      :key="tab.id"
                      @click="activeTab = tab.id"
                      class="news-tabs__header h5 "
                      :class="{ 'news-tabs__header--active': activeTab === tab.id }"
                    >
                      {{ tab.title }}
                    </button>
                  </div>

                  <div class="news-tabs__content">
                    <div v-if="activeTab === 'tab1' && newsItem.tab1Content" class="news-tab-panel">
                      <SanityBlocks :blocks="newsItem.tab1Content" />
                    </div>
                    <div v-if="activeTab === 'tab2' && newsItem.tab2Content" class="news-tab-panel">
                      <SanityBlocks :blocks="newsItem.tab2Content" />
                    </div>
                  </div>

                  <div v-if="newsItem.bookingUrl" class="news-booking">
                    <a 
                      :href="getProcessedUrl(newsItem.bookingUrl)" 
                      :target="shouldOpenInNewTab(newsItem.bookingUrl) ? '_blank' : undefined"
                      :rel="shouldOpenInNewTab(newsItem.bookingUrl) ? 'noopener' : undefined"
                      class="button min-180"
                    >
                      <span class="btn__text">{{ bookingTitle || 'Book Now' }}</span>
                      <div class="btn__circle"></div>
                    </a>
                  </div>
                  
                </div>
              </div>

            </div>

            <div v-if="newsItem.gallery?.length" class="news-gallery">
              <div class="news-carousel" ref="carouselRef">
                <div 
                  class="news-carousel__track"
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
                    v-for="(image, index) in newsItem.gallery" 
                    :key="index"
                    class="news-carousel__slide"
                  >
                    <div class="news-carousel__image-wrapper">
                      <NuxtImg 
                        :src="getGalleryImageUrl(image)" 
                        :alt="image.alt || newsItem.title"
                        class="news-carousel__image"
                        width="1200"
                        quality="80"
                        format="webp"
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
                    v-for="(image, index) in newsItem.gallery"
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
import { useUrlProcessing } from '~/composables/useUrlProcessing'
import { useHead } from '#app'
import PageIntroduction from '~/components/PageIntroduction.vue'

const route = useRoute()
const { getImageUrl } = useSanityImage()
const { title: websiteTitle, bookingTitle, defaultMetaDescription, defaultOgImage } = useSiteSettings()
const { getProcessedUrl, shouldOpenInNewTab } = useUrlProcessing()

const slug = computed(() => route.params.slug)

const { data: newsItem, error, pending } = await useAsyncData(
  `news-${slug.value}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'news',
      slug: slug.value
    } 
  })
)

useHead(() => {
  const pageTitle = newsItem.value?.seo?.metaTitle || newsItem.value?.title || 'News'
  const fullTitle = newsItem.value?.seo?.metaTitle 
    ? `${websiteTitle.value} | ${newsItem.value.seo.metaTitle}`
    : `${websiteTitle.value} | ${newsItem.value?.title || 'News'}`
  
  const metaDescription = newsItem.value?.seo?.metaDescription || defaultMetaDescription.value || ''
  
  let ogImageUrl = null
  if (newsItem.value?.seo?.ogImage?.asset) {
    ogImageUrl = getImageUrl(newsItem.value.seo.ogImage, { width: 1200, quality: 85 })
  } else if (newsItem.value?.featuredImage?.asset) {
    ogImageUrl = getImageUrl(newsItem.value.featuredImage, { width: 1200, quality: 85 })
  } else if (defaultOgImage.value?.asset) {
    ogImageUrl = getImageUrl(defaultOgImage.value, { width: 1200, quality: 85 })
  }
  
  const meta = []
  
  if (metaDescription) {
    meta.push({
      name: 'description',
      content: metaDescription
    })
  }
  
  if (ogImageUrl) {
    meta.push(
      {
        property: 'og:image',
        content: ogImageUrl
      },
      {
        property: 'og:image:width',
        content: '1200'
      },
      {
        property: 'og:image:height',
        content: '630'
      }
    )
  }
  
  meta.push(
    {
      property: 'og:title',
      content: fullTitle
    },
    {
      property: 'og:url',
      content: typeof window !== 'undefined' ? window.location.href : ''
    }
  )
  
  return {
    title: fullTitle,
    meta
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const newsHeroRef = ref(null)
let newsHeroScrollHandler = null

const handleNewsHeroScroll = () => {
  if (!newsHeroRef.value) return
  const wrapper = newsHeroRef.value.querySelector('.news-hero__image-wrapper')
  if (!wrapper) return

  const scrollY = window.scrollY || window.pageYOffset
  const parallaxOffset = scrollY * 0.3
  wrapper.style.transform = `translateY(${parallaxOffset}px)`
}

onMounted(() => {
  if (typeof window !== 'undefined' && newsItem.value?.featuredImage) {
    newsHeroScrollHandler = handleNewsHeroScroll
    window.addEventListener('scroll', newsHeroScrollHandler, { passive: true })
    handleNewsHeroScroll()
  }
})

onUnmounted(() => {
  if (newsHeroScrollHandler && typeof window !== 'undefined') {
    window.removeEventListener('scroll', newsHeroScrollHandler)
  }
})

const currentSlide = ref(0)
const carouselRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const dragOffset = ref(0)

const getGalleryImageUrl = (image) => {
  return getImageUrl(image, {
    width: 1200,
    quality: 80,
    fit: 'crop',
    crop: 'focalpoint'
  })
}

const nextSlide = () => {
  if (!newsItem.value?.gallery?.length) return
  currentSlide.value = (currentSlide.value + 1) % newsItem.value.gallery.length
}

const prevSlide = () => {
  if (!newsItem.value?.gallery?.length) return
  currentSlide.value = currentSlide.value === 0 
    ? newsItem.value.gallery.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index) => {
  if (!newsItem.value?.gallery?.length) return
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
  
  const threshold = 50
  
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

const activeTab = ref('tab1')

const tabs = computed(() => [
  { id: 'tab1', title: newsItem.value?.tab1Title || 'What to Expect' },
  { id: 'tab2', title: newsItem.value?.tab2Title || 'What\'s Included' }
])

const hasTabContent = computed(() => {
  return !!(newsItem.value?.tab1Content || newsItem.value?.tab2Content)
})

const showTabHeaders = computed(() => {
  return !!(newsItem.value?.tab1Content && newsItem.value?.tab2Content)
})

onMounted(() => {
  if (!newsItem.value?.tab1Content && newsItem.value?.tab2Content) {
    activeTab.value = 'tab2'
  }
})
</script>

<style scoped>
.news-page {
  margin-top: calc(var(--header-height, 80px) * -1);
}

.news-hero {
  position: relative;
  height: calc(50vw + var(--header-height, 80px));
  min-height: 600px;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
}

.news-hero__image-wrapper {
  position: absolute;
  top: -20%;
  left: 0;
  width: 100%;
  height: 140%;
  will-change: transform;
  min-height: 100vh;
}

.news-hero__image {
  position: absolute;
  inset: 0;
}

.news-hero__image--no-image {
  background-color: var(--dark-green);
}

.news-hero__img {
  width: 100%;
  height: 100%;
  -webkit-object-fit: cover;
  object-fit: cover;
  min-width: 100%;
  min-height: 100%;
}

.news-hero__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--header-height, 80px);
  background: rgba(0, 0, 0, 0.4);
}

.news-hero__title {
  text-align: center;
  padding-top: var(--header-height, 80px);
}

.news-meta {
  gap: calc(var(--pad-1) * 1.5);
}

.news-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.news-meta-item dd {
  margin: 0;
}

.news-gallery {
  position: relative;
}

.news-carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 8 / 7;
}

.news-carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.news-carousel__track:active {
  cursor: grabbing;
}

.news-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.news-carousel__image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.news-carousel__image {
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

.news-tabs__headers {
  display: flex;
}

.news-tabs__header {
  padding: var(--h5) calc(calc(var(--h5) * 1.5)) calc(calc(var(--h5) * .8));
  background: none;
  border: none;
  background: rgba(var(--mid-green), 0.3);
  color: var(--dark-green);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.news-tabs__header:not(.news-tabs__header--active):hover {
  background: rgba(var(--mid-green), 0.6);
}
.news-tabs__header--active {
  background: rgba(var(--mid-green), 1);
  color: rgba(var(--light-green), 1);
}
.news-tabs__header--active:hover {
  color: var(--white);
}

.news-tab-panel {
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
  .news-tabs__headers {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
