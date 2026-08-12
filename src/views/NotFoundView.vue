<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="content-wrap">
    <h1 class="name-title not-found-title">404</h1>

    <p class="location-text not-found-subtitle">
      This is not the page you're looking for
    </p>

    <RouterLink to="/" class="repo-link not-found-link">
      ← Take me home
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found-title {
  font-size: 96px;
  margin-bottom: 24px;
  letter-spacing: -2px;
  margin-top: 40px;
}

.not-found-subtitle {
  font-size: 18px;
  margin-bottom: 10px;
}

.not-found-link {
  margin-top: 20px;
  font-size: 16px;
  display: inline-block;
}
</style>
