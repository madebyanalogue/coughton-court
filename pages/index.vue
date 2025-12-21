<template>
  <div>
    <pre v-if="isDev" style="display: none">{{ JSON.stringify({ pageData, error, pending }, null, 2) }}</pre>
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
      
    <template v-if="pageData?.sections?.length">
      <PageBuilder :sections="pageData.sections" :page-data="pageData" />
      </template>
    </template>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRuntimeConfig } from '#app'
import { computed } from 'vue'
import { usePageSettings } from '~/composables/usePageSettings'
import { useSiteSettings } from '~/composables/useSiteSettings'

const config = useRuntimeConfig()

// Use the usePageSettings composable instead of duplicating the data fetching
const { page: pageData, error, pending } = usePageSettings()

// Get site settings once
const { title: websiteTitle } = useSiteSettings()


// Watch for changes in pageData to update title
watch(() => pageData.value, (newData) => {
  if (newData) {
    const pageTitle = newData.title || 'Home'
    const fullTitle = `${websiteTitle.value} | ${pageTitle}`
    useHead({
      title: fullTitle
    })
  }
}, { immediate: true })

// Page meta
useHead(() => {
  const title = pageData.value?.title || 'Home';
  return { 
    title: `${websiteTitle.value} | ${title}`
  };
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