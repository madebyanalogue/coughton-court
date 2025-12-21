<template>
  <div class="">
    <div class="hero-section-container py2 px2">
      <!-- Hero section -->
      <section ref="heroSectionRef" :class="['hero-section', { 'section-border-top': section.borderTop }]" data-momentum-hover-init style="opacity: 0; visibility: hidden;">
        <div v-if="isSvg && svgContent" class="hero-image svg-loading" data-momentum-hover-element v-html="svgContent"></div>
        <img v-else :src="imageUrl" alt="Hero Image" class="hero-image" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import { useRouter } from '#app'
import { gsap } from 'gsap'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  isFirstSection: {
    type: Boolean,
    default: false
  }
});

const { getImageUrl } = useSanityImage()

const imageUrl = computed(() => {
  if (props.section?.heroContent?.image) {
    return getImageUrl(props.section.heroContent.image)
  }
  return null
})

const headerPadding = computed(() => {
  return props.section?.heroContent?.headerPadding || false
})

const router = useRouter()
const svgContent = ref(null)
const isSvg = computed(() => isSvgUrl(imageUrl.value))
const heroSectionRef = ref(null)

function isSvgUrl(url) {
  if (!url || typeof url !== 'string') return false
  const withoutQuery = url.split('?')[0].toLowerCase()
  return withoutQuery.endsWith('.svg')
}

async function loadSvgIfNeeded(url) {
  if (!url || !isSvgUrl(url)) {
    svgContent.value = null
    return
  }
  try {
    // Use local proxy to bypass CORS
    const proxyUrl = `/api/proxy-svg?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      svgContent.value = null
      return
    }
    const text = await response.text()
    svgContent.value = processSvg(text)
  } catch (_error) {
    svgContent.value = null
  }
}

function processSvg(svgText) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return svgText
    svgEl.removeAttribute('width')
    svgEl.removeAttribute('height')
    const inlineStyle = svgEl.getAttribute('style')
    if (inlineStyle) {
      const cleaned = inlineStyle
        .replace(/(^|;)\s*width\s*:[^;]*;?/gi, '$1')
        .replace(/(^|;)\s*height\s*:[^;]*;?/gi, '$1')
        .replace(/;+\s*$/g, '')
        .trim()
    
      if (cleaned) svgEl.setAttribute('style', cleaned)
      else svgEl.removeAttribute('style')
    }
    
    // Add data attributes directly to the SVG element and its children
    svgEl.removeAttribute('data-momentum-hover-target') // Remove from root SVG
    
    // First, clear any existing targets from all descendants
    svgEl.querySelectorAll('[data-momentum-hover-target]').forEach(n => n.removeAttribute('data-momentum-hover-target'))
    
    // Apply effect ONLY to immediate children of <svg>
    const skipTags = new Set(['defs', 'clippath', 'mask', 'metadata', 'title', 'desc'])
    const immediateChildren = Array.from(svgEl.children)
    const tagged = []
    immediateChildren.forEach((child) => {
      const tag = child.tagName.toLowerCase()
      if (!skipTags.has(tag)) {
        // If it's not already a group, wrap it in one
        if (tag !== 'g') {
          const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          wrapper.setAttribute('data-momentum-hover-target', '')
          wrapper.style.cssText = 'opacity: 0; visibility: hidden; transform: translateY(20px) scale(0.8);'
          
          // Replace the child with the wrapper and move the child inside it
          child.parentNode.insertBefore(wrapper, child)
          wrapper.appendChild(child)
          
          tagged.push(`wrapped-${tag}`)
        } else {
          // It's already a group, just add the attributes
          child.setAttribute('data-momentum-hover-target', '')
          child.style.cssText = 'opacity: 0; visibility: hidden; transform: translateY(20px) scale(0.8);'
          tagged.push(tag)
        }
      }
    })


    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgEl)
  } catch (_e) {
    // Fallback: strip width/height attributes via regex only on opening <svg ...>
    const stripped = svgText
      .replace(/<svg([^>]*?)\swidth=\"[^\"]*\"([^>]*)>/i, '<svg$1$2>')
      .replace(/<svg([^>]*?)\sheight=\"[^\"]*\"([^>]*)>/i, '<svg$1$2>')
    return stripped
  }
}

// Apply grey background to HTML if this is the first section
onMounted(() => {
  if (props.isFirstSection) {
    document.documentElement.style.backgroundColor = 'var(--grey)'
  }
  loadSvgIfNeeded(imageUrl.value)
  watch(imageUrl, (newUrl) => {
    loadSvgIfNeeded(newUrl)
  })
  
  // Function to animate SVG elements in sequentially
const animateSvgElementsIn = () => {
  console.log('animateSvgElementsIn called')
  nextTick(() => {
    if (heroSectionRef.value) {
      console.log('Hero section ref found, showing section...')
      // First, show the hero section by removing inline styles
      heroSectionRef.value.style.cssText = ''
      
      // Remove the loading class and add loaded class to hero-image
      const heroImage = heroSectionRef.value.querySelector('.hero-image')
      if (heroImage) {
        heroImage.classList.remove('svg-loading')
        heroImage.classList.add('svg-loaded')
      }
    }
      
      // Wait a frame for the container to be visible
      requestAnimationFrame(() => {
        // Add additional 100ms delay to ensure everything is ready
        setTimeout(() => {
          // Look for SVG elements within the hero section specifically
          const svgElements = heroSectionRef.value?.querySelectorAll('[data-momentum-hover-target]') || []
          
          if (svgElements.length === 0) {
            return
          }
          
          // Remove only the hiding styles we added, but preserve all other styles
          svgElements.forEach(el => {
            // Clear only the specific hiding styles we added
            el.style.opacity = ''
            el.style.visibility = ''
            el.style.transform = ''
          })
          
          // Set initial state - elements start invisible and slightly offset
          gsap.set(svgElements, {
            opacity: 0,
            y: 30,
            scale: 0.8
          })
          
          // Animate elements in with stagger
          gsap.to(svgElements, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.2
          })
        }, 100)
      })
    })
  }

  // Watch for SVG content changes and animate elements in
  watch(svgContent, (newContent) => {
    if (newContent) {
      // Process SVG content
      const processedContent = processSvg(newContent)
      svgContent.value = processedContent
      
      // Dispatch event for momentum hover plugin
      nextTick(() => {
        // Trigger a custom event to re-initialize momentum hover
        window.dispatchEvent(new CustomEvent('svg-loaded'))

        // If preloader already finished (navigating between pages), animate immediately
        const body = document?.body
        const preloaderDone = body?.classList.contains('preloader-complete')
        if (preloaderDone) {
          animateSvgElementsIn()
        } else {
          // Otherwise, wait once for completion
          const onComplete = () => {
            animateSvgElementsIn()
            document.removeEventListener('preloader-complete', onComplete)
          }
          document.addEventListener('preloader-complete', onComplete)
        }
      })
    }
  })

  // Listen for route changes to trigger animation on page navigation
  router.afterEach(() => {
    console.log('Route changed, checking if we should animate hero...')
    // Small delay to ensure the new page content is rendered
    setTimeout(() => {
      if (svgContent.value && heroSectionRef.value) {
        // Trigger animation on route change
        console.log('Route changed, triggering hero animation...')
        animateSvgElementsIn()
      } else {
        console.log('Cannot animate hero: svgContent:', !!svgContent.value, 'heroSectionRef:', !!heroSectionRef.value)
      }
    }, 200)
  })
})

onUnmounted(() => {
  if (props.isFirstSection) {
    document.documentElement.style.backgroundColor = ''
  }
})
</script>


<style scoped>
.hero-section-container {
  background-color: var(--grey);
  padding-top: var(--header-height);
  margin-top: calc(var(--header-height) * -1);
}
@media all and (max-width: 1023px) {
  .hero-section-container {
    padding-top: calc(var(--header-height) + var(--pad-4));
    padding-bottom: var(--pad-3);
  }
}
.hero-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 15/7;
  position: relative;
  background-color: transparent;
}

.hero-section.header-padding {
  margin-top: var(--header-height);
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hero-image > *  {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  overflow: visible;
}

/* Hide SVG elements initially to prevent flash */
.hero-image.svg-loading {
  opacity: 0;
  visibility: hidden;
}

.hero-image [data-momentum-hover-target] {
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px) scale(0.8);
}

/* Show SVG elements when they have the 'svg-loaded' class */
.hero-image.svg-loaded [data-momentum-hover-target] {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  transition: opacity 0.6s ease, transform 0.6s ease, visibility 0s;
}

/* Inner SVG <g data-momentum-hover-target> is animated; no extra wrapper needed */
</style> 