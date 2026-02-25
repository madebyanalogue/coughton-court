<template>
  <section :class="['dark section-basic-page-html', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper small">
      <div class="py2 px-3-sm px-md-0 grid grid-1 grid-md-4 gap-3">

        <div class="">
          <h2 class="h4">{{ section.basicPageHtmlContent?.title }}</h2>
        </div>

        <div class="grid grid-1 grid-md-12 py1 pbottom col-span-3-md">
          <div class="col-span-12 col-span-9-md">
            <div v-if="htmlContent" class="content-wrapper html-content show-ol heading-font" v-html="htmlContent"></div>
            <a 
              v-if="section?.basicPageHtmlContent?.pdf?.asset?.url" 
              :href="section.basicPageHtmlContent.pdf.asset.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="with-circle mt2"
            >
              <div class="circle--heading"><span class="circle"></span><span>Download PDF</span></div>
            </a>
          </div>
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
      return value && value._type === 'section' && value.sectionType === 'basicPageHtml'
    }
  }
})

const htmlContent = computed(() => props.section?.basicPageHtmlContent?.html || '')
</script>

<style scoped>
.content-wrapper {
  white-space: normal;
}

.html-content :deep(a) {
  text-decoration: underline;
}

.html-content :deep(ul),
.html-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.html-content :deep(p) {
  margin: 0.5em 0;
}
</style>
