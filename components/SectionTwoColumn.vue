<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="">
      <div 
        class="grid middle-xs" 
        style="gap:0;" 
        :class="{ 'grid-reverse': imageRight }"
        :style="{
          backgroundColor: backgroundColor ? `var(--${backgroundColor})` : 'var(--beige)',
          color: textColor ? `var(--${textColor})` : 'var(--dark-grey)'
        }"
      >

        <div class="col-span-12 col-span-6-md image--column">
          <div class="image-container">
            <NuxtImg 
              v-if="mainImage" 
              :src="getOptimizedImage(mainImage, { width: 1400 })" 
              :alt="mainImage.alt || 'Main image'" 
              sizes="(max-width: 799px) 100vw, 50vw"
              loading="lazy"
            />
            <div v-if="overlayImage" class="overlay-image">
              <NuxtImg 
                :src="getOptimizedImage(overlayImage, { width: 1200, fit: 'max' })" 
                :alt="overlayImage.alt || 'Overlay image'"
                class="overlay-img"
                sizes="(max-width: 799px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div class="col-span-12 col-span-6-md text--column gap-3" :class="{ 'has-text-image': textImage, 'pw p3-sm' : !enableBookingButton}">
          <div class="booking--buttons" v-if="enableBookingButton">
            <SectionMarquee />
            <SectionMarquee :reverse="true" class="show-md" />
            <SectionMarquee class="show-md" />
          </div>
          <div class="text-image-container" v-if="textImage && !enableBookingButton">
            <NuxtImg 
              :src="getOptimizedImage(textImage, { width: 900, fit: 'max' })" 
              :alt="textImage.alt || 'Text image'" 
              class="text-image"
              sizes="(max-width: 799px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div class="text-content" v-if="text && !enableBookingButton">
            <div class="">
              <SanityBlocks :blocks="text" class="h4 rte" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'
import SectionMarquee from '~/components/SectionMarquee.vue'
import { useSanityImage } from '~/composables/useSanityImage'

// Define props based on the Sanity schema
const props = defineProps({
  mainImage: {
    type: Object,
    default: null
  },
  overlayImage: {
    type: Object,
    default: null
  },
  roundalImage: {
    type: Object,
    default: null
  },
  includeLogo: {
    type: Boolean,
    default: false
  },
  logoImage: {
    type: Object,
    default: null
  },
  text: {
    type: [String, Array],
    default: ''
  },
  enableBookingButton: {
    type: Boolean,
    default: false
  },
  imageRight: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: 'white'
  },
  textColor: {
    type: String,
    default: 'black'
  },
  textImage: {
    type: Object,
    default: null
  }
})

const { getImageUrl } = useSanityImage()

const getOptimizedImage = (image, options = {}) => {
  if (!image) return ''
  return getImageUrl(image, {
    width: options.width || 1400,
    quality: 80,
    fit: options.fit || 'crop',
    crop: options.crop || 'focalpoint'
  })
}
</script>

<style scoped>
.grid {
  background-color: var(--grey);
}

.image--column {
  aspect-ratio: 1/1;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text--column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  height: 100%;
}

.text--column.has-text-image {
  justify-content: space-between;
}

.booking--buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
}

.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.overlay-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.text-content {
  width: 100%;
}

.text-image-container {
  width: 100%;
}

.text-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

</style> 