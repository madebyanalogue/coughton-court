<template>
  <section ref="sectionRef" :class="['section-faqs', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-2 gap-3 gap-4-md px-md-4">
        
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
          <h3 v-if="subtitle" class="faqs-subtitle h4">{{ subtitle }}</h3>
          
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


.faqs-list {
  display: flex;
  flex-direction: column;
}

.faq-item {
  border-bottom: 1px solid currentColor;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  cursor: pointer;
  list-style: none;
  padding: calc(var(--pad-1) * .8) 0;
  position: relative;
  padding-right: calc(var(--pad-1) * 1.5);
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
  font-size:13px;
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
  padding-left: 0;
  padding:  0px 0px calc(var(--pad-1) * 1);
  letter-spacing: 0.01em;
}
</style>

