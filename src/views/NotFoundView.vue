<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="content-wrap">
    <h1
      class="name-title"
      style="
        font-size: 96px;
        margin-bottom: 24px;
        letter-spacing: -2px;
        margin-top: 40px;
      "
    >
      404
    </h1>

    <p class="location-text" style="font-size: 18px; margin-bottom: 10px">
      This is not the page you're looking for
    </p>

    <RouterLink
      to="/"
      class="repo-link"
      style="margin-top: 20px; font-size: 16px; display: inline-block"
    >
      ← Take me home
    </RouterLink>
  </div>
</template>
