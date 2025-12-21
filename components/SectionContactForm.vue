<template>
  <section ref="sectionRef" :class="['section-contact-form', { 'section-border-top': section.borderTop }]">
    <div class="wrapper">
      <div class="grid grid-1 grid-md-2 gap-3">
        
        <!-- Left: Form Content -->
        <div class="contact-form-content">
          <h2 v-if="title" class="contact-form-title">{{ title }}</h2>
          
          <div v-if="description" class="contact-form-description">
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

            <button type="submit" class="contact-form-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send' }}
            </button>

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
  padding: 4rem 0;
}

.contact-form-content {
  width: 100%;
}

.contact-form-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.contact-form-description {
  margin-bottom: 2rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-700, #555);
}

.required {
  color: var(--red, #dc2626);
}

.contact-form-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--gray-400, #999);
  padding: 0.5rem 0;
  font-size: 1rem;
  color: var(--black, #000);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.contact-form-input:focus {
  border-bottom-color: var(--black, #000);
}

.contact-form-input::placeholder {
  color: var(--gray-400, #999);
}

.contact-form-textarea {
  resize: vertical;
  min-height: 100px;
}

.contact-form-submit {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: var(--black, #000);
  color: var(--white, #fff);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.contact-form-submit:hover:not(:disabled) {
  background: var(--gray-700, #333);
}

.contact-form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-form-message {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.contact-form-message--error {
  background: rgba(220, 38, 38, 0.1);
  color: var(--red, #dc2626);
  border: 1px solid rgba(220, 38, 38, 0.3);
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

