<template>
  <section :class="['section-usps', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]" ref="sectionRef">
    <div class="wrapper">
      <div class="grid grid-1 py7 px-md-5">
        <div>
          <div class="grid grid-2 grid-md-4 h4 usps-grid">
            <div v-for="(item, index) in items" :key="index" class="usp-item">
              <div class="usp grid grid-1 gap-1 gap-sm-2">
                <div class="usp grid grid-2">
                  <div class="usp-image-container">
                    <img 
                      v-if="item.image?.asset?.url"
                      :src="item.image.asset.url" 
                      :alt="item.title || 'USP'"
                      class="square usp-image"
                      :data-index="index"
                    />
                  </div>
                </div>
                <div class="grid grid-1 gap-1 usp-content" :data-index="index">
                  <div class="usp--title">
                    <span class="">{{ item.title }}:</span>
                  </div>
                  <SanityBlocks v-if="item.description" :blocks="item.description" class="usp-description" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'
import gsap from 'gsap'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const sectionRef = ref(null)
const items = computed(() => props.section?.uspsContent?.items || [])

const setupAnimations = () => {
  if (!sectionRef.value) return
  gsap.set('.usp-content', { opacity: 0, y: 20 })
  const tl = gsap.timeline({ paused: true })
  tl.to('.usp-content', { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' })
  tl.play(0)
}

onMounted(() => {
  nextTick(setupAnimations)
})
</script>

<style scoped>
.usps-grid {
  gap: var(--pad-2) var(--pad-1);
}
@media (min-width: 800px) {
  .usps-grid {
    gap: var(--pad-2) var(--pad-2);
  }
}
.usp-image-container {
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
}

.usp-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
