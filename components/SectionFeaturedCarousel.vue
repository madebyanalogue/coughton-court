<template>
  <section
    ref="sectionRef"
    :class="[
      'section-featured-carousel',
      {
        'section-border-top': section.borderTop,
        'section-border-bottom': section.borderBottom,
        'section-featured-carousel--paged': slides.length > 1
      }
    ]"
  >
    <div
      v-if="slides.length"
      class="featured-carousel"
      ref="carouselRef"
      :style="{ backgroundColor: activeSlide?.keyColour || '#617954' }"
    >
      <div
        class="featured-carousel__stage"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @mousemove="onDrag"
        @touchmove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchend="endDrag"
      >
        <div
          v-if="activeSlide"
          :key="currentSlide"
          class="wrapper featured-carousel__inner"
          :class="{
            'is-fading-out': phase === 'out',
            'is-fading-in': phase === 'in'
          }"
        >
          <div class="featured-carousel__content">
            <h2 v-if="activeSlide.title" class="featured-carousel__title h3">
              {{ activeSlide.title }}
            </h2>
            <p v-if="activeSlide.description" class="featured-carousel__description">
              {{ activeSlide.description }}
            </p>
            <NuxtLink
              v-if="activeSlide.link?.href && activeSlide.buttonText"
              :to="activeSlide.link.href"
              :target="activeSlide.link.external ? '_blank' : undefined"
              :rel="activeSlide.link.external ? 'noopener noreferrer' : undefined"
              class="button featured-carousel__button"
            >
              {{ activeSlide.buttonText }}
            </NuxtLink>
          </div>

          <div class="featured-carousel__media">
            <div class="featured-carousel__image-inset">
              <NuxtImg
                v-if="activeSlide.image"
                :src="getSlideImageUrl(activeSlide.image)"
                :alt="activeSlide.image.alt || activeSlide.title || 'Slide image'"
                class="featured-carousel__image"
                width="1400"
                quality="80"
                format="webp"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div class="wrapper featured-carousel__divider" aria-hidden="true">
          <span></span>
        </div>
      </div>

      <div v-if="slides.length > 1" class="featured-carousel__controls">
        <div class="wrapper featured-carousel__controls-inner">
          <div class="featured-carousel__nav-wrap">
            <button
              type="button"
              class="featured-carousel__nav featured-carousel__nav--prev"
              aria-label="Previous slide"
              @click="prevSlide"
            >
              <span class="arrow">←</span>
            </button>
            <button
              type="button"
              class="featured-carousel__nav featured-carousel__nav--next"
              aria-label="Next slide"
              @click="nextSlide"
            >
              <span class="arrow">→</span>
            </button>
          </div>
          <div class="featured-carousel__dots">
            <button
              v-for="(slide, index) in slides"
              :key="`dot-${slide._key || index}`"
              type="button"
              class="featured-carousel__dot"
              :class="{ 'featured-carousel__dot--active': currentSlide === index }"
              :aria-label="`Go to slide ${index + 1}`"
              @click="goToSlide(index)"
            />
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
const phase = ref('idle')
const isDragging = ref(false)
const startX = ref(0)
const dragOffset = ref(0)
const FADE_MS = 400
let fadeTimer = null

const clearFadeTimer = () => {
  if (fadeTimer) {
    window.clearTimeout(fadeTimer)
    fadeTimer = null
  }
}

const resolveLink = (slide) => {
  const eventSlug = slide?.event?.slug?.current
  if (eventSlug) {
    return { href: `/events/${eventSlug}`, external: false }
  }

  const pageSlug = slide?.page?.slug?.current
  if (pageSlug) {
    return {
      href: pageSlug === 'index' ? '/' : `/${pageSlug}`,
      external: false
    }
  }

  const url = slide?.url?.trim()
  if (url) {
    return { href: url, external: true }
  }

  return null
}

const slides = computed(() => {
  const items = props.section?.featuredCarouselContent?.slides
  if (!items || !Array.isArray(items)) return []

  return items.map((slide) => ({
    ...slide,
    buttonText: slide.buttonText?.trim() || 'Find out more',
    link: resolveLink(slide)
  }))
})

const activeSlide = computed(() => slides.value[currentSlide.value] || null)

const getSlideImageUrl = (image) => {
  return getImageUrl(image, {
    width: 1600,
    quality: 85
  })
}

const showSlide = (index) => {
  if (!slides.value.length) return
  const next = (index + slides.value.length) % slides.value.length
  if (next === currentSlide.value || phase.value !== 'idle') return

  if (slides.value.length < 2) {
    currentSlide.value = next
    return
  }

  phase.value = 'out'
  clearFadeTimer()
  fadeTimer = window.setTimeout(() => {
    currentSlide.value = next
    phase.value = 'in'
    fadeTimer = window.setTimeout(() => {
      phase.value = 'idle'
      fadeTimer = null
    }, FADE_MS)
  }, FADE_MS)
}

const nextSlide = () => {
  showSlide(currentSlide.value + 1)
}

const prevSlide = () => {
  showSlide(currentSlide.value - 1)
}

const goToSlide = (index) => {
  showSlide(index)
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

onMounted(() => {
  if (sectionRef.value) {
    registerSection(`featured-carousel-${props.section._id}`, {
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
  clearFadeTimer()
  unregisterSection(`featured-carousel-${props.section._id}`)
})
</script>

<style scoped>
.section-featured-carousel {
  opacity: 0;
}

.section-featured-carousel:first-child {
  padding-top: 0;
}

.featured-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.featured-carousel__stage {
  position: relative;
  z-index: 1;
  cursor: grab;
}

.featured-carousel__stage:active {
  cursor: grabbing;
}

.featured-carousel__inner {
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;
}

.featured-carousel__inner.is-fading-out {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.featured-carousel__inner.is-fading-in {
  animation: featured-carousel-fade-in 0.4s ease;
}

@keyframes featured-carousel-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.featured-carousel__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 2;
  width: 100%;
  transform: translateX(-50%);
  display: none;
  pointer-events: none;
  box-sizing: border-box;
}

.featured-carousel__divider span {
  grid-column: 2;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.featured-carousel__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--pad-1);
  padding: var(--section-padding, 3rem) 0;
  color: white;
}

.featured-carousel__title {
  margin: 0;
  max-width: 18ch;
}

.featured-carousel__description {
  margin: 0;
  max-width: 36ch;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.35;
}

.featured-carousel__button {
  align-self: flex-start;
  margin-top: var(--pad-1);
  color: white;
  background: rgb(var(--dark-green));
  border-color: rgb(var(--dark-green));
}

.featured-carousel__button:hover {
  background: transparent;
  color: white;
  border-color: rgb(var(--dark-green));
}

.featured-carousel__media {
  display: flex;
  min-height: 60vw;
  padding: var(--wrapper-padding, 1.5rem);
}

.featured-carousel__image-inset {
  width: 100%;
  overflow: hidden;
  flex: 1;
}

.featured-carousel__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.featured-carousel__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  /* border-top: 1px solid; */
  padding: 30px 0 80px;
  color: rgb(var(--dark-green));
  background-color: transparent;
  box-sizing: border-box;
}

.featured-carousel__controls-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
}

.featured-carousel__nav-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.featured-carousel__nav {
  border: 1px solid rgb(var(--dark-green));
  background: transparent;
  color: rgb(var(--dark-green));
  cursor: pointer;
  padding: 15px;
}

.featured-carousel__dots {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px;
  background-color: rgb(97, 121, 84);
  border-radius: 100px;
}

.featured-carousel__dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid currentColor;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.featured-carousel__dot--active {
  background: currentColor;
}

@media (min-width: 800px) {
  .featured-carousel {
    --mono-spacing: 0.1em;
    --arrow-size: 30px;
  }

  .arrow {
    display: inline-block;
    width: var(--arrow-size);
    height: var(--arrow-size);
    transform-origin: center;
    position: relative;
    line-height: 34px;
    font-family: var(--heading);
    transition: transform 0.6s ease;
    font-size: 25px;
  }

  .featured-carousel__inner {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    height: 800px;
    max-height: 800px;
  }

  .featured-carousel__content {
    padding-left: 120px;
  }

  .featured-carousel__controls-inner {
    padding-left: calc(var(--wrapper-padding, 1.5rem) + 120px);
  }

  .featured-carousel__media {
    min-height: 0;
  }

  .featured-carousel__divider {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .section-featured-carousel--paged .featured-carousel__content {
    padding-bottom: 140px;
  }
}
</style>
