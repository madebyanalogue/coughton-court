export default defineNuxtPlugin(() => {
  // Image overlay swipe-in effect disabled globally.
  // Plugin left in place as a no-op to avoid runtime errors.
  if (process.server) return
  return

  // Available overlay colors
  const overlayColors = [
    //'#5b5653', // dark grey
    //'#dfd3cd', // beige
    //'#f7efeb', // light grey
    '#ffdd15'  // yellow
  ]
  
  // Color rotation index - tracks which color to use next
  let colorIndex = 0
  
  // Function to get next color in rotation
  function getNextColor() {
    const color = overlayColors[colorIndex]
    colorIndex = (colorIndex + 1) % overlayColors.length
    return color
  }
  
  function initImageOverlays() {
    // First, clean up any existing duplicate overlays
    cleanupDuplicateOverlays()
    
    const images = document.querySelectorAll('[data-image-overlay]')
    
    images.forEach((image, index) => {
      // Check if this image already has an overlay
      if (image.hasAttribute('data-overlay-processed')) {
        return // Skip if already processed
      }
      
      // Mark this image as processed
      image.setAttribute('data-overlay-processed', 'true')
      
      // Create container with overflow hidden if it doesn't exist
      let container = image.parentElement
      if (!container.classList.contains('image-overlay-container')) {
        // Wrap image in container
        container = document.createElement('div')
        container.className = 'image-overlay-container'
        container.style.cssText = 'position: relative; overflow: hidden; display: inline-block;'
        image.parentNode.insertBefore(container, image)
        container.appendChild(image)
      }
      
      // Create overlay element
      const overlay = document.createElement('div')
      overlay.className = 'image-overlay'
      
                   // Get next color in rotation
             const nextColor = getNextColor()
      
                   // Style the overlay - start fully visible
             overlay.style.cssText = `
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               height: 100%;
               background-color: ${nextColor};
               transform: scaleX(1);
               transform-origin: right;
               z-index: 3;
               pointer-events: none;
             `
      
      // Insert overlay before the image
      container.insertBefore(overlay, image)
      
      // Style the image - start hidden to the left
      image.style.cssText = `
        position: relative;
        z-index: 2;
        transform: translateX(-30%);
        transition: none;
      `
      
      // Don't animate yet - wait for scroll trigger
    })
  }
  
  function cleanupDuplicateOverlays() {
    // Remove any duplicate overlays
    const containers = document.querySelectorAll('.image-overlay-container')
    containers.forEach(container => {
      const overlays = container.querySelectorAll('.image-overlay')
      if (overlays.length > 1) {
        // Keep only the first overlay, remove the rest
        for (let i = 1; i < overlays.length; i++) {
          overlays[i].remove()
        }
      }
    })
  }
  
  function triggerImageOverlay(image) {
    const overlay = image.parentElement.querySelector('.image-overlay')
    if (!overlay || image.hasAttribute('data-overlay-animated')) {
      return // Already animated or no overlay
    }
    
    // Mark as animated
    image.setAttribute('data-overlay-animated', 'true')
    
    // Animate the overlay and image
    animateImageOverlay(overlay, image)
  }
  
  function animateImageOverlay(overlay, image) {
    // Animate overlay from scaleX(1) to scaleX(0)
    gsap.to(overlay, {
      scaleX: 0,
      duration: 1.2,
      ease: "power2.inOut"
    })
    
    // Animate image from translateX(-30%) to translateX(0%)
    gsap.to(image, {
      x: "0%",
      duration: 1.2,
      ease: "power2.inOut"
    })
  }
  
  // Set up scroll trigger for images
  function setupScrollTriggers() {
    // Check if ScrollTrigger is available
    if (!window.gsap || !window.gsap.ScrollTrigger) {
      setupFallbackScrollDetection()
      return
    }
    
    const images = document.querySelectorAll('[data-image-overlay]')
    
    images.forEach(image => {
      // Create ScrollTrigger for each image
      gsap.timeline({
        scrollTrigger: {
          trigger: image,
          start: "top 80%", // Start when image is 80% from top of viewport
          onEnter: () => triggerImageOverlay(image),
          once: true // Only trigger once
        }
      })

      // Also trigger immediately if already in view on load
      const rect = image.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
      if (isVisible) {
        triggerImageOverlay(image)
      }
    })
  }
  
  // Fallback scroll detection if ScrollTrigger is not available
  function setupFallbackScrollDetection() {
    const images = document.querySelectorAll('[data-image-overlay]')
    
    function checkImageVisibility() {
      images.forEach(image => {
        if (image.hasAttribute('data-overlay-animated')) return
        
        const rect = image.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
        
        if (isVisible) {
          triggerImageOverlay(image)
        }
      })
    }
    
    window.addEventListener('scroll', checkImageVisibility)
    // Initial check
    setTimeout(checkImageVisibility, 100)
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Check if preloader has already completed
      if (document.body.classList.contains('preloader-complete')) {
        // Preloader already completed, initialize immediately
        initImageOverlays()
        setTimeout(setupScrollTriggers, 100)
      } else {
        // Wait for preloader completion event
        document.addEventListener('preloader-complete', () => {
          initImageOverlays()
          setTimeout(setupScrollTriggers, 100)
        })
      }
    })
  } else {
    // DOM already ready, check preloader status
    if (document.body.classList.contains('preloader-complete')) {
      // Preloader already completed, initialize immediately
      initImageOverlays()
      setTimeout(setupScrollTriggers, 100)
    } else {
      // Wait for preloader completion event
      document.addEventListener('preloader-complete', () => {
        initImageOverlays()
        setTimeout(setupScrollTriggers, 100)
      })
    }
  }
  
  // Re-initialize when new content loads
  window.addEventListener('svg-loaded', () => {
    initImageOverlays()
    // Wait a bit for GSAP to be fully ready
    setTimeout(setupScrollTriggers, 100)
  })
  
  // Re-initialize when news content loads
  window.addEventListener('news-loaded', () => {
    //console.log('[ImageOverlay] News content loaded, re-initializing...')
    initImageOverlays()
    // Wait a bit for GSAP to be fully ready
    setTimeout(setupScrollTriggers, 100)
  })
  
  // Re-initialize on route changes (global)
  document.addEventListener('route-changed', () => {
    initImageOverlays()
    setTimeout(setupScrollTriggers, 100)
  })
  
  // Also watch for new images being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const hasNewImages = Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && (
            node.hasAttribute('data-image-overlay') || 
            node.querySelector('[data-image-overlay]')
          )
        )
        if (hasNewImages) {
          //console.log('[ImageOverlay] New images detected, re-initializing...')
          initImageOverlays()
          setTimeout(setupScrollTriggers, 50)
        }
      }
    })
  })
  
  // Start observing
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true })
  }
})
