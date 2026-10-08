<template>
  <section ref="sectionRef" :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid grid-1 py-md-1 gap-2">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div class="events-toolbar">
          <h1 class="events-toolbar__title">What's On</h1>

          <div class="events-filters-stack">
          <div class="events-filters" role="tablist" aria-label="Filter by Events or Workshops">
            <button
              v-for="filter in kindFilters"
              :key="`kind-${filter.value}`"
              type="button"
              class="events-filters__btn h7"
              :class="{ 'events-filters__btn--active': activeKind === filter.value }"
              role="tab"
              :aria-selected="activeKind === filter.value"
              :disabled="countForKind(filter.value) === 0"
              @click="setKind(filter.value)"
            >
              {{ filter.label }} ({{ countForKind(filter.value) }})
            </button>
          </div>

          <div class="events-filters" role="tablist" aria-label="Filter events by venue">
            <button
              v-for="filter in venueFilters"
              :key="`venue-${filter.value}`"
              type="button"
              class="events-filters__btn h7"
              :class="{ 'events-filters__btn--active': activeVenue === filter.value }"
              role="tab"
              :aria-selected="activeVenue === filter.value"
              :disabled="countForVenue(filter.value) === 0"
              @click="setVenue(filter.value)"
            >
              {{ filter.label }} ({{ countForVenue(filter.value) }})
            </button>
          </div>
        </div>
        </div>

        <div v-if="monthGroups.length === 0" class="text-center py4">
          <p class="h7">No events at the moment.</p>
        </div>

        <div v-else class="events-months grid grid-1 gap-4">
          <div
            v-for="group in monthGroups"
            :key="group.key"
            class="events-month"
          >
            <h2 class="events-month__title">{{ group.label }}</h2>

            <div class="grid grid-1 grid-md-3 gap-3">
              <div
                v-for="(event, index) in group.events"
                :key="`${group.key}-${event._id}`"
                :ref="el => setEventCardRef(el, `${group.key}-${index}`)"
                class="event-card"
              >
                <div class="grid grid-1 gap-1">
                  <NuxtLink
                    v-if="event.slug?.current"
                    :to="`/events/${event.slug.current}`"
                    class="event-link image-wrapper"
                    :aria-label="event.title"
                  >
                    <NuxtImg
                      v-if="event.featuredImage"
                      :src="getImageUrl(event.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })"
                      :alt="event.title"
                      class="event-image"
                      data-image-overlay
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="event-image-fallback secondary"
                    ></div>
                  </NuxtLink>
                  <div v-else class="image-wrapper">
                    <NuxtImg
                      v-if="event.featuredImage"
                      :src="getImageUrl(event.featuredImage, { width: 1056, quality: 80, fit: 'crop', crop: 'focalpoint' })"
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
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p v-if="event.shortDescription" class="event-description">{{ limitDescription(event.shortDescription) }}</p>
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
const eventCardRefs = ref({})
const hasAnimated = ref(false)
const activeVenue = ref('all')
const activeKind = ref('all')

const venueFilters = [
  { label: 'All', value: 'all' },
  { label: 'House', value: 'house' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Garden', value: 'garden' }
]

const kindFilters = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'event' },
  { label: 'Workshops', value: 'workshop' }
]

const title = computed(() => props.section?.eventsContent?.title || '')

const { data: eventsData } = await useAsyncData(
  `events-${props.section._key}`,
  () => $fetch('/api/sanity', {
    params: {
      type: 'event',
      all: true
    }
  })
)

const activeEvents = computed(() => {
  const events = eventsData.value || []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.filter((event) => {
    if (!event?.startDate) return false
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
    endDate.setHours(23, 59, 59, 999)
    return endDate >= today
  })
})

const eventMatchesKind = (event, kind) => {
  if (kind === 'all') return true
  if (kind === 'event') return event.eventKind === 'event' || !event.eventKind
  return event.eventKind === kind
}

const eventMatchesVenue = (event, venue) => {
  if (venue === 'all') return true
  return event.venue === venue
}

const filteredEvents = computed(() => {
  return activeEvents.value.filter((event) => {
    return eventMatchesVenue(event, activeVenue.value) && eventMatchesKind(event, activeKind.value)
  })
})

const countForKind = (kind) => {
  return activeEvents.value.filter((event) => {
    return eventMatchesKind(event, kind) && eventMatchesVenue(event, activeVenue.value)
  }).length
}

const countForVenue = (venue) => {
  return activeEvents.value.filter((event) => {
    return eventMatchesVenue(event, venue) && eventMatchesKind(event, activeKind.value)
  }).length
}

const getMonthsForEvent = (startDate, endDate) => {
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) return []

  const end = endDate ? new Date(endDate) : new Date(startDate)
  if (Number.isNaN(end.getTime())) return [{ key: `${start.getFullYear()}-${start.getMonth()}`, year: start.getFullYear(), month: start.getMonth() }]

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const months = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= last) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth)

    if (!isPastMonth) {
      months.push({
        key: `${year}-${month}`,
        year,
        month
      })
    }

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

const monthGroups = computed(() => {
  const groups = new Map()

  filteredEvents.value.forEach((event) => {
    const months = getMonthsForEvent(event.startDate, event.endDate)
    months.forEach(({ key, year, month }) => {
      if (!groups.has(key)) {
        const labelDate = new Date(year, month, 1)
        groups.set(key, {
          key,
          year,
          month,
          label: labelDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          events: []
        })
      }
      groups.get(key).events.push(event)
    })
  })

  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })
})

const DESCRIPTION_LIMIT = 160

const limitDescription = (text) => {
  const value = (text || '').replace(/\s+/g, ' ').trim()
  if (value.length <= DESCRIPTION_LIMIT) return value
  const sliced = value.slice(0, DESCRIPTION_LIMIT)
  const breakpoint = sliced.lastIndexOf(' ')
  const trimmed = (breakpoint > 0 ? sliced.slice(0, breakpoint) : sliced).trim()
  return `${trimmed}…`
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return ''

  const start = new Date(startDate)
  const options = { day: 'numeric', month: 'long' }
  const startFormatted = start.toLocaleDateString('en-GB', options)

  if (!endDate) return startFormatted

  const end = new Date(endDate)
  if (start.toDateString() === end.toDateString()) {
    return startFormatted
  }

  const endFormatted = end.toLocaleDateString('en-GB', options)
  return `${startFormatted} - ${endFormatted}`
}

const setVenue = (value) => {
  activeVenue.value = value
}

const setKind = (value) => {
  activeKind.value = value
}

const setEventCardRef = (el, key) => {
  if (el) {
    eventCardRefs.value[key] = el
  } else {
    delete eventCardRefs.value[key]
  }
}

const animateEventsIn = () => {
  if (hasAnimated.value) return

  const gsap = window.gsap
  if (!gsap) return

  nextTick(() => {
    const validRefs = Object.values(eventCardRefs.value).filter(Boolean)

    if (validRefs.length === 0) {
      setTimeout(() => {
        if (!hasAnimated.value) {
          animateEventsIn()
        }
      }, 50)
      return
    }

    const alreadyAnimated = validRefs.some((refEl) => {
      const computedStyle = window.getComputedStyle(refEl)
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

const replayAnimation = () => {
  hasAnimated.value = false
  eventCardRefs.value = {}
  nextTick(() => {
    animateEventsIn()
  })
}

onMounted(async () => {
  document.body.classList.add('events-listing')

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
            ease: 'power2.out',
            onComplete: () => {
              nextTick(() => {
                animateEventsIn()
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
                animateEventsIn()
              })
            }
          })
        }
      }
    }
  }, 200)
})

watch([activeVenue, activeKind], () => {
  replayAnimation()
})

watch(filteredEvents, (newEvents, oldEvents) => {
  if (oldEvents && newEvents.length !== oldEvents.length) {
    replayAnimation()
  }
}, { immediate: false })

onUnmounted(() => {
  document.body.classList.remove('events-listing')
  unregisterSection(`events-${props.section._id}`)
})
</script>

<style scoped>
section {
  opacity: 0;
}

.events-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.events-toolbar__title {
  margin: 0;
  font-family: var(--heading);
  font-weight: 400;
  font-size: 40px;
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.2;
}

.events-filters-stack {
  display: grid;
  gap: 0.75rem;
  margin-left: auto;
}

.events-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 15px;
}

.events-filters__btn {
  background: transparent;
  border: 1px solid;
  color: inherit;
  cursor: pointer;
  padding: 10px 20px;
  opacity: 1;
  transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.events-filters__btn--active {
  background: currentColor;
  color: var(--background-color);
}

.events-filters__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.events-month__title {
  margin: 0 0 var(--pad-2);
  text-align: left;
  font-size: 40px;
  border-bottom: 1px solid;
  padding: var(--pad-2) 0;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--background-color);
}

.event-link {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.event-title {
  margin: 0;
  font-family: var(--body-font);
  font-weight: 400;
  font-size: clamp(22px, 2vw, 28px);
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.2;
}

.image-wrapper {
  aspect-ratio: 1;
}

.event-date {
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.35;
  margin-top: 10px;
}

.event-description {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.4;
  margin-top: 10px;
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
