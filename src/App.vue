<script setup>
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <NavBar />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>
