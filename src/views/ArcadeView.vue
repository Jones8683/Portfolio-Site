<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="content-wrap">
    <h1 class="name-title arcade-title">Arcade</h1>

    <p class="arcade-subtitle">
      A collection of modern and classic browser games.
    </p>

    <div class="arcade-grid">
      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🧱</span>
          <h3 class="arcade-name">Tetris</h3>
        </div>
        <RouterLink to="/play/tetris" class="arcade-card-bottom red-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🏓</span>
          <h3 class="arcade-name">Pong</h3>
        </div>
        <RouterLink to="/play/pong" class="arcade-card-bottom blue-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🐤</span>
          <h3 class="arcade-name">Crossy Road</h3>
        </div>
        <RouterLink
          to="/play/crossy-road"
          class="arcade-card-bottom yellow-btn"
        >
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">💣</span>
          <h3 class="arcade-name">Minesweeper</h3>
        </div>
        <RouterLink to="/play/minesweeper" class="arcade-card-bottom green-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🪝</span>
          <h3 class="arcade-name">Stickman Hook</h3>
        </div>
        <RouterLink
          to="/play/stickman-hook"
          class="arcade-card-bottom yellow-btn"
        >
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🐦</span>
          <h3 class="arcade-name">Flappy Bird</h3>
        </div>
        <RouterLink to="/play/flappy-bird" class="arcade-card-bottom green-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🧍</span>
          <h3 class="arcade-name">Hangman</h3>
        </div>
        <RouterLink to="/play/hangman" class="arcade-card-bottom red-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🔢</span>
          <h3 class="arcade-name">2048</h3>
        </div>
        <RouterLink to="/play/2048" class="arcade-card-bottom blue-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">⭕</span>
          <h3 class="arcade-name">Noughts & Crosses</h3>
        </div>
        <RouterLink
          to="/play/noughts-and-crosses"
          class="arcade-card-bottom red-btn"
        >
          Play Now
        </RouterLink>
      </div>
      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🦆</span>
          <h3 class="arcade-name">Quack Attack</h3>
        </div>
        <RouterLink to="/play/quack-attack" class="arcade-card-bottom blue-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🟡</span>
          <h3 class="arcade-name">Connect 4</h3>
        </div>
        <RouterLink to="/play/connect-4" class="arcade-card-bottom yellow-btn">
          Play Now
        </RouterLink>
      </div>

      <div class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">🐍</span>
          <h3 class="arcade-name">Snake</h3>
        </div>
        <RouterLink to="/play/snake" class="arcade-card-bottom green-btn">
          Play Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.arcade-title {
  margin-top: 20px;
  margin-bottom: 4px;
  font-size: 72px;
}

.content-wrap {
  padding-bottom: 60px;
}

.arcade-subtitle {
  color: #94a3b8;
  font-size: 1.05rem;
  margin-bottom: 24px;
  font-weight: 400;
}

.arcade-grid {
  display: grid;
  grid-template-columns: repeat(4, 250px);
  grid-template-rows: repeat(2, auto);
  gap: 21px;
  width: 100%;
  max-width: 900px;
  justify-content: center;
  margin: 0 auto;
}

.arcade-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 210px;
  transition: all 0.3s ease;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(12px);
}

.arcade-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.arcade-card-top {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
}

.arcade-icon {
  font-size: 2.5rem;
}

.arcade-name {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.arcade-card-bottom {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.red-btn {
  background: rgba(255, 71, 87, 0.05);
  color: #ff4757;
}

.red-btn:hover {
  background: #ff4757;
  color: white;
}

.blue-btn {
  background: rgba(0, 162, 255, 0.05);
  color: #00a2ff;
}

.blue-btn:hover {
  background: #00a2ff;
  color: white;
}

.yellow-btn {
  background: rgba(255, 215, 0, 0.05);
  color: #ffd700;
}

.yellow-btn:hover {
  background: #ffd700;
  color: black;
}

.green-btn {
  background: rgba(46, 213, 115, 0.05);
  color: #2ed573;
}

.green-btn:hover {
  background: #2ed573;
  color: white;
}

@media (max-width: 900px) {
  .arcade-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .arcade-grid {
    grid-template-columns: 1fr;
  }
}
</style>
