// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  css: [
    '~/assets/css/app.css'
  ],
  colorMode: {
    preference: 'light'
  },
  devServer: {
    port: 3002
  },
  future: {
    compatibilityVersion: 4
  }
})
