<template>
    <div class="row gap-05 social-icons">
      <a v-if="facebookUrl" :href="facebookUrl" target="_blank" rel="noopener" class="social-link">
        <div class="social-icon-circle">
          <svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="var(--background-color)">
            <path d="M200,0C89.54,0,0,89.54,0,200s89.54,200,200,200s200-89.54,200-200S310.46,0,200,0z M240.83,133.33h-25c-19.58,0-23.33,9.33-23.33,22.5v30h48.33l-6.25,48.33h-42.08v124.17h-50V233.17h-41.67v-48.33h41.67v-35.42c0-41.25,25.21-63.75,62.08-63.75c17.67,0,32.83,1.33,37.25,1.92v43.25h-25.42z"/>
          </svg>
        </div>
      </a>
      <a v-if="linkedinUrl" :href="linkedinUrl" target="_blank" rel="noopener" class="social-link">
        <div class="social-icon-circle">
          <svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="var(--background-color)">
            <path d="M125.5,93.5c-34.32,2.79-29.4,51.36,5.95,47.41,32.04-3.58,28.48-50.21-5.95-47.41ZM176.16,297.85h44.62l1.35-1.35v-84.73c0-.72,3.36-7.42,4.11-8.51,10.92-15.61,34.97-14.62,41.36,4.49.56,1.69,2.3,8.15,2.3,9.42v79.32l1.35,1.35h43.27l1.4-3.11c-3.9-36.32,12.19-104.32-21.76-128.87-21.41-15.48-57.83-12.53-71.15,12.08h-1.33c-1.27-.14.44-1.14.44-1.34v-16.68h-45.97v137.91ZM150.92,159.93h-45.97v137.91h45.97v-137.91Z"/>
          </svg>
        </div>
      </a>
      <a v-if="instagramUrl" :href="instagramUrl" target="_blank" rel="noopener" class="social-link">
        <div class="social-icon-circle">
          <svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="var(--background-color)">
            <path d="M200.91,143.58c-31.61,0-57.33,25.72-57.33,57.33s25.72,57.33,57.33,57.33,57.33-25.72,57.33-57.33-25.72-57.33-57.33-57.33ZM200.91,240.86c-22.03,0-39.95-17.92-39.95-39.96s17.92-39.95,39.95-39.95,39.95,17.92,39.95,39.95-17.92,39.96-39.95,39.96Z"/>
            <path d="M264.48,122.42c-8.24,0-14.92,6.68-14.92,14.93s6.68,14.93,14.92,14.93,14.93-6.69,14.93-14.93-6.68-14.93-14.93-14.93Z"/>
            <path d="M244.84,87.59h-87.86c-38.26,0-69.38,31.13-69.38,69.38v87.87c0,38.26,31.12,69.38,69.38,69.38h87.86c38.26,0,69.39-31.12,69.39-69.38v-87.87c0-38.26-31.13-69.38-69.39-69.38ZM297.26,244.84c0,28.9-23.52,52.42-52.42,52.42h-87.86c-28.9,0-52.42-23.52-52.42-52.42v-87.87c0-28.9,23.52-52.42,52.42-52.42h87.86c28.91,0,52.42,23.52,52.42,52.42v87.87Z"/>
          </svg>
        </div>
      </a>
    </div>
</template>

<script setup>
const props = defineProps({ 
  facebookUrl: String,
  linkedinUrl: String,
  instagramUrl: String 
})
</script>

<style scoped>
.social-icons {
  display: flex;
}

.social-link {
  display: block;
  text-decoration: none;
}

.social-icon-circle {
  width: calc(var(--unit) * 2.5);
  height: calc(var(--unit) * 2.5);
  border-radius: 50%;
  background: currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-icon-circle svg {
  width: calc(var(--unit) * 2.5);
  height: calc(var(--unit) * 2.5);
  fill:var(--background-color);
}

.social-icon-circle:hover {
  /* transform: scale(1.1); */
}
</style> 