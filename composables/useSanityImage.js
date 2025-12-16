import imageUrlBuilder from '@sanity/image-url'
import { useNuxtApp } from '#app'

export const useSanityImage = () => {
  const { $sanity } = useNuxtApp()
  
  const builder = imageUrlBuilder({
    projectId: '4dgj84d5',
    dataset: 'production'
  })

  const getImageUrl = (source) => {
    if (!source?.asset) {
      return null
    }
    if (source.asset.url) {
      return source.asset.url
    }
    if (source.asset._ref) {
      const [_file, id, extension] = source.asset._ref.split('-')
      const url = `https://cdn.sanity.io/images/4dgj84d5/production/${id}.${extension}`
      return url
    }
    return null
  }

  return {
    getImageUrl
  }
} 