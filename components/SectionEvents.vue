<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1 py-md-1">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="grid grid-1 grid-md-3 gap-3">
          <div v-for="event in activeEvents" :key="event._id" class="event-card">
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
                    :src="getImageUrl(event.featuredImage)" 
                    :alt="event.title"
                    class="event-image"
                    data-image-overlay
                    loading="lazy"
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
                    :src="getImageUrl(event.featuredImage)" 
                    :alt="event.title"
                    class="event-image"
                    data-image-overlay
                    loading="lazy"
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
</style>

