<template>
  <div :class="['page-builder', { 'pbottom': removeTopPadding }]">
    <template v-for="(section, index) in sections" :key="section._id || index">
      <!-- Pass sectionId to each section component -->
      
      <SectionHero
        v-if="section._type === 'section' && section.sectionType === 'hero'"
        :section="section"
        :isFirstSection="index === 0"
      />

      <SectionBasicPage
        v-else-if="section._type === 'section' && section.sectionType === 'basicPage'"
        :section="section"
      />

      <SectionImage
        v-else-if="section._type === 'section' && section.sectionType === 'image'"
        :section="section"
      />

      <SectionHeadline
        v-else-if="section._type === 'section' && section.sectionType === 'headline'"
        :section="section"
      />

      <SectionContact
        v-else-if="section._type === 'section' && section.sectionType === 'contact'"
        :section="section"
      />

      <SectionBasicContent
        v-else-if="section._type === 'section' && section.sectionType === 'basicContent'"
        :section="section"
      />

      <SectionHomeScroll
        v-else-if="
          section._type === 'section' &&
          section.sectionType === 'homeScroll' &&
          section.homeScrollContent &&
          Array.isArray(section.homeScrollContent.items) &&
          section.homeScrollContent.items.length > 0
        "
        :section="section"
      />



      <!-- Two Column Section -->
      <SectionTwoColumn v-else-if="section._type === 'section' && section.sectionType === 'sectionTwoColumn'" v-bind="section.twoColumnContent" />

      <!-- Nested Section -->
      <SectionNested v-else-if="section._type === 'section' && section.sectionType === 'nested'" :section="section" />

      <!-- Banner Section -->
      <SectionBanner v-else-if="section._type === 'section' && section.sectionType === 'banner'" :section="section" />

      <!-- News Section -->
      <SectionNews v-else-if="section._type === 'section' && section.sectionType === 'news'" :section="section" />

      <!-- Services Section -->
      <SectionServices
        v-else-if="section._type === 'section' && section.sectionType === 'services'"
        :section="section"
      />

      <SectionService
        v-else-if="section._type === 'section' && section.sectionType === 'service'"
        :section="section"
      />

      <!-- USPs Section -->
      <SectionUsps
        v-else-if="section._type === 'section' && section.sectionType === 'usps'"
        :section="section"
      />

      <!-- Selected News Section -->
      <SectionSelectedNews
        v-else-if="section._type === 'section' && section.sectionType === 'selectedNews'"
        :section="section"
      />

      <!-- Selected Pages Section -->
      <SectionSelectedPages
        v-else-if="section._type === 'section' && section.sectionType === 'selectedPages'"
        :section="section"
      />

      <!-- Gardens Section -->
      <SectionGardens
        v-else-if="section._type === 'section' && section.sectionType === 'gardens'"
        :section="section"
      />

      <!-- Events Section -->
      <SectionEvents
        v-else-if="section._type === 'section' && section.sectionType === 'events'"
        :section="section"
      />

      <!-- Carousel Section -->
      <SectionCarousel
        v-else-if="section._type === 'section' && section.sectionType === 'carousel'"
        :section="section"
      />

      <!-- FAQs Section -->
      <SectionFAQs
        v-else-if="section._type === 'section' && section.sectionType === 'faqs'"
        :section="section"
      />

      <!-- Contact Form Section -->
      <SectionContactForm
        v-else-if="section._type === 'section' && section.sectionType === 'contactForm'"
        :section="section"
      />

      <!-- Directions Section -->
      <SectionDirections
        v-else-if="section._type === 'section' && section.sectionType === 'directions'"
        :section="section"
      />

      <!-- Opening Times and Prices Section -->
      <SectionOpeningTimesAndPrices
        v-else-if="section._type === 'section' && section.sectionType === 'openingTimesAndPrices'"
        :section="section"
      />

      <!-- Quote Section -->
      <SectionQuote
        v-else-if="section._type === 'section' && section.sectionType === 'quote'"
        :section="section"
      />

      <!-- Google Map Section -->
      <SectionGoogleMap
        v-else-if="section._type === 'section' && section.sectionType === 'googleMap'"
        :section="section"
      />

      <!-- Gallery Section -->
      <SectionGallery
        v-else-if="section._type === 'section' && section.sectionType === 'gallery'"
        :section="section"
      />

      <!-- Text Section -->
      <SectionText
        v-else-if="section._type === 'section' && section.sectionType === 'text'"
        :section="section"
      />

      <!-- Dual Carousel Section -->
      <SectionDualCarousel
        v-else-if="section._type === 'section' && section.sectionType === 'dualCarousel'"
        :section="section"
      />

      <!-- Single Carousel Section -->
      <SectionSingleCarousel
        v-else-if="section._type === 'section' && section.sectionType === 'singleCarousel'"
        :section="section"
      />

      <!-- Team Section -->
      <SectionTeam
        v-else-if="section._type === 'section' && section.sectionType === 'team'"
        :section="section"
      />

      <!-- Marquee Section -->
      <SectionMarquee
        v-else-if="section._type === 'section' && section.sectionType === 'marquee'"
        :section="section"
        :repeat-count="section.marqueeContent?.repeatCount ?? 10"
        :marquee-speed="section.marqueeContent?.marqueeSpeed ?? 15"
        :reverse="section.marqueeContent?.reverse ?? false"
      />

      <!-- Service Links Section -->
      <SectionServiceLinks
        v-else-if="section._type === 'section' && section.sectionType === 'serviceLinks'"
        :section="section"
      />

      <!-- Section Images -->
      <SectionImages
        v-else-if="section._type === 'section' && section.sectionType === 'sectionImages'"
        :section="section"
      />

      <!-- Tips From The Table -->
      <SectionTipsFromTheTable
        v-else-if="section._type === 'section' && section.sectionType === 'sectionTipsFromTheTable'"
        :section="section"
      />

      <!-- Reviews Section -->
      <SectionReviews
        v-else-if="section._type === 'section' && section.sectionType === 'reviews'"
        :section="section"
      />

      <!-- Instagram Section -->
      <SectionInstagram
        v-else-if="section._type === 'section' && section.sectionType === 'sectionInstagram'"
        :section="section"
      />

      <!-- Galleries Section -->
      <SectionGalleries
        v-else-if="section._type === 'section' && section.sectionType === 'sectionGalleries'"
        :section="section"
      />

      <!-- Horizontal Carousel Section -->
      <SectionHorizontalCarousel
        v-else-if="section._type === 'section' && section.sectionType === 'horizontalCarousel'"
        :section="section"
      />

      <!-- Fallback for empty or misconfigured Home Scroll Section -->
      <div
        v-else-if="section._type === 'section' && section.sectionType === 'homeScroll'"
        class="wrapper py6"
      >
        <div class="grid">
          <div class="col-span-12">
            <p class="error">Home Scroll section is empty or misconfigured.</p>
          </div>
        </div>
      </div>

      <!-- Fallback for unknown section types -->
      <div v-else class="wrapper py6">
        <div class="grid">
          <div class="col-span-12">
            <p class="error">Unknown section type: {{ section._type }} - {{ section.sectionType }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { usePageSettings } from '~/composables/usePageSettings'
import SectionHero from '~/components/SectionHero.vue'
import SectionBasicPage from '~/components/SectionBasicPage.vue'
import SectionImage from '~/components/SectionImage.vue'
import SectionHeadline from '~/components/SectionHeadline.vue'
import SectionContact from '~/components/SectionContact.vue'
import SectionBasicContent from '~/components/SectionBasicContent.vue'
import SectionHomeScroll from '~/components/SectionHomeScroll.vue'
import SectionTwoColumn from '~/components/SectionTwoColumn.vue'
import SectionNested from '~/components/SectionNested.vue'
import SectionBanner from '~/components/SectionBanner.vue'
import SectionNews from '~/components/SectionNews.vue'
import SectionServices from '~/components/SectionServices.vue'
import SectionService from '~/components/SectionService.vue'
import SectionSelectedNews from '~/components/SectionSelectedNews.vue'
import SectionSelectedPages from '~/components/SectionSelectedPages.vue'
import SectionUsps from '~/components/SectionUsps.vue'
import SectionQuote from '~/components/SectionQuote.vue'
import SectionGoogleMap from '~/components/SectionGoogleMap.vue'
import SectionGallery from '~/components/SectionGallery.vue'
import SectionText from '~/components/SectionText.vue'
import SectionDualCarousel from '~/components/SectionDualCarousel.vue'
import SectionSingleCarousel from '~/components/SectionSingleCarousel.vue'
import SectionTeam from '~/components/SectionTeam.vue'
import SectionMarquee from '~/components/SectionMarquee.vue'
import SectionServiceLinks from '~/components/SectionServiceLinks.vue'
import SectionImages from '~/components/SectionImages.vue'
import SectionTipsFromTheTable from '~/components/SectionTipsFromTheTable.vue'
import SectionReviews from '~/components/SectionReviews.vue'
import SectionInstagram from '~/components/SectionInstagram.vue'
import SectionGalleries from '~/components/SectionGalleries.vue'
import SectionHorizontalCarousel from '~/components/SectionHorizontalCarousel.vue'

const props = defineProps({
  sections: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(section => 
        section && 
        typeof section === 'object' && 
        section._type === 'section' && 
        typeof section.sectionType === 'string'
      )
    }
  },
  pageData: {
    type: Object,
    required: false,
    default: null
  }
})

// Get page settings for removeTopPadding - only if pageData prop is not provided
const pageSettings = computed(() => {
  if (!props.pageData) {
    return usePageSettings()
  }
  return null
})

// Use page data prop if available, otherwise fall back to composable
const removeTopPadding = computed(() => {
  if (props.pageData && props.pageData.removeTopPadding !== undefined) {
    return props.pageData.removeTopPadding
  }
  return pageSettings.value?.useRemoveTopPadding?.value || false
})

// Grey background setting
const greyBackground = computed(() => {
  return props.pageData?.greyBackground || false
})

// Apply grey background to body when component mounts
onMounted(() => {
  if (greyBackground.value) {
    document.body.style.setProperty('--initial-bg-light', 'var(--grey)')
  } else {
    document.body.style.removeProperty('--initial-bg-light')
  }
})

// Watch for changes in grey background setting
watch(greyBackground, (newValue) => {
  if (newValue) {
    document.body.style.setProperty('--initial-bg-light', 'var(--grey)')
  } else {
    document.body.style.removeProperty('--initial-bg-light')
  }
})

// Clean up on unmount
onUnmounted(() => {
  document.body.style.removeProperty('--initial-bg-light')
})


</script>

<style scoped>
.page-builder {
  width: 100%;
}

.error {
  color: red;
  padding: var(--unit);
  border: 1px solid red;
  border-radius: 4px;
}
</style> 