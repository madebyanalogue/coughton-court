import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useHeaderScroll() {
  const isHeaderVisible = ref(true)
  const lastScrollY = ref(0)
  const scrollThreshold = 50 // minimum scroll amount before hiding header

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    // Only trigger if we've scrolled more than the threshold
    if (Math.abs(currentScrollY - lastScrollY.value) < scrollThreshold) {
      return
    }

    // Hide header when scrolling down (translate -100%), show when scrolling up (translate back)
    // Always show if near top of page
    isHeaderVisible.value = currentScrollY < lastScrollY.value || currentScrollY < 100
    
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