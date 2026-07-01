// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: 'Procurement Hub | %s',
      title: 'SCGJWD Logistics',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ระบบควบคุมและจัดการการจัดซื้อจัดจ้างแบบครบวงจร - SCGJWD Logistics' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
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
  future: {
    compatibilityVersion: 4
  }
})
