export default defineNuxtPlugin((nuxtApp) => {
  // Prefetching disabled to reduce API usage
  // Each prefetch triggers API calls, which was causing excessive Sanity API usage
  // Pages will still load normally when clicked, just without the prefetch optimization
  return
})

