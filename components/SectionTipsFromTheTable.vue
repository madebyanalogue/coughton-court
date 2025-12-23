<template>
  <section :class="['section-tips-from-the-table grid grid-1 gap-2 gap-3-sm py2 py-sm-3', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
      <div v-if="title" class="wrapper">
        <div class="">
          <h2 class="h0 heading uppercase flex flex-between">
            <div 
              v-for="(word, index) in titleWords" 
              :key="index" 
              class="title-word"
            >
              {{ word }}
            </div>
          </h2>
        </div>
      </div>
    <div class="wrapper">
      <div class="tips-container">
        <div
          v-for="tip in tips"
          :key="tip._id"
          class="tip-item grid grid-1 grid-md-2 gap-1 gap-2-md"
        >
          <div class="tip-image-container flex flex-middle flex-end">
            <div v-if="tip.backgroundImage" class="tip-background-image">
              <NuxtImg
                :src="getImageUrl(tip.backgroundImage)"
                :alt="tip.title"
                class="tip-background-cover"
                loading="lazy"
                data-image-overlay
              />
            </div>
            <div class="tip-image">
              <NuxtImg
                :src="getImageUrl(tip.image)"
                :alt="tip.title"
                class="tip-cover-image"
                loading="lazy"
                data-image-overlay
              />
            </div>
          </div>
          <div class="tip-content flex flex-center flex-middle">
            <div class="grid grid-1 underline-links reverse px-md-4">
              <div class="grid grid-4">
                <div class="tip-title heading h3 col-span-3">{{ tip.title }}</div>
              </div>
              <div class="tip-text">
                <SanityBlocks :blocks="tip.content" />
              </div>
              <div v-if="tip.link && tip.link.url && tip.link.text">
                <a
                  :href="tip.link.url"
                  :target="tip.link.targetBlank ? '_blank' : '_self'"
                  :rel="tip.link.targetBlank ? 'noopener noreferrer' : ''"
                  class="tip-link btn"
                >
                  {{ tip.link.text }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
             value._type === 'section' &&
             value.sectionType === 'sectionTipsFromTheTable'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Extract data from section
const title = computed(() => {
  return props.section?.tipsFromTheTableContent?.title || 'Tips From The Table'
})

// Split title into words
const titleWords = computed(() => {
  return title.value.split(' ')
})

// Fetch tips from Sanity
const tips = ref([])



onMounted(async () => {
  try {
    const result = await $fetch('/api/sanity', { params: { type: 'tips' } })
    tips.value = result || []
  } catch (error) {
    console.error('Error fetching tips:', error)
    tips.value = []
  }
})
</script>

<style scoped>
.section-tips-from-the-table {
  width: 100%;
  background-color: var(--beige);
}

.tip-image-container {
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
}
.tip-item {
  opacity: 0;
  animation: fadeIn 1.5s ease-in-out forwards;
}

.tip-item:nth-child(1) { animation-delay: 0.2s; }
.tip-item:nth-child(2) { animation-delay: 0.4s; }
.tip-item:nth-child(3) { animation-delay: 0.6s; }
.tip-item:nth-child(4) { animation-delay: 0.8s; }
.tip-item:nth-child(5) { animation-delay: 1.0s; }
.tip-item:nth-child(6) { animation-delay: 1.2s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tip-image {
  width: 55%;
  z-index: 1;
}


.tip-background-image {
  width: 65%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 0;
}

.tip-background-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

</style>
