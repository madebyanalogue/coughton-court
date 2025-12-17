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
    
    <!-- Spline Testing Section - PageBuilder is dormant -->
    <!-- Show Spline even if pending/error for testing - SSR compatible -->
    <div class="spline-test-container">
      <!-- Add your Spline models here -->
      <div class="spline-section" v-for="(model, index) in splineModels" :key="index">
        <SplineModel 
          :scene="model.scene" 
          :container-class="model.containerClass"
          :container-style="model.containerStyle"
        />
      </div>
    </div>
    
    <!-- PageBuilder is commented out - uncomment when ready to use -->
    <!--
    <template v-if="pageData?.sections?.length">
      <PageBuilder :sections="pageData.sections" :page-data="pageData" />
    </template>
    -->
  </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { watch } from 'vue'
import { useRuntimeConfig } from '#app'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePageSettings } from '~/composables/usePageSettings'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { $sanity } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()

// Use the usePageSettings composable instead of duplicating the data fetching
const { page: pageData, error, pending } = usePageSettings()

// Get site settings once
const { title: websiteTitle } = useSiteSettings()

// Spline models configuration
// Add your Spline scene URLs or local file paths here
const splineModels = ref([
  // {
  //   // Robot 4 legs toon model
  //   scene: 'https://prod.spline.design/MQIiUj66nAWKsqDa/scene.splinecode',
  //   containerClass: 'spline-model-container',
  //   containerStyle: {
  //     width: '100%',
  //     height: '100vh' // Full viewport height
  //   }
  // }
  {
    scene: 'https://prod.spline.design/9g0Ad4sqfF-lHa2G/scene.splinecode',
    containerClass: 'spline-model-container',
    containerStyle: {
      width: '100%',
      height: '100vh' // Full viewport height
    }
  }
  // Add more models as needed:
  // {
  //   scene: 'https://prod.spline.design/your-scene-url.splinecode',
  //   containerClass: 'spline-model-container',
  //   containerStyle: {
  //     width: '100%',
  //     height: '600px'
  //   }
  // }
])

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

.spline-test-container {
  width: 100%;
  min-height: 100vh;
}

.spline-section {
  width: 100%;
  margin-bottom: 2rem;
}

.spline-model-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;
}
</style> 