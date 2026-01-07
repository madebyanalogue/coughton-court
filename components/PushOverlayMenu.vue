<template>
  <div class="push-overlay-menu">

    <!-- Menu Overlay -->
    <transition name="menu-fade" @enter="onMenuEnter" @leave="onMenuLeave">
      <div v-if="menuOpen" class="menu-overlay">
        <div class="menu-overlay-content">
          <!-- Left Side - Image/Media -->
          <div class="menu-left">
            <div class="menu-media-wrapper">
            </div>
          </div>
          
          <!-- Right Side - Menu Content -->
          <div class="menu-right">
            <div class="menu-content-wrapper">
              <div class="menu-content-main">
                <div class="menu-col">
                  <div v-for="item in menuItems" :key="item.text" class="menu-link">
                    <NuxtLink 
                      v-if="item.to?.page?.slug?.current" 
                      :to="`/${item.to.page.slug.current}`"
                      @click="closeMenu"
                    >
                      {{ item.text }}
                    </NuxtLink>
                    <a 
                      v-else-if="item.to?.url" 
                      :href="getProcessedUrl(item.to.url)" 
                      :target="isExternalLink(item.to.url) ? '_blank' : undefined"
                      :rel="isExternalLink(item.to.url) ? 'noopener' : undefined"
                      @click="closeMenu"
                    >
                      {{ item.text }}
                    </a>
                  </div>
                </div>

                <div class="menu-col">
                  <div v-for="tag in menuTags" :key="tag.text" class="menu-tag">
                    <a :href="tag.url">{{ tag.text }}</a>
                  </div>
                </div>
              </div>
              <div class="menu-footer">
                <div class="menu-col">
                  <p>{{ contactInfo.location || 'Location' }}</p>
                </div>
                <div class="menu-col">
                  <p v-if="contactInfo.phone">{{ contactInfo.phone }}</p>
                  <p v-if="contactInfo.email">{{ contactInfo.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useMenu } from '~/composables/useMenu'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useSanityImage } from '~/composables/useSanityImage'

// Props
const props = defineProps({
  menuOpen: {
    type: Boolean,
    default: false
  },
  menuTags: {
    type: Array,
    default: () => [
      { text: 'Accountancy', url: '#' },
      { text: 'Tax Services', url: '#' },
      { text: 'Business Advice', url: '#' }
    ]
  }
})

// Emits
const emit = defineEmits(['close-menu'])

// Get menu data
const { mainMenu } = useMenu()
const { settings, contactInfo } = useSiteSettings()
const { getImageUrl } = useSanityImage()

const menuItems = computed(() => mainMenu?.value?.items || [])

// Function to process external URLs consistently
const getProcessedUrl = (url) => {
  if (!url) return '#'
  
  // Preserve mailto: and tel: links as-is
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  } else if (url.startsWith('//')) {
    // Protocol-relative URL
    return `https:${url}`
  } else if (url.startsWith('/')) {
    // Absolute path on same domain
    return url
  } else {
    // Relative URL or domain without protocol - treat as external
    return `https://${url}`
  }
}

// Helper function to check if URL is external (excluding mailto/tel)
const isExternalLink = (url) => {
  if (!url) return false
  // mailto: and tel: are not external links (don't need target="_blank")
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return false
  // Other external protocols
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
  // Treat any URL that doesn't start with "/" or "#" as external
  return !url.startsWith('/') && !url.startsWith('#')
}


// Close menu function
const closeMenu = () => {
  emit('close-menu')
}

// Transition hooks
const onMenuEnter = (el) => {
  // Animate menu content in
  const menuContent = el.querySelector('.menu-overlay-content')
  const menuLinks = el.querySelectorAll('.menu-link a, .menu-tag a')
  
  gsap.set(menuContent, { y: '-50%' })
  gsap.set(menuLinks, { y: '100%' })
  
  gsap.to(menuContent, {
    y: '0%',
    duration: 0.3,
    ease: 'power2.out'
  })
  
  gsap.to(menuLinks, {
    y: '0%',
    duration: 0.2,
    ease: 'power2.out',
    stagger: 0.05
  })
}

const onMenuLeave = (el) => {
  // Animate menu content out
  const menuContent = el.querySelector('.menu-overlay-content')
  const menuLinks = el.querySelectorAll('.menu-link a, .menu-tag a')
  
  gsap.to(menuContent, {
    y: '-50%',
    duration: 0.5,
    ease: 'power2.in'
  })
  
  gsap.to(menuLinks, {
    y: '100%',
    duration: 0.3,
    ease: 'power2.in',
    stagger: 0.05
  })
}

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>

.menu-link, .menu-link a {
  display: block;
}

.menu-link {
  overflow: hidden;
}

.push-overlay-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}



.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--black);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.menu-overlay-content {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}

/* Left Side - Image/Media */
.menu-left {
  width: 33.333%;
  height: 100%;
  position: relative;
  background: var(--black);
}

.menu-media-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.menu-media-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Video Controls */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--white);
}

.play-btn {
  background: #ff0000;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.skip-btn {
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.time, .title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Right Side - Menu Content */
.menu-right {
  width: 66.667%;
  height: 100%;
  background: var(--black);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 800px;
  padding: 4rem;
}

.menu-content-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.menu-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-link a {
  font-size: 2rem;
  font-weight: 500;
  color: var(--white);
  text-decoration: none;
  transition: opacity 0.3s ease;
  display: block;
}

.menu-link a:hover {
  opacity: 0.7;
}

.menu-tag a {
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.menu-tag a:hover {
  opacity: 1;
}

.menu-footer p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Transition animations */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.5s ease;
}

.menu-fade-enter-from {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}

.menu-fade-leave-to {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}

/* Responsive */
@media (max-width: 799px) {
  .menu-overlay-content {
    flex-direction: column;
  }
  
  .menu-left {
    width: 100%;
    height: 40%;
  }
  
  .menu-right {
    width: 100%;
    height: 60%;
  }
  
  .menu-content-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .menu-footer {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .menu-link a {
    font-size: 1.5rem;
  }
  
  .menu-content-wrapper {
    padding: 2rem;
  }
}
</style> 