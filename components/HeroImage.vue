<template style="aspect-ratio: 32/16.4;background:url('~@/assets/sectons/hero.jpg') no-repeat center center;background-size: cover;">
  <div class="hero-image" v-if="src">
    <NuxtImg
      :src="src"
      :alt="alt"
      :class="{ roundal: isRoundal }"
      :width="width"
      :height="height"
      quality="85"
      format="webp"
      loading="lazy"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  isRoundal: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  }
});
</script>

<style scoped>
.hero-image {
  width: 100%;
  height: 100%;
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.roundal {
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 