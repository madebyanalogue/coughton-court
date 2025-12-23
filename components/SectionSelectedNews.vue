<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="grid grid-1 grid-md-2">
          <div v-for="newsItem in newsToShow" :key="newsItem._id" class="">
            <div class="grid grid-1">
              <NuxtImg 
                v-if="newsItem.featuredImage"
                :src="getImageUrl(newsItem.featuredImage)" 
                :alt="newsItem.title"
                class="square"
                data-image-overlay
              />
              <div class="grid grid-1 gap-1">
                <div class="h2">{{ newsItem.title }}</div>
                <SanityBlocks v-if="newsItem.content" :blocks="newsItem.content" />
                <div v-if="newsItem.offsiteUrl">
                  <a 
                      :href="newsItem.offsiteUrl" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="btn" 
                      data-btn-hover
                    >
                      <span class="btn__text">{{ newsItem.linkTitle || 'Discover more' }}</span>
                      <div class="btn__circle"></div>
                  </a>
                </div>
                <!-- <div class="">
                  <div class="h5">{{ formatDate(post.publishedAt) }}</div>
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <div v-if="button && button.text && (button.page || button.url)" class="text-center py2">
          <NuxtLink v-if="button.page?.slug?.current" :to="`/${button.page.slug.current}`" class="btn" data-btn-hover>
            <span class="btn__text">{{ button.text }}</span>
            <div class="btn__circle"></div>
          </NuxtLink>
          <a v-else-if="button.url" :href="button.url" target="_blank" rel="noopener" class="btn" data-btn-hover>
            <span class="btn__text">{{ button.text }}</span>
            <div class="btn__circle"></div>
          </a>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const sectionRef = ref(null)

const title = computed(() => props.section?.selectedNewsContent?.title || 'News')
const button = computed(() => props.section?.selectedNewsContent?.button || null)
const selectedNews = computed(() => props.section?.selectedNewsContent?.news || [])
const newsToShow = ref([])

function getImageUrl(image) {
  const url = image?.asset?.url
  const mimeType = image?.asset?.mimeType
  if ((mimeType && mimeType === 'image/svg+xml') || (url && url.endsWith('.svg'))) {
    return url
  }
  // fallback: just use the url if present
  return url
}

onMounted(async () => {
  if (selectedNews.value.length > 0) {
    // Use selected news items from Sanity (limit to 2)
    newsToShow.value = selectedNews.value.slice(0, 2)
  } else {
    // Fetch latest 2 news posts if none selected
    const res = await $fetch('/api/sanity', { params: { type: 'news', limit: 2 } })
    newsToShow.value = res
  }
  
  // Dispatch event for image overlay plugin to re-initialize
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('news-loaded'))
  })
  
  // Register section for scroll animations
  if (sectionRef.value) {
    registerSection(`selected-news-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        // Simple fade-in animation
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
          })
        }
      }
    })
  }
})

// Clean up scroll trigger when component unmounts
onUnmounted(() => {
  unregisterSection(`selected-news-${props.section._id}`)
})
</script>

<style scoped>
/* Initial state for scroll animations */
section {
  opacity: 0;
}
</style> 