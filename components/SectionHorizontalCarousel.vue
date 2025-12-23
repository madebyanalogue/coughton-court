<template>
  <section :class="['section-horizontal-carousel', { 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }]">
    <div class="">
      
      <!-- GSAP Slider -->
      <div aria-label="Slider" data-gsap-slider-init="" role="region" aria-roledescription="carousel" class="gsap-slider" :class="{ 'fallback-slider': !gsapReady }">
        <div data-gsap-slider-collection="" class="gsap-slider__collection">
          <div data-gsap-slider-list="" class="gsap-slider__list">
            <div 
              v-for="(item, index) in items" 
              :key="index"
              data-gsap-slider-item="" 
              class="gsap-slider__item"
            >
              <div class="carousel-card">
                <div class="before__125"></div>
                
                <!-- Image Item -->
                <div v-if="isImageItem(item) && item.asset?.asset" class="carousel-media">
                  <NuxtImg
                    :src="getImageUrl(item.asset)"
                    :alt="item.alt || 'Carousel image'"
                    class="carousel-image"
                    loading="lazy"
                  />
                </div>
                
                <!-- Video Item -->
                <div v-else-if="isVideoItem(item) && item.asset?.asset" class="carousel-media">
                  <video
                    :poster="item.poster ? getImageUrl(item.poster) : undefined"
                    class="carousel-video"
                    muted
                    loop
                    autoplay
                    playsinline
                  >
                    <source :src="item.asset.asset.url" :type="item.asset.asset.mimeType">
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <!-- Fallback content -->
                <div v-else class="carousel-placeholder">
                  <div class="debug-info">
                    <p>No content found</p>
                    <p><strong>Item Type Check:</strong></p>
                    <p>isImageItem: {{ isImageItem(item) }}</p>
                    <p>isVideoItem: {{ isVideoItem(item) }}</p>
                    <p><strong>Asset Debug:</strong></p>
                    <p>item.asset: {{ item.asset }}</p>
                    <p>item.asset?.asset: {{ item.asset?.asset }}</p>
                    <p>item.asset?.asset?.url: {{ item.asset?.asset?.url }}</p>
                    <p><strong>Item Structure:</strong></p>
                    <pre style="font-size: 10px; color: #666;">{{ JSON.stringify(item, null, 2) }}</pre>
                  </div>
                </div>
<!--                 
                <div class="carousel-card__tag">
                  <p class="carousel-card__tag-p">Slide {{ index + 1 }}</p>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        <div data-gsap-slider-controls="" class="gsap-slider__controls">
          <button data-gsap-slider-control="prev" class="gsap-slider__control"><div class="arrow left"></div></button>
          <button data-gsap-slider-control="next" class="gsap-slider__control"><div class="arrow right"></div></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value &&
             value._type === 'section' &&
             value.sectionType === 'horizontalCarousel'
    }
  }
})

const { getImageUrl } = useSanityImage()

// GSAP ready state
const gsapReady = ref(false)

// Helper functions to detect item types
const isImageItem = (item) => {
  return item && item._type === 'imageItem'
}

const isVideoItem = (item) => {
  return item && item._type === 'videoItem'
}

// Extract data from section
const title = computed(() => props.section?.title || '')
const items = computed(() => {
  const carouselItems = props.section?.horizontalCarouselContent?.items || []
  
  
  if (carouselItems.length > 0) {
  //   console.log('First item:', carouselItems[0])
  //   console.log('First item asset:', carouselItems[0]?.asset)
  }
  
  return carouselItems
})

// GSAP Slider Initialization
function initBasicGSAPSlider() {
  const sliders = document.querySelectorAll('[data-gsap-slider-init]')
  
  sliders.forEach(root => {
    if (root._sliderDraggable) root._sliderDraggable.kill();

    const collection = root.querySelector('[data-gsap-slider-collection]');
    const track      = root.querySelector('[data-gsap-slider-list]');
    const items      = Array.from(root.querySelectorAll('[data-gsap-slider-item]'));
    const controls   = Array.from(root.querySelectorAll('[data-gsap-slider-control]'));

    // Inject aria attributes
    root.setAttribute('role','region');
    root.setAttribute('aria-roledescription','carousel');
    root.setAttribute('aria-label','Slider');
    collection.setAttribute('role','group');
    collection.setAttribute('aria-roledescription','Slides List');
    collection.setAttribute('aria-label','Slides');
    items.forEach((slide,i) => {
      slide.setAttribute('role','group');
      slide.setAttribute('aria-roledescription','Slide');
      slide.setAttribute('aria-label',`Slide ${i+1} of ${items.length}`);
      slide.setAttribute('aria-hidden','true');
      slide.setAttribute('aria-selected','false');
      slide.setAttribute('tabindex','-1');
    });
    controls.forEach(btn => {
      const dir = btn.getAttribute('data-gsap-slider-control');
      btn.setAttribute('role','button');
      btn.setAttribute('aria-label', dir==='prev' ? 'Previous Slide' : 'Next Slide');
      btn.disabled = true;
      btn.setAttribute('aria-disabled','true');
    });

    // Determine if slider runs
    const styles      = getComputedStyle(root);
    const statusVar   = styles.getPropertyValue('--slider-status').trim();
    let   spvVar      = parseFloat(styles.getPropertyValue('--slider-spv'));
    const rect        = items[0].getBoundingClientRect();
    const marginRight = parseFloat(getComputedStyle(items[0]).marginRight);
    const slideW      = rect.width + Math.max(marginRight, 0.01); // Ensure minimum margin for calculations
    if (isNaN(spvVar)) {
      spvVar = collection.clientWidth / slideW;
    }
    const spv           = Math.max(1, Math.min(spvVar, items.length));
    const sliderEnabled = statusVar==='on' && spv < items.length;
    root.setAttribute('data-gsap-slider-status', sliderEnabled ? 'active' : 'not-active');

    if (!sliderEnabled) {
      // Teardown when disabled
      track.removeAttribute('style');
      track.onmouseenter = null;
      track.onmouseleave = null;
      track.removeAttribute('data-gsap-slider-list-status');
      root.removeAttribute('role');
      root.removeAttribute('aria-roledescription');
      root.removeAttribute('aria-label');
      collection.removeAttribute('role');
      collection.removeAttribute('aria-roledescription');
      collection.removeAttribute('aria-label');
      items.forEach(slide => {
        slide.removeAttribute('role');
        slide.removeAttribute('aria-roledescription');
        slide.removeAttribute('aria-label');
        slide.removeAttribute('aria-hidden');
        slide.removeAttribute('aria-selected');
        slide.removeAttribute('tabindex');
        slide.removeAttribute('data-gsap-slider-item-status');
      });
      controls.forEach(btn => {
        btn.disabled = false;
        btn.removeAttribute('role');
        btn.removeAttribute('aria-label');
        btn.removeAttribute('aria-disabled');
        btn.removeAttribute('data-gsap-slider-control-status');
      });
      return;
    }

    // Track hover state
    track.onmouseenter = () => {
      track.setAttribute('data-gsap-slider-list-status','grab');
    };
    track.onmouseleave = () => {
      track.removeAttribute('data-gsap-slider-list-status');
    };

    //Ccalculate bounds and snap points
    const vw        = collection.clientWidth;
    const tw        = track.scrollWidth;
    const maxScroll = Math.max(tw - vw, 0);
    const minX      = -maxScroll;
    const maxX      = 0;
    const maxIndex  = maxScroll / slideW;
    const full      = Math.floor(maxIndex);
    const snapPoints = [];
    for (let i = 0; i <= full; i++) {
      snapPoints.push(-i * slideW);
    }
    if (full < maxIndex) {
      snapPoints.push(-maxIndex * slideW);
    }

    let activeIndex    = 0;
    const setX         = gsap.quickSetter(track,'x','px');
    let collectionRect = collection.getBoundingClientRect();

    function updateStatus(x) {
      if (x > maxX || x < minX) {
        return;
      }

      // Clamp and find closest snap
      const calcX = x > maxX ? maxX : (x < minX ? minX : x);
      let closest = snapPoints[0];
      snapPoints.forEach(pt => {
        if (Math.abs(pt - calcX) < Math.abs(closest - calcX)) {
          closest = pt;
        }
      });
      activeIndex = snapPoints.indexOf(closest);

      // Update Slide Attributes
      items.forEach((slide,i) => {
        const r           = slide.getBoundingClientRect();
        const leftEdge    = r.left - collectionRect.left;
        const slideCenter = leftEdge + r.width/2;
        const inView      = slideCenter > 0 && slideCenter < collectionRect.width;
        const status      = i === activeIndex ? 'active' : inView ? 'inview' : 'not-active';

        slide.setAttribute('data-gsap-slider-item-status', status);
        slide.setAttribute('aria-selected',    i === activeIndex ? 'true' : 'false');
        slide.setAttribute('aria-hidden',      inView ? 'false' : 'true');
        slide.setAttribute('tabindex',         i === activeIndex ? '0'    : '-1');
      });

      // Update Controls
      controls.forEach(btn => {
        const dir = btn.getAttribute('data-gsap-slider-control');
        const can = dir === 'prev'
          ? activeIndex > 0
          : activeIndex < snapPoints.length - 1;

        btn.disabled = !can;
        btn.setAttribute('aria-disabled', can ? 'false' : 'true');
        btn.setAttribute('data-gsap-slider-control-status', can ? 'active' : 'not-active');
      });
    }

    controls.forEach(btn => {
      const dir = btn.getAttribute('data-gsap-slider-control');
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const delta = dir === 'next' ? 1 : -1;
        const target = activeIndex + delta;
        gsap.to(track, {
          duration: 0.4,
          x: snapPoints[target],
          onUpdate: () => updateStatus(gsap.getProperty(track,'x'))
        });
      });
    });

    // Initialize Draggable
    root._sliderDraggable = Draggable.create(track, {
      type: 'x',
      inertia: true,
      bounds: {minX, maxX},
      throwResistance: 2000,
      dragResistance: 0.05,
      maxDuration: 0.6,
      minDuration: 0.2,
      edgeResistance: 0.75,
      snap: {x: snapPoints, duration: 0.4},
      onPress() {
        track.setAttribute('data-gsap-slider-list-status','grabbing');
        collectionRect = collection.getBoundingClientRect();
      },
      onDrag() {
        setX(this.x);
        updateStatus(this.x);
      },
      onThrowUpdate() {
        setX(this.x);
        updateStatus(this.x);
      },
      onThrowComplete() {
        setX(this.endX);
        updateStatus(this.endX);
        track.setAttribute('data-gsap-slider-list-status','grab');
      },
      onRelease() {
        setX(this.x);
        updateStatus(this.x);
        track.setAttribute('data-gsap-slider-list-status','grab');
      }
    })[0];

    // Initial state
    setX(0);
    updateStatus(0);
  });
}

// Initialize GSAP slider when component mounts
onMounted(() => {
  // Register GSAP plugins
  gsap.registerPlugin(Draggable, InertiaPlugin)
  
  // Initialize slider
  gsapReady.value = true
  initBasicGSAPSlider()
})
</script>

<style scoped>


.gsap-slider {
  flex-flow: column;
  align-items: center;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

.gsap-slider__collection {
  width: 100%;
}

.gsap-slider__list {
  -webkit-user-select: none;
  user-select: none;
  will-change: transform;
  touch-action: pan-y;
  backface-visibility: hidden;
  display: flex;
}

.gsap-slider__item {
  width: calc(((100% - 1px)  - (var(--slider-spv)  - 1) * var(--slider-gap)) / var(--slider-spv));
  margin-right: var(--slider-gap);
  flex: none;
}

.carousel-card {
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

.before__125 {
  padding-top: 133%;
}

.carousel-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.carousel-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.carousel-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 1rem;
}


/* Setup */

[data-gsap-slider-init] {
  --slider-status: on; /* Turn slider on/off */
  --slider-spv: 3.5; /* Slides per view */ 
  --slider-gap: 0.01em; /* Slides Gap */
}

@media screen and (max-width: 991px) {
   [data-gsap-slider-init] {
    --slider-status: on; /* Turn slider on/off */
    --slider-spv: 2.25; /* Slides per view */ 
    --slider-gap: 0.01em; /* Slides Gap */
  } 
}

@media screen and (max-width: 767px) {
  [data-gsap-slider-init] { 
    --slider-status: on; /* Turn slider on/off */
    --slider-spv: 1.15; /* Slides per view */ 
    --slider-gap: 0.01em; /* Gap */
  }
}

[data-gsap-slider-control-status="not-active"] { 
  opacity: 0;
  pointer-events: none;
}

/* Customization */

.carousel-card {
  transition: all 0.3s ease;
}

.carousel-card__tag {
  transition: all 0.3s ease;
}

[data-gsap-slider-item-status="not-active"] .carousel-card__tag {
  opacity: 0;
}

/* Fallback slider styles */
.fallback-slider .gsap-slider__list {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.fallback-slider .gsap-slider__list::-webkit-scrollbar {
  display: none;
}

.fallback-slider .gsap-slider__item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.fallback-slider .gsap-slider__controls {
  display: none;
}
[data-gsap-slider-item]:last-child {
  margin-right: 0;
}

/* Controls */

</style>