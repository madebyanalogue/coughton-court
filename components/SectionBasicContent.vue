<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      
      <div class="grid grid-center-items">
        <div class="col-span-12 col-span-8-md rte py3 pbottom">
          <h2 class="h2">{{ section.basicContent.title }}</h2>
          <div class="h4 rte">
            <SanityBlocks :blocks="section.basicContent.content" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && value._type === 'section' && value.sectionType === 'basicContent'
    }
  }
})


</script>

<style scoped>
/* Add any section-specific styles here */
</style> 