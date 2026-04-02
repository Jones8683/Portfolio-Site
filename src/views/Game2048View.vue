<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameMobileMessage from "@/components/GameMobileMessage.vue";
import GameControls from "@/components/GameControls.vue";

const gameIframe = ref(null);
const showIframe = ref(false);
const score = ref(0);
const bestScore = ref(0);
const gameSrc = `${import.meta.env.BASE_URL}gameassets/2048.html`;
let focusTimer = null;

const handleMessage = (event) => {
  if (event.source !== gameIframe.value?.contentWindow) return;
  if (event.data && event.data.type === "2048-update") {
    score.value = event.data.score;
    bestScore.value = event.data.bestScore;
  }
};

const focusIframe = () => {
  if (gameIframe.value) {
    gameIframe.value.focus();
  }
};

onMounted(() => {
  showIframe.value = true;
  window.addEventListener("message", handleMessage);
  focusTimer = setTimeout(() => {
    focusIframe();
  }, 100);
});

onUnmounted(() => {
  if (focusTimer) {
    clearTimeout(focusTimer);
    focusTimer = null;
  }
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <div class="game2048-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section" @click="focusIframe">
          <iframe
            v-if="showIframe"
            ref="gameIframe"
            :src="gameSrc"
            class="game-iframe"
            title="2048 game"
            frameborder="0"
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
            <div class="value high-score-value">{{ bestScore }}</div>
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
    </div>
  </div>
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
