<template>
  <section :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">
      <div
        class="grid"
        :class="alignmentClass"
      >
        <div :class="colClass">
          <NuxtImg
            v-if="imageUrl"
            :src="imageUrl"
            :alt="section.imageContent.alt"
            :style="imgStyle"
            :class="{ 'constrain-height': section.imageContent?.constrainHeight }"
            loading="lazy"
            data-image-overlay
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({ section: Object })
const { getImageUrl } = useSanityImage()

// Get the image URL using the Sanity image builder
const imageUrl = computed(() => {
  if (!props.section?.imageContent?.image) return null
  return getImageUrl(props.section.imageContent.image)
})

// Column class
const colClass = computed(() => {
  const columns = props.section?.imageContent?.columns ?? 12
  return `col-span-12 col-span-${columns}-md`
})

// Alignment classes
const alignmentClass = computed(() => {
  const alignment = props.section?.imageContent?.alignment ?? 'center'
  switch (alignment) {
    case 'left':
      return 'grid-start-items'
    case 'center':
      return 'grid-center-items'
    case 'right':
      return 'grid-end-items'
    default:
      return ''
  }
})

// Constrain height style
const imgStyle = computed(() =>
  props.section?.imageContent?.constrainHeight
    ? 'width:auto;max-height:100svh;margin:0 auto;'
    : ''
)
</script>

<style scoped>
.constrain-height {
  max-height: 100svh;
  width: auto;
  margin: 0 auto;
}
</style>