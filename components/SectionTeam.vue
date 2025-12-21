<template>
  <section :class="['section-team', { 'section-border-top': section.borderTop }]">
    <div class="show-md"> 
      <div class="team--viewer" ref="effectSection">
        <p class="scroll">Scroll</p>
        <!-- Visualize caption visibility area -->
        <div class="visibility-zone" aria-hidden="true"></div>
        <!-- Visualize vertical placement band for media-wrap tops -->
        <div class="placement-zone" aria-hidden="true"></div>

        <div class="container" ref="effectContainer">
            <div v-if="teamMembers.length" class="medias">
                <div 
                  v-for="member in teamMembers" 
                  :key="member._id" 
                  class="media-wrap"
                >
                <div class="media-inner-container grid grid-1">
                  <img 
                    :src="member.imageUrl" 
                    :alt="member.imageAlt || member.name" 
                    class="media" 
                  />
                  <div class="media-caption grid grid-1">
                    <div class="grid grid-1 gap-025">
                      <p class="media-title heading h3 uppercase letter-spacing-medium">{{ member.name }}</p>
                      <p v-if="member.role" class="media-role">{{ member.role }}</p>
                    </div>
                    <p v-if="member.bio" class="media-bio">{{ member.bio }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="medias">
                <div 
                  v-for="i in 24" 
                  :key="`placeholder-` + i" 
                  class="media-wrap"
                >
                <div class="media-inner-container grid grid-1">
                  <img 
                    :src="generatedMediaUrls[i - 1]" 
                    :alt="`Generated media ${i}`" 
                    class="media" 
                  />
                  <div class="media-caption grid grid-1">
                    <div class="grid grid-1 gap-025">
                      <p class="media-title heading">Team Member {{ i }}</p>
                      <p class="media-role">Role</p>
                    </div>
                    <p class="media-bio">Short bio goes here for placeholder.</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    <div class="hide-md py1 ptop">
      <div class="pw p3 p4-sm pbottom">
        <div v-if="teamMembers.length"
             data-gsap-slider-init
             class="gsap-slider">
          <div data-gsap-slider-collection class="gsap-slider__collection">
            <div data-gsap-slider-list class="gsap-slider__list">
              <div v-for="member in teamMembers"
                   :key="member._id"
                   data-gsap-slider-item
                   class="gsap-slider__item">
                <div class="carousel-card">
                  <div class="media-inner-container grid grid-1">
                    <div class="pw p2 pleftright">
                      <img 
                        :src="member.imageUrl" 
                        :alt="member.imageAlt || member.name" 
                        class="media" 
                      />
                    </div>
                    <div class="media-caption grid grid-1 pw p2 pleftright">
                      <div class="grid grid-1 gap-025">
                        <p class="media-title heading h3 uppercase letter-spacing-medium">{{ member.name }}</p>
                        <p v-if="member.role" class="media-role">{{ member.role }}</p>
                      </div>
                      <p v-if="member.bio" class="media-bio">{{ member.bio }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div data-gsap-slider-controls class="gsap-slider__controls">
            <button data-gsap-slider-control="prev" class="gsap-slider__control"><div class="arrow left"></div></button>
            <button data-gsap-slider-control="next" class="gsap-slider__control"><div class="arrow right"></div></button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const generatedMediaUrls = Array.from({ length: 24 }, (_, idx) => `https://picsum.photos/seed/team-${idx + 1}/600/600`)

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

// Use the team composable
const { orderedTeamMembers, loading, fetchTeamMembers } = useTeam()

// Get team members
const teamMembers = computed(() => orderedTeamMembers.value)

// Refs for effect section
const effectSection = ref(null)
const effectContainer = ref(null)

// Fetch team members on mount and init GSAP effect
onMounted(async () => {
  await fetchTeamMembers()

  if (typeof window === 'undefined') return

  gsap.registerPlugin(ScrollTrigger)

  await nextTick()

  const sectionEl = effectSection.value
  const containerEl = effectContainer.value
  if (!sectionEl || !containerEl) return

  // Measure header height (fallback to 105px) and expose as CSS var
  const headerEl = document.querySelector('header')
  const headerH = Math.max(0, Math.round((headerEl?.getBoundingClientRect().height ?? 105)))
  document.documentElement.style.setProperty('--header-h', headerH + 'px')

  const medias = containerEl.querySelectorAll('.media')

  // Ensure media starts with no absolute pixel translate; all motion happens via percent-based tweens
  const W = window.innerWidth
  medias.forEach((media, index) => {
    gsap.set(media, { x: 0, y: 0 })
  })

  // Hide the scroll prompt when pinned
  gsap.to(sectionEl.querySelector('.scroll'), {
    autoAlpha: 0,
    duration: 0.2,
    scrollTrigger: {
      trigger: sectionEl,
      start: 'top top',
      end: 'top top-=1',
      toggleActions: 'play none reverse none'
    }
  })

  // Widen horizontal scope by multiplying item spacing virtually with padding
  // Horizontal scroll length with a 20vw tail after the last item
  const distance = (containerEl.scrollWidth - window.innerWidth) + (window.innerWidth * 0.2)
  const scrollTween = gsap.to(containerEl, {
    x: -distance,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionEl,
      pin: true,
      scrub: true,
      start: () => 'top +=' + headerH,
      end: '+=' + distance
    }
  })

  medias.forEach((media, mediaIndex) => {
    const wrap = media.closest('.media-wrap')
    const caption = wrap?.querySelector('.media-caption')
    if (caption) {
      // First caption should be visible since it's in view initially
      if (mediaIndex === 0) {
        gsap.set(caption, { autoAlpha: 1 })
        caption.classList.add('is-visible')
      } else {
        gsap.set(caption, { autoAlpha: 0 })
      }
    }

    // Alternate vertical position per card within safe viewport bounds
    if (wrap) {
      // Calculate positions relative to the pinned section, not viewport
      const sectionRect = sectionEl.getBoundingClientRect()
      const sectionTop = sectionRect.top
      const sectionHeight = sectionEl.clientHeight
      
      const topOffset = 20   // pushes odd items down from 40px
      const bottomNudge = 0 // lets even items sit closer to bottom
      const minTop = 40 + topOffset
      
      const wrapRect = wrap.getBoundingClientRect()
      const currentTop = wrapRect.top - sectionTop // relative to section
      
      // Odd items align to top, even items align to bottom
      const targetTop = (mediaIndex % 2 === 0)
        ? minTop // odd items (0, 2, 4...) align to top
        : (sectionHeight - 40 - wrapRect.height) // even items (1, 3, 5...) align to bottom
      
      const deltaY = targetTop - currentTop
      gsap.set(wrap, { y: deltaY })
    }

    gsap.from(media, {
      rotation: (Math.random() - 0.5) * 80,
      yPercent: (Math.random() - 0.5) * 300,
      xPercent: Math.random() * 400,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: media,
        containerAnimation: scrollTween,
        start: 'left 110%',
        end: 'left 65%',
        scrub: true
      }
    })

    const endTween = gsap.fromTo(media, {
      rotation: 0,
      yPercent: 0,
      xPercent: 0
    }, {
      rotation: (Math.random() - 0.5) * 80,
      yPercent: (Math.random() - 0.5) * 300,
      xPercent: -Math.random() * 400,
      ease: 'power1.in',
      scrollTrigger: {
        trigger: media,
        containerAnimation: scrollTween,
        start: 'right 35%',
        end: 'right -10%',
        scrub: true
      }
    })

    // Reveal caption when rotation stops (center zone)
    if (caption) {
      // Use fixed central visibility zone center line as reference
      // Align caption visibility with the media's neutral window
      // Neutral window is between the end of the "enter" tween (left 65%)
      // and the start of the "exit" tween (right 35%).

      ScrollTrigger.create({
        trigger: media,
        containerAnimation: scrollTween,
        // Visible while media is in the same neutral band as the transforms
        start: 'left 65%',
        end: 'right 35%',
        onEnter: () => {
          caption.classList.add('is-visible')
          gsap.to(caption, { autoAlpha: 1, duration: 0.5 })
        },
        onLeaveBack: () => {
          caption.classList.remove('is-visible')
          gsap.to(caption, { autoAlpha: 0, duration: 0.5 })
        },
        onLeave: () => {
          caption.classList.remove('is-visible')
          gsap.to(caption, { autoAlpha: 0, duration: 0.5 })
        },
        onEnterBack: () => {
          caption.classList.add('is-visible')
          gsap.to(caption, { autoAlpha: 1, duration: 0.5 })
        }
      })
    }
  })
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

 

<!-- legacy inline script removed; logic moved into Vue onMounted above -->

<style scoped>

.team--viewer {
  --media-image-width: 15vw;
  --media-image-height: 15vw;
  --media-width: 35vw;
  --media-height: 30vw;
  --media-column-gap: 0vw; 
  --visibility-zone-left: 15vw;
  --visibility-zone-width: 70vw;
  --media-caption-width: calc(var(--h3) * 16);
  --container-padding: 60vw;
  --header-h: 105px;
  --media-inner-transform: 15%;
  --media-random-padding: calc(100svh - 105px);
}
.team--viewer {
    width: 100%;
    overflow: hidden;
    height: calc(100svh - var(--header-h));
    max-height: 75vw !important;
    display: flex;
}
.scroll {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
}
.visibility-zone {
    position: fixed;
    top: 0;
    bottom: 0;
    left: var(--visibility-zone-left);               /* (100 - 70) / 2 */
    width: var(--visibility-zone-width);              /* central 70% of viewport */
    pointer-events: none;
    z-index: 9999;
}

.placement-zone {
    position: fixed;
    left: 0;
    right: 0;
    top: 40px;                                       /* 40px from viewport top */
    bottom: 40px;                                   /* 40px from viewport bottom */
    pointer-events: none;
    z-index: 9998;
}
.container {
    height: 100%;
    white-space: nowrap;
    width: max-content;
    /* left pre-roll space only; no trailing space after last item */
    padding: 0 0 0 var(--container-padding);
    will-change: transform;
    display: flex;
}
.medias {
    position: relative;
    height: auto;
    column-gap: var(--media-column-gap);
    row-gap: 0;
    display: grid;
    grid-template-rows: 1fr; /* single row */
    grid-auto-flow: column; /* each child in its own column */
    grid-auto-columns: max-content;
    align-items: center;
}
.media-wrap { position: relative; }
.media-wrap {
    position: relative;
    max-height: var(--media-height);
    width: var(--media-width);
}
.media-caption {
    pointer-events: none;
    width: var(--media-caption-width);
    background: transparent;
}
.team--viewer .media {
    width: var(--media-image-width);
    height: var(--media-image-height);
    will-change: transform;
    position: relative;
    object-fit: contain;
}
.media-bio {
  white-space: normal;
  max-width: var(--media-caption-width);
}
.media-inner-container {
  width: var(--media-inner-width);
}
.media-wrap:nth-child(even) .media-inner-container {
  transform: translate(var(--media-inner-transform), -10%);
}
.media-wrap:nth-child(4n - 1) .media-inner-container {
  transform: translate(0, 10%);
}
.media-wrap:nth-child(4n - 2) .media-inner-container {
  transform: translate(var(--media-inner-transform), -15%);
}
.media-wrap:nth-child(4n - 0) .media-inner-container {
  transform: translate(var(--media-inner-transform), -15%);
}

/* 
.media-wrap:nth-child(8n - 7) { padding-top:   calc(var(--media-random-padding) * 0.1); }
.media-wrap:nth-child(8n - 6) { padding-top:   calc(var(--media-random-padding) * 0.4); }
.media-wrap:nth-child(8n - 5) { padding-top:   calc(var(--media-random-padding) * 0.05); }
.media-wrap:nth-child(8n - 4) { padding-top:   calc(var(--media-random-padding) * 0.35); }
.media-wrap:nth-child(8n - 3) { padding-top:   calc(var(--media-random-padding) * 0.05); }
.media-wrap:nth-child(8n - 2) { padding-top:   calc(var(--media-random-padding) * 0.4); }
.media-wrap:nth-child(8n - 1) { padding-top:   calc(var(--media-random-padding) * 0.05); }
.media-wrap:nth-child(8n - 0) { padding-top:   calc(var(--media-random-padding) * 0.4); } */
</style>

<style scoped>
.section-team {
  overflow: hidden;
}
.team-section {
  width: 100%;
  padding: var(--section-padding, 4rem 0);
}

.team-container {
  max-width: var(--container-width, 1200px);
  margin: 0 auto;
  padding: 0 var(--container-padding, 1rem);
}

.team-header {
  text-align: center;
  margin-bottom: 3rem;
}

.team-title {
  font-size: var(--h2);
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--dark-grey);
}

.team-description {
  font-size: var(--body);
  color: var(--grey);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}


.member-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.member-info {
  padding: 1.5rem;
}

.member-name {
  font-size: var(--h4);
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--dark-grey);
}

.member-role {
  font-size: var(--body);
  font-weight: 500;
  color: var(--yellow);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-bio {
  font-size: var(--body);
  color: var(--grey);
  line-height: 1.6;
  margin: 0;
}

.team-loading,
.team-empty {
  text-align: center;
  padding: 3rem;
  color: var(--grey);
  font-size: var(--body);
}

/* Responsive adjustments */
@media (max-width: 799px) {
  .team-section {
    padding: var(--section-padding, 2rem 0);
  }
  
  .team-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .team-header {
    margin-bottom: 2rem;
  }
  
  .member-info {
    padding: 1rem;
  }
}



[data-gsap-slider-init] {
  --slider-status: on; /* Turn slider on/off */
  --slider-spv: 3.5; /* Slides per view */ 
  --slider-gap: 0.01em; /* Slides Gap */
}

@media screen and (max-width: 1023px) {
   [data-gsap-slider-init] {
    --slider-status: on; /* Turn slider on/off */
    --slider-spv: 2.25; /* Slides per view */ 
    --slider-gap: 0.01em; /* Slides Gap */
  } 
}

@media screen and (max-width: 799px) {
  [data-gsap-slider-init] { 
    --slider-status: on; /* Turn slider on/off */
    --slider-spv: 1; /* Slides per view */ 
    --slider-gap: 0.01em; /* Gap */
  }
}

</style>
