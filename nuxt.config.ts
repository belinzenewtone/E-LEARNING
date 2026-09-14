// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  // Supabase module config — url/key read from SUPABASE_URL / SUPABASE_KEY
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    key: process.env.SUPABASE_KEY ?? '',
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/']
    },
    types: './types/database.types.ts'
  },

  // Route rules: only prerender the landing page; login must be SSR
  // so it picks up the Supabase runtime config on every request
  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { ssr: false }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
