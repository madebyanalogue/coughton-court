<template>
  <section :class="['section-service-links', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div :class="['service-links-container', {'py1 py-sm-2': enablePaddingTopBottom, 'px1 px-sm-2': enablePaddingLeftRight }]">
      <div class="service-links-grid">
        <div 
          v-for="(item, index) in items" 
          :key="index"
          :class="getGridClass(index)"
          class="service-link-item"
        >
          <a 
            v-if="item.url"
            :href="item.url" 
            :target="item.targetBlank ? '_blank' : '_self'"
            :rel="item.targetBlank ? 'noopener noreferrer' : ''"
            class="service-link"
            :class="item.url ? 'service-link-item--url' : 'service-link-item--no-url'"
          >
            <div class="service-link-image">
              <img 
                :src="getImageUrl(item.image)" 
                :alt="item.title"
                class="cover-image"
              />
            </div>
            <div class="service-link-content flex flex-center gap-1 h4 p2">
              <h3 class="service-link-title">{{ item.title }}</h3>
              <span class="service-link-text">{{ item.linkTitle }}</span>
            </div>
          </a>
          <div v-else class="service-link service-link--no-url">
            <div class="service-link-image">
              <img 
                :src="getImageUrl(item.image)" 
                :alt="item.title"
                class="cover-image"
              />
            </div>
            <div class="service-link-content flex flex-center gap-1 h4 p2">
              <h3 class="service-link-title">{{ item.title }}</h3>
              <span v-if="item.url" class="service-link-text">{{ item.linkTitle }}</span>
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
             value.sectionType === 'serviceLinks'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Extract data from section
const enablePaddingTopBottom = computed(() => {
  return props.section?.serviceLinksContent?.enablePaddingTopBottom || false
})

const enablePaddingLeftRight = computed(() => {
  return props.section?.serviceLinksContent?.enablePaddingLeftRight || false
})

const items = computed(() => {
  return props.section?.serviceLinksContent?.items || []
})

// Grid class logic based on item count
const getGridClass = (index) => {
  const totalItems = items.value.length
  
  if (totalItems === 1) {
    return 'col-span-12 ratio-2-1' // 2:1 ratio
  }
  
  if (totalItems === 2) {
    return 'col-span-12 col-span-6-md' // 1:1 ratio each
  }
  
  // For 3+ items, last item gets 2:1 if odd number
  if (totalItems % 2 === 1 && index === totalItems - 1) {
    return 'col-span-12 ratio-2-1' // 2:1 ratio for last item
  }
  
  return 'col-span-12 col-span-6-md' // 1:1 ratio for others
}
</script>

<style scoped>
.section-service-links {
  width: 100%;
}

.service-links-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0px;
}

.service-link-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}


.service-links-container.py1 .service-links-grid {
  gap: var(--pad-1) 0px;
}

.service-links-container.px1 .service-links-grid {
  gap: var(--pad-1) 0px;
}

@media (min-width: 800px) {  
.service-link-item.ratio-2-1 {
  aspect-ratio: 2/1;
}
.service-links-container.py1 .service-links-grid {
  gap: var(--pad-2) 0px;
}

.service-links-container.px1 .service-links-grid {
  gap: 0px var(--pad-2);
}
}

.service-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
}


.service-link-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.service-link.service-link-item--url:hover .cover-image {
  transform: scale(1.05);
}

.service-link-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: var(--yellow);
  text-align: center;
}

.service-link-title {
  text-transform: uppercase;
}

.service-link-text {
  display: block;
}

</style>
