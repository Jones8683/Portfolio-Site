<script setup>
import { ref, useTemplateRef } from 'vue';
import { useEventListener, useStorage } from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: '2048' } });

const gameIframe = useTemplateRef('iframe');
const score = ref(0);
const highScore = useStorage('2048-best-score', 0);
const gameSrc = '/gameassets/2048.html';

const focusIframe = () => gameIframe.value?.focus();

const handleMessage = ({ source, data }) => {
  if (source !== gameIframe.value?.contentWindow || data?.type !== '2048-update') return;
  score.value = data.score;
  highScore.value = Math.max(highScore.value, data.score);
};

useEventListener(window, 'message', handleMessage);
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section" @click="focusIframe">
        <iframe
          ref="iframe"
          :src="gameSrc"
          class="game-iframe"
          title="2048 game"
          scrolling="no"
          @load="focusIframe"
        ></iframe>
      </div>

      <div class="right-section">
        <h1 class="game-title">2048</h1>

        <div class="info-box score-box">
          <div class="label score-label">Score</div>
          <div class="value score-value">{{ score }}</div>

          <div class="score-divider"></div>

          <div class="label high-score-label">High Score</div>
          <div class="value high-score-value">{{ highScore }}</div>
        </div>

        <GameControls
          :controls="[
            { action: 'Move Tiles', key: ['↑', '↓', '←', '→'] },
            { action: 'Alternative', key: ['W', 'A', 'S', 'D'] },
            { action: 'Restart', key: 'R' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.game-iframe {
  width: 530px;
  height: 530px;
  background: #faf8ef;
}

.right-section {
  width: 260px;
}

.score-box {
  padding: 16px 10px;
}

.label {
  margin-bottom: 4px;
}

@media (max-width: 1200px) {
  .game-wrapper {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .right-section {
    width: 100%;
    max-width: 550px;
    text-align: center;
  }

  .game-title {
    text-align: center;
  }
}
</style>
