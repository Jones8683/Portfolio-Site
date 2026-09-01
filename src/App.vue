<script setup>
import NavBar from '@/components/NavBar.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>

<template>
  <NavBar />
  <main>
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </main>
  <AppFooter />
</template>
