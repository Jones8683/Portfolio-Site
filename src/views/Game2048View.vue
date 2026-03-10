<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const gameIframe = ref(null);
const score = ref(0);
const bestScore = useStorage("2048-best-score", 0, localStorage, {
  serializer: {
    read: (v) => {
      try {
        if (!v) return 0;
        const decoded = JSON.parse(atob(v));
        if (decoded.k !== "g48" || typeof decoded.v !== "number") return 0;
        return decoded.v;
      } catch (e) {
        return 0;
      }
    },
    write: (v) => {
      const payload = {
        v: v,
        k: "g48",
        t: Date.now(),
      };
      return btoa(JSON.stringify(payload));
    },
  },
});
const gameOver = ref(false);
const gameWon = ref(false);

const handleMessage = (event) => {
  if (event.data && event.data.type === "2048-update") {
    score.value = event.data.score;
    if (event.data.score > bestScore.value) {
      bestScore.value = event.data.score;
    }
    gameOver.value = !!event.data.over;
    gameWon.value = !!event.data.won;
  }
};

const preventScroll = (e) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
      e.code,
    )
  ) {
    e.preventDefault();
  }
};

const focusIframe = () => {
  if (gameIframe.value) {
    gameIframe.value.focus();
  }
};

const handleVisibilityChange = () => {
  if (!document.hidden) {
    focusIframe();
  }
};

onMounted(() => {
  window.addEventListener("keydown", preventScroll, { passive: false });
  window.addEventListener("message", handleMessage);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  focusIframe();
});

onUnmounted(() => {
  window.removeEventListener("keydown", preventScroll);
  window.removeEventListener("message", handleMessage);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div class="game2048-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section" @click="focusIframe">
          <iframe
            ref="gameIframe"
            src="/gameassets/2048.html"
            class="game-iframe"
            title="2048 game"
            frameborder="0"
            scrolling="no"
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

          <div class="controls-container">
            <div class="control-item">
              <span>Move Tiles</span>
              <div>
                <span class="key">↑</span>
                <span class="key">↓</span>
                <span class="key">←</span>
                <span class="key">→</span>
              </div>
            </div>
            <div class="control-item">
              <span>Alternative</span>
              <div>
                <span class="key">W</span>
                <span class="key">A</span>
                <span class="key">S</span>
                <span class="key">D</span>
              </div>
            </div>
            <div class="control-item">
              <span>Restart</span>
              <span class="key">R</span>
            </div>
          </div>
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

.controls-container {
  margin-top: 5px;
  padding: 0 5px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;
}

.control-item:last-child {
  border-bottom: none;
}

.key {
  color: #fff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  min-width: 18px;
  text-align: center;
  display: inline-block;
  margin-left: 4px;
}

.mobile-msg {
  display: none;
}

.desktop-game {
  display: block;
}

.name-title {
  font-size: 32px;
  margin-bottom: 16px;
  letter-spacing: -1px;
  margin-top: 60px;
  color: white;
}

.repo-link {
  font-size: 14px;
  display: inline-block;
  color: lightskyblue;
  text-decoration: none;
}

@media (max-width: 1000px) {
  .game-wrapper {
    flex-direction: column;
    align-items: center;
  }
  .right-section {
    width: 100%;
    max-width: 550px;
  }
}

@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
  .mobile-msg {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
    padding: 0 20px;
  }
}
</style>
