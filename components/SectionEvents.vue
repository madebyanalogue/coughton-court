<template>
  <section
    ref="sectionRef"
    :class="{
      'section-border-top': section.borderTop,
      'section-border-bottom': section.borderBottom,
      'section-events--has-hero': !!heroImageUrl
    }"
  >
    <div v-if="heroImageUrl" class="events-hero">
      <div
        class="events-hero__media"
        aria-hidden="true"
        :style="{ backgroundImage: `url('${heroImageUrl}')` }"
      >
        <img
          :src="heroImageUrl"
          :alt="heroImageAlt"
          class="events-hero__image"
          width="1920"
          height="1080"
        >
      </div>
      <div class="events-hero__overlay" aria-hidden="true"></div>
      <div class="wrapper events-hero__bar">
        <div class="events-toolbar">
          <h1 class="events-toolbar__title">What's On</h1>
          <div class="events-filters-stack">
            <select
              v-model="activeKind"
              class="events-filters__select h7"
              aria-label="Filter by Events or Workshops"
            >
              <option
                v-for="filter in kindFilters"
                :key="`kind-${filter.value}`"
                :value="filter.value"
                :disabled="filter.value !== 'all' && countForKind(filter.value) === 0"
              >
                {{ filter.label }} ({{ countForKind(filter.value) }})
              </option>
            </select>
            <select
              v-model="activeVenue"
              class="events-filters__select h7"
              aria-label="Filter events by venue"
            >
              <option
                v-for="filter in venueFilters"
                :key="`venue-${filter.value}`"
                :value="filter.value"
                :disabled="filter.value !== 'all' && countForVenue(filter.value) === 0"
              >
                {{ filter.label }} ({{ countForVenue(filter.value) }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="wrapper">
      <div class="grid grid-1 py-md-1 gap-2">

        <div v-if="title" class="text-center py1">
          <div class="h4 mono">{{ title }}</div>
        </div>

        <div v-if="!heroImageUrl" class="events-toolbar">
          <h1 class="events-toolbar__title">What's On</h1>

          <div class="events-filters-stack">
            <select
              v-model="activeKind"
              class="events-filters__select h7"
              aria-label="Filter by Events or Workshops"
            >
              <option
                v-for="filter in kindFilters"
                :key="`kind-${filter.value}`"
                :value="filter.value"
                :disabled="filter.value !== 'all' && countForKind(filter.value) === 0"
              >
                {{ filter.label }} ({{ countForKind(filter.value) }})
              </option>
            </select>

            <select
              v-model="activeVenue"
              class="events-filters__select h7"
              aria-label="Filter events by venue"
            >
              <option
                v-for="filter in venueFilters"
                :key="`venue-${filter.value}`"
                :value="filter.value"
                :disabled="filter.value !== 'all' && countForVenue(filter.value) === 0"
              >
                {{ filter.label }} ({{ countForVenue(filter.value) }})
              </option>
            </select>
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

            <div class="grid grid-1 grid-md-3 gap-2">
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
                  <p v-if="venueLabel(event.venue)" class="event-location">{{ venueLabel(event.venue) }}</p>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p v-if="event.shortDescription" class="event-description">{{ limitDescription(event.shortDescription) }}</p>
                  <div v-if="event.slug?.current || event.cost" class="event-card__actions">
                    <p v-if="event.cost" class="event-card__price">{{ event.cost }}</p>
                    <NuxtLink
                      v-if="event.slug?.current"
                      :to="`/events/${event.slug.current}`"
                      class="button event-card__button"
                    >
                      Find out more
                    </NuxtLink>
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
import { useEventHeroHeader } from '~/composables/useEventHeroHeader.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  pageData: {
    type: Object,
    default: null
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const { setEventsListingHasHero } = useEventHeroHeader()
const sectionRef = ref(null)
const eventCardRefs = ref({})
const hasAnimated = ref(false)
const activeVenue = ref('all')
const activeKind = ref('all')

const venueFilters = [
  { label: 'All Locations', value: 'all' },
  { label: 'House', value: 'house' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Garden', value: 'garden' }
]

const kindFilters = [
  { label: 'All Types', value: 'all' },
  { label: 'Events', value: 'event' },
  { label: 'Workshops', value: 'workshop' }
]

const venueLabel = (venue) => {
  return venueFilters.find((filter) => filter.value === venue)?.label || ''
}

const title = computed(() => props.section?.eventsContent?.title || '')

const heroImage = computed(() => {
  const fromSection = props.section?.eventsContent?.heroImage
  if (fromSection?.asset) return fromSection
  const fromPage = props.pageData?.featuredImage
  if (fromPage?.asset) return fromPage
  return null
})

const heroImageUrl = computed(() => {
  if (!heroImage.value) return null
  return getImageUrl(heroImage.value, { width: 1920, quality: 80 })
})

const heroImageAlt = computed(() => {
  return heroImage.value?.alt || 'What\'s On'
})

watch(heroImageUrl, (url) => {
  setEventsListingHasHero(!!url)
}, { immediate: true })

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
  setEventsListingHasHero(false)
  unregisterSection(`events-${props.section._id}`)
})
</script>

<style scoped>
section {
  opacity: 0;
  background: var(--background-color);
}

.section-events--has-hero {
  padding-top: 0;
  opacity: 1;
}

.events-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 50vh;
  min-height: 600px;
  padding-top: var(--header-height, 80px);
  color: white;
}

.events-hero__media,
.events-hero__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.events-hero__media {
  z-index: 0;
  background-color: rgb(43, 46, 41);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.events-hero__image {
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: block;
  object-fit: cover;
  -webkit-object-fit: cover;
  object-position: center;
}

.events-hero__overlay {
  z-index: 1;
  background: rgba(43, 46, 41, 0.35);
}

.events-hero__bar {
  position: relative;
  z-index: 2;
  padding-bottom: var(--section-padding, 3rem);
}

.events-hero .events-toolbar__title {
  color: white;
}

.events-hero .events-filters__select {
  color: white;
  border-color: white;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
}

:global(body.events-listing) {
  --background-color: white;
  --button-text-color: white;
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
  font-family: var(--serif);
  font-size: clamp(10px, 6vw, 55px);
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.2;
}

.events-filters-stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  margin-left: auto;
}

@media (max-width: 399px) {
  .events-hero .events-filters__select {
    color: white;
    border-color: transparent;
    background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
    padding: 0;
    padding-right: 30px;
  }

  .events-filters-stack {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0;
    margin-left: auto;
    margin-right: -15px;
  }
}

.events-filters__select {
  appearance: none;
  background-color: transparent;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 13px) calc(50% - 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  border: 1px solid;
  color: inherit;
  cursor: pointer;
  font-family: var(--heading);
  padding: 13px 36px 11px 20px;
  border-radius: 0;
}

.events-month__title {
  margin: 0 0 var(--pad-2);
  text-align: left;
  font-size: clamp(25px, 2vw, 40px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding: var(--pad-2) 0;
  position: static;
  background: var(--background-color);
}

@media (max-width: 799px) {
  .events-month__title {
    margin: 0 0 var(--pad-3);
    margin-top: var(--pad-1);
    text-align: left;
    font-size: clamp(20px, 2vw, 40px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: var(--pad-2) 0;
    position: static;
    background: var(--background-color);
  }
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
  aspect-ratio: 1.5;
  border-radius: 10px;
}

.event-date {
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.35;
  margin-top: 10px;
}

.event-location {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.35;
}

.event-description {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  font-family: var(--heading);
  line-height: 1.4;
  margin-top: 10px;
  opacity: 0.6;
  flex: 1;
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
  padding: 0;
  border: navajowhite;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.event-card > * {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  border-top: 1px solid #ddd;
  padding-top: 25px;
  padding-bottom: 60px;
}

.event-card__price {
  margin: 0;
  font-family: var(--heading);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.35;
}

.event-card__button {
  margin-left: auto;
  flex-shrink: 0;
}
</style>
