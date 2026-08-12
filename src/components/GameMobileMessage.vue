<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="mobile-msg">
    <div class="content-wrap">
      <h1 class="mobile-heading">Not supported on mobile</h1>
      <RouterLink to="/play" class="mobile-back-link">
        ← Back to arcade
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.mobile-heading {
  font-size: 32px;
  margin-bottom: 16px;
  letter-spacing: -1px;
  margin-top: 60px;
  width: 100%;
  color: white;
}

.mobile-back-link {
  font-size: 14px;
  display: inline-block;
  color: lightskyblue;
  text-decoration: none;
}
</style>
