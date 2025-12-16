<template>
  <div
    v-if="logotypeImageUrl && isSvg"
    ref="svgContainer"
    class="logo-image logo-svg"
    :aria-label="logotypeAlt || websiteTitle"
    role="img"
  />
  <img
    v-else-if="logotypeImageUrl && !isSvg"
    :src="logotypeImageUrl"
    :alt="logotypeAlt || websiteTitle"
    class="logo-image"
  />
  <svg
    v-else
    id="a"
    class="icon--logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 814.7"
    fill="currentColor"
  >
    <path d="M310.93,200.08c0,61.16-49.71,110.92-110.85,111h0c-53.1,0-96.29,43.19-96.29,96.28s43.2,96.28,96.29,96.28h0c61.13.07,110.85,49.84,110.85,110.99s-49.79,111-111,111v11.24c67.4,0,122.23-54.84,122.23-122.23s-54.84-122.23-122.23-122.23h0c-46.83-.07-84.91-38.19-84.91-85.04s38.08-84.98,84.91-85.05h0c67.4,0,122.23-54.83,122.23-122.22s-54.84-122.24-122.23-122.24v11.24c61.21,0,111,49.8,111,111.01Z"/>
    <path d="M284.97,200.08c0,46.85-38.07,84.97-84.9,85.04h0c-67.41,0-122.24,54.83-122.24,122.23s54.84,122.23,122.24,122.23h0c46.82.07,84.9,38.19,84.9,85.04s-38.15,85.06-85.04,85.06v11.24c53.09,0,96.28-43.19,96.28-96.29s-43.19-96.28-96.28-96.28h0c-61.14-.07-110.86-49.83-110.86-110.99s49.71-110.93,110.86-111.01h0c53.09,0,96.28-43.19,96.28-96.27s-43.19-96.29-96.28-96.29v11.24c46.9,0,85.04,38.16,85.04,85.05Z"/>
    <path d="M336.88,200.08c0,75.46-61.36,136.86-136.8,136.94h0c-38.78,0-70.33,31.55-70.33,70.34s31.55,70.33,70.33,70.33h0c75.44.07,136.8,61.48,136.8,136.94s-61.44,136.95-136.95,136.95v11.24c81.71,0,148.19-66.48,148.19-148.19s-66.48-148.18-148.19-148.18h0c-32.52-.07-58.95-26.55-58.95-59.08s26.43-59.03,58.95-59.11h0c81.71,0,148.19-66.47,148.19-148.17S281.64,51.89,199.93,51.89v11.24c75.51,0,136.95,61.44,136.95,136.96Z"/>
    <path d="M362.82,200.08c0,89.81-73.08,162.88-162.89,162.88-24.4.08-44.23,19.97-44.23,44.4s19.83,44.29,44.23,44.38c89.82,0,162.89,73.08,162.89,162.89s-73.08,162.89-162.89,162.89v11.24c96.02,0,174.13-78.11,174.13-174.13s-78.03-174.04-173.98-174.13c-18.28,0-33.15-14.87-33.15-33.14s14.87-33.16,33.15-33.16c95.94-.09,173.98-78.16,173.98-174.12S295.94,25.94,199.93,25.94v11.24c89.82,0,162.89,73.08,162.89,162.9Z"/>
    <path d="M259.02,200.08c0,32.54-26.43,59.01-58.94,59.09h0c-81.71,0-148.18,66.47-148.18,148.19s66.47,148.19,148.18,148.19v-.02c32.51.08,58.94,26.56,58.94,59.1s-26.51,59.1-59.09,59.1v11.24c38.78,0,70.33-31.55,70.33-70.34s-31.55-70.34-70.33-70.34v.02c-75.44-.08-136.8-61.48-136.8-136.95s61.36-136.87,136.8-136.96h0c38.78,0,70.33-31.54,70.33-70.32s-31.55-70.35-70.33-70.35v11.24c32.58,0,59.09,26.52,59.09,59.11Z"/>
    <path d="M199.93,414.56c-3.97,0-7.2-3.23-7.2-7.2s3.23-7.21,7.2-7.21c110.32,0,200.07-89.75,200.07-200.07S310.25,0,199.93,0v11.24c104.12,0,188.83,84.71,188.83,188.84s-84.71,188.83-188.83,188.83c-10.16,0-18.44,8.27-18.44,18.44s8.27,18.43,18.44,18.43c104.12,0,188.83,84.71,188.83,188.83s-84.71,188.83-188.83,188.83v11.24c110.32,0,200.07-89.75,200.07-200.07s-89.75-200.07-200.07-200.07Z"/>
    <path d="M233.07,200.08c0,18.27-14.87,33.14-33.14,33.14-95.94.09-173.98,78.17-173.98,174.14s78.04,174.03,173.98,174.12c18.28,0,33.14,14.88,33.14,33.15s-14.87,33.15-33.14,33.15v11.24c24.47,0,44.38-19.91,44.38-44.39s-19.83-44.31-44.23-44.39c-89.82,0-162.89-73.07-162.89-162.88s73.07-162.9,162.89-162.9c24.4-.08,44.23-19.96,44.23-44.38s-19.91-44.4-44.38-44.4v11.24c18.28,0,33.14,14.88,33.14,33.16Z"/>
    <path d="M207.28,614.63c0,3.98-3.23,7.21-7.2,7.21v11.24c10.17,0,18.44-8.28,18.44-18.44s-8.27-18.43-18.44-18.43c-104.13,0-188.84-84.71-188.84-188.83s84.71-188.84,188.84-188.84c10.17,0,18.44-8.27,18.44-18.44s-8.27-18.44-18.44-18.44v11.23c3.97,0,7.2,3.23,7.2,7.21s-3.23,7.2-7.2,7.2C89.75,207.28,0,297.03,0,407.36s89.75,200.07,200.08,200.07c3.97,0,7.2,3.23,7.2,7.2Z"/>
  </svg>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
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
.logo-image {
  width: 127px;
  height: 70px;
  display: block;
  object-fit: contain;
}

.logo-svg {
  width: 127px;
  height: 70px;
  display: block;
}

.logo-svg :deep(svg) {
  width: 127px;
  height: 70px;
  display: block;
}
</style>