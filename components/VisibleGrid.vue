<template>
  <div v-if="visible" class="visible-grid">
    <div class="wrapper">
      <div class="grid">
        <div v-for="n in 12" :key="n" class="grid-col"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
// Grid toggle disabled - keydown listener removed
</script>

<style scoped>
.visible-grid {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap);
  width: 100%;
  height: 100vh;
}
.grid-col {
  background: black;
  opacity: 0.1;
  border-radius: 2px;
  height: 100%;
}
</style> 