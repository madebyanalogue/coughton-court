<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
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
            :width="imageWidth"
            :height="imageHeight"
            loading="lazy"
            quality="85"
            format="webp"
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
const { getImageUrl, getImageDimensions } = useSanityImage()

// Get image dimensions for responsive sizing
const imageDimensions = computed(() => {
  if (!props.section?.imageContent?.image) return null
  return getImageDimensions(props.section.imageContent.image)
})

// Calculate responsive width based on column span
const imageWidth = computed(() => {
  const columns = props.section?.imageContent?.columns ?? 12
  // Calculate approximate width: 12 columns = 1920px, scale down proportionally
  const baseWidth = 1920
  return Math.round((baseWidth * columns) / 12)
})

const imageHeight = computed(() => {
  if (imageDimensions.value) {
    // Maintain aspect ratio
    const aspectRatio = imageDimensions.value.height / imageDimensions.value.width
    return Math.round(imageWidth.value * aspectRatio)
  }
  return null
})

// Get the image URL using the Sanity image builder with optimization
const imageUrl = computed(() => {
  if (!props.section?.imageContent?.image) return null
  return getImageUrl(props.section.imageContent.image, {
    width: imageWidth.value,
    quality: 85
  })
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