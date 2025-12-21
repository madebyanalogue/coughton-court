<template>
  <section :class="['section-text py2 py-sm-4', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-center-items">
        
        <!-- Text content -->
        <div 
          class="h4 text-center col-span-12 col-span-6-md grid grid-1"
        >
          <div v-if="imageUrl || title" class="">
            <img 
              v-if="imageUrl" 
              :src="imageUrl" 
              :alt="imageAlt || 'Decorative image'" 
              class="py05 pbottom"
            />
          </div>

          <div v-if="splitTitle" class="split-text-title py1 pbottom">
            <div class="left">{{ splitTitle.left }}</div>
            <div class=""></div>
            <div class="center py1 pad-bottom"><Logoicon /></div>
            <div class=""></div>
            <div class="right">{{ splitTitle.right }}</div>
          </div>

          <div v-if="title" class="heading h2">{{ title }}</div>  
          <SanityBlocks :blocks="content" class="px-sm-1 py-sm-1 pbottom"/>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'
import Logoicon from '~/components/Logoicon.vue'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'text'
    }
  }
})

// Extract text content
const content = computed(() => {
  return props.section?.textContent?.content || []
})

const columns = computed(() => {
  return props.section?.textContent?.columns || 6
})

// Optional title and image
const title = computed(() => {
  return props.section?.textContent?.title || ''
})

const { getImageUrl } = useSanityImage()
const imageSource = computed(() => {
  return props.section?.textContent?.image || null
})
const imageUrl = computed(() => {
  return imageSource.value ? getImageUrl(imageSource.value) : null
})
const imageAlt = computed(() => {
  return imageSource.value?.alt || ''
})

// Split title functionality
const splitTitle = computed(() => {
  const textContent = props.section?.textContent
  if (!textContent?.splitTitle) return null
  
  return {
    left: textContent.splitTitleLeft || '',
    right: textContent.splitTitleRight || ''
  }
})
</script>

<style scoped>

.miniicon--logo {
  width: 100%;
}
.split-text-title {
  display: grid;
  align-items: end;
  grid-template-columns: 4fr .8fr 1.2fr .8fr 4fr;
}
.split-text-title {
 font-family: var(--heading);
 letter-spacing: 0.06em;
 text-transform: uppercase;
 font-size: calc((46 / (var(--unit-reference) / 100)) * var(--unit));
}
.split-text-title .left {
  text-align: right;
}
.split-text-title .right {
  text-align: left;
}
/* Split title styling handled by individual classes */

@media (max-width: 1023px) {
  .split-text-title {
    font-size: 5vw;
  }
}


.text-image {
  display: block;
  width: 100%;
  height: auto;
}

</style> 