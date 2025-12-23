<template>
  <section :class="['news-section', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="grid grid-1 gap-2 py2 py-sm-3 px-md-5">

        <!-- Top Text Section -->
        <div v-if="topText" class="grid grid-1 grid-md-2">
          <h2 class="h1">
            <div v-html="topText"></div>
          </h2>
        </div>

        
        <div class="grid grid-1 grid-md-2 gap-2 gap-2-md py2 pbottom underline-links reverse">
          <div v-for="(post, index) in posts" :key="post._id" class="news-item" :data-summary="post.summary">
            <div class="grid grid-1">
              <NuxtImg 
                v-if="post.featuredImage"
                :src="getImageUrl(post.featuredImage)" 
                :alt="post.title"
                class="news-thumbnail"
                data-image-overlay
              />
              <div class="grid grid-1 gap-1">
                <div class="grid grid-1 gap-05">
                  <div class="news-category h6 uppercase">
                    {{ post.category }}
                  </div>
                  <div class="grid">
                    <div class="col-span-7 h3 heading">{{ post.title }}</div>
                  </div>
                </div>
                <div v-if="post.excerpt" :blocks="post.excerpt" class="h5" v-html="post.excerpt"></div>
                <div v-if="post.offsiteUrl">
                  <a 
                      :href="post.offsiteUrl" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {{ post.linkTitle || 'Discover more' }}
                  </a>
                </div>
                <!-- <div class="">
                  <div class="h5">{{ formatDate(post.publishedAt) }}</div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

</template> 

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import { isDark, useRemoveTopPadding } from '~/composables/usePageUi.js'

// Props
const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'news'
    }
  }
})

const posts = ref([])
const { getImageUrl } = useSanityImage()

// Computed property for top text with line break formatting
const topText = computed(() => {
  const text = props.section?.newsContent?.topText || ''
  return text.replace(/\n/g, '<br>')
})

onMounted(async () => {
  const res = await $fetch('/api/sanity', { params: { type: 'news' } })
  posts.value = res
  
  // Debug: Check if images are rendered with correct attributes
  nextTick(() => {
    const newsImages = document.querySelectorAll('[data-image-overlay]')
    //console.log('[SectionNews] Found images with data-image-overlay:', newsImages.length)
    newsImages.forEach((img, i) => {
        // console.log(`[SectionNews] Image ${i}:`, {
        //   tagName: img.tagName,
        //   src: img.src,
        //   alt: img.alt,
        //   hasOverlay: img.hasAttribute('data-image-overlay')
        // })
    })
    
    // Dispatch event for image overlay plugin to re-initialize
    window.dispatchEvent(new CustomEvent('news-loaded'))
  })
})

isDark.value = false
useRemoveTopPadding.value = false

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  // Get month name in uppercase
  const month = date.toLocaleString('en-US', { month: 'long' }).toUpperCase()
  const year = date.getFullYear()
  return `${month} ${year}`
}
</script>

<style scoped>
.news-section {
  background-color: var(--light-grey);
}

.news-item {
  opacity: 0;
  animation: fadeInNews 1.5s ease-in-out forwards;
}

.news-item:nth-child(1) { animation-delay: 0.2s; }
.news-item:nth-child(2) { animation-delay: 0.4s; }
.news-item:nth-child(3) { animation-delay: 0.6s; }
.news-item:nth-child(4) { animation-delay: 0.8s; }
.news-item:nth-child(5) { animation-delay: 1.0s; }
.news-item:nth-child(6) { animation-delay: 1.2s; }

@keyframes fadeInNews {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.news-thumbnail {
  aspect-ratio: 1/1.2;
  width: 100%;
  object-fit: cover;
}
</style> 