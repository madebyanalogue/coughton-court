import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from '#app'

export function useHeaderScroll() {
  const route = useRoute()
  const isHeaderVisible = ref(true)
  const lastScrollY = ref(0)
  const scrollThreshold = 50 // minimum scroll amount before hiding header

  // A scrolled events listing can leave the header hidden. Start each page visible.
  watch(() => route.fullPath, () => {
    isHeaderVisible.value = true
    lastScrollY.value = 0
  })

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    // Only trigger if we've scrolled more than the threshold
    if (Math.abs(currentScrollY - lastScrollY.value) < scrollThreshold) {
      return
    }

    // Hide header when scrolling down. Show again on scroll up, except on the
    // events listing, where it stays hidden until you're back near the top.
    const eventsListing = document.body.classList.contains('events-listing')
    isHeaderVisible.value = eventsListing
      ? currentScrollY < 100
      : currentScrollY < lastScrollY.value || currentScrollY < 100
    
    lastScrollY.value = currentScrollY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isHeaderVisible
  }
} 