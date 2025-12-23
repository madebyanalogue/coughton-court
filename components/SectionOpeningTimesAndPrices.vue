<template>
  <section ref="sectionRef" :class="['section-opening-times-prices', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-3 gap-3 gap-md-4 px-md-2">
        
        <!-- Column 1: Image -->
        <div v-if="image" class="opening-times-prices__image">
          <button 
            type="button" 
            class="opening-times-prices__image-button"
            @click="openLightbox"
          >
            <NuxtImg 
              :src="getImageUrl(image)" 
              :alt="title || 'Opening Times and Prices'"
              class="opening-times-prices__image-img"
              loading="lazy"
            />
          </button>
        </div>
        <div v-else class="opening-times-prices__image-placeholder"></div>

        <!-- Column 2: Title, Opening Times, Prices, Book Now Button -->
        <div class="opening-times-prices__content">
          <h2 v-if="title" class="opening-times-prices__title h4" style="white-space: pre-line;">{{ title }}</h2>
          
          <!-- Opening Times -->
          <div v-if="openingTimes && openingTimes.length > 0" class="opening-times-prices__opening-times">
            <div 
              v-for="(item, index) in openingTimes" 
              :key="index"
              class="opening-times-item"
            >
              <span class="opening-times-item__title h5">{{ item.title }}</span>
              <span class="opening-times-item__time">{{ item.time }}</span>
            </div>
          </div>

          <!-- Prices -->
          <div v-if="prices && prices.length > 0" class="opening-times-prices__prices">
            <div 
              v-for="(item, index) in prices" 
              :key="index"
              class="price-item h6"
            >
              <span class="price-item__category">{{ item.category }}</span>
              <span class="price-item__price">{{ item.price }}</span>
            </div>
          </div>

          <!-- Book Now Button -->
          <div v-if="bookingLink" class="opening-times-prices__booking">
            <a 
              :href="bookingLink" 
              target="_blank" 
              rel="noopener noreferrer"
              class="button"
            >
              {{ bookingTitle }}
            </a>
          </div>
        </div>

        <!-- Column 3: Information Blocks -->
        <div v-if="informationBlocks && informationBlocks.length > 0" class="opening-times-prices__information">
          <div 
            v-for="(block, index) in informationBlocks" 
            :key="index"
            class="information-block"
          >
            <h3 v-if="block.title" class="information-block__title h4">{{ block.title }}</h3>
            <div v-if="block.description" class="information-block__description">
              <SanityBlocks :blocks="block.description" />
            </div>
          </div>
        </div>

      </div>

      <!-- Lightbox -->
      <div 
        v-if="isLightboxOpen && image" 
        class="opening-times-prices__lightbox"
      >
        <div class="opening-times-prices__lightbox-backdrop" @click="closeLightbox"></div>
        <div class="opening-times-prices__lightbox-content">
          <button 
            type="button" 
            class="opening-times-prices__lightbox-close"
            @click="closeLightbox"
            aria-label="Close image"
          >
            ×
          </button>
          <NuxtImg
            :src="getImageUrl(image)"
            :alt="title || 'Opening Times and Prices'"
            class="opening-times-prices__lightbox-img"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage.js'
import { useSiteSettings } from '~/composables/useSiteSettings.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const sectionRef = ref(null)
const { getImageUrl } = useSanityImage()
const { bookingTitle, bookingLink } = useSiteSettings()

const title = computed(() => props.section?.openingTimesAndPricesContent?.title || '')
const openingTimes = computed(() => props.section?.openingTimesAndPricesContent?.openingTimes || [])
const prices = computed(() => props.section?.openingTimesAndPricesContent?.prices || [])
const informationBlocks = computed(() => props.section?.openingTimesAndPricesContent?.informationBlocks || [])
const image = computed(() => props.section?.openingTimesAndPricesContent?.image || null)

const isLightboxOpen = ref(false)

const openLightbox = () => {
  if (image.value) {
    isLightboxOpen.value = true
  }
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}
</script>

<style scoped>
.section-opening-times-prices {
  padding: var(--section-padding, 2rem) 0;
}

.opening-times-prices__image {
  width: 100%;
}

.opening-times-prices__image-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.opening-times-prices__image-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 200px;
}

.opening-times-prices__image-button {
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
}

.opening-times-prices__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.opening-times-prices__title {
  margin: 0;
  font-family: var(--heading, inherit);
  white-space: pre-line;
}

.opening-times-prices__opening-times {
  display: flex;
  flex-direction: column;
  gap: calc(var(--pad-1) * 1.5);
}

.opening-times-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}


.opening-times-prices__prices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-item {
  padding: calc(var(--pad-1) * .8) calc(var(--pad-1) * 1.5);
  border-radius: 100px;
  background-color: var(--secondary-background-color);
  display: flex;
}

.price-item__category {
  flex: 1;
}



.opening-times-prices__information {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.information-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.information-block__title {
  margin: 0;
  font-family: var(--heading, inherit);
  font-size: 1.25rem;
}

.information-block__description {
  color: inherit;
  opacity: 0.9;
}

.opening-times-prices__lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opening-times-prices__lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.opening-times-prices__lightbox-content {
  position: relative;
  z-index: 1;
  max-width: 90vw;
  max-height: 90vh;
}

.opening-times-prices__lightbox-img {
  width: 100%;
  height: auto;
  max-height: 90vh;
  object-fit: contain;
}

.opening-times-prices__lightbox-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (max-width: 768px) {
  .opening-times-prices__content,
  .opening-times-prices__information {
    margin-top: 2rem;
  }
}
</style>

