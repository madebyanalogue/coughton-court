<template>
  <section ref="sectionRef" :class="['section-directions', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-2 gap-3">
        
        <!-- Left: Title and Tabs -->
        <div class="directions-content">
          <h2 v-if="title" class="directions-title">{{ title }}</h2>
          
          <div v-if="tabs && tabs.length > 0" class="directions-tabs">
            <div class="directions-tabs__header">
              <button
                v-for="(tab, index) in tabs"
                :key="index"
                @click="activeTab = index"
                class="directions-tabs__button"
                :class="{ 'directions-tabs__button--active': activeTab === index }"
              >
                {{ tab.tabTitle }}
              </button>
            </div>
            
            <div class="directions-tabs__content">
              <div
                v-for="(tab, index) in tabs"
                :key="index"
                v-show="activeTab === index"
                class="directions-tabs__panel"
              >
                <SanityBlocks v-if="tab.content" :blocks="tab.content" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Google Map -->
        <div v-if="mapEmbedCode" class="directions-map">
          <div v-html="mapEmbedCode" class="directions-map__embed"></div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const sectionRef = ref(null)
const activeTab = ref(0)

const title = computed(() => props.section?.directionsContent?.title || '')
const tabs = computed(() => props.section?.directionsContent?.tabs || [])
const mapEmbedCode = computed(() => props.section?.directionsContent?.mapEmbedCode || '')
</script>

<style scoped>
.section-directions {
  padding: var(--section-padding, 2rem) 0;
}

.directions-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.directions-title {
  margin: 0;
  font-family: var(--heading, inherit);
}

.directions-tabs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.directions-tabs__header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.5rem;
}

.directions-tabs__button {
  background: none;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  text-decoration: none;
  position: relative;
  transition: opacity 0.2s;
}

.directions-tabs__button:hover {
  opacity: 0.7;
}

.directions-tabs__button--active {
  text-decoration: underline;
}

.directions-tabs__content {
  min-height: 200px;
}

.directions-tabs__panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.directions-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.directions-map__embed {
  width: 100%;
  height: 100%;
}

.directions-map__embed :deep(iframe) {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
}

@media (max-width: 768px) {
  .directions-map {
    min-height: 300px;
  }
  
  .directions-map__embed :deep(iframe) {
    min-height: 300px;
  }
}
</style>

