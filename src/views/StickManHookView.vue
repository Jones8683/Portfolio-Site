<script setup>
import { ref } from "vue";

const gameIframe = ref(null);

const toggleFullscreen = () => {
  if (gameIframe.value) {
    if (gameIframe.value.requestFullscreen) {
      gameIframe.value.requestFullscreen();
    } else if (gameIframe.value.webkitRequestFullscreen) {
      gameIframe.value.webkitRequestFullscreen();
    } else if (gameIframe.value.msRequestFullscreen) {
      gameIframe.value.msRequestFullscreen();
    }
  }
};
</script>

<template>
  <div class="stickman-wrapper">
    <div class="mobile-msg">
      <div class="content-wrap">
        <h1 class="name-title">Not supported on mobile</h1>
        <RouterLink to="/games" class="repo-link">← Back to games</RouterLink>
      </div>
    </div>

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <iframe
            ref="gameIframe"
            src="/gameassets/stickmanhook.html"
            class="game-iframe"
            frameborder="0"
            scrolling="no"
            allow="fullscreen"
          ></iframe>
        </div>

        <div class="right-section">
          <h1 class="game-title">Stickman Hook</h1>

          <div class="controls-container">
            <div class="control-item">
              <span>Swing / Hook</span>
              <span class="key">LEFT CLICK</span>
            </div>
            <div class="control-item">
              <span>Alternative</span>
              <span class="key">SPACE</span>
            </div>
          </div>

          <button @click="toggleFullscreen" class="glass-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              />
            </svg>
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stickman-wrapper {
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
  width: 880px;
  height: 550px;
  border-radius: 4px;
  display: block;
  background: #000;
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
  margin: 0 0 10px 0;
  letter-spacing: -4px;
  font-weight: 900;
  color: white;
  line-height: 1;
  text-align: left;
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
}

.glass-btn {
  cursor: pointer;
  text-decoration: none !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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
