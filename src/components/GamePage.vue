<script>
import { onKeyStroke, useMediaQuery } from '@vueuse/core';

export function onGameKey(keys, handler) {
  onKeyStroke((event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    const key = event.key?.toLowerCase();
    return keys.some((gameKey) => gameKey.toLowerCase() === key);
  }, handler);
}
</script>

<script setup>
const isMobile = useMediaQuery('(pointer: coarse)');
</script>

<template>
  <div class="game-page">
    <div v-if="isMobile" class="content-wrap">
      <h1 class="page-title">Not supported on touch screens</h1>
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
  color: #ffd700;
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

.overlay-btn {
  padding: 10px 20px;
  font-weight: 700;
  color: #000000;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

:where(.game-page) canvas {
  display: block;
  border: none;
  border-radius: 4px;
}

@media (width <= 1200px) {
  .game-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .right-section {
    width: 100%;
    text-align: center;
  }
}
</style>

<style scoped>
.page-title {
  font-size: clamp(48px, 10vw, 72px);
  line-height: 1;
  text-wrap: balance;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  color: #87cefa;
}

.back-link:hover {
  text-decoration: underline;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transform: scaleX(-1);
}
</style>
