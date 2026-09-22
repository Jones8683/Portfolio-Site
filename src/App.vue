<script setup>
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import NavBar from '@/components/NavBar.vue';
import AppFooter from '@/components/AppFooter.vue';

const route = useRoute();
useTitle(() => `${route.meta.title} • Jones Jankovic`);
</script>

<template>
  <NavBar />
  <main>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
