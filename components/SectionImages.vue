<template>
  <section :class="['section-images', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div :class="[{'py-md-3': enablePadding }]">
      <div class="images-grid p1 p2-sm">
        <div 
          v-for="(item, index) in items" 
          :key="index"
          :class="getGridClass(index)"
          class="image-item"
        >
          <div 
            class="image-container"
            :style="{
              justifyContent: getJustifyContent(item.alignment),
              alignItems: 'center'
            }"
          >
          <div 
              :style="{
                objectFit: item.objectFit || 'cover',
                objectPosition: getObjectPosition(item.alignment),
                width: `${item.width}%`
              }"> 
              <NuxtImg 
                :src="getImageUrl(item.image)" 
                :alt="item.title || 'Image'"
                class="image"
                data-image-overlay
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'sectionImages'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Extract data from section
const enablePadding = computed(() => {
  return props.section?.sectionImagesContent?.enablePadding || false
})

const items = computed(() => {
  return props.section?.sectionImagesContent?.items || []
})

// Grid class logic based on item count
const getGridClass = (index) => {
  const totalItems = items.value.length
  
  if (totalItems === 1) {
    return 'col-span-12 ratio-2-1' // 2:1 ratio container
  }
  
  if (totalItems === 2) {
    return 'col-span-12 col-span-6-sm' // 1:1 ratio each
  }
  
  // For 3+ items, last item gets 2:1 if odd number
  if (totalItems % 2 === 1 && index === totalItems - 1) {
    return 'col-span-12 ratio-2-1' // 2:1 ratio for last item
  }
  
  return 'col-span-12 col-span-6-sm' // 1:1 ratio for others
}

// Convert alignment to object-position
const getObjectPosition = (alignment) => {
  switch (alignment) {
    case 'left':
      return 'left center'
    case 'right':
      return 'right center'
    case 'center':
    default:
      return 'center center'
  }
}

// Helper functions for justify-content and align-items
const getJustifyContent = (alignment) => {
  switch (alignment) {
    case 'left':
      return 'flex-start'
    case 'right':
      return 'flex-end'
    case 'center':
    default:
      return 'center'
  }
}

const getAlignItems = (alignment) => {
  switch (alignment) {
    case 'left':
      return 'flex-start'
    case 'right':
      return 'flex-end'
    case 'center':
    default:
      return 'center'
  }
}
</script>

<style scoped>
.section-images {
  width: 100%;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--pad-1);
}

.image-item {
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
}

@media (min-width: 800px) {
  .image-item.ratio-2-1 {
    aspect-ratio: 2/1;  
  }
  .images-grid {
    gap: var(--pad-2);
  }
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
}

.image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

@media (max-width: 801px) {
  .image-container {
    justify-content: center !important;
  }
  .image-container img {
    width: 100% !important;  
  }
  .image-item {
    aspect-ratio: unset;
    max-height: calc(100vw - calc(var(--pad-1) * 2));
  }
}


</style>
