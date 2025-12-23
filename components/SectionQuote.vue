<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper" data-fade-in>
      <div  :class="[
              'grid',
              `flex-${alignment}`
            ]">
        <div class="col-span-12 col-span-9-md py2">
          <blockquote 
            :class="[
              'quote-section',
            ]"
          >
            <div class="quote-text">
              <div class="py2 grid grid-1">
                <div class="quote-content">{{ quote }}</div>
                <cite v-if="cite" class="quote-cite">{{ cite }}</cite>
              </div>
              <div class="quote-icon quote-left">
                <svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 54.03 47.91">
                  <path d="M0,44.23v-14.87c0-.68.19-1.34.54-1.92L16.18,1.77c.67-1.1,1.86-1.77,3.14-1.77h.95c2.68,0,4.46,2.77,3.35,5.2l-6.79,14.98c-1.07,2.36.56,5.05,3.14,5.2h0c1.95.11,3.47,1.72,3.47,3.68v15.17c0,2.03-1.65,3.68-3.68,3.68H3.68c-2.03,0-3.68-1.65-3.68-3.68Z"/>
                  <path d="M29.08,44.23v-14.87c0-.68.19-1.34.54-1.92L45.25,1.77c.67-1.1,1.86-1.77,3.14-1.77h.95c2.68,0,4.46,2.77,3.35,5.2l-6.79,14.98c-1.07,2.36.56,5.05,3.14,5.2h0c1.95.11,3.47,1.72,3.47,3.68v15.17c0,2.03-1.65,3.68-3.68,3.68h-16.08c-2.03,0-3.68-1.65-3.68-3.68Z"/>
                </svg>
              </div>
              <div class="quote-icon quote-right">
                <svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 54.03 47.91">
                  <path d="M0,44.23v-14.87c0-.68.19-1.34.54-1.92L16.18,1.77c.67-1.1,1.86-1.77,3.14-1.77h.95c2.68,0,4.46,2.77,3.35,5.2l-6.79,14.98c-1.07,2.36.56,5.05,3.14,5.2h0c1.95.11,3.47,1.72,3.47,3.68v15.17c0,2.03-1.65,3.68-3.68,3.68H3.68c-2.03,0-3.68-1.65-3.68-3.68Z"/>
                  <path d="M29.08,44.23v-14.87c0-.68.19-1.34.54-1.92L45.25,1.77c.67-1.1,1.86-1.77,3.14-1.77h.95c2.68,0,4.46,2.77,3.35,5.2l-6.79,14.98c-1.07,2.36.56,5.05,3.14,5.2h0c1.95.11,3.47,1.72,3.47,3.68v15.17c0,2.03-1.65,3.68-3.68,3.68h-16.08c-2.03,0-3.68-1.65-3.68-3.68Z"/>
                </svg>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'quote'
    }
  }
})

// Extract quote content
const quote = computed(() => props.section?.quoteContent?.quote || '')
const cite = computed(() => props.section?.quoteContent?.cite || '')
const alignment = computed(() => props.section?.quoteContent?.alignment || 'left')
</script>

<style scoped>
.quote-section {
 
}

.quote-text {
  padding-left: var(--pad-4);
  position:relative;
}
.quote-content {
  font-size: var(--h1);
  line-height: 1.1;
}
.quote-cite {
  font-style: normal;
  display: block;
}

.quote-icon {
  position: absolute;
  width:var(--pad-2);
}
.quote-icon.quote-left {
  left:0;
  top:0;
}
.quote-icon.quote-right {
  right: 0;
  bottom:0;
  transform: rotate(180deg);
}

</style> 