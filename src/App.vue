<script setup>
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";
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
