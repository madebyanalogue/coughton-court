<template>
  <section :class="['section-memberships', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div 
        class="grid grid-1 gap-3 gap-5-md px-md-2 middle-xs" 
        :class="useNarrowText ? 'grid-md-8' : 'grid-md-3'"
      >
        
        <!-- Column 1: Image -->
        <div 
          v-if="image" 
          class="memberships__image"
          :class="useNarrowText ? 'col-span-12 col-span-5-md' : ''"
        >
          <NuxtImg 
            :src="getImageUrl(image)" 
            :alt="title || 'Memberships'"
            class="memberships__image-img"
            loading="lazy"
          />
        </div>
        <div v-else class="memberships__image-placeholder" :class="useNarrowText ? 'col-span-12 col-span-5-md' : ''"></div>

        <!-- Column 2: Title, Text, Prices Repeater, Button -->
        <div 
          class="memberships__content"
          :class="useNarrowText ? 'col-span-12 col-span-3-md' : ''"
        >
          <h2 v-if="title" class="memberships__title h4" style="white-space: pre-line;">{{ title }}</h2>
          
          <!-- Text Block -->
          <div v-if="text && text.length > 0" class="memberships__text">
            <SanityBlocks :blocks="text" />
          </div>

          <!-- Prices Repeater (same structure as Opening Times and Prices) -->
          <div v-if="memberships && memberships.length > 0" class="memberships__prices">
            <div 
              v-for="(item, index) in memberships" 
              :key="index"
              class="price-item h6"
            >
              <span class="price-item__category">{{ item.category }}</span>
              <span class="price-item__price">{{ item.price }}</span>
            </div>
          </div>

          <!-- Button Link -->
          <div v-if="buttonLink" class="memberships__button">
            <a 
              :href="buttonLink" 
              :target="buttonOpenInNewTab ? '_blank' : '_self'"
              :rel="buttonOpenInNewTab ? 'noopener noreferrer' : undefined"
              class="button"
            >
              {{ buttonText }}
            </a>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage.js'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { getImageUrl } = useSanityImage()

const title = computed(() => props.section?.membershipsContent?.title || '')
const text = computed(() => {
  const content = props.section?.membershipsContent?.text
  return content && Array.isArray(content) && content.length > 0 ? content : null
})
const memberships = computed(() => props.section?.membershipsContent?.memberships || [])
const image = computed(() => props.section?.membershipsContent?.image || null)
const buttonText = computed(() => props.section?.membershipsContent?.buttonText || 'Find out more')
const buttonLink = computed(() => props.section?.membershipsContent?.buttonLink || '')
const buttonOpenInNewTab = computed(() => props.section?.membershipsContent?.buttonOpenInNewTab ?? true)
const useNarrowText = computed(() => props.section?.membershipsContent?.useNarrowText || false)
</script>

<style scoped>
.section-memberships {
  padding: var(--section-padding, 2rem) 0;
}

.memberships__image {
  width: 100%;
}

.memberships__image-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.memberships__image-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 200px;
}

.memberships__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.memberships__title {
  margin: 0;
  font-family: var(--heading, inherit);
  white-space: pre-line;
}

.memberships__text {
  color: inherit;
}

.memberships__prices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.memberships__button a {
  width: 100%;
}

.price-item {
  padding: calc(var(--pad-1) * 1) calc(var(--pad-1) * 1.5) calc(var(--pad-1) * .8);
  border-radius: 100px;
  background-color: var(--secondary-background-color);
  display: flex;
}

.price-item__category {
  flex: 1;
}

@media (max-width: 768px) {
  .memberships__content {
    margin-top: 2rem;
  }
}
</style>
