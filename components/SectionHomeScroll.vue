<template>
  <section :class="['home-scroll-section', { 'section-border-top': section.borderTop }]">
    <div class="home--container">
      <div class="logo home--logo"><Logo /></div>
      <div class="container" v-if="hasItems">
        <div 
          v-for="(item, index) in section.homeScrollContent.items" 
          :key="item._key"
          class="media"
        >
          <NuxtLink 
            v-if="item.link && item.link.page && item.link.page.slug && item.link.page.slug.current"
            :to="`/${item.link.page.slug.current}`"
            class="media-link"
          >
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="item.title"
            />
            <h3 class="media-title">{{ item.title }}</h3>
          </NuxtLink>
          <a 
            v-else-if="item.link && item.link.url"
            :href="item.link.url"
            class="media-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="item.title"
            />
            <h3 class="media-title">{{ item.title }}</h3>
          </a>
          <div v-else>
            <p class="error">Missing link for item: {{ item.title }}</p>
          </div>
        </div>
      </div>
      <div v-else class="wrapper py6">
        <p class="error">Home Scroll section is missing <b>homeScrollContent</b> or <b>items</b>.<br>
          <span>Raw section data:</span>
          <pre style="font-size:12px;max-width:100vw;overflow:auto;">{{ JSON.stringify(section, null, 2) }}</pre>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import gsap from 'gsap';
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})



const { getImageUrl } = useSanityImage()

const hasItems = computed(() => {
  return (
    props.section &&
    props.section.homeScrollContent &&
    Array.isArray(props.section.homeScrollContent.items) &&
    props.section.homeScrollContent.items.length > 0
  )
})

let incr = 800, deltaObject = ref({delta: 0}), deltaTo, tl, isWheeling
const mediaArray = ref([])
let currentCycle = 0
let trajectoryAngles = [0, 45, 90, 135, 180, 225, 270, 315]

const isMobile = ref(false);

function handleResize() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024;
  }
}

onMounted(() => {
  handleResize();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  if (!hasItems.value) {
    return;
  }
  
  // Wait for preloader to complete before initializing animations
  const initHomeScrollAnimations = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('no-smooth')
      document.body.classList.add('has-home-scroll')
    }

    const root = typeof document !== 'undefined' ? document.querySelector('.home--container') : null;
    const container = root ? root.querySelector('.container') : null;

    // Build media array from Sanity images
    mediaArray.value = props.section.homeScrollContent.items.map(item => 
      getImageUrl(item.image)
    )

    const medias = root ? root.querySelectorAll('.media') : [];
    const mediasImg = root ? root.querySelectorAll('.media img') : [];

    // Set initial images
    mediasImg.forEach((img, index) => {
      img.setAttribute('src', mediaArray.value[index])
    })

    // QUICK TOS
    deltaTo = gsap.quickTo(deltaObject.value, 'delta', { duration: 2, ease: "power1" })
    const rotY = container ? gsap.quickTo(container, "rotationY", {duration: 0.5, ease: 'power1'}) : () => {};
    const rotX = container ? gsap.quickTo(container, "rotationX", {duration: 0.5, ease: 'power1'}) : () => {};

    medias.forEach(media => {
        updateMedia(media)
    })

    tl = gsap.timeline({
        paused: true
    })

    // Continue with the rest of the animation setup...
    // (keeping the existing animation logic)
  }

  // Always wait for preloader completion
  document.addEventListener('preloader-complete', () => {
    initHomeScrollAnimations()
  })
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('has-home-scroll')
    document.body.classList.remove('no-smooth')
  }
})

watch(isMobile, (newVal) => {
  if (typeof document === 'undefined') return;
  const root = document.querySelector('.home--container');
  if (!root) return;
  if (newVal) {
    root.classList.add('mobile');
    root.classList.remove('desktop');
  } else {
    root.classList.remove('mobile');
    root.classList.add('desktop');
  }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateMedia(media) {
    // Get the index of the current media element
    const mediaIndex = Array.from(media.parentNode.children).indexOf(media);
    
    if (mediaIndex === 0) {
        currentCycle++;
        if (currentCycle > 0) {
            trajectoryAngles = shuffleArray([...trajectoryAngles]);
        }
    }
    
    const angle = trajectoryAngles[mediaIndex] * (Math.PI / 180);
    const distance = (0.45 + Math.random() * 0.2) * Math.min(window.innerWidth, window.innerHeight);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    gsap.set(media, {
        xPercent: -50,
        yPercent: -50,
        x: x,
        y: y,
    })
}

function handleWheel(e) {
    deltaTo(e.deltaY)

    window.clearTimeout(isWheeling) // Kill setTimeout
    isWheeling = setTimeout(() => { // Init setTimeout
        deltaTo(0) // Reset speed
    }, 120)
}

function tick(time, dt) {
    incr += deltaObject.value.delta / 600 + dt / 800
    tl.time(incr) // time() : go to a specific time of a timeline
}


</script>

<style>
body.has-home-scroll main {
  min-height: unset !important;
  padding-top: 0 !important;
}

body.has-home-scroll .back-to-top {
  display: none !important;
}
</style>

<style scoped>
/* When this section is present, these styles will affect the parent elements */
:global(.home-scroll-section ~ main) {
  min-height: unset;
  padding-top: 0 !important;
}

:global(.home-scroll-section ~ .back-to-top) {
  display: none;
}

.home--logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.home--container {
  height: 100vh;
  perspective: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}
.home--container .container {
  height: 100%;
  transform-style: preserve-3d;
  position: relative;
}

.home--container .media {
  width: 24%;
  height: auto;
  position: absolute;
  transform: translateZ(-200vw);
  z-index: 2;
}


.home--container .media-link {
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.home--container .media-title {
  margin-top: calc(var(--unit) * 1);
  font-size: calc(var(--unit) * 1);
  text-align: center;
  color: #fff;
  font-weight: 500;
  text-transform: uppercase;
}

.home--container .media img {
  width: 100%;
  height: auto;
  display: block;
  box-shadow: 1px 1px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.6s ease;
  transform-origin: bottom;
}

@media (min-width: 1023px) {
  .home--container .media-title {
    margin-top: 15px;
    font-size: 30px;
  }
  .home--container .media {
    width: 280px;
  }
}

.home--container .media-link:hover img {
  transform: scale(1.05);
}

.home--container .preload-medias img {
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

@media (max-width: 768px) {
  .home--container .media {
    width: 40%;
    z-index: 2;
  }
  
  .home--container .media-link {
    z-index: 9999;
    pointer-events: all;
  }
}


.home--container.mobile .media .media-title {
  opacity: 0;
}

/* 

.home--container.mobile .media {
  transform: none !important;
  position: relative;
  width: 100%;
}


.home--container.mobile {
  perspective: unset;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5vw;
}
.home--container.mobile .container {
  height: 100vw;
  transform-style: preserve-3d;
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3vw;
  grid-template-rows: repeat(6, 1fr);
  justify-content: end;
  align-content: center;
  max-width: 100vh;
}
.home--container.mobile .media img {
  aspect-ratio: 1 / .95;
  object-fit: contain;
}

.home--container.mobile .media {
  grid-column: span 2;
  grid-row: span 2;
  filter: blur(0px) !important;
  opacity: 1 !important;
}

.home--container.mobile .media:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 1; }
.home--container.mobile .media:nth-child(2) { grid-column: 3 / 5; grid-row: 1 / 2; }
.home--container.mobile .media:nth-child(3) { grid-column: 5 / 7; grid-row: 1 / 2; }
.home--container.mobile .media:nth-child(4) { grid-column: 1 / 3; grid-row: 2 / 3; }
.home--container.mobile .media:nth-child(5) { grid-column: 5 / 7; grid-row: 2 / 3; }
.home--container.mobile .media:nth-child(6) { grid-column: 2 / 4; grid-row: 3 / 4; }
.home--container.mobile .media:nth-child(7) { grid-column: 4 / 6; grid-row: 3 / 4; }

.home--container.mobile .home--logo {
  max-width: 21vw;
  margin-top: -5vw;
} */




</style> 