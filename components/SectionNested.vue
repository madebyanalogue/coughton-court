<template>
  <section :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">
      <div class="relative py6">
        <div class="cover object-fit-child show-md">
          <NuxtImg 
            :src="getImageUrl(section.nestedContent.mainImage)" 
            :alt="section.title"
            loading="lazy"
          />
        </div>
        <div class="hide-md">
          <NuxtImg 
            :src="getImageUrl(section.nestedContent.mainImage)" 
            :alt="section.title"
            loading="lazy"
          />
        </div>
        <div class="grid">
          <div 
            class="col-span-12 col-span-6-md col-start-4-md" 
            :class="[
              section.nestedContent.backgroundColor,
              section.nestedContent.textColor === 'white' ? 'white-text' : '',
              'p2'
            ]"
          >
            <div v-if="section.nestedContent.iconImage" class="grid">
              <div class="col-span-2">
                <NuxtImg 
                  :src="getImageUrl(section.nestedContent.iconImage)"
                  :alt="`${section.title} icon`"
                  loading="lazy"
                />
              </div>
            </div>
            <div v-if="section.nestedContent.iconImage" class="py2"></div>
            <div class="h4 rte" v-html="formatContent(section.nestedContent.content)"></div>
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
      return value && value._type === 'section' && value.sectionType === 'nested'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Helper function to format content with paragraphs
const formatContent = (content) => {
  if (!content) return ''
  return content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')
}
</script>

<style scoped>
.medium {
  background-color: var(--color-medium);
}
.white-text {
  color: var(--color-white);
}
</style> 