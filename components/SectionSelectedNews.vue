<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1 py-md-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="grid grid-1 grid-md-3 gap-3">
          <div v-for="newsItem in newsToShow" :key="newsItem._id" class="news-card">
            <NuxtLink 
              v-if="newsItem.slug?.current" 
              :to="`/news/${newsItem.slug.current}`" 
              class="news-link"
            >
              <div class="grid grid-1 gap-1">
                <div class="h6 medium">{{ newsItem.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="newsItem.featuredImage"
                    :src="getImageUrl(newsItem.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })" 
                    :alt="newsItem.title"
                    class="news-image"
                    loading="lazy"
                    data-image-overlay
                  />
                  <div 
                    v-else
                    class="news-image-fallback secondary"
                  ></div>
                </div>
                <div class="news-date">{{ formatDate(newsItem.publishedAt) }}</div>
                <div class="flex gap-1">
                  <div class="col-xs">
                    <p v-if="newsItem.shortDescription" class="h7">{{ newsItem.shortDescription }}</p>
                  </div>
                  <div class="">
                    <div class="arrow">→</div>
                  </div>
                </div>
              </div>
            </NuxtLink>
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
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const sectionRef = ref(null)

const title = computed(() => props.section?.selectedNewsContent?.title || 'News')
const button = computed(() => props.section?.selectedNewsContent?.button || null)
const selectedNews = computed(() => props.section?.selectedNewsContent?.news || [])
const newsToShow = ref([])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

onMounted(async () => {
  if (selectedNews.value.length > 0) {
    newsToShow.value = selectedNews.value
  } else {
    const res = await $fetch('/api/sanity', { params: { type: 'news', limit: 3 } })
    newsToShow.value = res || []
  }

  nextTick(() => {
    window.dispatchEvent(new CustomEvent('news-loaded'))
  })

  if (sectionRef.value) {
    registerSection(`selected-news-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
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

onUnmounted(() => {
  unregisterSection(`selected-news-${props.section._id}`)
})
</script>

<style scoped>
section {
  opacity: 0;
}

.news-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.image-wrapper {
  aspect-ratio: 3/2;
}

.news-date {
  font-style: italic;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-image-fallback {
  width: 100%;
  height: 100%;
}
</style>
