<template>
  <section :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">
      <div class="grid-1 grid-sm-12 grid">
        <div 
          v-for="(item, index) in galleryItems" 
          :key="index"
          :class="[
            'gallery-item',
            'col-span-12',
            `col-span-${item.columns}-sm`,
            ]"
            :style="getItemStyle(item)"
          >
          <div v-if="item.image" :class="[
              'gallery-image-container',
              `ratio-${item.imageRatio}`,
            ]">
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="`Gallery image ${index + 1}`"
              :class="[
                'gallery-image',
              ]"
              data-image-overlay
              loading="lazy"
            />
          </div>
          <!-- Empty spacer div for items without images -->
          <div v-else class="gallery-spacer"
            :class="[
              `ratio-${item.imageRatio}`,
            ]"
          ></div>
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
             value.sectionType === 'gallery'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Extract gallery items
const galleryItems = computed(() => {
  return props.section?.galleryContent?.items || []
})

// Get item styling based on ratio and custom height
const getItemStyle = (item) => {
  const styles = {}
  
  if (item.imageRatio === 'custom' && item.customHeight) {
    styles.height = item.customHeight
  }
  
  return styles
}
</script>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--pad-2);
  width: 100%;
}

.gallery-item {
  position: relative;
  overflow: hidden;
}

.gallery-image-container {
  position: relative;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-spacer {
  width: 100%;
  height: 100%;
  background: transparent;
}


/* Aspect ratios */
.ratio-square {
  aspect-ratio: 1 / 1;
}

.ratio-landscape {
  aspect-ratio: 16 / 9;
}

.ratio-portrait {
  aspect-ratio: 3 / 4;
}

.ratio-wide {
  aspect-ratio: 21 / 9;
}

.ratio-tall {
  aspect-ratio: 2 / 3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gallery-spacer {
    display: none;
  }
}

</style> 