<template>
  <div v-if="showBanner" class="cookies-banner">
    <div class="cookies-banner__content">
      <div class="cookies-banner__message">
        <SanityBlocks v-if="message?.length" :blocks="message" />
      </div>
      <div class="cookies-banner__actions">
        <button @click="acceptCookies" class="cookies-banner__btn cookies-banner__btn--accept">
          Accept
        </button>
        <button @click="declineCookies" class="cookies-banner__btn cookies-banner__btn--decline">
          Decline
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { cookiesMessage } = useSiteSettings()
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
  const { googleAnalyticsId } = useSiteSettings()
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
.cookies-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 1rem;
}

.cookies-banner__content {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid currentColor;
  padding: var(--wrapper-padding);
}

@media (min-width: 768px) {
  .cookies-banner__content {
    flex-direction: row;
  }
}

.cookies-banner__message {
  flex: 1;
  font-size: 0.875rem;
}

.cookies-banner__actions {
  display: flex;
  gap: 1rem;
}

.cookies-banner__btn {
  border: none;
  cursor: pointer;
  font-size: var(--body);
  transition: all 0.2s;
}

</style>

