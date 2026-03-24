<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="content-wrap">
    <h1 class="name-title not-found-title">Coming Soon</h1>

    <p class="location-text not-found-subtitle">
      This game is currently under development
    </p>

    <RouterLink to="/play" class="repo-link not-found-link">
      ← Back to arcade
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found-title {
  font-size: 48px;
  margin-bottom: 12px;
  letter-spacing: -2px;
  margin-top: 40px;
}

.not-found-subtitle {
  font-size: 18px;
  margin-bottom: 10px;
}

.not-found-link {
  margin-top: 12px;
  font-size: 16px;
  display: inline-block;
}
</style>
