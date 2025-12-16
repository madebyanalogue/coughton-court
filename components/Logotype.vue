<template>
  <div
    v-if="logotypeImageUrl && isSvg"
    ref="svgContainer"
    class="logotype-image logotype-svg"
    :aria-label="logotypeAlt || websiteTitle"
    role="img"
  />
  <img
    v-else-if="logotypeImageUrl && !isSvg"
    :src="logotypeImageUrl"
    :alt="logotypeAlt || websiteTitle"
    class="logotype-image"
  />
  <svg
    v-else
    data-name="SVG"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3950 300"
    :aria-label="websiteTitle"
    role="img"
    fill="currentColor"
  >
    <title>{{ websiteTitle }}</title>
    <path d="M260.97,254.99c-6.56,6.51-15.47,13-26.79,19.37-11.3,6.45-24.28,11.77-38.97,16.17-14.72,4.34-30.42,6.54-47.02,6.54-20.7,0-40-3.5-57.97-10.42-18.01-6.92-33.71-16.82-47.2-29.59-13.47-12.8-23.97-28.27-31.44-46.38C4.08,192.52.33,172.37.33,150.04c0-20.97,3.97-40.36,11.87-58.02,7.88-17.71,18.85-33.12,32.89-46.19,13.99-13.05,29.99-23.2,48.02-30.41,17.95-7.24,36.96-10.83,57.13-10.83,16.88,0,32.72,2.39,47.62,7.13,14.82,4.77,27.99,10.85,39.6,18.2,11.56,7.32,20.75,15.08,27.56,23.3l-28.17,33.47c-12.03-11.15-25.26-20.4-39.81-27.59-14.58-7.19-30.72-10.8-48.42-10.8s-34.07,4.04-49.86,12.21c-15.77,8.17-28.66,19.91-38.57,35.16-9.96,15.24-14.92,33.39-14.92,54.36,0,22.87,5.14,41.91,15.3,57.16,10.23,15.24,23.53,26.77,40.02,34.5,16.51,7.78,34.26,11.64,53.34,11.64s36.08-3.74,50.24-11.2c14.12-7.52,25.83-15.3,35.11-23.52l21.67,36.37Z" fill="currentColor" />
    <polygon points="557.93 7.06 557.93 129.97 392.49 129.97 392.49 7.06 348.36 7.06 348.36 292.97 392.49 292.97 392.49 172.45 557.93 172.45 557.93 292.97 602.07 292.97 602.07 7.06 557.93 7.06" fill="currentColor" />
    <polygon points="709.48 7.06 709.48 292.97 912.5 292.97 912.5 250.52 753.61 250.52 753.61 167.54 890.03 167.54 890.03 125.11 753.61 125.11 753.61 49.54 912.5 49.54 912.5 7.06 709.48 7.06" fill="currentColor" />
    <polygon points="1010.93 7.06 1010.93 292.97 1211.89 292.97 1211.89 250.52 1055.07 250.52 1055.07 7.06 1010.93 7.06" fill="currentColor" />
    <path d="M1313.19,205.95c13.09,16.38,26.83,29.05,41.27,38.03,14.44,8.98,32.54,13.49,54.33,13.49,11.18,0,21.92-1.6,32.25-4.75,10.39-3.12,18.8-7.7,25.33-13.89,6.52-6.1,9.81-13.78,9.81-23.03,0-13.62-6.81-23.63-20.45-30.05-13.6-6.4-32.66-11.48-57.15-15.33-30.81-5.13-55.23-14.33-73.34-27.56-18.11-13.21-27.14-32.63-27.14-58.21,0-16.87,5.03-31.41,15.08-43.67,10.05-12.29,23.41-21.65,40.02-28.21,16.61-6.51,34.88-9.82,54.73-9.82,25.11,0,46.78,4.37,65.16,13.08,18.39,8.71,32.78,21.08,43.11,37.22l-30.22,31.41c-8.72-12.51-19.69-22.65-32.89-30.44-13.2-7.76-28.67-11.64-46.41-11.64s-32.56,3.47-44.68,10.44c-12.11,6.92-18.16,16.65-18.16,29.19,0,14.46,6.39,24.79,19.14,31.06,12.83,6.27,29.86,11.15,51.11,14.7,13.92,2.17,27.22,5.12,40.04,8.98,12.8,3.8,24.28,8.76,34.49,14.87,10.22,6.19,18.28,13.65,24.33,22.52,5.95,8.84,9.01,19.69,9.01,32.44,0,18.28-4.72,34.13-14.15,47.61-9.39,13.51-22.8,23.95-40.22,31.44-17.42,7.49-37.98,11.26-61.73,11.26-25.02,0-47.74-4.39-68.2-13.1-20.44-8.68-38.38-22.84-53.88-42.43l29.39-35.59Z" fill="currentColor" />
    <polygon points="1610.16 7.06 1610.16 292.97 1813.19 292.97 1813.19 250.52 1654.3 250.52 1654.3 167.54 1790.69 167.54 1790.69 125.11 1654.3 125.11 1654.3 49.54 1813.19 49.54 1813.19 7.06 1610.16 7.06" fill="currentColor" />
    <path d="M2001.49,112.44l-29.42,68.63h102.92l-30.19-70.26c-3.58-9.03-7.11-18.23-10.63-27.59-3.53-9.41-7.09-19.12-10.59-29.24-3.87,10.36-7.53,20.45-11.03,30.27-3.53,9.79-7.26,19.21-11.06,28.18M2122.38,292.97l-29.35-69.45h-138.9l-29.87,69.45h-45.3L2001.07,7.06h47.79l121.31,285.91h-47.8Z" fill="currentColor" />
    <path d="M2550.15,167.16h-93.51v83.33h95.62c17.14,0,31.17-3.5,42.02-10.42,10.9-6.94,16.38-17.63,16.38-32.06,0-10.33-3.15-18.5-9.38-24.5-6.29-6.02-14.03-10.23-23.27-12.67-9.25-2.41-18.56-3.69-27.86-3.69M2543.23,49.54h-86.59v75.14h91.53c12.53-.27,23.57-3.69,33.09-10.17,9.55-6.56,14.27-15.87,14.27-27.8,0-13.37-5.01-22.9-15.08-28.62-10.04-5.72-22.46-8.54-37.22-8.54M2546.54,7.03c31.03,0,54.44,6.1,70.25,18.39,15.79,12.24,23.68,30.08,23.68,53.49,0,12.81-3.42,24.33-10.17,34.56-6.84,10.17-16.82,18.01-29.84,23.46,9.82,3.26,18.83,7.9,27.12,13.89,8.36,6.02,15.06,13.75,20.24,23.25,5.18,9.55,7.74,21.13,7.74,34.72,0,16.63-3.01,30.41-9.2,41.28-6.05,10.85-14.22,19.48-24.25,25.75-10.09,6.26-21.13,10.66-33.15,13.24-11.94,2.6-23.92,3.88-35.86,3.88h-140.57V7.03h134.01Z" fill="currentColor" />
    <polygon points="2742.23 7.06 2742.23 208.47 2742.23 292.97 2945.19 292.97 2945.19 250.52 2786.28 250.52 2786.28 167.54 2922.73 167.54 2922.73 125.11 2786.28 125.11 2786.28 49.54 2945.19 49.54 2945.19 7.06 2742.23 7.06" fill="currentColor" />
    <path d="M3133.47,112.44l-29.35,68.63h102.91l-30.19-70.26c-3.53-9.03-7.1-18.23-10.64-27.59-3.58-9.41-7.16-19.12-10.63-29.24-3.83,10.36-7.49,20.45-11.04,30.27-3.53,9.79-7.19,19.21-11.06,28.18M3254.43,292.97l-29.4-69.45h-138.89l-29.84,69.45h-45.36L3133.12,7.06h47.79l121.31,285.91h-47.8Z" fill="currentColor" />
    <path d="M3608.62,254.99c-6.56,6.51-15.49,13-26.77,19.37-11.31,6.45-24.31,11.77-39,16.17-14.73,4.34-30.38,6.54-46.98,6.54-20.72,0-40.01-3.5-58-10.42-18.01-6.92-33.74-16.82-47.2-29.59-13.46-12.8-23.95-28.27-31.47-46.38-7.46-18.15-11.23-38.31-11.23-60.63,0-20.97,3.99-40.36,11.88-58.02,7.87-17.71,18.85-33.12,32.88-46.19,13.99-13.05,30.03-23.2,47.95-30.41,18.01-7.24,37.06-10.83,57.21-10.83,16.9,0,32.74,2.39,47.55,7.13,14.89,4.77,28.05,10.85,39.66,18.2,11.56,7.32,20.78,15.08,27.56,23.3l-28.16,33.47c-11.99-11.15-25.25-20.4-39.82-27.59-14.59-7.19-30.7-10.8-48.45-10.8s-34.01,4.04-49.8,12.21c-15.82,8.17-28.67,19.91-38.63,35.16-9.92,15.24-14.92,33.39-14.92,54.36,0,22.87,5.13,41.91,15.35,57.16,10.2,15.24,23.57,26.77,40.01,34.5,16.52,7.78,34.29,11.64,53.36,11.64s36.08-3.74,50.24-11.2c14.13-7.52,25.82-15.3,35.1-23.52l21.67,36.37Z" fill="currentColor" />
    <polygon points="3905.51 7.06 3905.51 129.97 3740.15 129.97 3740.15 7.06 3695.99 7.06 3695.99 292.97 3740.15 292.97 3740.15 172.45 3905.51 172.45 3905.51 292.97 3949.67 292.97 3949.67 7.06 3905.51 7.06" fill="currentColor" />
  </svg>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSanityImage } from '~/composables/useSanityImage'

const { title, logotype } = useSiteSettings()
const { getImageUrl } = useSanityImage()
const websiteTitle = computed(() => title.value || 'Coughton Court')
const logotypeImageUrl = computed(() => {
  if (!logotype.value) return null
  return getImageUrl(logotype.value)
})
const logotypeAlt = computed(() => logotype.value?.alt || websiteTitle.value)

// Check if the logo is an SVG
const isSvg = computed(() => {
  if (!logotype.value?.asset) return false
  
  // Check MIME type from asset
  const mimeType = logotype.value.asset.mimeType || logotype.value.asset._type
  if (mimeType && mimeType.includes('svg')) {
    return true
  }
  
  // Check URL extension
  const url = logotypeImageUrl.value
  if (!url) return false
  const urlLower = url.toLowerCase()
  return urlLower.endsWith('.svg') || urlLower.includes('.svg?') || urlLower.includes('image/svg+xml')
})

// Template ref for SVG container
const svgContainer = ref(null)

// Fetch and render SVG content via proxy to avoid CORS
const loadSvg = async (url) => {
  if (!svgContainer.value) return
  
  try {
    // Use the proxy endpoint to avoid CORS issues
    const proxyUrl = `/api/proxy-svg?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const svg = await response.text()
    svgContainer.value.innerHTML = svg
  } catch (error) {
    if (svgContainer.value) {
      svgContainer.value.innerHTML = ''
    }
  }
}

watch([logotypeImageUrl, isSvg], async ([url, isSvgFile]) => {
  if (url && isSvgFile && svgContainer.value) {
    await loadSvg(url)
  } else if (svgContainer.value) {
    svgContainer.value.innerHTML = ''
  }
}, { immediate: true })

onMounted(() => {
  if (logotypeImageUrl.value && isSvg.value && svgContainer.value) {
    loadSvg(logotypeImageUrl.value)
  }
})
</script>

<style scoped>
.logotype-image {
  width: 149px;
  height: 70px;
  display: block;
  object-fit: contain;
}

.logotype-svg {
  width: 149px;
  height: 70px;
  display: block;
}

.logotype-svg :deep(svg) {
  width: 149px;
  height: 70px;
  display: block;
}
</style>