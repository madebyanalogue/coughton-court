import imageUrlBuilder from '@sanity/image-url'
import { useNuxtApp } from '#app'

export const useSanityImage = () => {
  const { $sanity } = useNuxtApp()
  
  const builder = imageUrlBuilder({
    projectId: '4dgj84d5',
    dataset: 'production'
  })

  /**
   * Get optimized image URL from Sanity.
   * Defaults are conservative and bandwidth-friendly.
   *
   * @param {Object} source - Sanity image source object
   * @param {Object} options - Optimization options
   * @param {number} options.width - Target width (default: 1920)
   * @param {number} options.height - Target height (optional)
   * @param {number} options.quality - Image quality 1-100 (default: 80)
   * @param {string} options.fit - Sanity fit mode (default: max)
   * @param {string} options.crop - Sanity crop mode (optional, e.g. focalpoint)
   * @param {boolean} options.autoFormat - Add auto=format (default: true)
   * @returns {string|null} Optimized image URL
   */
  const getImageUrl = (source, options = {}) => {
    if (!source?.asset) {
      return null
    }

    const {
      width = 1920,
      height,
      quality = 80,
      fit = 'max',
      crop,
      autoFormat = true
    } = options

    try {
      let imageBuilder = builder.image(source)

      // Apply width constraint (prevents serving oversized images)
      imageBuilder = imageBuilder.width(Math.min(width, 1920))

      // Apply height if specified
      if (height) {
        imageBuilder = imageBuilder.height(height)
      }

      // Apply quality (reduces file size)
      imageBuilder = imageBuilder.quality(quality)

      // Fit/crop defaults keep images bounded unless a component opts in.
      if (fit) {
        imageBuilder = imageBuilder.fit(fit)
      }

      if (crop) {
        imageBuilder = imageBuilder.crop(crop)
      }

      if (autoFormat) {
        imageBuilder = imageBuilder.auto('format')
      }

      return imageBuilder.url()
    } catch (error) {
      console.error('Error building Sanity image URL:', error)
      // Never return the raw asset URL — append transform params to the CDN URL
      if (source?.asset?.url) {
        try {
          const u = new URL(source.asset.url)
          u.searchParams.set('w', String(Math.min(width, 1920)))
          u.searchParams.set('q', String(quality))
          if (fit) u.searchParams.set('fit', fit)
          if (crop) u.searchParams.set('crop', crop)
          if (autoFormat) u.searchParams.set('auto', 'format')
          return u.toString()
        } catch {
          return null
        }
      }
      return null
    }
  }

  /**
   * Get image dimensions from Sanity asset metadata
   * @param {Object} source - Sanity image source object
   * @returns {Object|null} Object with width and height, or null
   */
  const getImageDimensions = (source) => {
    if (!source?.asset?.metadata?.dimensions) {
      return null
    }
    return {
      width: source.asset.metadata.dimensions.width,
      height: source.asset.metadata.dimensions.height
    }
  }

  return {
    getImageUrl,
    getImageDimensions
  }
} 