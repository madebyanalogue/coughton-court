<template>
  <section :class="{ 'section-border-top': section.borderTop, 'section-border-bottom': section.borderBottom }">
    <div class="wrapper">
      <div class="grid">
        <div class="col-span-12 col-span-8-md">
          <div class="grid grid-1 gap-1 py2 pbottom">
            <div v-if="hasCoordinates" class="map--outer">
              <!-- Google Map Container -->
              <div 
                v-if="hasCoordinates" 
                class="map-container"
                data-image-overlay
                ref="mapContainer"
              >
              </div>
              
              <!-- Google Maps Link -->
              <div v-if="googleMapsLink" class="map-link">
                <a 
                  :href="googleMapsLink" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="google-maps-button"
                >
                  <div class="arrow"></div>
                  <div class="dot"></div>
                </a>
              </div>
            
            </div>
            <!-- Fallback if no coordinates or API key -->
            <div v-else class="map-fallback">
              <p v-if="!latitude || !longitude">Map coordinates not configured</p>
              <p v-else>Google Maps API key not configured</p>
            </div>
            <div v-if="googleMapsLink" class="flex flex-end">
              <div class="">
                <a 
                    :href="googleMapsLink" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="btn" 
                    data-btn-hover
                  >
                    <span class="btn__text">OPEN IN GOOGLE MAPS</span>
                    <div class="btn__circle"></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             value._type === 'section' && 
             value.sectionType === 'googleMap'
    }
  }
})

// Extract map content
const latitude = computed(() => props.section?.googleMapContent?.latitude)
const longitude = computed(() => props.section?.googleMapContent?.longitude)
const zoom = computed(() => props.section?.googleMapContent?.zoom || 15)
const googleMapsLink = computed(() => props.section?.googleMapContent?.googleMapsLink || '')
const customMapStyle = computed(() => props.section?.googleMapContent?.customMapStyle || null)

// Check if we have coordinates
const hasCoordinates = computed(() => latitude.value && longitude.value)

// Map container ref
const mapContainer = ref(null)
let map = null
let marker = null

// Google Maps Style ID for Registix (fallback)
const mapStyleId = '3d2d84b1d8ab6d551417b829'

// Default dark mode greyscale style
const defaultDarkGreyscaleStyle = [
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1e1e1e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a3a3a"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#555555"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#a0a0a0"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a3a3a"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#a0a0a0"
      }
    ]
  }
]

// Initialize map
const initMap = async () => {
  console.log('Initializing map with custom styling')
  if (!hasCoordinates.value || !mapContainer.value) return
  
  const config = useRuntimeConfig()
  const apiKey = config.public.googleMapsApiKey
  
  if (!apiKey) {
    console.warn('Google Maps API key is not configured')
    return
  }

  try {
    // Load Google Maps JavaScript API
    await loadGoogleMapsScript(apiKey)
    
    // Map options with custom styling
    const mapOptions = {
      center: { lat: latitude.value, lng: longitude.value },
      zoom: zoom.value,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    }
    
    // Apply custom style if provided, otherwise use dark greyscale style
    if (customMapStyle.value) {
      console.log('Applying custom map style')
      mapOptions.styles = customMapStyle.value
    } else {
      console.log('Applying default dark greyscale style')
      mapOptions.styles = defaultDarkGreyscaleStyle
    }
    
    // Create map
    map = new google.maps.Map(mapContainer.value, mapOptions)
    
    // Add marker
    marker = new google.maps.Marker({
      position: { lat: latitude.value, lng: longitude.value },
      map: map,
      title: 'Location'
    })
    
  } catch (error) {
    console.error('Error initializing Google Maps:', error)
  }
}

// Load Google Maps script
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => resolve()
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error)
      reject(new Error('Failed to load Google Maps script'))
    }
    
    document.head.appendChild(script)
  })
}

// Clean up map on unmount
onUnmounted(() => {
  if (map) {
    map = null
  }
  if (marker) {
    marker = null
  }
})

// Initialize map when component mounts
onMounted(() => {
  if (hasCoordinates.value) {
    initMap()
  }
})
</script>

<style scoped>
.map--outer {
  position: relative;
  color: #f9da23;
}
.map-container {
  width: 100%;
  overflow: hidden;
  aspect-ratio: 4/3;
  max-height: 900px;
}
.map-fallback {
  height: 400px;
  background: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

.map-link {
  text-align: center;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  top: 0;
  margin-top: 0;
}
.map-link .arrow {
  transform: rotate(180deg);
  width: 30px;
  position: absolute;
  top:50%;
  left: 50%;
  transform: rotate(0deg) translate(-50%, calc(-50% - 80px));
}
.map-link .arrow:after {
  bottom: calc(var(--arrow-size) / 10);
  transform: rotate(-45deg);
  top:unset;
}
.google-maps-button {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.2s ease;
  position:absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
.google-maps-button .dot {
  width: 40px;
  height: 40px;
  background: currentColor;
  border-radius: 50%;
  position:absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% - 20px));
}

</style> 