// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui"
  ],

  devtools: {
    enabled: true
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      // Будет переопределён env-переменной NUXT_PUBLIC_API_BASE
      apiBase: "http://localhost/api"
    }
  },

  routeRules: {
    "/": { prerender: true }
  },

  compatibilityDate: "2026-06-30",

  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: "double",
        commaDangle: "never",
        braceStyle: "1tbs",
        semi: true
      }
    }
  }
});
