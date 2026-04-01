<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameMobileMessage from "../components/GameMobileMessage.vue";
import GameControls from "../components/GameControls.vue";

const gameIframe = ref(null);
const showIframe = ref(false);
const score = ref(0);
const bestScore = ref(0);
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
            src="/gameassets/2048.html"
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
.game2048-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 85vh;
  width: 100%;
  text-align: center;
  background: transparent;
  padding-top: 0;
}

.game-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
  margin-top: 0;
}

.left-section {
  position: relative;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.game-iframe {
  width: 530px;
  height: 530px;
  border-radius: 4px;
  display: block;
  background: #faf8ef;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 260px;
  text-align: left;
}

.game-title {
  font-size: 72px;
  margin: 0 0 10px;
  letter-spacing: -4px;
  font-weight: 900;
  color: white;
  line-height: 1;
  text-align: left;
}

.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  text-align: center;
}

.score-box {
  min-height: 120px;
  width: 100%;
  padding: 16px 10px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.01)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
  font-weight: 700;
}

.score-label {
  color: #ffd700;
}

.value {
  font-size: 20px;
  font-weight: 900;
  color: white;
  word-break: break-all;
  line-height: 1;
}

.score-value {
  font-size: 42px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.score-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.high-score-label {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.high-score-value {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.desktop-game {
  display: block;
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

@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
}
</style>
