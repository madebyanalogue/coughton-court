<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1 py-md-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div v-if="activeEvents.length === 0" class="text-center py4">
          <p class="h7">No events at the moment.</p>
        </div>

        <div v-else class="grid grid-1 grid-md-3 gap-3">
          <div 
            v-for="(event, index) in activeEvents" 
            :key="event._id" 
            :ref="el => setEventCardRef(el, index)"
            class="event-card"
          >
            <NuxtLink 
              v-if="event.slug?.current" 
              :to="`/events/${event.slug.current}`" 
              class="event-link"
            >
              <div class="grid grid-1 gap-1">
                <div class="h6 medium">{{ event.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="event.featuredImage"
                    :src="getImageUrl(event.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })" 
                    :alt="event.title"
                    class="event-image"
                    data-image-overlay
                    loading="lazy"
                    sizes="(max-width: 799px) 100vw, 33vw"
                  />
                  <div 
                    v-else
                    class="event-image-fallback secondary"
                  ></div>
                </div>
                <div class="event-date">{{ formatDateRange(event.startDate, event.endDate) }}</div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="event.shortDescription" class="h7">{{ event.shortDescription }}</p>
                    </div>
                    <div class="">
                      <div class="arrow">→</div>
                    </div>
                </div>
              </div>
            </NuxtLink>
            <div v-else class="event-link">
              <div class="grid grid-1 gap-1">
                <div class="h2">{{ event.title }}</div>
                <div class="image-wrapper">
                  <NuxtImg 
                    v-if="event.featuredImage"
                    :src="getImageUrl(event.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })" 
                    :alt="event.title"
                    class="event-image"
                    data-image-overlay
                    loading="lazy"
                    sizes="(max-width: 799px) 100vw, 33vw"
                  />
                  <div 
                    v-else
                    class="event-image-fallback secondary"
                  ></div>
                </div>
                <div class="event-date">{{ formatDateRange(event.startDate, event.endDate) }}</div>
                <div class="flex gap-1">
                    <div class="col-xs">
                    <p v-if="event.shortDescription" class="h7">{{ event.shortDescription }}</p>
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
const eventCardRefs = ref([])
const hasAnimated = ref(false)

const title = computed(() => props.section?.eventsContent?.title || '')

// Fetch events from Sanity
const { data: eventsData } = await useAsyncData(
  `events-${props.section._key}`,
  () => $fetch('/api/sanity', { 
    params: { 
      type: 'event',
      all: true
    } 
  })
)

// Filter out events where end date (or start date if no end date) has passed
const activeEvents = computed(() => {
  const events = eventsData.value || []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return events.filter(event => {
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
    endDate.setHours(23, 59, 59, 999)
    return endDate >= today
  })
})

// Format date range: "9 November - 5 January" or just "9 November" if same day
const formatDateRange = (startDate, endDate) => {
  if (!startDate) return ''
  
  const start = new Date(startDate)
  const options = { day: 'numeric', month: 'long' }
  
  const startFormatted = start.toLocaleDateString('en-GB', options)
  
  if (!endDate) return startFormatted
  
  const end = new Date(endDate)
  
  // Check if same day
  if (start.toDateString() === end.toDateString()) {
    return startFormatted
  }
  
  const endFormatted = end.toLocaleDateString('en-GB', options)
  return `${startFormatted} - ${endFormatted}`
}

// Set ref for event cards
const setEventCardRef = (el, index) => {
  if (el) {
    // Ensure array is large enough
    if (!eventCardRefs.value[index]) {
      eventCardRefs.value[index] = el
    } else if (eventCardRefs.value[index] !== el) {
      eventCardRefs.value[index] = el
    }
  }
}

// Animate events sequentially
const animateEventsIn = () => {
  // Prevent multiple animations
  if (hasAnimated.value) return
  
  const gsap = window.gsap
  if (!gsap) return
  
  // Wait for refs to be set
  nextTick(() => {
    // Filter out null refs - refs should be DOM elements directly
    const validRefs = eventCardRefs.value.filter(ref => ref !== null && ref !== undefined)
    
    if (validRefs.length === 0) {
      // If no refs yet, try again after a short delay
      setTimeout(() => {
        if (!hasAnimated.value) {
          animateEventsIn()
        }
      }, 50)
      return
    }
    
    // Check if already animated by checking opacity
    const alreadyAnimated = validRefs.some(ref => {
      const computed = window.getComputedStyle(ref)
      return parseFloat(computed.opacity) > 0
    })
    
    if (alreadyAnimated) {
      hasAnimated.value = true
      return
    }
    
    // Mark as animated before setting initial state to prevent race conditions
    hasAnimated.value = true
    
    // Set initial state
    gsap.set(validRefs, {
      opacity: 0,
      y: 20
    })
    
    // Animate in sequentially with stagger
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
    window.dispatchEvent(new CustomEvent('events-loaded'))
  })
  
  if (sectionRef.value) {
    registerSection(`events-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        const gsap = window.gsap
        if (gsap) {
          // Fade in the section container
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              // After section fades in, animate events sequentially
              nextTick(() => {
                animateEventsIn()
              })
            }
          })
        }
      }
    })
  }
  
  // Also animate on initial load if section is already visible
  await nextTick()
  // Wait a bit more for events to load and refs to be set
  setTimeout(() => {
    if (sectionRef.value && !hasAnimated.value) {
      const rect = sectionRef.value.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.8
      if (isVisible) {
        // Section is already visible, animate immediately
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              nextTick(() => {
                animateEventsIn()
              })
            }
          })
        }
      }
    }
  }, 200)
})

// Watch for when events are loaded - reset animation flag when events change
watch(activeEvents, (newEvents, oldEvents) => {
  // Reset animation flag if events actually changed
  if (oldEvents && newEvents.length !== oldEvents.length) {
    hasAnimated.value = false
    // Reset refs array when events change
    eventCardRefs.value = []
  }
}, { immediate: false })

onUnmounted(() => {
  unregisterSection(`events-${props.section._id}`)
})
</script>

<style scoped>
section {
  opacity: 0;
}

.event-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.image-wrapper {
  aspect-ratio: 3/2;
}

.event-date {
  font-style: italic;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-image-fallback {
  width: 100%;
  height: 100%;
}

.event-card {
  will-change: opacity, transform;
}
</style>

