<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="grid grid-1 grid-md-4 gap-2">
          <div v-for="page in pages" :key="page._id" class="page-card">
            <NuxtLink 
              v-if="page.slug?.current" 
              :to="`/${page.slug.current}`" 
              class="page-link"
            >
              <div class="grid grid-1 gap-1">
                <div class="h5">{{ page.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="page.featuredImage"
                    :src="getImageUrl(page.featuredImage)" 
                    :alt="page.title"
                    class="page-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="page-image-fallback secondary"
                  ></div>
                </div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="page.shortDescription" class="h7">{{ page.shortDescription }}</p>
                    </div>
                    <div class="">
                      <div class="arrow">→</div>
                    </div>
                </div>
              </div>
            </NuxtLink>
            <div v-else class="page-link">
              <div class="grid grid-1 gap-1">
                <div class="h5">{{ page.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="page.featuredImage"
                    :src="getImageUrl(page.featuredImage)" 
                    :alt="page.title"
                    class="page-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="page-image-fallback secondary"
                  ></div>
                </div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="page.shortDescription" class="h7">{{ page.shortDescription }}</p>
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
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
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

const title = computed(() => props.section?.selectedPagesContent?.title || '')
const pages = computed(() => props.section?.selectedPagesContent?.pages || [])

onMounted(async () => {
  // Dispatch event for image overlay plugin to re-initialize
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('pages-loaded'))
  })
  
  // Register section for scroll animations
  if (sectionRef.value) {
    registerSection(`selected-pages-${props.section._id}`, {
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
  unregisterSection(`selected-pages-${props.section._id}`)
})
</script>

<style scoped>
/* Initial state for scroll animations */
section {
  opacity: 0;
}

.page-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.page-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-image-fallback {
  width: 100%;
  height: 100%;
}
</style>

