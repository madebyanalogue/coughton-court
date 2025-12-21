<template>
  <nav data-navigation-status="not-active" class="navigation">
    <div data-navigation-toggle="close" class="navigation__dark-bg"></div>
    <div class="hamburger-nav">
      <div class="hamburger-nav__bg"></div>
      <div class="hamburger-nav__group">
        <p class="hamburger-nav__menu-p">Menu</p>
        <ul class="hamburger-nav__ul">
          <div v-for="(item, idx) in normalizedMenuItems" :key="idx" class="hamburger-nav__li">
            <!-- Use regular anchor tag for external/custom URLs -->
            <a 
              v-if="item.isExternal" 
              :href="item.to" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hamburger-nav__a" 
              @click="closeMenu"
            >
              <p class="hamburger-nav__p">{{ item.text }}</p>
              <div class="hamburger-nav__dot"></div>
            </a>
            <!-- Use NuxtLink for internal page navigation -->
            <NuxtLink 
              v-else-if="item.to && item.to !== '#'" 
              :to="item.to" 
              class="hamburger-nav__a" 
              @click="closeMenu"
            >
              <p class="hamburger-nav__p">{{ item.text }}</p>
              <div class="hamburger-nav__dot"></div>
            </NuxtLink>
            <!-- Fallback for items without valid links -->
            <span v-else class="hamburger-nav__a">
              <p class="hamburger-nav__p">{{ item.text }}</p>
              <div class="hamburger-nav__dot"></div>
            </span>
          </div>
        </ul>
      </div>
      <div data-navigation-toggle="toggle" class="hamburger-nav__toggle">
        <div class="hamburger-nav__toggle-bar"></div>
        <div class="hamburger-nav__toggle-bar"></div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useMenu } from '~/composables/useMenu'
import { useUrlProcessing } from '~/composables/useUrlProcessing'

const { mainMenu } = useMenu()
const { getProcessedUrl } = useUrlProcessing()

// Function to close the menu when a link is clicked
const closeMenu = () => {
  const navStatusEl = document.querySelector('[data-navigation-status]')
  if (navStatusEl) {
    navStatusEl.setAttribute('data-navigation-status', 'not-active')
  }
}

const normalizedMenuItems = computed(() => {
  const items = mainMenu?.value?.items || []
  return items.map((it) => {
    const text = it?.text || it?.title || 'Untitled'
    const slug = it?.to?.page?.slug?.current
    const url = it?.to?.url
    
    // Determine if this is an external/custom URL
    const isExternal = !!url && !slug
    
    let to
    if (slug) {
      // Internal page navigation
      to = `/${slug}`
    } else if (url) {
      // External URL - process it to ensure proper protocol
      to = getProcessedUrl(url)
    } else {
      to = '#'
    }
    
    return { text, to, isExternal }
  })
})
</script>

<style scoped>
/* No styles here; uses global hamburger-nav.css */
</style>


