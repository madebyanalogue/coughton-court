<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">

      <div class="grid grid-1 py2 ptop">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>
        <div v-else class="text-center">
        </div>

        <div>
          <div class="grid grid-2 grid-md-4 py1 ">
            <div v-for="(service, index) in services" :key="service._id" class="service-item">
              
              <div class="service grid grid-1">
                <div class="service grid grid-2">
                  <div class="service-image-container">
                    <img 
                      v-if="service.image"
                      :src="getServiceImageUrl(service.image)" 
                      :alt="service.title"
                      class="square service-image"
                      :data-index="index"
                    />
                  </div>
                </div>
                <div class="grid grid-1 gap-1 service-content" :data-index="index">
                  <div class="h2 service--title"><br/><br/><br/>
                    <span class="">{{ service.title }}</span>
                  </div>
                  <SanityBlocks v-if="service.description" :blocks="service.description" class="service-description" />
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
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import SanityBlocks from '~/components/SanityBlocks.vue'
import gsap from 'gsap'
import { useScrollTrigger } from '~/composables/useScrollTrigger'

const props = defineProps({
  section: {
    type: Object,
    required: false
  }
})

const services = ref([])
const { getImageUrl } = useSanityImage()
const { registerSection, unregisterSection } = useScrollTrigger()
const sectionRef = ref(null)

function getServiceImageUrl(image) {
  const url = image?.asset?.url
  const mimeType = image?.asset?.mimeType
  if ((mimeType && mimeType === 'image/svg+xml') || (url && url.endsWith('.svg'))) {
    return url
  }
  return getImageUrl(image)
}

const title = computed(() => props.section?.servicesContent?.title)

// Animation setup
const setupAnimations = () => {
  if (!sectionRef.value) return

  // Register with global scroll trigger system
  const tl = registerSection('services', {
    trigger: sectionRef.value,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
    immediateRender: false
  })

  // Only proceed if timeline was created successfully
  if (!tl) {
    console.warn('Failed to create timeline, GSAP may not be loaded yet')
    return
  }

  // Animate each service sequentially
  const servicesCount = services.value?.length || 0
  for (let index = 0; index < servicesCount; index++) {
    const delay = index * 0.2 // 0.2s delay between each service
    
    tl.to(`[data-index="${index}"].service-image`, {
      y: '0%',
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, delay)
    
    tl.to(`[data-index="${index}"].service-content`, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out'
    }, delay + 0.2) // Text starts fading in 0.2s after image starts
  }
}

// Cleanup animations
const cleanupAnimations = () => {
  unregisterSection('services')
}

onMounted(async () => {
  if (props.section && Array.isArray(props.section.servicesContent?.services)) {
    services.value = props.section.servicesContent.services
  } else {
    try {
      const res = await $fetch('/api/sanity', { 
        params: { type: 'service' } 
      })
      services.value = res
    } catch (error) {
      console.error('Error fetching services:', error)
      services.value = []
    }
  }
  
  // Set initial hidden state immediately to prevent flash
  if (typeof window !== 'undefined' && window.gsap) {
    await nextTick()
    console.log('🔴 [SectionServices] Setting initial hidden state to prevent flash...')
    
    // Set initial states immediately
    window.gsap.set('.service-image', { 
      y: '100%',
      opacity: 0
    })
    
    window.gsap.set('.service-content', { 
      opacity: 0,
      y: 20
    })
  }
  
  // Listen for section visibility event from section-triggers system
  if (typeof window !== 'undefined') {
    await nextTick()
    
    console.log('🔴 [SectionServices] Setting up section-trigger listener...')
    
    // Listen for when this section becomes visible
    const handleSectionVisible = (event) => {
      if (event.detail.section === sectionRef.value) {
        console.log('🔴 [SectionServices] Section became visible, starting animation')
        document.removeEventListener('section-visible', handleSectionVisible)
        setupAnimations()
      }
    }
    
    document.addEventListener('section-visible', handleSectionVisible)
    
    // Cleanup on unmount
    onUnmounted(() => {
      document.removeEventListener('section-visible', handleSectionVisible)
    })
  }
})

onUnmounted(() => {
  cleanupAnimations()
})
</script>

<style scoped>
.service-item {
  opacity: 1;
}

.service-image-container {
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
}

.service-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-description {
  margin-top: 1rem;
}
</style> 