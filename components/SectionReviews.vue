<template>
  <section :class="['section-reviews', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]" :style="{ '--section-bg': `var(--${backgroundColor})`, '--section-text': `var(--${textColor})` }">
    <div class="wrapper">
      <div class="reviews-container py2 py-sm-4">
        <div class="grid grid-4">
          <div
            v-for="(review, index) in items"
            :key="index"
            :class="getReviewClass(index)"
            class="review-item col-span-4 col-span-2-md"
          >
            <div class="review-content h4 grid grid-1 gap-125 text-center p1">
              <div v-if="review.showStars" class="review-stars">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118.93 19.26">
                  <polygon points="10.05 0 12.43 7.31 20.11 7.31 13.9 11.82 16.27 19.13 10.05 14.61 3.84 19.13 6.21 11.82 0 7.31 7.68 7.31 10.05 0"/>
                  <polygon points="35.02 .13 37.4 7.44 45.08 7.44 38.87 11.95 41.24 19.26 35.02 14.74 28.81 19.26 31.18 11.95 24.97 7.44 32.65 7.44 35.02 .13"/>
                  <polygon points="59.46 0 61.84 7.31 69.52 7.31 63.3 11.82 65.68 19.13 59.46 14.61 53.25 19.13 55.62 11.82 49.41 7.31 57.09 7.31 59.46 0"/>
                  <polygon points="84.43 .13 86.81 7.44 94.49 7.44 88.27 11.95 90.65 19.26 84.43 14.74 78.22 19.26 80.59 11.95 74.38 7.44 82.06 7.44 84.43 .13"/>
                  <polygon points="108.87 .13 111.24 7.44 118.93 7.44 112.71 11.95 115.09 19.26 108.87 14.74 102.66 19.26 105.03 11.95 98.82 7.44 106.5 7.44 108.87 .13"/>
                </svg>
              </div>
              <div class="review-text" v-if="review.reviewContent">
                <template v-if="review.showQuotes">
                  “<SanityBlocks :blocks="review.reviewContent" />”
                </template>
                <template v-else>
                  <SanityBlocks :blocks="review.reviewContent" />
                </template>
              </div>
              <div class="review-cite uppercase" v-if="review.cite">
                <cite v-if="review.cite">{{ review.cite }}</cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
             value._type === 'section' &&
             value.sectionType === 'reviews'
    }
  }
})

// Extract data from section
const backgroundColor = computed(() => props.section?.reviewsContent?.backgroundColor || 'white')
const textColor = computed(() => props.section?.reviewsContent?.textColor || 'dark-grey')
const items = computed(() => props.section?.reviewsContent?.items || [])

// Get CSS class for responsive layout
const getReviewClass = (index) => {
  const totalItems = items.value.length
  
  if (totalItems === 1) {
    return 'col-span-4 col-span-2-md col-start-2-md'
  } else if (totalItems % 2 === 1 && index === totalItems - 1) {
    // Last item in odd number of items - center it
    return 'col-span-4 col-span-2-md col-start-2-md'
  } else {
    // Regular 6-column layout
    return 'col-span-4 col-span-2-md px-md-4'
  }
}
</script>

<style scoped>


.sanity-blocks, .sanity-blocks > * {
  display:inline;
}

.review-stars svg {
  width:calc(var(--pad-1) * 4);
  margin:0 auto;
  display:block;
}
.review-stars svg > * {
  fill:currentColor;
}

/* Responsive adjustments */
@media (min-width: 1024px) {
.review-stars svg {
  width:calc(var(--pad-1) * 6);
}
}
</style>
