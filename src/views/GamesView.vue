<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="content-wrap">
    <h1
      class="name-title"
      style="
        margin-top: 20px !important;
        margin-bottom: 4px !important;
        font-size: 72px;
      "
    >
      Arcade
    </h1>

    <p class="arcade-subtitle">
      A collection of modern and classic browser games.
    </p>

    <div class="arcade-grid">
      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🧱</span>
          <h3 class="arcade-name">Tetris</h3>
        </div>
        <RouterLink to="/games/tetris" class="arcade-card-bottom red-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🏓</span>
          <h3 class="arcade-name">Pong</h3>
        </div>
        <RouterLink to="/games/pong" class="arcade-card-bottom blue-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">💣</span>
          <h3 class="arcade-name">Minesweeper</h3>
        </div>
        <RouterLink
          to="/games/minesweeper"
          class="arcade-card-bottom green-btn"
        >
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🪝</span>
          <h3 class="arcade-name">Stickman Hook</h3>
        </div>
        <RouterLink
          to="/games/stickman-hook"
          class="arcade-card-bottom yellow-btn"
        >
          Play Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>
