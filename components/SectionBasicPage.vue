<template>
  <section :class="['dark section-basic-page', { 'section-border-top': section.borderTop }]">
    <div class="wrapper medium">
      <div class="py2 py-sm-3 grid grid-1 gap-3">

        <div class="grid show-md" style="color: var(--yellow);">
          <div class="col-span-2-md grid grid-2">
            <div></div>
            <div class="grid grid-1 ">
                <Logo />
                <div style="width: 270%;">
                  <Logotype />
                </div>
            </div>
          </div>
        </div>

        <div class="grid py1 pbottom">
          <div></div>
          <div class="col-span-12 col-span-7-md">
            <h2>{{ section.basicContent.title }}</h2>
            <div v-if="section?.basicContent?.content" class="content-wrapper">
              <SanityBlocks :blocks="section.basicContent.content" />
            </div>
            <a 
              v-if="section?.basicContent?.pdf?.asset?.url" 
              :href="section.basicContent.pdf.asset.url" 
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
import { watch } from 'vue'

const props = defineProps({ 
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && value._type === 'section' && value.sectionType === 'basicPage'
    }
  }
})


</script>

<style scoped>
.debug {
  background: #f5f5f5;
  padding: 1em;
  margin: 1em 0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.debug-info {
  background: #e8f4ff;
  padding: 1em;
  margin: 1em 0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.debug-info p {
  margin: 0.5em 0;
}

.content-wrapper {
  white-space: pre-wrap;
}
.sanity-blocks {
  display: flex;
  flex-direction: column;
}
</style>