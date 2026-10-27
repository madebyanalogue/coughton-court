import { ref } from 'vue'

const eventHeroHasBackground = ref(false)
const eventsListingHasHero = ref(false)

export function useEventHeroHeader() {
  const setEventHeroHasBackground = (value) => {
    eventHeroHasBackground.value = !!value
  }

  const setEventsListingHasHero = (value) => {
    eventsListingHasHero.value = !!value
  }

  return {
    eventHeroHasBackground,
    setEventHeroHasBackground,
    eventsListingHasHero,
    setEventsListingHasHero
  }
}
