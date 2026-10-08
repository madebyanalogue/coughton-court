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
      <section
        class="event-hero"
        :class="{ 'event-hero--has-background': heroBackgroundUrl }"
      >
        <div v-if="heroBackgroundUrl" class="event-hero__background" aria-hidden="true">
          <NuxtImg
            :src="heroBackgroundUrl"
            alt=""
            class="event-hero__background-img"
            width="1920"
            quality="80"
            format="webp"
            loading="eager"
            preload
          />
        </div>
        <div v-if="heroBackgroundUrl" class="event-hero__overlay" aria-hidden="true"></div>
        <div class="wrapper event-hero__inner">
          <div class="event-hero__content">
            <div class="event-hero__heading">
              <h1 class="event-hero__title h1">{{ event.title }}</h1>
              <p v-if="heroDate" class="event-hero__date">{{ heroDate }}</p>
            </div>
            <a
              v-if="event.bookingUrl"
              :href="getProcessedUrl(event.bookingUrl)"
              :target="shouldOpenInNewTab(event.bookingUrl) ? '_blank' : undefined"
              :rel="shouldOpenInNewTab(event.bookingUrl) ? 'noopener' : undefined"
              class="button event-hero__button"
            >
              Buy tickets
            </a>
          </div>
          <div v-if="event.featuredImage" class="event-hero__media">
            <div class="event-hero__image-inset">
              <NuxtImg 
                :src="getImageUrl(event.featuredImage, { width: 1600, quality: 85 })" 
                :alt="event.title"
                class="event-hero__img"
                width="1600"
                quality="85"
                format="webp"
                loading="eager"
                preload
              />
            </div>
          </div>
        </div>
      </section>
      
      <section class="event-details-section section-padding">
        <div class="wrapper">
          <div class="event-details">
            <aside class="event-info">
              <div v-if="whenText" class="event-info__item">
                <h2 class="event-info__label">When</h2>
                <p class="event-info__value">{{ whenText }}</p>
              </div>
              <div v-if="whereText" class="event-info__item">
                <h2 class="event-info__label">Where</h2>
                <p class="event-info__value">{{ whereText }}</p>
              </div>
              <div v-if="pricingText" class="event-info__item">
                <h2 class="event-info__label">Pricing</h2>
                <p class="event-info__value">{{ pricingText }}</p>
              </div>
              <a
                v-if="event.bookingUrl"
                :href="getProcessedUrl(event.bookingUrl)"
                :target="shouldOpenInNewTab(event.bookingUrl) ? '_blank' : undefined"
                :rel="shouldOpenInNewTab(event.bookingUrl) ? 'noopener' : undefined"
                class="button event-info__button"
              >
                Buy tickets
              </a>
            </aside>

            <div class="event-copy">
              <div
                v-for="(section, index) in copySections"
                :key="index"
                class="event-copy__section rte"
              >
                <h2 v-if="section.title" class="event-copy__title">{{ section.title }}</h2>
                <SanityBlocks :blocks="section.blocks" />
              </div>
            </div>
          </div>

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
      </section>

      <section v-if="moreEvents.length" class="more-events section-padding">
        <div class="wrapper">
          <div class="more-events__header">
            <h2 class="more-events__title">More events</h2>
            <div v-if="moreEvents.length > perView" class="more-events__nav">
              <button type="button" class="more-events__arrow" aria-label="Previous events" @click="prevMore">
                ←
              </button>
              <button type="button" class="more-events__arrow" aria-label="Next events" @click="nextMore">
                →
              </button>
            </div>
          </div>
          <div class="more-events__viewport">
            <div
              class="more-events__track"
              :style="{ transform: `translateX(-${moreIndex * (100 / perView)}%)` }"
            >
              <article
                v-for="item in moreEvents"
                :key="item._id"
                class="more-events__card"
              >
                <NuxtLink
                  v-if="item.slug?.current"
                  :to="`/events/${item.slug.current}`"
                  class="more-events__link"
                  :aria-label="item.title"
                >
                  <div class="more-events__image">
                    <NuxtImg
                      v-if="item.featuredImage"
                      :src="getImageUrl(item.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })"
                      :alt="item.title"
                      width="1056"
                      quality="80"
                      format="webp"
                      loading="lazy"
                    />
                    <div v-else class="more-events__fallback secondary"></div>
                  </div>
                </NuxtLink>
                <p class="more-events__date">{{ formatDateRange(item.startDate, item.endDate) }}</p>
                <h3 class="more-events__name">{{ item.title }}</h3>
                <p v-if="item.shortDescription" class="more-events__description">{{ limitDescription(item.shortDescription) }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSanityImage } from '~/composables/useSanityImage.js'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useUrlProcessing } from '~/composables/useUrlProcessing'
import { useHead } from '#app'
import { useEventHeroHeader } from '~/composables/useEventHeroHeader.js'

const route = useRoute()
const { getImageUrl } = useSanityImage()
const { title: websiteTitle, defaultMetaDescription, defaultOgImage } = useSiteSettings()
const { getProcessedUrl, shouldOpenInNewTab } = useUrlProcessing()
const { setEventHeroHasBackground } = useEventHeroHeader()

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

const heroBackgroundUrl = computed(() => {
  const image = event.value?.heroBackground
  if (!image?.asset) return null
  return getImageUrl(image, { width: 1920, quality: 80 })
})

watch(heroBackgroundUrl, (url) => {
  setEventHeroHasBackground(!!url)
}, { immediate: true })

onUnmounted(() => {
  if (!route.path.startsWith('/events/')) {
    setEventHeroHasBackground(false)
  }
})

// Page meta - use page-specific SEO data if available, otherwise use defaults
useHead(() => {
  const pageTitle = event.value?.seo?.metaTitle || event.value?.title || 'Event'
  const fullTitle = event.value?.seo?.metaTitle 
    ? `${websiteTitle.value} | ${event.value.seo.metaTitle}`
    : `${websiteTitle.value} | ${event.value?.title || 'Event'}`
  
  const metaDescription = event.value?.seo?.metaDescription || defaultMetaDescription.value || ''
  
  // Get OG image - use page-specific if available, otherwise use default
  let ogImageUrl = null
  if (event.value?.seo?.ogImage?.asset) {
    ogImageUrl = getImageUrl(event.value.seo.ogImage, { width: 1200, quality: 85 })
  } else if (event.value?.featuredImage?.asset) {
    ogImageUrl = getImageUrl(event.value.featuredImage, { width: 1200, quality: 85 })
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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const whenText = computed(() => {
  if (event.value?.when?.trim()) return event.value.when.trim()
  if (!event.value?.startDate) return ''
  const start = formatDate(event.value.startDate)
  if (!event.value.endDate) return start
  const end = formatDate(event.value.endDate)
  return start === end ? start : `${start} – ${end}`
})

const pricingText = computed(() => {
  return event.value?.pricing?.trim() || event.value?.cost?.trim() || ''
})

const { data: allEvents } = await useAsyncData(
  'more-events',
  () => $fetch('/api/sanity', { params: { type: 'event', all: true } })
)

const moreEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (allEvents.value || []).filter((item) => {
    if (!item?.startDate) return false
    if (item._id && item._id === event.value?._id) return false
    if (item.slug?.current && item.slug.current === slug.value) return false

    const endDate = item.endDate ? new Date(item.endDate) : new Date(item.startDate)
    endDate.setHours(23, 59, 59, 999)
    return endDate >= today
  })
})

const perView = ref(1)
const moreIndex = ref(0)

const updatePerView = () => {
  perView.value = window.innerWidth >= 800 ? 3 : 1
  const maxIndex = Math.max(moreEvents.value.length - perView.value, 0)
  if (moreIndex.value > maxIndex) moreIndex.value = maxIndex
}

const prevMore = () => {
  moreIndex.value = Math.max(moreIndex.value - 1, 0)
}

const nextMore = () => {
  const maxIndex = Math.max(moreEvents.value.length - perView.value, 0)
  moreIndex.value = Math.min(moreIndex.value + 1, maxIndex)
}

const DESCRIPTION_LIMIT = 160

const limitDescription = (text) => {
  const value = (text || '').replace(/\s+/g, ' ').trim()
  if (value.length <= DESCRIPTION_LIMIT) return value
  const sliced = value.slice(0, DESCRIPTION_LIMIT)
  const breakpoint = sliced.lastIndexOf(' ')
  const trimmed = (breakpoint > 0 ? sliced.slice(0, breakpoint) : sliced).trim()
  return `${trimmed}…`
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return ''
  const start = formatDate(startDate)
  if (!endDate) return start
  const end = formatDate(endDate)
  return start === end ? start : `${start} – ${end}`
}

const heroDate = computed(() => formatDateRange(event.value?.startDate, event.value?.endDate))

onMounted(() => {
  updatePerView()
  window.addEventListener('resize', updatePerView)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePerView)
})

watch(moreEvents, () => {
  moreIndex.value = 0
})

const whereLabels = {
  house: 'House',
  cafe: 'Cafe',
  garden: 'Garden'
}

const whereText = computed(() => {
  const option = event.value?.whereOption
  if (option && whereLabels[option]) return whereLabels[option]
  return event.value?.where?.trim() || ''
})

const portableTextParagraphs = (blocks) => {
  if (!Array.isArray(blocks)) return []
  return blocks
    .map((block) => {
      if (!Array.isArray(block?.children)) return ''
      return block.children.map((child) => child.text || '').join('')
    })
    .map((text) => text.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter(Boolean)
}

const copySections = computed(() => {
  const candidates = [
    { title: event.value?.tab1Title, blocks: event.value?.tab1Content },
    { title: event.value?.tab2Title, blocks: event.value?.tab2Content }
  ]
  const shown = []

  return candidates.filter((section) => {
    if (!section.blocks?.length) return false
    const paragraphs = portableTextParagraphs(section.blocks)
    const repeated = paragraphs.length > 0 && paragraphs.every((paragraph) =>
      shown.some((previous) => previous.includes(paragraph))
    )
    if (repeated) return false
    shown.push(paragraphs.join('\n'))
    return true
  })
})

// Gallery carousel
const currentSlide = ref(0)
const carouselRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
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

</script>

<style scoped>
.event-hero {
  position: relative;
  overflow: hidden;
  padding-top: var(--header-height, 80px);
  background: #617954;
  color: rgba(var(--light-green), 1);
}

.event-hero__background,
.event-hero__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.event-hero__background {
  z-index: 0;
}

.event-hero__background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.event-hero__overlay {
  z-index: 1;
  background: rgba(43, 46, 41, 0.45);
}

.event-hero__inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr;
  max-height: 800px;
}

.event-hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: var(--pad-2, 1.5rem);
  padding: var(--section-padding, 3rem) 0;
}

.h1 {
  line-height: 1.2;
}

.event-hero__heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 45px;
}

.event-hero__date {
  margin: 0;
  font-family: var(--heading);
  font-weight: 400;
  font-size: 18px;
  line-height: 1.35;
  color: white;
}

.event-hero__title {
  margin: 0;
  text-align: left;
  color: white;
}

.event-hero__button {
  align-self: flex-start;
  width: auto;
  border-radius: 100px;
  color: white;
  background: rgb(var(--dark-green));
  border-color: rgb(var(--dark-green));
}

.event-hero__button:hover {
  background: transparent;
  color: white;
  border-color: rgb(var(--dark-green));
}

.event-hero--has-background .event-hero__button {
  background: white;
  color: rgb(var(--dark-green));
  border-color: white;
}

.event-hero--has-background .event-hero__button:hover {
  background: transparent;
  color: white;
  border-color: white;
}

.event-hero__media {
  display: flex;
  min-height: 60vw;
  padding: var(--wrapper-padding, 1.5rem);
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.event-hero__image-inset {
  width: 100%;
  overflow: hidden;
  flex: 1;
}

.event-hero__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

@media (min-width: 800px) {
  .event-hero__inner {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    height: 800px;
  }

  .event-hero__content {
    padding: 120px;
    gap: 60px;
  }

  .event-hero__media {
    min-height: 0;
  }
}


.event-details-section {
  background: #f7f7f7;
  padding: calc(var(--section-padding) * 2) 0;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 90px;
  align-items: flex-start;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 680px;
  padding: 1.75rem 1.5rem;
  background: rgba(var(--dark-green), 0.08);
  box-sizing: border-box;
}

.event-info,
.event-copy {
  font-family: var(--heading);
}

.event-info__item {
  border-bottom: 1px solid;
  padding-bottom: 35px;
}

.event-info__label {
  margin: 0 0 12px;
  font-family: var(--heading);
  font-style: normal;
  font-weight: 400;
  font-size: 28px;
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.2;
}

.event-info__value {
  margin: 0;
  white-space: pre-line;
  line-height: 1.45;
  font-size: 20px;
}

.event-info__button {
  display: block;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  border-radius: 100px;
  color: white;
  background: rgb(var(--dark-green));
  border-color: rgb(var(--dark-green));
}

.event-info__button:hover {
  background: transparent;
  color: rgb(var(--dark-green));
  border-color: rgb(var(--dark-green));
}

.event-copy {
  display: flex;
  flex-direction: column;
  gap: var(--pad-2, 1.5rem);
  max-width: 980px;
}

.event-copy__title {
  margin: 0 0 22px;
  font-family: var(--heading);
  font-weight: 400;
  font-size: 32px;
  letter-spacing: -0.01em;
  text-transform: none;
}

.event-gallery {
  position: relative;
  margin-top: var(--pad-3, 2rem);
}

@media (min-width: 1200px) {
  .event-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .event-info {
    width: 680px;
    max-width: 680px;
    flex: 0 0 680px;
    padding: 50px;
    margin: 0 auto;
  }

  .event-copy {
    flex: 1;
    min-width: 0;
  }
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

.more-events__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: var(--pad-2);
}

.more-events__title {
  margin: 0;
  font-family: var(--heading);
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.more-events__nav {
  display: flex;
  gap: 0.75rem;
}

.more-events__arrow {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.more-events__viewport {
  overflow: hidden;
}

.more-events__track {
  display: flex;
  width: 100%;
  transition: transform 0.45s ease;
}

.more-events__card {
  flex: 0 0 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--pad-1);
  align-content: start;
  padding-right: var(--pad-3);
}

.more-events__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.more-events__image,
.more-events__fallback {
  aspect-ratio: 1.5;
  border-radius: 10px;
  overflow: hidden;
  display: block;
}

.more-events__image img,
.more-events__image :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-events__date {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.35;
}

.more-events__description {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.4;
  margin-top: 10px;
}

.more-events__name {
  margin: 0;
  font-family: var(--body-font);
  font-weight: 400;
  font-size: clamp(22px, 2vw, 28px);
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.2;
}

@media (min-width: 800px) {
  .more-events__card {
    flex: 0 0 33.333%;
    max-width: 33.333%;
  }
}
</style>

