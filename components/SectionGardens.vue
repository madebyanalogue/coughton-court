<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">
      <div class="grid grid-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="grid grid-1 grid-sm-2 grid-md-3 gap-2">
          <div v-for="garden in gardens" :key="garden._id" class="garden-card">
            <NuxtLink 
              v-if="garden.slug?.current" 
              :to="`/gardens/${garden.slug.current}`" 
              class="garden-link"
            >
              <div class="grid grid-1 gap-1">
                <div class="h2">{{ garden.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="garden.featuredImage"
                    :src="getImageUrl(garden.featuredImage)" 
                    :alt="garden.title"
                    class="garden-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="garden-image-fallback secondary"
                  ></div>
                </div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="garden.shortDescription" class="p-small">{{ garden.shortDescription }}</p>
                    </div>
                    <div class="">
                      <div class="">→</div>
                    </div>
                </div>
              </div>
            </NuxtLink>
            <div v-else class="garden-link">
              <div class="grid grid-1 gap-1">
                <div class="h2">{{ garden.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="garden.featuredImage"
                    :src="getImageUrl(garden.featuredImage)" 
                    :alt="garden.title"
                    class="garden-image"
                    data-image-overlay
                    loading="lazy"
                  />
                  <div 
                    v-else
                    class="garden-image-fallback secondary"
                  ></div>
                </div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="garden.shortDescription" class="p-small">{{ garden.shortDescription }}</p>
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

const title = computed(() => props.section?.gardensContent?.title || '')

// Fetch gardens from Sanity
const { data: gardensData } = await useAsyncData(
  `gardens-${props.section._key}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'garden',
      all: true
    } 
  })
)

const gardens = computed(() => gardensData.value || [])

onMounted(async () => {
  // Dispatch event for image overlay plugin to re-initialize
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('gardens-loaded'))
  })
  
  // Register section for scroll animations
  if (sectionRef.value) {
    registerSection(`gardens-${props.section._id}`, {
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
  unregisterSection(`gardens-${props.section._id}`)
})
</script>

<style scoped>
/* Initial state for scroll animations */
section {
  opacity: 0;
}

.garden-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.garden-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.garden-image-fallback {
  width: 100%;
  height: 100%;
}
</style>

