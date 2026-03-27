<script setup>
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useRoute, RouterView } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isHomePage = computed(() => route.path === "/");
</script>

<template>
  <NavBar />
  <main :class="{ 'home-page': isHomePage }">
    <RouterView />
  </main>
  <AppFooter />
</template>
