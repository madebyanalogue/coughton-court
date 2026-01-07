import imageUrlBuilder from '@sanity/image-url'
import { useNuxtApp } from '#app'

export const useSanityImage = () => {
  const { $sanity } = useNuxtApp()
  
  const builder = imageUrlBuilder({
    projectId: '4dgj84d5',
    dataset: 'production'
  })

  /**
   * Get optimized image URL from Sanity
   * @param {Object} source - Sanity image source object
   * @param {Object} options - Optimization options
   * @param {number} options.width - Maximum width (default: 1920)
   * @param {number} options.height - Maximum height (optional)
   * @param {number} options.quality - Image quality 1-100 (default: 85)
   * @param {string} options.format - Image format (default: auto)
   * @returns {string|null} Optimized image URL
   */
  const getImageUrl = (source, options = {}) => {
    if (!source?.asset) {
      return null
    }

    const {
      width = 1920,
      height,
      quality = 85,
      format = 'auto'
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

      // Apply format if specified (auto allows Sanity to choose best format)
      if (format && format !== 'auto') {
        imageBuilder = imageBuilder.format(format)
      }

      return imageBuilder.url()
    } catch (error) {
      console.error('Error building Sanity image URL:', error)
      // Fallback to direct URL
      if (source.asset.url) {
        return source.asset.url
      }
      if (source.asset._ref) {
        const [_file, id, extension] = source.asset._ref.split('-')
        return `https://cdn.sanity.io/images/4dgj84d5/production/${id}.${extension}`
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