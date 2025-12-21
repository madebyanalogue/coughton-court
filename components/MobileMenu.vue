<template>
  <div ref="navWrap" data-navigation-status="not-active" class="nav" :class="{ 'nav-open': isOpen }">
    <div ref="overlay" data-navigation-toggle="close" class="overlay" @click="closeMenu"></div>
    <nav ref="menu" class="menu">
      <div class="menu-bg">
        <div ref="bgPanel1" class="bg-panel first"></div>
        <div ref="bgPanel2" class="bg-panel second"></div>
        <div ref="bgPanel3" class="bg-panel scheme dark"></div>
      </div>
      <div class="menu-inner">
        <ul class="menu-list">
          <li 
            v-for="(item, index) in menuItems" 
            :key="item.text"
            class="menu-list-item"
          >
            <NuxtLink 
              v-if="item.to?.page?.slug?.current" 
              :to="`/${item.to.page.slug.current}`"
              class="menu-link w-inline-block"
              @click="closeMenu"
            >
              <p class="menu-link-heading">{{ item.text }}</p>
              <p class="eyebrow">{{ String(index + 1).padStart(2, '0') }}</p>
            </NuxtLink>
            <a 
              v-else-if="item.to?.url" 
              :href="getProcessedUrl(item.to.url)" 
              target="_blank" 
              rel="noopener"
              class="menu-link w-inline-block"
              @click="closeMenu"
            >
              <p class="menu-link-heading">{{ item.text }}</p>
              <p class="eyebrow">{{ String(index + 1).padStart(2, '0') }}</p>
            </a>
          </li>
        </ul>
        <div class="menu-details" v-if="hasAnySocials">
          <p ref="socialsTitle" data-menu-fade class="p-small">Socials</p>
          <div class="socials-row">
            <a 
              v-if="linkedinUrl" 
              ref="linkedinLink"
              data-menu-fade 
              :href="linkedinUrl" 
              target="_blank" 
              rel="noopener"
              class="p-large text-link"
            >
              LinkedIn
            </a>
            <a 
              v-if="instagramUrl" 
              ref="instagramLink"
              data-menu-fade 
              :href="instagramUrl" 
              target="_blank" 
              rel="noopener"
              class="p-large text-link"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useMenu } from '~/composables/useMenu'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useUrlProcessing } from '~/composables/useUrlProcessing'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close-menu'])

const { mainMenu } = useMenu()
const { linkedinUrl, instagramUrl } = useSiteSettings()
const { getProcessedUrl } = useUrlProcessing()

const menuItems = computed(() => mainMenu?.value?.items || [])

const hasAnySocials = computed(() => {
  const hasLinkedIn = Boolean(linkedinUrl && String(linkedinUrl).trim().length > 0)
  const hasInstagram = Boolean(instagramUrl && String(instagramUrl).trim().length > 0)
  return hasLinkedIn || hasInstagram
})

const closeMenu = () => {
  emit('close-menu')
}

// GSAP animations
let tl = null

// Refs
const navWrap = ref(null)
const overlay = ref(null)
const menu = ref(null)
const bgPanel1 = ref(null)
const bgPanel2 = ref(null)
const bgPanel3 = ref(null)
const socialsTitle = ref(null)
const linkedinLink = ref(null)
const instagramLink = ref(null)

onMounted(() => {
  // Register custom ease
  if (typeof window !== 'undefined' && window.gsap && window.CustomEase) {
    const gsap = window.gsap
    const CustomEase = window.CustomEase
    
    gsap.registerPlugin(CustomEase)
    CustomEase.create("main", "0.65, 0.01, 0.05, 0.99")
    
    gsap.defaults({
      ease: "main",
      duration: 0.7
    })
  }
})

onUnmounted(() => {
  if (tl) {
    tl.kill()
  }
})

// Watch for menu state changes
watch(() => props.isOpen, async (newValue) => {
  await nextTick()
  
  if (newValue) {
    openNav()
  } else {
    closeNav()
  }
})

// ESC key to close
const handleKeydown = (e) => {
  if (e.key === "Escape" && navWrap.value?.getAttribute("data-nav") === "open") {
    closeNav()
    emit('close-menu')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (tl) {
    tl.kill()
  }
})

const openNav = () => {
  if (!navWrap.value || !menu.value) return
  
  navWrap.value.setAttribute("data-nav", "open")
  
  tl = gsap.timeline()
  
  // Get menu links dynamically
  const menuLinks = navWrap.value.querySelectorAll(".menu-link")
  
  // Collect fade targets
  const fadeTargets = []
  if (socialsTitle.value) fadeTargets.push(socialsTitle.value)
  if (linkedinLink.value) fadeTargets.push(linkedinLink.value)
  if (instagramLink.value) fadeTargets.push(instagramLink.value)
  
  tl.clear()
    .set(navWrap.value, { display: "block" })
    .set(menu.value, { xPercent: 0 }, "<")
    .fromTo(overlay.value, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
    .fromTo([bgPanel1.value, bgPanel2.value, bgPanel3.value], { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
    .fromTo(menuLinks, { yPercent: 200, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35")
    .fromTo(fadeTargets, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04 }, "<+=0.2")
}

const closeNav = () => {
  if (!navWrap.value || !menu.value) return
  
  navWrap.value.setAttribute("data-nav", "closed")
  
  tl = gsap.timeline()
  
  tl.clear()
    .to(overlay.value, { autoAlpha: 0 })
    .to(menu.value, { xPercent: 120 }, "<")
    .set(navWrap.value, { display: "none" })
}
</script>

<style scoped>
.nav {
  z-index: 10000;
  width: 100%;
  height: 100svh;
  margin-left: auto;
  margin-right: auto;
  display: none;
  position: fixed;
  inset: 0%;
}

.menu {
  grid-column-gap: 5em;
  grid-row-gap: 5em;
  flex-flow: column;
  justify-content: space-between;
  align-items: flex-start;
  width: 400px;
  height: 100%;
  margin-left: auto;
  padding-top: calc(0.75vw + 90px);
  padding-bottom: 60px;
  position: relative;
  overflow: auto;
}

.menu-bg {
  z-index: 0;
  position: absolute;
  inset: 0%;
}

.bg-panel {
  z-index: 0;
  /* border-top-left-radius: 1.25em;
  border-bottom-left-radius: 1.25em; */
  position: absolute;
  inset: 0%;
}

.bg-panel.first {
  background-color: transparent;
}

.bg-panel.second {
  background-color: transparent;
}

.menu-inner {
  z-index: 1;
  grid-column-gap: 5em;
  grid-row-gap: 5em;
  flex-flow: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  display: flex;
  position: relative;
  overflow: auto;
}

.menu-list {
  flex-flow: column;
  width: 100%;
  margin-bottom: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
}

.menu-list-item {
  height: auto;
  position: relative;
  overflow: hidden;
}

.menu-link {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  color: var(--dark-grey);
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 40px;
  text-decoration: none;
  display: flex;
  transition: color 0.3s ease;
}
.menu-link:hover {
  color: var(--white);
}

.menu-link-heading {
  z-index: 1;
  text-transform: none;
  font-size: 38px;
  font-weight: 400;
  line-height: 0.75;
  transition: transform 0.55s cubic-bezier(0.65, 0.05, 0, 1);
  position: relative;
}

.eyebrow {
  z-index: 1;
  color: var(--white);
  text-transform: uppercase;
  font-weight: 400;
  position: relative;
}

.menu-details {
  grid-column-gap: 1.25em;
  grid-row-gap: 1.25em;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 2em;
  display: flex;
}

.socials-row {
  grid-column-gap: 1.5em;
  grid-row-gap: 1.5em;
  flex-flow: row;
  display: flex;
}

.p-small {
  font-size: 0.875em;
  margin: 0;
}

.p-large {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 20px;
}
@media (min-width: 800px) {
.p-large {
    font-size: 20px;
  }
}


.p-large.text-link {
  color: var(--white);
  text-decoration: none;
  transition: color 0.3s ease;
}

.p-large.text-link:hover {
  color: var(--white);
}

.overlay {
  z-index: 0;
  cursor: pointer;
  background-color: rgba(19, 19, 19, 0.4);
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0%;
}
.nav-open .overlay {
  pointer-events: all;
}

/* Responsive */
@media (max-width: 600px) {
  .menu {
    width: 100%;
    padding-top: 80px;
    padding-bottom: 40px;
  }
  
  .menu-link-heading {
    font-size: 30px;
  }
  
}
</style>
