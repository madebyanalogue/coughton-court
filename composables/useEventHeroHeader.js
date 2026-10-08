import { ref } from 'vue'

const eventHeroHasBackground = ref(false)

export function useEventHeroHeader() {
  const setEventHeroHasBackground = (value) => {
    eventHeroHasBackground.value = !!value
  }

  return {
    eventHeroHasBackground,
    setEventHeroHasBackground
  }
}
