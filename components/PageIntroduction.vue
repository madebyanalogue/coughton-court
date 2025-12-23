<template>
  <section v-if="enabled && (title || hasContent)" class="page-introduction scheme light">
    <div class="wrapper">
        <div class="introduction-content-wrapper grid grid-1 gap-1 text-center">
            <h2 v-if="title" class="introduction-title h5">{{ title }}</h2>
            <div v-if="hasContent" class="introduction-content centered-text-max-width">
            <SanityBlocks :blocks="content" />
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import SanityBlocks from '~/components/SanityBlocks.vue'

const props = defineProps({
  enabled: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: Array,
    default: () => []
  }
})

const hasContent = computed(() => {
  return props.content && props.content.length > 0
})
</script>

<style scoped>
.page-introduction {
  width: 100%;
}


.introduction-content :deep(p) {
  margin-bottom: 1em;
}

.introduction-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
