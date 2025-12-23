<template>
  <section ref="sectionRef" :class="['section-service', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="service-content-container grid grid-1 py15 py-sm-3">
        


        <div v-if="service" class="service-section py1 pbottom">
          <div class="service-container grid h6" :class="alignmentClass">
            
            <!-- Service Content -->
            <div class="service-content col-span-12 col-span-9-md" :data-index="0">

              <div class="flex flex-middle flex-between service--title--container">
                <div class="h4 heading service--title">
                  <span class="">{{ service.title }}</span>
                </div>
                <!-- Booking Button (falls back to site settings booking link) -->
                <div v-if="service.bookingLink || bookingLink" class="booking-section">
                  <a :href="service.bookingLink || bookingLink" target="_blank" rel="noopener" class="button h6 uppercase">
                    <span>{{ bookingTitle || 'Book' }}</span>
                  </a>
                </div>
              </div>
              
              <div v-if="service.description" class="service-description">
                {{ service.description }}
              </div>

              <!-- Subservices List -->
              <div v-if="service.subservices && service.subservices.length > 0" class="subservices-list">
                <div class="show-md">
                  <table class="subservices-table desktop-version">
                    <thead>
                      <tr>
                        <th class="subservice-title-header">Service</th>
                        <th class="subservice-duration-header">Duration</th>
                        <th class="subservice-cost-header">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(subservice, index) in service.subservices" 
                        :key="subservice.title" 
                        class="subservice-row"
                        :data-subservice-index="index"
                      >
                        <td class="subservice-title">{{ subservice.title }}</td>
                        <td class="subservice-duration" v-if="subservice.duration">({{ subservice.duration }})</td>
                        <td class="subservice-cost">{{ subservice.cost }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="hide-md">
                  <div class="subservices-table mobile-version">
                    <div>
                      <div 
                        v-for="(subservice, index) in service.subservices" 
                        :key="subservice.title" 
                        class="subservice-row grid grid-1"
                        :data-subservice-index="index"
                      >
                        <div class="subservice-title">{{ subservice.title }}</div>
                        <div class="">
                          <div class="flex flex-between flex-bottom">
                            <div class="subservice-duration flex-1" v-if="subservice.duration">({{ subservice.duration }})</div>
                            <div class="subservice-cost">{{ subservice.cost }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Testimonial -->
            <div class="col-span-12 col-span-3-md show-md">
              <div class="testimonial">
                <div v-if="testimonial && testimonial.quote" class="grid grid-1 h4 p1">
                  <blockquote class="testimonial-quote" v-html="testimonial.quote.replace(/\r?\n|\r/g, '<br>')">
                  </blockquote>
                  <cite v-if="testimonial.cite" class="testimonial-cite uppercase">{{ testimonial.cite }}</cite>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div v-else class="service-section">
          <p>No service found.</p>
        </div>



      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import SanityBlocks from '~/components/SanityBlocks.vue'
import gsap from 'gsap'
import { useScrollTrigger } from '~/composables/useScrollTrigger'
import { useSiteSettings } from '~/composables/useSiteSettings'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { bookingLink, bookingTitle } = useSiteSettings()

const { getImageUrl } = useSanityImage()
const { registerSection, unregisterSection } = useScrollTrigger()
const sectionRef = ref(null)
const hasAnimated = ref(false)

function getServiceImageUrl(image) {
  const url = image?.asset?.url
  const mimeType = image?.asset?.mimeType
  if ((mimeType && mimeType === 'image/svg+xml') || (url && url.endsWith('.svg'))) {
    return url
  }
  return getImageUrl(image)
}

const service = computed(() => props.section?.serviceContent?.service || null)
const alignment = computed(() => props.section?.serviceContent?.alignment || 'left')
const testimonial = computed(() => props.section?.serviceContent?.testimonial || null)

const alignmentClass = computed(() => {
  return alignment.value === 'right' ? 'service-right' : 'service-left'
})

// Animation setup
const setupAnimations = () => {
  if (!sectionRef.value || hasAnimated.value) return
  
  console.log('🔴 [SectionService] Setting up animations for section:', sectionRef.value)
  
  // Debug: Check if elements are found
  const titleContainer = sectionRef.value.querySelector('.service--title--container')
  // Only select visible subservice rows based on screen size
  const desktopTable = sectionRef.value.querySelector('.subservices-table.desktop-version')
  const mobileDiv = sectionRef.value.querySelector('.subservices-table.mobile-version')
  
  let subserviceRows = []
  if (window.innerWidth >= 768) {
    // Desktop: animate table rows
    subserviceRows = Array.from(sectionRef.value.querySelectorAll('.subservices-table.desktop-version .subservice-row'))
  } else {
    // Mobile: animate div rows
    subserviceRows = Array.from(sectionRef.value.querySelectorAll('.subservices-table.mobile-version .subservice-row'))
  }
  
  const quoteEl = sectionRef.value.querySelector('.testimonial-quote')
  const citeEl = sectionRef.value.querySelector('.testimonial-cite')
  const sequenceTargets = [titleContainer, ...subserviceRows, quoteEl, citeEl].filter(Boolean)

  // Set initial states immediately - scope to this section
  if (titleContainer) {
    gsap.set(titleContainer, { 
      opacity: 0,
      y: 20
    })
  }
  
  // Set initial states for visible elements only
  if (window.innerWidth >= 768) {
    // Desktop: set table rows initial state
    gsap.set(sectionRef.value.querySelectorAll('.subservices-table.desktop-version .subservice-row'), { 
      opacity: 0,
      y: 20
    })
  } else {
    // Mobile: set div rows initial state
    gsap.set(sectionRef.value.querySelectorAll('.subservices-table.mobile-version .subservice-row'), { 
      opacity: 0,
      y: 20
    })
  }

  // Set initial states for quote/cite if present
  if (quoteEl) {
    gsap.set(quoteEl, {
      opacity: 0,
      y: 20
    })
  }
  if (citeEl) {
    gsap.set(citeEl, {
      opacity: 0,
      y: 20
    })
  }

  // Register with global scroll trigger system - only trigger once
  const tl = registerSection('service', {
    trigger: sectionRef.value,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none none', // Changed to only play once
    immediateRender: false
  })

  // Only proceed if timeline was created successfully
  if (!tl) {
    console.warn('Failed to create timeline, GSAP may not be loaded yet')
    return
  }
  
  console.log('🔴 [SectionService] Timeline created successfully, adding animations')

  // Animate title first, then each row, then quote and cite (if present), with 0.2s stagger
  if (sequenceTargets.length > 0) {
    tl.to(sequenceTargets, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    })
  }

  hasAnimated.value = true
}

// Cleanup animations
const cleanupAnimations = () => {
  unregisterSection('service')
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.gsap) {
    console.log('🔴 [SectionService] Component mounted, setting up animations...')
    nextTick(() => {
      setupAnimations()
    })
  } else {
    console.warn('🔴 [SectionService] GSAP not available, skipping animations')
  }
})

// Watch for changes in service to re-setup animations if needed
watch(service, (newService) => {
  if (newService && typeof window !== 'undefined') {
    nextTick(() => {
      // Reset animation flag when service changes
      hasAnimated.value = false
      // Re-setup animations when service changes
      setupAnimations()
    })
  }
}, { immediate: false })

onUnmounted(() => {
  cleanupAnimations()
})
</script>

<style scoped>

.service-container {
  --table-padding: calc(var(--h6) / 1);
}

.testimonial-quote {
  white-space: normal;
  line-height: 1.2;
}
.service-item {
  opacity: 1;
}

.service-image-container {
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
}

.service-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Subservices Table Styles */
.subservices-table {
  width: 100%;
  border-collapse: collapse;
}

.subservices-table th {
  text-align: left;
  padding: var(--table-padding) 0;
  border-bottom: 0.05em solid currentColor;
  display: none;
}

.subservices-table td {
  padding: var(--table-padding) 0;
}

/* Ensure table rows animate as complete units with borders */
.subservice-row {
  transform-origin: center;
  box-shadow: 0px 1px 0px 0px rgba(0,0,0,0.3);
}

.mobile-version .subservice-row {
  padding: var(--table-padding) 0;
  gap: var(--table-padding) 0;
}

.service--title--container {
  padding: var(--table-padding) 0;
  border-bottom: 1px solid currentColor;
}

/* 
.subservices-table tr:last-child td {
  border-bottom: none;
} */

.desktop-version .subservice-title-header,
.desktop-version .subservice-title {
  width: 65%;
}

.desktop-version .subservice-duration-header,
.desktop-version .subservice-duration {
  width: 24%;
}

.desktop-version .subservice-cost-header,
.desktop-version .subservice-cost {
  width: 11%;
  text-align: right;
}

.mobile-version .subservice-title {
  border-bottom: 0.05em dashed;
  padding-bottom: var(--table-padding);
}


@media (min-width: 768px) {
  .service-content {
    order: 1;
  }
  
  .testimonial {
    order: 2;
  }
  
  .service-right .service-content {
    order: 2;
  }
  
  .service-right .testimonial {
    order: 1;
  }
}
</style> 