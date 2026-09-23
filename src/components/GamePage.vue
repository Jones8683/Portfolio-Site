<script setup>
import { useMediaQuery } from '@vueuse/core';

const isMobile = useMediaQuery('(max-width: 850px)');
</script>

<template>
  <div class="game-page">
    <div v-if="isMobile" class="content-wrap">
      <h1 class="page-title">Not supported on mobile</h1>
      <RouterLink to="/play" class="back-link">
        <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 10h11m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Back to arcade
      </RouterLink>
    </div>
    <slot v-else />
  </div>
</template>

<style>
.game-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 85vh;
  text-align: center;
  font-family: var(--font-ui);
}

.game-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
}

.left-section {
  position: relative;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 240px;
  text-align: left;
}

.game-title {
  font-size: 72px;
  margin-bottom: 10px;
  line-height: 1;
}

.row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: var(--color-glass);
  border: 1px solid var(--color-hairline);
  border-radius: 12px;
}

.score-box {
  min-height: 120px;
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.01));
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.label {
  width: 100%;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  color: var(--color-muted);
}

.score-label {
  margin-bottom: 4px;
  color: var(--color-gold);
}

.high-score-label {
  margin-bottom: 2px;
  font-size: 11px;
}

.value {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  word-break: break-all;
}

.score-value {
  font-size: 42px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.high-score-value {
  font-size: 24px;
  color: var(--color-gold);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.score-divider {
  width: 100%;
  height: 1px;
  margin: 8px 0;
  background: var(--color-hairline);
}

.overlay-msg {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 16px;
}

.menu-title {
  font-size: 32px;
  margin-bottom: 20px;
}

.retry-btn,
.menu-btn {
  padding: 10px 20px;
  font-weight: 700;
  color: #000000;
  background: #ffffff;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.menu-btn {
  min-width: 140px;
  margin: 5px;
  padding: 12px 24px;
  font-weight: 800;
}

.game-iframe,
:where(.game-page) canvas {
  display: block;
  border: 0;
  border-radius: 4px;
}
</style>
