// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/sanity',
    '@nuxt/image'
  ],
  sanity: {
    projectId: '4dgj84d5',
    dataset: 'production',
    useCdn: true
  },
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    }
  },

  components: {
    dirs: [
      '~/components'
    ]
  },
  css: [
    '~/assets/styles/reset.css',
    '~/assets/styles/colors.css',
    '~/assets/styles/utilities.css',
    '~/assets/styles/typography.css',
    '~/assets/styles/main.css',
  ],
  experimental: {
    componentIslands: true
  },
  routeRules: {
    '/**': { ssr: true }
  },

  build: {
    transpile: ['gsap']
  },
  vite: {
    ssr: {
      noExternal: []
    }
  },
  
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          href: '/fonts/ttcommons-regular.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          href: '/fonts/ttcommons-medium.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          href: '/fonts/baskerville.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/CustomEase.min.js',
          defer: true
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js',
          defer: true
        }
      ]
    }
  }
})