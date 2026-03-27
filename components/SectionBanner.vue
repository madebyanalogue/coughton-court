<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="relative py9">
        <div v-if="section.bannerContent?.image" class="cover object-fit-child">
          <NuxtImg 
            :src="getImageUrl(section.bannerContent.image, { width: 1920, quality: 85 })" 
            :alt="section.title" 
            width="1920"
            quality="85"
            format="webp"
            sizes="100vw"
            loading="lazy" 
            data-image-overlay 
          />
        </div>
        <div class="grid grid-center-items">
          <div class="col-span-12 col-span-6-md white-text-md">
            <div v-if="section.bannerContent?.content" class="h2" v-html="formatContent(section.bannerContent.content)"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => value && value._type === 'section' && value.sectionType === 'banner'
  }
})

const { getImageUrl } = useSanityImage()

const formatContent = (content) => {
  if (!content) return ''
  return content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')
}
</script>

<style scoped>

</style> 