// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui"
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost/api"
    }
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
