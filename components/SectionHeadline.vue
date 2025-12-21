<template>
  <section v-if="section?.headlineContent" :id="sectionId" ref="sectionRef" :class="{ 'section-border-top': section.borderTop }">
    <div class="wrapper">
      <div :class="`py${section.headlineContent.paddingBottom || '0'} pbottom`">
        <div
          class="grid"
          :class="{
            'text-center': section.headlineContent.centerText,
            'grid-center-items': section.headlineContent.centerBlock
          }"
        >
          <div class="col-span-12 col-span-7-md">
            <div class="h2" data-fade-in>
              <SanityBlocks v-if="Array.isArray(section.headlineContent.headline)" :blocks="section.headlineContent.headline" />
              <div v-else-if="section.headlineContent.headline" v-html="section.headlineContent.headline.replace(/\n/g, '<br>')"></div>
            </div>
            <div v-if="section.headlineContent?.button?.text && section.headlineContent?.button?.url" class="py3 padtop">
              <a :href="section.headlineContent.button.url" class="btn" data-btn-hover>
                <span class="btn__text">{{ section.headlineContent.button.text }}</span>
                <div class="btn__circle"></div>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Scroll Arrow -->
        <div v-if="section.headlineContent.showArrow" class="scroll-arrow-container">
          <button @click="scrollToBottom" class="scroll-arrow" aria-label="Scroll to bottom of section">
            <div class="arrow"></div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'headline' &&
             value.headlineContent
    }
  }
})

// Initialize scroll trigger system
const { registerSection, unregisterSection } = useScrollTrigger()

// Section reference for scroll targeting
const sectionRef = ref(null)



// Generate unique section ID for scroll targeting
const sectionId = computed(() => `section-${props.section._id}`)

// Scroll to bottom of current section function
const scrollToBottom = () => {
  const currentSection = document.getElementById(sectionId.value)
  if (currentSection) {
    // Get the bottom position of the current section
    const rect = currentSection.getBoundingClientRect()
    const bottomPosition = rect.bottom + window.scrollY
    
    // Scroll to that position
    window.scrollTo({
      top: bottomPosition,
      behavior: 'smooth'
    })
  }
}


</script>

<style scoped>
.scroll-arrow-container {
  display: flex;
  justify-content: start;
  margin-top: calc(var(--pad-1) / 2);
}

.scroll-arrow {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: inherit;
  position: relative;
  transform: rotate(180deg);
}

.scroll-arrow:hover {
  transform: translateY(2px) rotate(180deg);
}

.scroll-arrow .arrow {
  position: relative;
}

/* Initial state for scroll animations */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
}
</style>