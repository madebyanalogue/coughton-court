<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1 py-md-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div v-if="newsItems.length === 0" class="text-center py4">
          <p class="h7">No news at the moment.</p>
        </div>

        <div v-else class="grid grid-1 grid-md-3 gap-3">
          <div 
            v-for="(item, index) in newsItems" 
            :key="item._id" 
            :ref="el => setNewsCardRef(el, index)"
            class="news-card"
          >
            <NuxtLink 
              v-if="item.slug?.current" 
              :to="`/news/${item.slug.current}`" 
              class="news-link"
            >
              <div class="grid grid-1 gap-1">
                <div class="h6 medium">{{ item.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="item.featuredImage"
                    :src="getImageUrl(item.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })" 
                    :alt="item.title"
                    class="news-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="news-image-fallback secondary"
                  ></div>
                </div>
                <div class="news-date">{{ formatDate(item.publishedAt) }}</div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="item.shortDescription" class="h7">{{ item.shortDescription }}</p>
                    </div>
                    <div class="">
                      <div class="arrow">→</div>
                    </div>
                </div>
              </div>
            </NuxtLink>
            <div v-else class="news-link">
              <div class="grid grid-1 gap-1">
                <div class="h2">{{ item.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="item.featuredImage"
                    :src="getImageUrl(item.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })" 
                    :alt="item.title"
                    class="news-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="news-image-fallback secondary"
                  ></div>
                </div>
                <div class="news-date">{{ formatDate(item.publishedAt) }}</div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="item.shortDescription" class="h7">{{ item.shortDescription }}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const sectionRef = ref(null)
const newsCardRefs = ref([])
const hasAnimated = ref(false)

const title = computed(() => props.section?.newsContent?.title || '')

const { data: newsData } = await useAsyncData(
  `news-${props.section._key}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'news',
      all: true
    } 
  })
)

const newsItems = computed(() => newsData.value || [])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

const setNewsCardRef = (el, index) => {
  if (el) {
    if (!newsCardRefs.value[index]) {
      newsCardRefs.value[index] = el
    } else if (newsCardRefs.value[index] !== el) {
      newsCardRefs.value[index] = el
    }
  }
}

const animateNewsIn = () => {
  if (hasAnimated.value) return
  
  const gsap = window.gsap
  if (!gsap) return
  
  nextTick(() => {
    const validRefs = newsCardRefs.value.filter(ref => ref !== null && ref !== undefined)
    
    if (validRefs.length === 0) {
      setTimeout(() => {
        if (!hasAnimated.value) {
          animateNewsIn()
        }
      }, 50)
      return
    }
    
    const alreadyAnimated = validRefs.some(ref => {
      const computedStyle = window.getComputedStyle(ref)
      return parseFloat(computedStyle.opacity) > 0
    })
    
    if (alreadyAnimated) {
      hasAnimated.value = true
      return
    }
    
    hasAnimated.value = true
    
    gsap.set(validRefs, {
      opacity: 0,
      y: 20
    })
    
    gsap.to(validRefs, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.2
    })
  })
}

onMounted(async () => {
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('news-loaded'))
  })
  
  if (sectionRef.value) {
    registerSection(`news-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              nextTick(() => {
                animateNewsIn()
              })
            }
          })
        }
      }
    })
  }
  
  await nextTick()
  setTimeout(() => {
    if (sectionRef.value && !hasAnimated.value) {
      const rect = sectionRef.value.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.8
      if (isVisible) {
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              nextTick(() => {
                animateNewsIn()
              })
            }
          })
        }
      }
    }
  }, 200)
})

watch(newsItems, (newItems, oldItems) => {
  if (oldItems && newItems.length !== oldItems.length) {
    hasAnimated.value = false
    newsCardRefs.value = []
  }
}, { immediate: false })

onUnmounted(() => {
  unregisterSection(`news-${props.section._id}`)
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

.news-card {
  will-change: opacity, transform;
}
</style>
