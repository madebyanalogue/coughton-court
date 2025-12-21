<template>
  <section ref="sectionRef" :class="['section-faqs', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-2 gap-3">
        
        <!-- Left: Image -->
        <div v-if="image" class="faqs-image">
          <NuxtImg 
            :src="getImageUrl(image)" 
            :alt="subtitle || 'FAQs'"
            class="faqs-image__img"
            loading="lazy"
          />
        </div>

        <!-- Right: FAQs -->
        <div class="faqs-content">
          <h3 v-if="subtitle" class="faqs-subtitle">{{ subtitle }}</h3>
          
          <div class="faqs-list">
            <details 
              v-for="(faq, index) in faqs" 
              :key="index"
              class="faq-item"
            >
              <summary class="faq-question">{{ faq.question }}</summary>
              <div class="faq-answer">
                <SanityBlocks :blocks="faq.answer" />
              </div>
            </details>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const sectionRef = ref(null)

const subtitle = computed(() => props.section?.faqsContent?.subtitle || 'FAQs')
const image = computed(() => props.section?.faqsContent?.image || null)
const faqs = computed(() => props.section?.faqsContent?.faqs || [])

onMounted(() => {
  if (sectionRef.value) {
    registerSection(`faqs-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
          })
        }
      }
    })
  }
})

onUnmounted(() => {
  unregisterSection(`faqs-${props.section._id}`)
})
</script>

<style scoped>
.section-faqs {
  opacity: 0;
  padding: 4rem 0;
}

.faqs-image {
  width: 100%;
}

.faqs-image__img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.faqs-content {
  width: 100%;
}

.faqs-subtitle {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600, #666);
  margin-bottom: 2rem;
}

.faqs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border-bottom: 1px solid var(--gray-200, #e5e5e5);
  padding-bottom: 1rem;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  list-style: none;
  padding: 0.5rem 0;
  position: relative;
  padding-right: 2rem;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-question::after {
  content: '+';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  font-weight: 300;
  transition: transform 0.2s;
}

.faq-item[open] .faq-question::after {
  content: '−';
}

.faq-question:hover {
  color: var(--black, #000);
}

.faq-answer {
  padding-top: 1rem;
  padding-left: 0;
  color: var(--gray-700, #555);
  line-height: 1.6;
}
</style>

