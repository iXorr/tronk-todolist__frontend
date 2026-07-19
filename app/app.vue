<script setup lang="ts">
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" }
  ],
  htmlAttrs: {
    lang: "ru"
  }
});

useSeoMeta({
  title: "Список задач",
  ogTitle: "Список задач"
});
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 5000 }">
    <NuxtPage />
  </UApp>
</template>
