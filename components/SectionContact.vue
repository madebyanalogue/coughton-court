<template>
  <section :class="['wrapper', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="grid grid-1 grid-sm-2">
      <div class="contact-content h3 medium grid grid-1 uppercase">
        <div v-if="section.contactContent?.content" class="whitespace-pre-line" data-fade-in v-html="formatContent(section.contactContent.content)"></div>
      </div>
      <div>

      </div>
    </div>

    <NuxtImg
      v-if="section.contactContent?.decorativeImage?.asset?.url"
      :src="section.contactContent.decorativeImage.asset.url"
      :alt="section.contactContent.decorativeImage.alt || 'Contact'"
      loading="lazy"
    />
  </section>
</template>

<script setup>
import { useSanityImage } from '~/composables/useSanityImage'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && value._type === 'section' && value.sectionType === 'contact'
    }
  }
})

const { getImageUrl } = useSanityImage()

// Helper function to format content and ensure HTML is safe
const formatContent = (content) => {
  if (!content) return ''
  
  // If it's block content, convert it to HTML
  if (Array.isArray(content)) {
    return content.map(block => {
      const text = block.children.map(child => {
        if (child.marks?.length) {
          const markDef = block.markDefs?.find(def => def._key === child.marks[0])
          if (markDef?._type === 'link') {
            return `<a href="${markDef.href}" class="link" ${markDef.blank ? 'target="_blank" rel="noopener noreferrer"' : ''}>${child.text}</a>`
          }
        }
        return child.text
      }).join('')
      return text
    }).join('<br>')
  }
  
  // If it's plain text with HTML, sanitize it to only allow specific tags
  const allowedTags = ['a', 'br', 'strong', 'em']
  const sanitized = content.replace(/<[^>]*>/g, match => {
    const tag = match.match(/<\/?([a-z0-9]+)/i)?.[1]
    return allowedTags.includes(tag) ? match : ''
  })
  
  return sanitized
}
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre;
}


@media all and (max-width: 1023px) {
  a {
    font-size: 3.9vw;
  }
}

:deep(.link) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

:deep(.link:hover) {
  text-decoration: none;
}

/* Ensure links maintain the uppercase style */
:deep(a) {
  text-transform: uppercase;
}
</style> 