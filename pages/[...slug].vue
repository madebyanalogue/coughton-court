<template>
  <div>
    <pre v-if="isDev" style="display: none">{{ JSON.stringify({ pageData, error, pending, slug: slug.value }, null, 2) }}</pre>
    <template v-if="error">
      <div class="wrapper py6">
        <h1>Error</h1>
        <p>{{ error.message }}</p>
        <p v-if="isDev">Status: {{ error.statusCode }}</p>
      </div>
    </template>
    <template v-else-if="pending">
      <div class="wrapper py6">
        <div class="loading-placeholder">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </template>
    <template v-else-if="pageData">
      <!-- Page Hero Image -->
      <PageHero 
        v-if="pageData?.enableHeroImage && pageData?.featuredImage"
        :featured-image="pageData.featuredImage"
        :enabled="!!pageData.enableHeroImage"
        :show-title="!!pageData.showTitleOverHero"
        :title="pageData.title"
        :enable-custom-title-and-button="!!pageData.enableCustomTitleAndButton"
        :custom-title="pageData.customTitle"
        :custom-button-title="pageData.customButtonTitle"
        :custom-button-link="pageData.customButtonLink"
        :enable-newsletter-signup="!!pageData.enableNewsletterSignup"
        :enable-cookies-banner="!!pageData.enableCookiesBanner"
      />
      
      <!-- Page Introduction -->
      <PageIntroduction 
        v-if="pageData?.enableIntroduction"
        :enabled="!!pageData.enableIntroduction"
        :title="pageData.introductionTitle"
        :content="pageData.introduction"
      />
      
      <template v-if="pageData?.sections?.length">
        <PageBuilder :sections="pageData.sections" :page-data="pageData" />
      </template>
    </template>
  </div>
</template> 

<script setup>
import { usePageSettings } from '~/composables/usePageSettings'
import { useRuntimeConfig } from '#app'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSanityImage } from '~/composables/useSanityImage'
import { useHead } from '#app'
import PageHero from '~/components/PageHero.vue'
import PageIntroduction from '~/components/PageIntroduction.vue'

const route = useRoute()
const config = useRuntimeConfig()

// Get the full path as the slug
const slug = computed(() => route.params.slug?.join('/') || '')

// Use the usePageSettings composable for consistency
const { page: pageData, error, pending } = usePageSettings()

// Call useSiteSettings once at setup level
const { title: websiteTitle, defaultMetaDescription, defaultOgImage } = useSiteSettings()
const { getImageUrl } = useSanityImage()

// Page meta - use page-specific SEO data if available, otherwise use defaults
useHead(() => {
  const pageTitle = pageData.value?.seo?.metaTitle || pageData.value?.title || 'Page Not Found'
  const fullTitle = pageData.value?.seo?.metaTitle 
    ? `${websiteTitle.value} | ${pageData.value.seo.metaTitle}`
    : `${websiteTitle.value} | ${pageData.value?.title || 'Page Not Found'}`
  
  const metaDescription = pageData.value?.seo?.metaDescription || defaultMetaDescription.value || ''
  
  // Get OG image - use page-specific if available, then featured image, then default
  let ogImageUrl = null
  if (pageData.value?.seo?.ogImage?.asset) {
    ogImageUrl = getImageUrl(pageData.value.seo.ogImage, { width: 1200, quality: 85 })
  } else if (pageData.value?.featuredImage?.asset) {
    ogImageUrl = getImageUrl(pageData.value.featuredImage, { width: 1200, quality: 85 })
  } else if (defaultOgImage.value?.asset) {
    ogImageUrl = getImageUrl(defaultOgImage.value, { width: 1200, quality: 85 })
  }
  
  const meta = []
  
  if (metaDescription) {
    meta.push({
      name: 'description',
      content: metaDescription
    })
  }
  
  if (ogImageUrl) {
    meta.push(
      {
        property: 'og:image',
        content: ogImageUrl
      },
      {
        property: 'og:image:width',
        content: '1200'
      },
      {
        property: 'og:image:height',
        content: '630'
      }
    )
  }
  
  meta.push(
    {
      property: 'og:title',
      content: fullTitle
    },
    {
      property: 'og:url',
      content: typeof window !== 'undefined' ? window.location.href : ''
    }
  )
  
  return {
    title: fullTitle,
    meta
  }
})

// Computed property for development mode
const isDev = computed(() => config.public.dev)
</script>

<style scoped>
.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--black);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
