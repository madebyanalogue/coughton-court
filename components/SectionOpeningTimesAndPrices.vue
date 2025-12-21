<template>
  <section ref="sectionRef" :class="['section-opening-times-prices', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-3 gap-3">
        
        <!-- Column 1: Image -->
        <div v-if="image" class="opening-times-prices__image">
          <NuxtImg 
            :src="getImageUrl(image)" 
            :alt="title || 'Opening Times and Prices'"
            class="opening-times-prices__image-img"
            loading="lazy"
          />
        </div>
        <div v-else class="opening-times-prices__image-placeholder"></div>

        <!-- Column 2: Title, Opening Times, Prices, Book Now Button -->
        <div class="opening-times-prices__content">
          <h2 v-if="title" class="opening-times-prices__title">{{ title }}</h2>
          
          <!-- Opening Times -->
          <div v-if="openingTimes && openingTimes.length > 0" class="opening-times-prices__opening-times">
            <div 
              v-for="(item, index) in openingTimes" 
              :key="index"
              class="opening-times-item"
            >
              <span class="opening-times-item__title">{{ item.title }}</span>
              <span class="opening-times-item__time">{{ item.time }}</span>
            </div>
          </div>

          <!-- Prices -->
          <div v-if="prices && prices.length > 0" class="opening-times-prices__prices">
            <div 
              v-for="(item, index) in prices" 
              :key="index"
              class="price-item"
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
              class="opening-times-prices__booking-button"
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
            <h3 v-if="block.title" class="information-block__title">{{ block.title }}</h3>
            <div v-if="block.description" class="information-block__description">
              <SanityBlocks :blocks="block.description" />
            </div>
          </div>
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
</script>

<style scoped>
.section-opening-times-prices {
  padding: var(--section-padding, 2rem) 0;
}

.section-opening-times-prices :deep(.grid) {
  align-items: stretch;
}

.opening-times-prices__image {
  width: 100%;
  display: flex;
  align-items: stretch;
}

.opening-times-prices__image-img {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.opening-times-prices__image-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 200px;
}

@media (min-width: 768px) {
  .opening-times-prices__image {
    height: 100%;
    align-self: stretch;
  }
  
  .opening-times-prices__image-img {
    aspect-ratio: auto;
    height: 100%;
  }
  
  .opening-times-prices__image-placeholder {
    aspect-ratio: auto;
    height: 100%;
  }
}

.opening-times-prices__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.opening-times-prices__title {
  margin: 0;
  font-family: var(--heading, inherit);
}

.opening-times-prices__opening-times {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opening-times-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.opening-times-item__title {
  font-weight: 600;
}

.opening-times-item__time {
  color: inherit;
  opacity: 0.8;
}

.opening-times-prices__prices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.price-item__category {
  flex: 1;
}

.price-item__price {
  font-weight: 600;
}

.opening-times-prices__booking {
  margin-top: 1rem;
}

.opening-times-prices__booking-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  text-decoration: none;
  border: 1px solid currentColor;
  transition: all 0.3s ease;
}

.opening-times-prices__booking-button:hover {
  opacity: 0.7;
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

@media (max-width: 768px) {
  .opening-times-prices__content,
  .opening-times-prices__information {
    margin-top: 2rem;
  }
}
</style>

