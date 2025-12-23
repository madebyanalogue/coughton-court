<template>
  <div v-if="showBanner" class="hero-cookies-banner">
    <div class="hero-cookies-banner__content">
      <div class="hero-cookies-banner__message">
        <SanityBlocks v-if="message?.length" :blocks="message" />
      </div>
      <div class="hero-cookies-banner__actions">
        <button @click="acceptCookies" class="hero-cookies-banner__btn hero-cookies-banner__btn--accept">
          Accept
        </button>
        <button @click="declineCookies" class="hero-cookies-banner__btn hero-cookies-banner__btn--decline">
          Decline
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { cookiesMessage, googleAnalyticsId } = useSiteSettings()
const showBanner = ref(false)

const message = computed(() => cookiesMessage.value || [])

const acceptCookies = () => {
  localStorage.setItem('cookies-accepted', 'true')
  showBanner.value = false
  // Add class to body
  if (typeof document !== 'undefined') {
    document.body.classList.add('cookies-handled')
    document.body.classList.add('cookies-accepted')
    document.body.classList.remove('cookies-declined')
  }
  // Dispatch event for GA plugin to initialize
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cookies-accepted'))
  }
  // Initialize Google Analytics if ID is provided
  initializeGA()
}

const declineCookies = () => {
  localStorage.setItem('cookies-accepted', 'false')
  showBanner.value = false
  // Add class to body
  if (typeof document !== 'undefined') {
    document.body.classList.add('cookies-handled')
    document.body.classList.add('cookies-declined')
    document.body.classList.remove('cookies-accepted')
  }
}

const initializeGA = () => {
  const gaId = googleAnalyticsId.value
  
  if (!gaId) return
  
  // Initialize Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', gaId)
  }
}

onMounted(() => {
  // Check if user has already made a choice
  const cookiesAccepted = localStorage.getItem('cookies-accepted')
  if (cookiesAccepted === null) {
    showBanner.value = true
  } else {
    // User has already made a choice, add class to body
    if (typeof document !== 'undefined') {
      document.body.classList.add('cookies-handled')
      if (cookiesAccepted === 'true') {
        document.body.classList.add('cookies-accepted')
        document.body.classList.remove('cookies-declined')
      } else {
        document.body.classList.add('cookies-declined')
        document.body.classList.remove('cookies-accepted')
      }
    }
    if (cookiesAccepted === 'true') {
      initializeGA()
    }
  }
})
</script>

<style scoped>
.hero-cookies-banner {
  width: 100%;
}

.hero-cookies-banner__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  height: var(--pad-4);
  border-top: 1px solid currentColor;
}

@media (min-width: 768px) {
  .hero-cookies-banner__content {
    flex-direction: row;
  }
}

.hero-cookies-banner__message {
  flex: 1;
  font-size: 0.875rem;
}

.hero-cookies-banner__actions {
  display: flex;
  gap: 1rem;
}

.hero-cookies-banner__btn {
    cursor: pointer;
    font-size: var(--body);
    /* font-weight: 600; */
    /* text-transform: uppercase; */
    /* letter-spacing: 0.05em; */
    transition: all 0.2s;
}

</style>

