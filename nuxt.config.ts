// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/tailwindcss', '@nuxtjs/seo', 'nuxt-og-image', '@nuxt/fonts', 'nuxt-gtag'],
  compatibilityDate: '2025-07-15',
  gtag: {
    id: 'G-TDLGYGSW1D' 
  }


  site: {
    url: 'https://parasalvaracuba.org',
    name: 'Para Salvar A Cuba',
    description: 'Una plataforma moderna para la acción colectiva. Diseña el futuro de nuestra nación a través de visión compartida y participación democrática colaborativa.',
  },
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    configPath: new URL('./tailwind.config.js', import.meta.url).pathname,
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined',
        },
      ],
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },

  i18n: {
    defaultLocale: 'es',
    langDir: 'locales',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Spanish', file: 'es.json' },
      { code: 'pt', name: 'Portuguese', file: 'pt.json' },
    ],
  },
})