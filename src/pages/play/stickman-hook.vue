<script setup>
import { useTemplateRef } from 'vue';
import { useFullscreen } from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Stickman Hook' } });

const gameIframe = useTemplateRef('iframe');

const focusIframe = () => gameIframe.value?.focus();
const { enter: enterFullscreen } = useFullscreen(gameIframe);
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section" @click="focusIframe">
        <iframe
          ref="iframe"
          src="/gameassets/stickmanhook.html"
          class="game-iframe"
          title="Stickman Hook game"
          scrolling="no"
          allow="fullscreen"
          @load="focusIframe"
        ></iframe>
      </div>

      <div class="right-section">
        <h1 class="game-title">Stickman Hook</h1>

        <GameControls
          :controls="[
            { action: 'Swing / Hook', key: 'Left Click' },
            { action: 'Alternative', key: 'Space' },
          ]"
        />

        <button class="fullscreen-btn" @click="enterFullscreen">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            />
          </svg>
          Fullscreen
        </button>
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.right-section {
  width: 260px;
}

.game-iframe {
  width: 880px;
  height: 550px;
  background: #000000;
}

.fullscreen-btn {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 14px 16px;
  background: var(--color-glass);
  border: 1px solid var(--color-hairline);
  border-radius: 10px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.fullscreen-btn:hover {
  background: var(--color-hairline);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 1200px) {
  .game-iframe {
    width: 700px;
    height: 525px;
  }
}

@media (max-width: 1000px) {
  .game-iframe {
    width: 580px;
    height: 435px;
  }
  .game-wrapper {
    flex-direction: column;
    align-items: center;
  }
  .right-section {
    width: 100%;
    max-width: 580px;
  }
}
</style>
