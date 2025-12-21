<template>
  <section :class="['section-instagram py2 py-sm-3', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 gap-1 gap-sm-2">
      <!-- Section Image -->
        <div v-if="sectionImage" class="grid grid-center-items">
          <div class="col-span-12 col-span-6-md">
            <img
              :src="getImageUrl(sectionImage)"
              :alt="'Instagram Section'"
              class="section-image"
            />
          </div>
        </div>

        <!-- Fading Carousel (like SingleCarousel) -->
        <div v-if="items?.length" class="instagram-carousel px1 px-sm-4 hide-md">
          <div class="carousel-stage">
            <img
              v-for="(item, index) in items"
              :key="index"
              :src="getImageUrl(item.image)"
              :alt="`Instagram carousel ${index + 1}`"
              class="carousel-image"
              :class="{ 'is-active': index === currentSlide }"
              draggable="false"
            />
          </div>
        </div>

        <!-- Instagram Grid -->
        <div class="grid grid-3 gap-2 px2 px-md-6 show-md">
          <div
            v-for="(item, index) in shuffledItems"
            :key="index"
            class="instagram-item"
          >
            <a
              v-if="linkUrl"
              :href="linkUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="instagram-link"
            >
              <img
                :src="getImageUrl(item.image)"
                :alt="`Instagram post ${index + 1}`"
                class="instagram-image"
              />
            </a>
            <img
              v-else
              :src="getImageUrl(item.image)"
              :alt="`Instagram post ${index + 1}`"
              class="instagram-image"
            />
          </div>
        </div>

        <!-- Link -->
        <div v-if="linkText && linkUrl" class="instagram-link-container py1 ptop">
          <a
            :href="linkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="instagram-link underline-link"
          >
            {{ linkText }}
          </a>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
             value._type === 'section' &&
             value.sectionType === 'sectionInstagram'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Extract data from section
const sectionImage = computed(() => props.section?.instagramContent?.sectionImage)
const linkText = computed(() => props.section?.instagramContent?.linkText)
const linkUrl = computed(() => props.section?.instagramContent?.linkUrl)
const items = computed(() => props.section?.instagramContent?.items || [])

// Shuffled items for random placement
const shuffledItems = ref([])

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

onMounted(() => {
  // Shuffle items on component mount
  shuffledItems.value = shuffleArray(items.value)
})

// --- Fading carousel state/logic ---
const currentSlide = ref(0)
const carouselTimer = ref(null)
const carouselIntervalMs = 3000

function startCarousel() {
  stopCarousel()
  if (!items.value?.length) return
  carouselTimer.value = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % items.value.length
  }, carouselIntervalMs)
}

function stopCarousel() {
  if (carouselTimer.value) {
    clearInterval(carouselTimer.value)
    carouselTimer.value = null
  }
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.section-instagram {
  width: 100%;
  background-color: var(--beige);
}

.section-image-container {
  text-align: center;
}

.section-image {
  max-width: 100%;
  height: auto;
}

.instagram-grid {
  display: grid;
}

.instagram-item {
  aspect-ratio: 2/3;
  overflow: hidden;
}

.instagram-item:hover {
  
}

.instagram-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.75s ease;
}

.instagram-item:hover .instagram-image {
  transform: scale(1.05);
}

.instagram-link-container {
  text-align: center;
}

.instagram-link {
  text-decoration: none;
  color: inherit;
}

/* --- Fading carousel styles --- */

.carousel-stage {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-stage::before {
  content: '';
  display: block;
  /* Maintain 2:3 portrait ratio */
  padding-top: calc(100% * 3 / 2);
}

.carousel-stage > img.carousel-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 600ms ease;
}

.carousel-stage > img.carousel-image.is-active {
  opacity: 1;
}

/* Desktop: 3 columns */
@media (min-width: 768px) {
  
}

/* Responsive adjustments */
@media (max-width: 767px) {
 
}
</style>
