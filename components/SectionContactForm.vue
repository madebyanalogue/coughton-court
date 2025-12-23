<template>
  <section ref="sectionRef" :class="['section-contact-form', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-2 gap-3 px-md-4 gap-md-4">
        
        <!-- Left: Form Content -->
        <div class="contact-form-content grid grid-1 gap-1">
          <h2 v-if="title" class="contact-form-title h4">{{ title }}</h2>
          
          <div v-if="description" class="contact-form-description rte">
            <SanityBlocks :blocks="description" />
          </div>

          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="contact-form-field">
              <label for="name" class="contact-form-label">
                Name <span class="required">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="contact-form-input"
              />
            </div>

            <div class="contact-form-field">
              <label for="email" class="contact-form-label">
                Email <span class="required">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="contact-form-input"
              />
            </div>

            <div class="contact-form-field">
              <label for="telephone" class="contact-form-label">
                Telephone <span class="required">*</span>
              </label>
              <input
                id="telephone"
                v-model="formData.telephone"
                type="tel"
                required
                class="contact-form-input"
              />
            </div>

            <div class="contact-form-field">
              <label for="comment" class="contact-form-label">
                Comment
              </label>
              <textarea
                id="comment"
                v-model="formData.comment"
                rows="4"
                class="contact-form-input contact-form-textarea"
              ></textarea>
            </div>
            <div>
              <button type="submit" class="contact-form-submit button" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sending...' : 'Send' }}
              </button>
            </div>

            <div v-if="message" class="contact-form-message" :class="{ 'contact-form-message--error': isError }">
              {{ message }}
            </div>
          </form>
        </div>

        <!-- Right: Image -->
        <div v-if="image" class="contact-form-image">
          <NuxtImg 
            :src="getImageUrl(image)" 
            :alt="title || 'Contact'"
            class="contact-form-image__img"
            loading="lazy"
          />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScrollTrigger } from '~/composables/useScrollTrigger.js'
import { useSanityImage } from '~/composables/useSanityImage.js'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const { registerSection, unregisterSection } = useScrollTrigger()
const { getImageUrl } = useSanityImage()
const sectionRef = ref(null)

const title = computed(() => props.section?.contactFormContent?.title || 'Contact Us')
const description = computed(() => props.section?.contactFormContent?.description || null)
const image = computed(() => props.section?.contactFormContent?.image || null)

const formData = ref({
  name: '',
  email: '',
  telephone: '',
  comment: ''
})

const message = ref('')
const isError = ref(false)
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  message.value = ''
  isError.value = false

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value
    })
    
    message.value = 'Thank you! Your message has been sent.'
    formData.value = {
      name: '',
      email: '',
      telephone: '',
      comment: ''
    }
  } catch (error) {
    isError.value = true
    message.value = 'Sorry, there was an error sending your message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (sectionRef.value) {
    registerSection(`contact-form-${props.section._id}`, {
      trigger: sectionRef.value,
      start: 'top 80%',
      onEnter: () => {
        const gsap = window.gsap
        if (gsap) {
          gsap.to(sectionRef.value, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
          })
        }
      }
    })
  }
})

onUnmounted(() => {
  unregisterSection(`contact-form-${props.section._id}`)
})
</script>

<style scoped>
.section-contact-form {
  opacity: 0;
}

.contact-form-content {
  width: 100%;
}


.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-form-label {
}

.required {
  color: var(--red, #dc2626);
}

.contact-form-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid currentColor;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.contact-form-input:focus {
  border-bottom-color: currentColor;
}

.contact-form-input::placeholder {
  color: var(--gray-400, #999);
}

.contact-form-textarea {
  resize: vertical;
  min-height: 100px;
}

.contact-form-submit {
  min-width: 180px;
}
.contact-form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.contact-form-image {
  width: 100%;
  order: -1;
}

@media (min-width: 768px) {
  .contact-form-image {
    order: 0;
  }
}

.contact-form-image__img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>

