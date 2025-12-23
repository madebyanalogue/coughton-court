<template>
  <section 
    ref="sectionRef"
    :class="['section-galleries', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]"
  >
    <div class="">
      <div data-gallery="" class="gallery-group py-md-2">
        <div role="list" class="gallery-grid grid grid-2 grid-sm-2 grid-md-4" ref="gridRef">
          <div 
            v-for="(gallery, index) in displayedGalleries" 
            :key="gallery._id"
            data-lightbox="trigger-parent" 
            role="listitem" 
            class="gallery-grid__item"
            :data-gallery-id="gallery._id"
            :data-gallery-color="getColorForGallery(gallery._id)"
          >
            <button 
              data-lightbox="trigger" 
              class="gallery-item__button"
            >
              <div 
                class="lightbox-img__item-inner"
                @mouseenter="handleGalleryHover(gallery._id)"
                @mouseleave="handleGalleryLeave"
              >
                <div class="gallery-item__media-container">
                  <img 
                    v-if="gallery.thumbnail?.asset"
                      :src="getImageUrl(gallery.thumbnail)"
                      :alt="gallery.title"
                      loading="lazy" 
                      class="gallery-item__img"
                    />
                  <div v-else class="thumbnail-placeholder">
                    <span>No Image</span>
                  </div>
                </div>
                <h3 class="gallery-title">{{ gallery.title }}</h3>
              </div>
            </button>
          </div>
        </div>
        
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreGalleries" class="load-more-container">
        <button ref="loadMoreBtnRef" @click="loadMore" class="load-more-button">
          <div class="load-more-svg">
            <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 630">
              <path d="M319.66,73.93l.16-1.06c4.15-.85,6.8-4.08,7.48-8.59l7.44-49.36c.56-3.75-.97-7.9-4.66-10.13l.15-.96c6.98-.03,14.02.15,23.24,1.54,23.72,3.58,34.82,20.47,31.49,42.56-3.9,25.83-22.57,34.41-41.39,31.57-8.07-1.22-17.72-3.65-23.91-5.57h0ZM371.93,47.74c3.32-21.99-2.49-36.22-16.8-38.38-5.38-.81-8.2,1.61-9.07,7.37l-7.34,48.69c-.91,6.05,1.45,9.94,6.92,10.77,14.02,2.11,22.81-5.4,26.29-28.45h0Z"/>
              <path d="M382.46,86.46l.36-1.01c3.84.23,7.39-2.22,9.14-7.16l17.11-48.13c1.59-4.48.79-8.89-2.54-11.42l.33-.92,22.42,7.97-.33.91c-4.17-.14-7.58,2.77-9.17,7.25l-17.11,48.13c-1.76,4.94-.46,9.11,2.57,11.32l-.36,1.01-22.42-7.97v.02Z"/>
              <path d="M427.13,107c-7.54-4.22-14.9-11.35-19.18-16.42l15.5-12.57.93.52c-3.71,11.39-1.57,21.27,7.75,26.49,8.47,4.75,16.64,2.09,20.15-4.18,4.37-7.79-1.14-14.66-7.17-22.16-7.03-8.5-14.43-17.77-7.97-29.29,5.7-10.17,18.2-13.4,30.99-6.24,5.76,3.23,11.12,7.57,15.36,11.72l-12.7,12.14-.93-.52c2.64-9.09.13-17.52-7.16-21.6-6.02-3.37-12.69-1.99-16.01,3.94-4.32,7.71,2.43,14.94,8.92,23.03,6.44,8.17,12.41,17.19,6.19,28.29-6.36,11.35-20.27,14.92-34.67,6.85h0Z"/>
              <path d="M477.47,94.98c14.82-16.45,37.5-19.42,51.28-7.01,5.27,4.74,9.01,10.6,11.24,15.09l-18.95,9.72-.65-.58c6.46-10.65,6.42-19.31.65-24.51-7.65-6.89-20.37-2.92-31.1,8.98-13,14.43-15.61,30.25-5.37,39.48,6.13,5.53,13.95,6.42,23.15,2.16l.53,1c-12.49,9.8-25.73,8.98-34.32,1.24-11.19-10.07-10.9-29.55,3.53-45.57h0Z"/>
              <path d="M572.88,140.26c9.61,14.25,2.68,34.38-14.63,46.05-17.31,11.67-38.73,10.3-48.18-3.71-9.34-13.85-2.66-34.52,14.57-46.14s38.62-10.46,48.23,3.79h.01ZM512.97,180.65c6.3,9.34,20.91,6.52,38.06-5.05,17.15-11.56,25.52-23.65,18.95-33.39-6.51-9.66-21.1-6.62-38.17,4.89-17.15,11.56-25.14,24.21-18.84,33.55Z"/>
              <path d="M537.09,233.57l-.74-2.01,48.75-41.85c5.84-4.94,8.08-8.98,8.37-12.4l.91-.34,8.65,23.51-.91.34c-3.11-3.1-7.8-3.75-12.77.46l-33.44,28.35,43.85-.62c5.87-.09,8.88-4.82,9.23-9.5l.91-.34,6.61,17.95-.91.34c-2.38-2.54-7.08-4.33-14.2-4.29l-64.32.39h.01Z"/>
              <path d="M624.01,291.59c.37,3.18,1.73,5.57,3.52,6.73l.1.87-20.35,5.7-.31-.94c9.05-7.02,13.55-14.58,12.25-25.68-.7-5.98-3.86-8.74-8.97-8.14l-19.87,2.32,1.64,14.08c.65,5.59,3.1,9.81,9.31,11.92l.1.87-19.68,2.3-.1-.87c4.85-3.69,7.35-8.19,6.71-13.69l-1.65-14.18-26.43,3.09c-5.21.61-7.6,4.41-6.92,10.19,1.42,12.15,8.41,19.26,19.52,24.8l-.1.79-22.75-2.23-.14-1.16c1.74-1.87,2.28-3.88,1.92-6.97l-4.84-41.48,1.06-.12c1.57,3.43,4.95,5.58,10.45,4.94l50.74-5.92c4.92-.57,8.43-3.14,9.13-7.23l.96-.11,4.68,40.13h.02Z"/>
              <path d="M623.65,348.81c-1.98,16.88-11.93,26.67-24.66,25.17-11.86-1.39-18.15-10.34-19.75-20.01-12.97,3.86-27.94,11.49-37.99,19.6l-.82-.49c7.36-14.39,21.17-26.27,39.2-31.58.41-1.81,1-3.5,1.57-5.1l-19.19-2.25c-4.82-.57-8.84,1.21-10.47,5.03l-1.06-.12,2.76-23.53,1.06.12c.6,4.08,4.11,6.64,9.03,7.22l50.16,5.88c4.73.55,8.45-1.16,10.16-4.97l.96.11c.32,8.15-.04,17.01-.96,24.92h0ZM584.38,336.78c-.65,2.17-1.08,4.18-1.29,6.01-1.27,10.8,4.54,17.15,15.73,18.47,11.86,1.39,20.35-3.48,21.32-11.68.61-5.21-2.19-8.86-7.98-9.54l-27.78-3.26Z"/>
              <path d="M521.86,435.73l.85.65c-1.28,4.04.26,7.93,3.88,10.72l39.53,30.48c3,2.31,7.38,2.99,11.12.85l.77.59c-3.36,6.11-6.94,12.18-12.63,19.57-14.65,19-34.81,20.5-52.5,6.86-20.69-15.95-19.11-36.44-7.49-51.52,4.98-6.46,11.8-13.71,16.48-18.2h-.01ZM519.38,494.14c17.61,13.58,32.87,15.41,41.71,3.95,3.32-4.31,2.57-7.95-2.04-11.51l-38.99-30.06c-4.85-3.74-9.39-3.56-12.77.82-8.66,11.23-6.36,22.56,12.1,36.8h-.01Z"/>
              <path d="M480.4,484.57l.71.8c-2.06,3.24-1.63,7.54,1.84,11.46l33.84,38.26c3.15,3.57,7.4,4.99,11.22,3.3l.64.73-17.82,15.76-.64-.73c2.15-3.58,1.25-7.97-1.91-11.54l-33.84-38.26c-3.47-3.93-7.75-4.81-11.15-3.23l-.71-.8,17.82-15.76h0Z"/>
              <path d="M440.81,513.78c7.34-4.57,17.13-7.57,23.64-8.88l3.53,19.65-.91.56c-8.19-8.75-17.88-11.64-26.95-5.99-8.25,5.13-9.86,13.57-6.06,19.67,4.72,7.59,13.39,6.08,22.87,4.41,10.84-2.06,22.52-4.06,29.5,7.15,6.16,9.89,2.96,22.41-9.49,30.15-5.61,3.49-11.99,6.09-17.68,7.8l-4.51-16.98.91-.56c6.69,6.7,15.28,8.56,22.37,4.15,5.85-3.64,7.86-10.15,4.27-15.93-4.67-7.5-14.26-5.08-24.47-3.3-10.27,1.7-21.05,2.57-27.77-8.23-6.88-11.05-3.28-24.95,10.73-33.67h.02Z"/>
              <path d="M427.03,563.68c7.23,20.93-1.14,42.21-18.67,48.27-6.7,2.31-13.64,2.76-18.65,2.54l.66-21.29.83-.29c6.2,10.81,13.8,14.96,21.14,12.43,9.73-3.36,12.42-16.41,7.18-31.56-6.34-18.36-18.92-28.3-31.95-23.8-7.8,2.69-12.37,9.1-13.09,19.21l-1.14-.02c-2.53-15.67,4.59-26.86,15.52-30.63,14.23-4.91,31.13,4.76,38.17,25.14h0Z"/>
              <path d="M341.06,625.2c-17.13,1.47-31.36-14.36-33.15-35.16s9.81-38.86,26.65-40.31c16.64-1.43,31.46,14.45,33.24,35.15,1.78,20.71-9.62,38.84-26.75,40.32h.01ZM334.86,553.21c-11.22.97-15.85,15.11-14.08,35.72,1.77,20.61,8.27,33.79,19.98,32.79,11.61-1,16.04-15.22,14.27-35.74-1.77-20.61-8.95-33.74-20.17-32.77Z"/>
              <path d="M276.86,548.67l2.11.32,13.08,62.91c1.51,7.5,3.95,11.41,6.81,13.32l-.15.96-24.77-3.79.15-.96c4.21-1.22,7.05-5.01,5.77-11.4l-8.66-42.98-20.65,38.7c-2.76,5.18-.07,10.11,3.86,12.67l-.15.96-18.91-2.89.15-.96c3.37-.86,7.21-4.11,10.62-10.36l30.74-56.51h0Z"/>
              <path d="M184.03,596.74c-2.97-1.21-5.71-1.18-7.59-.17l-.81-.33,4.85-20.58.97.19c1.77,11.32,6.22,18.91,16.55,23.14,5.57,2.28,9.52.85,11.47-3.91l7.58-18.52-13.12-5.37c-5.21-2.13-10.08-2.03-14.93,2.39l-.81-.33,7.5-18.34.81.33c.89,6.03,3.62,10.4,8.74,12.49l13.21,5.41,10.08-24.63c1.99-4.85-.18-8.78-5.58-10.99-11.33-4.63-20.92-1.95-31.15,5.09l-.65-.47,12.95-18.84,1.08.44c.79,2.42,2.3,3.88,5.17,5.05l38.65,15.81-.4.99c-3.77-.28-7.28,1.64-9.38,6.76l-19.34,47.28c-1.88,4.58-1.33,8.9,1.91,11.49l-.37.9-37.39-15.3v.02Z"/>
              <path d="M134.04,568.59c-13.79-9.93-17.51-23.38-10.03-33.78,6.98-9.69,17.85-10.84,27.09-7.54,2.93-13.21,3.53-30.01,1.32-42.73l.83-.48c9,13.42,12.68,31.26,8.57,49.6,1.38,1.24,2.58,2.57,3.69,3.85l11.29-15.68c2.84-3.94,3.24-8.32.69-11.59l.62-.87,19.23,13.84-.62.87c-3.86-1.46-7.8.37-10.7,4.39l-29.5,40.99c-2.78,3.86-3.09,7.95-.59,11.3l-.57.79c-7.28-3.68-14.85-8.3-21.31-12.95h-.01ZM163.63,540.12c-1.59-1.62-3.13-2.97-4.63-4.05-8.83-6.35-17.2-4.36-23.78,4.78-6.98,9.7-6.85,19.48-.15,24.31,4.26,3.06,8.81,2.39,12.21-2.34l16.34-22.7h0Z"/>
              <path d="M107.32,437.49l-.98.43c-2.92-3.07-7.07-3.6-11.26-1.78l-45.79,19.88c-3.47,1.51-6.19,5.02-6.11,9.33l-.89.39c-3.73-5.9-7.31-11.96-11.03-20.52-9.56-22-1.13-40.38,19.36-49.28,23.96-10.41,41.14.87,48.72,18.33,3.25,7.48,6.3,16.96,7.97,23.22h0ZM57.38,407.09c-20.4,8.86-29.38,21.34-23.62,34.61,2.17,4.99,5.72,6.09,11.06,3.77l45.16-19.61c5.61-2.44,7.66-6.5,5.45-11.58-5.65-13.01-16.68-16.47-38.06-7.19h0Z"/>
              <path d="M84.62,377.62l-1.04.23c-1.84-3.37-5.8-5.08-10.92-3.95l-49.88,11.02c-4.65,1.03-7.96,4.05-8.33,8.21l-.95.21-5.13-23.23.95-.21c2.09,3.62,6.37,4.96,11.01,3.93l49.88-11.02c5.12-1.13,7.97-4.45,8.24-8.19l1.04-.23,5.13,23.23h0Z"/>
              <path d="M78.32,328.84c.43,8.63-1.7,18.66-3.72,24.98l-18.89-6.45-.05-1.07c11.62-2.91,18.85-9.98,18.32-20.65-.48-9.7-7.08-15.21-14.25-14.85-8.92.44-11.82,8.75-14.96,17.86-3.47,10.48-7.38,21.66-20.57,22.32-11.64.58-21.02-8.29-21.75-22.94-.33-6.6.5-13.44,1.77-19.24l17.03,4.31.05,1.07c-9.11,2.59-14.91,9.2-14.49,17.54.34,6.89,5.06,11.81,11.85,11.47,8.83-.44,11.37-10,14.77-19.79,3.5-9.8,7.97-19.65,20.68-20.28,13-.65,23.41,9.24,24.22,25.73h-.01Z"/>
              <path d="M41.36,292.61c-21.81-3.79-36.4-21.4-33.23-39.67,1.21-6.98,4.18-13.27,6.79-17.55l18.32,10.87-.15.86c-12.45.2-19.77,4.85-21.09,12.5-1.76,10.14,8.37,18.8,24.15,21.54,19.14,3.32,33.91-2.89,36.27-16.47,1.41-8.13-1.99-15.23-10.49-20.74l.57-.99c14.94,5.35,21.3,17,19.32,28.39-2.57,14.83-19.21,24.95-40.45,21.27h-.01Z"/>
              <path d="M29.03,187.6c6.99-15.7,27.73-20.5,46.81-12.01,19.07,8.49,29.27,27.38,22.39,42.82-6.79,15.26-27.86,20.55-46.85,12.1-18.99-8.45-29.35-27.21-22.35-42.91ZM95.04,216.99c4.58-10.29-5.56-21.18-24.45-29.6-18.9-8.41-33.58-9.11-38.36,1.63-4.74,10.65,5.57,21.4,24.37,29.78,18.9,8.41,33.86,8.48,38.44-1.81Z"/>
              <path d="M127.14,168.48l-1.31,1.69-61.34-19.12c-7.29-2.33-11.89-2.09-14.95-.52l-.77-.59,15.34-19.81.77.59c-.98,4.28.96,8.6,7.16,10.58l41.77,13.31-23.79-36.84c-3.19-4.92-8.8-4.97-12.95-2.78l-.77-.59,11.71-15.13.77.59c-.89,3.37.09,8.3,3.9,14.32l34.46,54.32v-.02Z"/>
              <path d="M130,64.03c2.5-2.01,3.79-4.43,3.82-6.56l.68-.55,15.67,14.19-.63.76c-10.77-3.92-19.56-3.7-28.26,3.31-4.69,3.78-5.34,7.92-2.11,11.93l12.55,15.58,11.04-8.89c4.39-3.53,6.65-7.85,5.12-14.23l.68-.55,12.43,15.43-.68.55c-5.71-2.13-10.85-1.86-15.16,1.61l-11.12,8.95,16.69,20.72c3.29,4.08,7.78,4.08,12.32.43,9.53-7.68,11.82-17.37,10.59-29.73l.73-.34,10.23,20.44-.91.73c-2.5-.48-4.5.14-6.92,2.09l-32.52,26.19-.67-.83c2.07-3.16,2.08-7.17-1.39-11.48l-32.04-39.78c-3.11-3.86-7.15-5.47-10.98-3.88l-.61-.76,31.46-25.34h-.01Z"/>
              <path d="M178.77,33.85c15.35-7.28,28.93-4.05,34.42,7.54,5.12,10.79.87,20.87-6.48,27.36,10.15,8.94,24.57,17.58,36.77,21.79l.02.96c-16.1,1.4-33.5-4-47.57-16.45-1.75.62-3.5,1.01-5.15,1.37l8.28,17.46c2.08,4.39,5.72,6.85,9.82,6.2l.46.97-21.41,10.15-.46-.97c3.14-2.67,3.45-7.01,1.32-11.48l-21.64-45.63c-2.04-4.3-5.47-6.54-9.61-5.98l-.42-.88c6.74-4.59,14.44-9,21.63-12.41h.02ZM189.42,73.51c2.18-.61,4.11-1.3,5.78-2.1,9.83-4.66,12.13-12.95,7.3-23.13-5.12-10.79-13.75-15.4-21.21-11.87-4.74,2.25-6.35,6.56-3.85,11.82l11.99,25.27h0Z"/>
            </svg>
          </div>
          <div class="load-more-button__inner">
            <div>More</div>
          </div>
        </button>
      </div>
    </div>
  </section>


    <!-- Lightbox Modal -->
    <div 
      aria-modal="true" 
      data-lightbox="wrapper" 
      role="dialog" 
      class="lightbox-wrap"
      :style="selectedGallery ? { backgroundColor: getColorForGallery(selectedGallery._id) } : {}"
      >
      <div class="lightbox-img__wrap" @click.stop>
        
        <div class="lightbox-img__list">
          <div 
            v-for="(item, index) in selectedGallery?.items || []"
            :key="index"
            data-lightbox="item" 
            class="lightbox-img__item"
          >
              <img 
                v-if="item._type === 'image' && item.asset"
                :src="getImageUrl(item)"
                :alt="`${selectedGallery?.title} - Image ${index + 1}`"
                loading="lazy" 
                class="lightbox-img"
              />
              <video
                v-else-if="item._type === 'file' && item.asset"
                :src="item.asset.url"
                controls
                class="lightbox-img"
              >
                Your browser does not support the video tag.
              </video>
              <div v-else class="thumbnail-placeholder">
                <span>No Image</span>
              </div>
          </div>
        </div>
      </div>
      <div class="lightbox-nav">
        <div v-if="indicatorEnabled" class="scroll-indicator" :class="{ 'is-hidden': !showScrollIndicator }"><div>Scroll Down</div><div><span></span></div></div>
        <button 
          data-lightbox="close" 
          class="lightbox-nav__button"
        ><div></div>
        </button>
      </div>
    </div>

</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useSanityImage } from '~/composables/useSanityImage'
import { useColorExtraction } from '~/composables/useColorExtraction'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
             value._type === 'section' &&
             value.sectionType === 'sectionGalleries'
    }
  }
})

const { getImageUrl } = useSanityImage()
// Disable runtime color extraction for this section.
// We still use the shared getters/setters so downstream logic stays unchanged.
const { /* extractColorFromImage */ getColorForGallery, setColorForGallery } = useColorExtraction()

// Gallery data
const galleries = ref([])
// Show first 8 galleries, reveal the rest via the Load More button
const displayedCount = ref(8)
const sectionRef = ref(null)
const gridRef = ref(null)
const loadMoreBtnRef = ref(null)
const selectedGallery = ref(null)
const isModalOpen = ref(false)
const hoveredColor = ref(null)
const showScrollIndicator = ref(false)
const indicatorEnabled = ref(false)
 

// Computed properties
const displayedGalleries = computed(() => galleries.value.slice(0, displayedCount.value))
const hasMoreGalleries = computed(() => galleries.value.length > displayedCount.value)

// Methods
const fadeInThumbs = (items) => {
  
  if (!items || !items.length) return
  const gsap = window.gsap
  // Only target items that haven't animated yet
  const targets = Array.from(items).filter(el => !el.dataset.animated)
  
  if (!targets.length) {
    
    return
  }
  gsap.set(targets, { autoAlpha: 0, y: 12 })
  
  gsap.to(targets, { 
    autoAlpha: 1, 
    y: 0, 
    duration: 0.9, 
    stagger: 0.12, 
    ease: 'power2.out',
    onStart: () => {
      
      targets.forEach(el => el.dataset.animated = '1')
    }
  })
}

const loadMore = async () => {
  const gsap = window.gsap
  const sectionEl = sectionRef.value
  const gridEl = gridRef.value
  if (!sectionEl || !gridEl || !gsap) {
    displayedCount.value = galleries.value.length
    await nextTick()
    await extractColorsForGalleries()
    return
  }

  // 1) Keep button visible during height change (avoid layout jump)

  // 2) Capture current height and lock it as min-height to avoid contraction
  const fromH = sectionEl.offsetHeight
  sectionEl.style.minHeight = fromH + 'px'

  // 3) Add all galleries (they'll be hidden initially)
  displayedCount.value = galleries.value.length
  await nextTick()

  // 4) Measure new height and animate min-height so no contraction can happen
  const toH = sectionEl.scrollHeight
  await gsap.to(sectionEl, { minHeight: toH, duration: 0.45, ease: 'power2.out' })

  // 5) Now fade out the button (after height settles)
  if (loadMoreBtnRef.value) {
    await gsap.to(loadMoreBtnRef.value, { autoAlpha: 0, duration: 0.25 })
  }

  // 6) Clear explicit min-height so layout can flow naturally
  sectionEl.style.removeProperty('min-height')

  // 7) Set new items to opacity 0 inline style, then fade in sequentially
  const newItems = gridEl.querySelectorAll('.gallery-grid__item:not([data-animated="1"])')
  newItems.forEach(item => {
    item.style.opacity = '0'
  })
  fadeInThumbs(newItems)
  // Assign palette colors to all galleries after revealing more items
  assignPaletteColors()
}

// Setup animation after galleries are loaded
const setupAnimation = () => {
  if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger && sectionRef.value && gridRef.value) {
    const { gsap, ScrollTrigger } = window
    gsap.registerPlugin(ScrollTrigger)
    const items = gridRef.value.querySelectorAll('.gallery-grid__item')
    
    
    if (items.length === 0) return // No items to animate
    
    // Initialize items hidden until animated
    Array.from(items).forEach(el => { if (!el.dataset.animated) gsap.set(el, { autoAlpha: 0, y: 12 }) })
    
    // Check if section is already in view
    const sectionRect = sectionRef.value.getBoundingClientRect()
    const isInView = sectionRect.top < window.innerHeight && sectionRect.bottom > 0
    
    
    if (isInView) {
      // If already in view, animate immediately
      
      fadeInThumbs(items)
    } else {
      // Otherwise, wait for scroll trigger
      
      ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          
          fadeInThumbs(items)
        }
      })
    }
  }
}


// Static palette for SectionGalleries (in order).
// Provided brand colors:
// 1) #e0d0c5  2) #ac7cba  3) #64be85  4) #fee510  5) #fe330a  6) #5cc1d5
const galleryPalette = ['#e0d0c5', '#ac7cba', '#64be85', '#fee510', '#fe330a', '#5cc1d5']

// Assign colors from the static palette instead of extracting from images.
const assignPaletteColors = () => {
  if (!Array.isArray(galleries.value)) return
  galleries.value.forEach((gallery, idx) => {
    const color = galleryPalette[idx % galleryPalette.length]
    setColorForGallery(gallery._id, color)
  })
}

const handleGalleryHover = (galleryId) => {
  const color = getColorForGallery(galleryId)
  if (color) {
    hoveredColor.value = color
    // Expose color as CSS var on all section elements for theming
    if (typeof document !== 'undefined') {
      document.querySelectorAll('section').forEach((el) => {
        // Set inline background with !important
        el.style.setProperty('background', color, 'important')
      })
    }
  }
  // Dim non-hovered thumbnails to 0.3
  if (typeof window !== 'undefined' && window.gsap && gridRef.value) {
    const gsap = window.gsap
    const items = gridRef.value.querySelectorAll('.gallery-grid__item')
    items.forEach((item) => {
      const id = item.getAttribute('data-gallery-id')
      gsap.to(item, { autoAlpha: id === galleryId ? 1 : 1, duration: 0.4, ease: 'power2.out' })
    })
  }
}

const handleGalleryLeave = () => {
  hoveredColor.value = null
  if (typeof document !== 'undefined') {
    document.querySelectorAll('section').forEach((el) => {
      el.style.removeProperty('background')
    })
  }
  // Restore all thumbnails
  if (typeof window !== 'undefined' && window.gsap && gridRef.value) {
    const gsap = window.gsap
    const items = gridRef.value.querySelectorAll('.gallery-grid__item')
    gsap.to(items, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
  }
}

// Your original JavaScript code
const createLightbox = (container) => {
  const gsap = window.gsap
  const Flip = window.Flip || (window.gsap && window.gsap.Flip)
  
  // Support lightbox rendered outside the section by using a global root
  const lightboxRoot = document.querySelector('[data-lightbox="wrapper"]')

  const elements = {
    wrapper: lightboxRoot,
    triggers: container.querySelectorAll('[data-lightbox="trigger"]'),
    triggerParents: container.querySelectorAll('[data-lightbox="trigger-parent"]'),
    items: lightboxRoot ? lightboxRoot.querySelectorAll('[data-lightbox="item"]') : [],
    titles: container.querySelectorAll('.gallery-title'),
    buttons: {
      close: lightboxRoot ? lightboxRoot.querySelector('[data-lightbox="close"]') : null
    }
  };

  const mainTimeline = gsap.timeline();

  // no-op: nav and counters removed
  
  function closeLightbox() {
    mainTimeline.clear();
    const loadMoreContainer = document.querySelector('.load-more-container');
    const otherSections = document.querySelectorAll('section:not(.section-galleries)');
    const otherSectionChildren = otherSections.length > 0 ? 
      Array.from(otherSections).map(section => Array.from(section.children)).flat() : [];
    
    gsap.killTweensOf([elements.wrapper, elements.triggerParents, elements.items, loadMoreContainer, ...otherSectionChildren]);
    
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        elements.wrapper.classList.remove('is-active');
        elements.items.forEach(item => {
          item.classList.remove('is-active');
        });
        // Reset Vue state
        selectedGallery.value = null
        isModalOpen.value = false
        // Unlock page scroll after close
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        // Restore sections' background to CSS variable so theme persists
        if (typeof document !== 'undefined') {
          document.querySelectorAll('section').forEach((el) => {
            el.style.setProperty('background', 'var(--section-bg)', 'important')
          })
        }
        // Clear dynamic item count CSS variable
        if (elements.wrapper) {
          elements.wrapper.style.removeProperty('--items')
        }
      }
    });

    // Original image may now live inside the global lightbox root
    const originalItem = document.querySelector('[data-lightbox="original"]');
    const originalParent = container.querySelector('[data-lightbox="original-parent"]');
    
    // Filter out the original parent from triggerParents to avoid animating the cloned item
    const otherTriggerParents = Array.from(elements.triggerParents).filter(parent => 
      parent !== originalParent
    );
    
    // Update killTweensOf to exclude the original parent
    gsap.killTweensOf([elements.wrapper, elements.nav, otherTriggerParents, elements.items, loadMoreContainer, ...otherSectionChildren]);
    
    if (originalItem && originalParent) {
      // Create a clone of the image to place back in the grid
      const imgClone = originalItem.cloneNode(true);
      
      // Clear any GSAP properties from the clone and reset positioning
      gsap.set(imgClone, { 
        clearProps: "all",
        position: "static",
        top: "auto",
        left: "auto",
        width: "100%",
        height: "100%",
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible"
      });
      
      // Place the clone back into the original grid position
      const targetInner = originalParent.querySelector('.gallery-item__media-container') || originalParent;
      targetInner.appendChild(imgClone);
      
      // Ensure the parent container is visible
      gsap.set(originalParent, { 
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible"
      });
      
      // Restore trigger-parent marker for future opens and clear original flag on the lightbox image
      originalParent.setAttribute('data-lightbox', 'trigger-parent');
      originalItem.removeAttribute('data-lightbox');
      
      // Hide the original image in the lightbox (it stays there)
      gsap.set(originalItem, { autoAlpha: 0 });
    }
    
    let activeLightboxSlide = container.querySelector('[data-lightbox="item"].is-active')

    tl.to(otherTriggerParents, {
      autoAlpha: 1,
      opacity: 1,
      visibility: "visible",
      duration: 0.5,
      stagger: 0.03,
      overwrite: true
    }, 0)
    
    // Fade back in load more container and other page sections
    
    if (loadMoreContainer) {
      tl.to(loadMoreContainer, {
        opacity: 1,
        duration: 0.5,
        overwrite: true
      }, 0);
    }
    
    if (otherSections.length > 0) {
      // Target direct children of other sections
      const otherSectionChildren = Array.from(otherSections).map(section => 
        Array.from(section.children)
      ).flat();
      
      if (otherSectionChildren.length > 0) {
        tl.to(otherSectionChildren, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
          overwrite: true
        }, 0);
      }
    }
    
    tl.to(elements.titles, {
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.03,
      overwrite: true
    }, 0)
    // First fade out all lightbox items and the nav
    .to([elements.items, elements.wrapper.querySelector('.lightbox-nav')], {
      autoAlpha: 0,
      duration: 0.3,
      stagger: 0.02,
      overwrite: true
    }, 0)
    // Ensure active slide is hidden as well
    .to(activeLightboxSlide, {
      autoAlpha: 0,
      duration: 0.25,
      overwrite: true
    }, "<")
    // Then fade the lightbox background/wrapper
    .to(elements.wrapper, {
      backgroundColor: "rgba(0,0,0,0)",
      duration: 0.4,
      overwrite: true
    }, 0.05)
    // Bring header back into view
    .to(document.querySelector('header'), {
      yPercent: 0,
      duration: 0.35,
      ease: 'power2.inOut'
    }, "<")
    .add(() => {
      // Cleanup scroll/debug state
      if (elements._scrollBind) {
        const { lbWrap, onScroll, onResize } = elements._scrollBind
        lbWrap.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
        lbWrap.style.removeProperty('--scrolled-height')
        elements._scrollBind = null
      }
      
    })
    .set([elements.items, activeLightboxSlide, elements.triggerParents],  { clearProps: "all" })
    // Cleanup scroll bindings
    .add(() => {
      if (elements._scrollBind) {
        const { lbWrap, onScroll, onResize } = elements._scrollBind
        lbWrap.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
        elements._scrollBind = null
      }
    })
    
    mainTimeline.add(tl);
  }

  function handleOutsideClick(event) {
    if (event.detail === 0) return;
    const clickedElement = event.target;
    const isOutside = !clickedElement.closest('[data-lightbox="item"].is-active img, [data-lightbox="nav"], [data-lightbox="close"], [data-lightbox="trigger"]');
    if (isOutside) {
      closeLightbox();
    }
  }

  function updateActiveItem(index) {
    elements.items.forEach(item => item.classList.remove('is-active'));
    elements.items[index].classList.add('is-active');
    if (elements.counter.current) {
      elements.counter.current.textContent = index + 1;
    }
  }

  elements.triggers.forEach((trigger, index) => {
    // Bind once per trigger
    if (trigger.dataset.lbBound === '1') return
    trigger.dataset.lbBound = '1'
    trigger.addEventListener('click', async () => {
      // Lock page scroll while gallery is open
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      // On click, fade out other thumbnails to 0
      if (gridRef.value && typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap
        const items = gridRef.value.querySelectorAll('.gallery-grid__item')
        const parent = trigger.closest('.gallery-grid__item')
        items.forEach((item) => {
          if (item !== parent) gsap.to(item, { autoAlpha: 0, duration: 0.25 })
        })
      }
      // Get gallery ID and fetch contents
      const galleryId = trigger.closest('[data-gallery-id]')?.getAttribute('data-gallery-id')
      if (galleryId) {
        try {
          const result = await $fetch('/api/sanity', {
            params: { type: 'gallery', id: galleryId }
          })
          selectedGallery.value = result
          isModalOpen.value = true
          
          // Wait for Vue to update the DOM
          await nextTick()
          
          // Re-query elements after DOM update
          const liveLightboxRoot = document.querySelector('[data-lightbox="wrapper"]')
          elements.items = liveLightboxRoot ? liveLightboxRoot.querySelectorAll('[data-lightbox="item"]') : []
          elements.wrapper = liveLightboxRoot

          // Set dynamic CSS variable for number of items
          if (elements.wrapper) {
            const itemCount = Array.isArray(selectedGallery.value?.items) ? selectedGallery.value.items.length : elements.items.length
            elements.wrapper.style.setProperty('--items', String(itemCount))
          }
          
          // Check if elements exist before proceeding
          if (!elements.wrapper || !elements.items.length) {
            console.error('Lightbox elements not found')
            return
          }
          
          mainTimeline.clear();
          const loadMoreContainer = document.querySelector('.load-more-container');
          const otherSections = document.querySelectorAll('section:not(.section-galleries)');
          const otherSectionChildren = otherSections.length > 0 ? 
            Array.from(otherSections).map(section => Array.from(section.children)).flat() : [];
          gsap.killTweensOf([elements.wrapper, elements.triggerParents, loadMoreContainer, ...otherSectionChildren]);
          
          // Clear any stale original markers from previous opens
          const prevOriginalParent = container.querySelector('[data-lightbox="original-parent"]')
          if (prevOriginalParent) {
            prevOriginalParent.setAttribute('data-lightbox', 'trigger-parent')
          }
          const prevOriginal = document.querySelector('[data-lightbox="original"]')
          if (prevOriginal) {
            prevOriginal.removeAttribute('data-lightbox')
          }

          const img = trigger.querySelector(".gallery-item__media-container img")
          const state = Flip ? Flip.getState(img) : null;
          
          const triggerRect = trigger.getBoundingClientRect();
          trigger.parentElement.style.height = `${triggerRect.height}px`;
          
          trigger.setAttribute('data-lightbox', 'original-parent');
          img.setAttribute('data-lightbox', 'original');
          
          // Start by showing first item only (nav removed)
          if (elements.wrapper) {
            elements.wrapper.addEventListener('click', handleOutsideClick);
          }
          
          const tl = gsap.timeline();
          elements.wrapper.classList.add('is-active');
          // Animate lightbox background from transparent to gallery color
          const wrapperBg = getColorForGallery(galleryId) || 'rgba(0,0,0,0.85)'
          tl.fromTo(elements.wrapper, {
            backgroundColor: 'rgba(0,0,0,0)'
          }, {
            backgroundColor: wrapperBg,
            duration: 0.6,
            ease: 'power2.inOut'
          }, 0)
          // Tie vertical scroll to horizontal translateX of the list
          const lbWrap = elements.wrapper.querySelector('.lightbox-img__wrap')
          const lbList = elements.wrapper.querySelector('.lightbox-img__list')
          const navEl = elements.wrapper.querySelector('.lightbox-nav')
          if (navEl) {
            gsap.set(navEl, { autoAlpha: 0 })
          }
          if (lbWrap && lbList) {
            gsap.set(lbList, { willChange: 'transform' })
            // Determine which element actually scrolls (wrap or outer wrapper)
            const getScroller = () => {
              const canWrapScroll = (lbWrap.scrollHeight - lbWrap.clientHeight) > 1
              const canOuterScroll = (elements.wrapper.scrollHeight - elements.wrapper.clientHeight) > 1
              return canWrapScroll ? lbWrap : (canOuterScroll ? elements.wrapper : lbWrap)
            }
            let scroller = getScroller()
            // Show indicator only when more than one item
            const cssItems = parseInt(getComputedStyle(elements.wrapper).getPropertyValue('--items')) || 0
            const domItems = elements.items?.length || 0
            const stateItems = Array.isArray(selectedGallery.value?.items) ? selectedGallery.value.items.length : 0
            const itemsCountInit = Math.max(cssItems, domItems, stateItems, 1)
            indicatorEnabled.value = itemsCountInit > 1
            showScrollIndicator.value = indicatorEnabled.value
            const updateX = () => {
              // Re-evaluate scroller in case layout changed
              scroller = getScroller()
              const maxV = Math.max(scroller.scrollHeight - scroller.clientHeight, 1)
              const progress = scroller.scrollTop / maxV
              const maxH = Math.max(lbList.scrollWidth - lbWrap.clientWidth, 0)
              const x = -progress * maxH
              gsap.to(lbList, { x, duration: 0.1, ease: 'none', overwrite: true })
              // Inline CSS var for normalized scroll (0% .. -((items-1)/items*100)%)
              const cssItemsNow = parseInt(getComputedStyle(elements.wrapper).getPropertyValue('--items')) || 0
              const domItemsNow = elements.items?.length || 0
              const stateItemsNow = Array.isArray(selectedGallery.value?.items) ? selectedGallery.value.items.length : 0
              const itemsCount = Math.max(cssItemsNow, domItemsNow, stateItemsNow, 1)
              const denom = Math.max((itemsCount - 1) * scroller.clientHeight, 1)
              const scrollProgressNorm = Math.min(1, Math.max(0, scroller.scrollTop / denom))
              // Cap translate to (items-1)/items of the distance so last item aligns flush
              const maxPercent = ((itemsCount - 1) / itemsCount) * 100
              const percentX = -(scrollProgressNorm * maxPercent)
              scroller.style.setProperty('--scrolled-height', `${percentX.toFixed(2)}%`)
              // Hide indicator on first scroll
              if (indicatorEnabled.value && showScrollIndicator.value && scroller.scrollTop > 0) {
                // trigger fade-out; a 1s CSS transition handles opacity
                showScrollIndicator.value = false
              }
              
            }
            const onScroll = () => updateX()
            const onResize = () => updateX()
            lbWrap.addEventListener('scroll', onScroll, { passive: true })
            elements.wrapper.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', onResize)
            updateX()
            // store for cleanup
            elements._scrollBind = { lbWrap, onScroll, onResize }
          }
          // Slide header out of view while lightbox is open
          const pageHeader = document.querySelector('header')
          if (pageHeader) {
            tl.to(pageHeader, {
              yPercent: -100,
              duration: 0.4,
              ease: 'power2.inOut'
            }, 0)
          }
          const targetItem = elements.items[0]; // First item
          const otherItems = Array.from(elements.items).slice(1);
          // Hide all items first except first; they will fade in sequentially after the first animation
          gsap.set(elements.items, { autoAlpha: 0 });
          gsap.set(targetItem, { autoAlpha: 1 });
          
          const lightboxImage = targetItem.querySelector('img');
          if (lightboxImage) {
            lightboxImage.style.display = 'none';
          }

          elements.triggerParents.forEach(otherTrigger => {
            if (otherTrigger !== trigger) {
              gsap.to(otherTrigger, {
                autoAlpha: 0,
                duration: 0.4,
                stagger:0.02,
                overwrite: true
              });
            }
          });

          // Fade out load more container and other page sections
          
          if (loadMoreContainer) {
            gsap.to(loadMoreContainer, {
              opacity: 0,
              duration: 0.4,
              overwrite: true
            });
          }
          
          if (otherSections.length > 0) {
            // Target direct children of other sections
            const otherSectionChildren = Array.from(otherSections).map(section => 
              Array.from(section.children)
            ).flat();
            
            if (otherSectionChildren.length > 0) {
              gsap.to(otherSectionChildren, {
                opacity: 0,
                duration: 0.4,
                stagger: 0.02,
                overwrite: true
              });
            }
          }
          
          gsap.to(elements.titles, {
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.02,
            overwrite: true
          });

          if (!targetItem.contains(img)) {
            targetItem.appendChild(img);
            if (Flip && state) {
              tl.add(
                Flip.from(state, {
                  targets: img,
                  absolute: true,
                  duration: 0.6,
                  ease: "power2.inOut"
                }), 0
              );
            }
          }
          // After the first item's FLIP completes, fade in the remaining items sequentially
          if (otherItems.length) {
            tl.to(otherItems, {
              autoAlpha: 1,
              duration: 1,
              stagger: 0.08,
              ease: 'power2.out'
            }, 0.8);
          }
          // Always reveal the nav container and close button even if there's only one item
          const closeBtn = elements.wrapper.querySelector('[data-lightbox="close"]')
          const navElNow = elements.wrapper.querySelector('.lightbox-nav')
          if (navElNow) {
            tl.to(navElNow, {
              autoAlpha: 1,
              duration: 0.6,
              ease: 'power2.out'
            }, 0.8)
          }
          if (closeBtn) {
            tl.to(closeBtn, {
              autoAlpha: 1,
              duration: 0.6,
              ease: 'power2.out'
            }, 0.8)
          }
          
          // nav animations removed
          
          mainTimeline.add(tl);
        } catch (error) {
          console.error('Error fetching gallery:', error)
        }
      }
    });
  });

  // nav removed: no next/prev handlers

  if (elements.buttons.close) {
    elements.buttons.close.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (event) => {
    if (!elements.wrapper || !elements.wrapper.classList.contains('is-active')) return;
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
}

// Initialize lightbox after component mounts
onMounted(async () => {
  try {
    const result = await $fetch('/api/sanity', { params: { type: 'galleries' } })
    galleries.value = result || []
    
    // Assign static palette colors for this section
    assignPaletteColors()
    
    await nextTick()
    
    // Show the section now that galleries are loaded
    if (sectionRef.value) {
      sectionRef.value.classList.add('loaded')
    }
    
    // Setup animation now that galleries are loaded
    setupAnimation()
    
    if (typeof window !== 'undefined' && window.gsap) {
      const gsap = window.gsap
      const Flip = window.Flip || (window.gsap && window.gsap.Flip)
      const ScrollTrigger = window.ScrollTrigger
      
      if (Flip) gsap.registerPlugin(Flip)
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
      
      gsap.defaults({
        ease: "power4.inOut",
        duration: 0.8,
      });
      
      const wrapper = document.querySelector('[data-gallery]')
      if (wrapper) {
        createLightbox(wrapper)
        // Rebind triggers when all galleries are revealed via load more
        const stopWatch = watch(() => displayedGalleries.value.length, async (len) => {
          if (len === galleries.value.length) {
            await nextTick()
            createLightbox(wrapper)
            stopWatch()
          }
        })

        // Rotate the load-more badge based on page scroll (no ScrollTrigger needed)
        const loadMoreSvg = document.querySelector('.load-more-svg')
        if (loadMoreSvg && gsap) {
          gsap.set(loadMoreSvg, { transformOrigin: '50% 50%' })
          const pxPerTurn = 2000 // 100px per 360deg
          const rotateTo = gsap.quickTo(loadMoreSvg, 'rotation', { duration: 0.1, ease: 'none' })
          const onScroll = () => rotateTo((window.scrollY / pxPerTurn) * 360)
          onScroll()
          window.addEventListener('scroll', onScroll, { passive: true })
        }
      }
    }
  } catch (error) {
    console.error('Error fetching galleries:', error)
    galleries.value = []
  }
})
</script>

<style scoped>
.section-galleries {
  width: 100%;
  z-index: 3;
  --container-width: 100vw;
  --container-padding: 0vw;
  --columns: 4;
  --gap: var(--pad-2);
  --item-width: calc(50vw - 30px);
  --item-margin-bottom: 25px;
  --button-spacing: 2vw;
  opacity: 0;
  visibility: hidden;
  color: rgba(0,0,0,0.6);
  gap: 0px;
}

.section-galleries.loaded {
  opacity: 1;
  visibility: visible;
}
@media (min-width: 600px) {
  .section-galleries {
    --item-width: 45vw;
    --item-margin-bottom: 3.25vw;
  }
}

@media (min-width: 800px) {
  .section-galleries {
    --item-width: 28vw;
    --item-margin-bottom: 3vw;
    gap: var(--pad-2);
  }
}

@media (min-width: 1024px) {
  .section-galleries {
    --item-width: 22vw;
  }
}



.gallery-group {
  position: relative;
  width: 100vw;
  overflow: hidden;
}

.gallery-grid {
gap:0;
}

.gallery-grid__item {
  cursor: pointer;
  margin-bottom: var(--item-margin-bottom);
  display:flex;
  justify-content: center;
  aspect-ratio: 1/1;
}

.gallery-item__button {
  width: 100%;
  padding: 0;
  cursor: pointer;
  position: absolute;
  display: flex;
  height: 100%;
  width: auto;
  align-items: start;
  justify-content: center;
  position: relative;
}
.gallery-item__media-container,
.gallery-item__media-container > * {
  transition: transform 0.6s ease;
  overflow: hidden;
}


@media (min-width: 1024px) {
  /* .gallery-item__button:hover .gallery-item__media-container {
    transform: scale(0.975);
  }
  .gallery-item__button:hover .gallery-item__media-container > * {
    transform: scale(1.1);
  } */
  .gallery-title {
    transition: transform 0.6s ease;
  }
  .gallery-item__button:hover .gallery-title {
    transform: translateY(8px);
  }
}

.gallery-item__img {
  width: 100%;
  max-width: calc(var(--item-width) / 1);
  max-height: calc(var(--item-width) / 1);
  object-fit: contain;
  object-position: center;
  position: relative;
  visibility:visible !important;
  opacity:1 !important;
}
.gallery-title {
  font-size: var(--h5);
  margin-top: calc(var(--pad-1) / 2);
  margin-bottom: 0;
  position: absolute;
  top: 100%;
  width: 100%;
  text-align: left;
}



.lightbox-img__item-inner {
  position: relative;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  position: relative;
}


/* Lightbox Styles */
.lightbox-wrap {
  z-index: 10000;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100svh * 1);
  display: none;
  position: fixed;
  overflow:scroll;
  justify-content: start;
  align-items: start;
  inset: 0% 0% auto;
  transition: background-color 0.3s ease;
}
.lightbox-wrap.is-active {
  display: flex;
}


@media (min-width: 1024px) {
  .lightbox-img__wrap {
    height: calc(100svh * var(--items));
    overflow-x: hidden;
    overflow-y: scroll;
    padding-left: calc(calc(100vw - 100svh) / 2);
  }
}

 .scroll-indicator {
  position: fixed;
  bottom: 80px;
  padding: 0 20px;
  left: 0;
  width: 100%;
  height: auto;
  text-align: center;
  opacity: 1;
  transition: opacity 1s ease;
 }
 .lightbox-wrap.is-active  .scroll-indicator,
 .lightbox-wrap.is-active .lightbox-nav__button {
  pointer-events: all;
 }
  .scroll-indicator div:first-child {
  opacity: 0;
  }
  .scroll-indicator div:last-child {
  animation: scroll-indicator 1s infinite linear;
  }
 
 .scroll-indicator span {
  content: '';
  height: 25px;
  width: 25px;
  border-top:1px solid currentColor;
  border-right:1px solid currentColor;
  margin-left: -0px;
  margin-bottom: -0px;
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%) rotate(135deg);
}

@keyframes scroll-indicator {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.scroll-indicator.is-hidden {
  opacity: 0;
}

.lightbox-img__container {
  width: 100%;
  height: 100%;
}

.lightbox-img__list {
  justify-content: center;
  align-items: center;
  width: calc(100svh * var(--items));
  will-change: transform;
  transform: translateX(var(--scrolled-height)) !important;
  height: 100svh;
  display: flex;
  position: fixed;
  pointer-events: none;
  top: 0;
}
@media (max-width: 1023px) {
.lightbox-img__list {
  height: calc(100svh * var(--items));
  width: 100%;
  flex-direction: column;
  transform: none !important;
}
}

.lightbox-img__item {
  height:100svh;
  width:100svh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img__item.is-active {
  visibility: visible;
}

.lightbox-img {
  object-fit: contain;
  min-width: auto;
  height:100%;
  width:100%;
}

.lightbox-img__item > * { 
  object-fit: contain !important;
  min-width: auto;
  width: 100%;
  height:100%;
  max-height: 90vh;
  max-width: 90vh;
}
.lightbox-img__item > video {
  height: auto;
} 

/* Navigation */
.lightbox-nav {
  z-index: 2;
  justify-content: space-between;
  align-items: center;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
.lightbox-nav__col {
  width: 33.333%;
}

.lightbox-nav__col.start {
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.lightbox-nav__col.center {
  grid-column-gap: var(--button-spacing);
  grid-row-gap: var(--button-spacing);
  justify-content: center;
  align-items: center;
  display: flex;
}

.lightbox-nav__col.end {
  justify-content: flex-end;
  align-items: center;
  display: flex;
}

.lightbox-nav__text {
  margin-bottom: 0;
  font-size: var(--body);
}

.lightbox-nav__button {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  cursor: pointer;
}
.lightbox-nav__button div:after,
.lightbox-nav__button div:before {
  content: '';
  height: 1px;
  width: 30px;
  border-top:1px solid currentColor;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 100;
  transform: translate(-50%) rotate(45deg);
}
.lightbox-nav__button div:before {
  transform: translate(-50%) rotate(-45deg);
}
/* .lightbox-nav__button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
} */

.lightbox-nav__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lightbox-nav__dot {
  background-color: currentColor;
  border-radius: 10em;
  width: .375em;
  height: .375em;
  margin-bottom: -.1em;
  transition-property: transform;
  transition-duration: .45s;
  transition-timing-function: cubic-bezier(.625, .05, 0, 1);
}

/* Load More Button */
.load-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 12.5vw;
  position: relative;
  bottom: 0px;
  z-index: 1;
  color: var(--yellow);
}

.load-more-button {
  width: 50vw;
  height: 50vw;
  transform: translate(-50%, 0%);
  position: absolute;
  left: 50%;
  top: -25%;
  letter-spacing: var(--letterspacing-large);
  text-transform: uppercase;
  font-size: var(--h5);
}
@media (min-width: 800px) {
  .load-more-button {
    width: 33vw;
    height: 33vw;
  }
}
@media (min-width: 1024px) {
  .load-more-button {
    width: 25vw;
    height: 25vw;
  }
}
.load-more-button:hover {
  letter-spacing: 0.5em;
}
.load-more-button svg {
  transition: all 0.6s ease;
}
.load-more-button:hover svg {
transform: scale(.95);
}
.load-more-button > * {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.load-more-button svg > * {
  fill: currentColor;
}
.load-more-button__inner {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.6s ease;
}

.gallery-grid__item:not([data-animated="1"]) {
  opacity: 0;
}


/* Responsive Design */
@media (min-width: 800px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 799px) {
  .section-galleries {
    padding: 2rem 0;
  }
  
  .wrapper {
    padding: 0 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .thumbnail-placeholder {
    height: 200px;
  }
  
  .lightbox-nav {
    padding: 1rem 0;
  }
  
  .lightbox-nav__col.center {
    gap: 1rem;
  }



  .lightbox-wrap, .lightbox-img__list, .lightbox-img__wrap {
    height: auto;
    min-height:100svh;
  }
  .lightbox-img__wrap {
    height: 100svh;
    overflow:auto;
  }
  .lightbox-img__list {
    position: relative;
    pointer-events: all;
    gap:40px;
    padding:40px;
  }
  .lightbox-img__item {
    width: 100svh;
    height: auto;
  }
  .lightbox-img__item {
    width:100%;
  }
  
}



</style>
