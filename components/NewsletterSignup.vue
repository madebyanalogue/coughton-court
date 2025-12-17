<template>
  <div class="newsletter-signup">
    <h3 v-if="title" class="newsletter-title">{{ title }}</h3>
    <form 
      :id="formId"
      @submit.prevent="handleSubmit" 
      class="newsletter-form"
      novalidate
    >
      <div class="newsletter-input-wrapper" :class="{ 'newsletter-input-wrapper--error': hasError }">
        <input
          v-model="email"
          type="email"
          :placeholder="placeholder"
          required
          class="newsletter-input"
          :class="{ 'newsletter-input--error': hasError }"
          aria-label="Email address"
          :aria-invalid="hasError"
          :aria-describedby="hasError ? `${formId}-error` : undefined"
        />
        <button 
          type="submit" 
          class="newsletter-submit" 
          :disabled="isSubmitting"
          aria-label="Subscribe to newsletter"
        >
          <div class="arrow" :class="{ 'arrow--loading': isSubmitting }"></div>
        </button>
      </div>
      <div 
        v-if="message" 
        :id="`${formId}-error`"
        class="newsletter-message" 
        :class="{ 
          'newsletter-message--error': isError,
          'newsletter-message--success': !isError
        }"
        role="alert"
      >
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter your email'
  },
  action: {
    type: String,
    required: true,
    description: 'Mailchimp form action URL (e.g., https://yourdomain.us1.list-manage.com/subscribe/post-json?u=xxx&id=xxx)'
  },
  onSubmit: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['submit', 'success', 'error'])

const email = ref('')
const message = ref('')
const isError = ref(false)
const isSubmitting = ref(false)
const formId = ref(`newsletter-form-${Math.random().toString(36).substr(2, 9)}`)
let jsonpCallbackName = null

const hasError = computed(() => isError.value && message.value)

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Clean up JSONP callback
const cleanupJsonp = () => {
  if (jsonpCallbackName && typeof window !== 'undefined') {
    try {
      delete window[jsonpCallbackName]
      const script = document.querySelector(`script[src*="${jsonpCallbackName}"]`)
      if (script) {
        script.remove()
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

onUnmounted(() => {
  cleanupJsonp()
})

const handleSubmit = async () => {
  // Reset state
  message.value = ''
  isError.value = false
  isSubmitting.value = true

  // Validate email
  if (!email.value || !isValidEmail(email.value)) {
    message.value = 'Please enter a valid email address.'
    isError.value = true
    isSubmitting.value = false
    emit('error', { message: message.value, email: email.value })
    return
  }

  // If custom onSubmit is provided, use it
  if (props.onSubmit) {
    try {
      await props.onSubmit(email.value)
      message.value = 'Thank you for subscribing!'
      email.value = ''
      isError.value = false
      emit('success', { email: email.value })
    } catch (error) {
      message.value = error.message || 'Something went wrong. Please try again.'
      isError.value = true
      emit('error', { message: message.value, email: email.value })
    } finally {
      isSubmitting.value = false
    }
    return
  }

  // Mailchimp AJAX submission using JSONP
  if (!props.action) {
    message.value = 'Form action URL is required.'
    isError.value = true
    isSubmitting.value = false
    emit('error', { message: message.value, email: email.value })
    return
  }

  // Generate unique callback name
  jsonpCallbackName = `mailchimpCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create callback function
  if (typeof window !== 'undefined') {
    window[jsonpCallbackName] = (data) => {
      cleanupJsonp()
      isSubmitting.value = false

      if (data.result === 'success') {
        const submittedEmail = email.value
        message.value = data.msg || 'Thank you for subscribing!'
        isError.value = false
        email.value = ''
        emit('success', { email: submittedEmail, data })
      } else {
        // Handle Mailchimp errors
        let errorMsg = data.msg || 'Something went wrong. Please try again.'
        
        // Parse common Mailchimp error messages
        if (data.msg) {
          if (data.msg.includes('already subscribed')) {
            errorMsg = 'This email is already subscribed.'
          } else if (data.msg.includes('invalid')) {
            errorMsg = 'Please enter a valid email address.'
          } else if (data.msg.includes('too many')) {
            errorMsg = 'Too many subscribe attempts. Please try again later.'
          }
        }

        message.value = errorMsg
        isError.value = true
        emit('error', { message: errorMsg, email: email.value, data })
      }
    }

    // Build the JSONP URL
    const formData = new URLSearchParams({
      EMAIL: email.value,
      c: jsonpCallbackName
    })

    const jsonpUrl = `${props.action}&${formData.toString()}`

    // Create and inject script tag for JSONP
    const script = document.createElement('script')
    script.src = jsonpUrl
    script.async = true
    script.onerror = () => {
      cleanupJsonp()
      isSubmitting.value = false
      message.value = 'Network error. Please try again later.'
      isError.value = true
      emit('error', { message: message.value, email: email.value })
    }

    // Add timeout
    const timeout = setTimeout(() => {
      cleanupJsonp()
      isSubmitting.value = false
      message.value = 'Request timed out. Please try again.'
      isError.value = true
      emit('error', { message: message.value, email: email.value })
    }, 10000) // 10 second timeout

    // Clear timeout when callback is called
    const originalCallback = window[jsonpCallbackName]
    window[jsonpCallbackName] = (data) => {
      clearTimeout(timeout)
      originalCallback(data)
    }

    document.head.appendChild(script)
  }
}
</script>

<style scoped>
.newsletter-signup {
  width: 100%;
}

.newsletter-title {
  margin-bottom: 1em;
  font-family: var(--heading);
  font-weight: 500;
}

.newsletter-form {
  width: 100%;
}

.newsletter-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid currentColor;
  padding-right: calc(var(--arrow-size) + 0.5em);
  transition: border-color 0.3s ease;
}

.newsletter-input-wrapper--error {
  border-color: rgba(255, 0, 0, 0.6);
}

.newsletter-input {
  flex: 1;
  width: 100%;
  padding: 0.75em 1em;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

.newsletter-input::placeholder {
  color: currentColor;
  opacity: 0.6;
}

.newsletter-input--error {
  color: rgba(255, 0, 0, 0.8);
}

.newsletter-submit {
  position: absolute;
  right: 0.5em;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: opacity 0.3s ease;
}

.newsletter-submit:hover {
  opacity: 0.7;
}

.newsletter-submit:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.newsletter-submit .arrow {
  width: var(--arrow-size);
  height: var(--arrow-size);
  transition: opacity 0.3s ease;
}

.newsletter-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.newsletter-submit:disabled .arrow {
  opacity: 0.5;
}

.arrow--loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.newsletter-message {
  margin-top: 0.75em;
  font-size: 0.9em;
  opacity: 0.8;
  animation: fadeIn 0.3s ease;
}

.newsletter-message--error {
  opacity: 1;
  color: rgba(255, 0, 0, 0.9);
}

.newsletter-message--success {
  opacity: 1;
  color: currentColor;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

