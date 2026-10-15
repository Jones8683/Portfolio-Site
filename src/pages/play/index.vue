<script setup>
definePage({ meta: { title: 'Arcade' } });

const games = [
  { name: 'Tetris', icon: '🧱', path: '/play/tetris', color: 'red' },
  { name: '2048', icon: '🔢', path: '/play/2048', color: 'blue' },
  { name: 'Pong', icon: '🏓', path: '/play/pong', color: 'yellow' },
  {
    name: 'Minesweeper',
    icon: '💣',
    path: '/play/minesweeper',
    color: 'green',
  },
  {
    name: 'Stickman Hook',
    icon: '🪝',
    path: '/play/stickman-hook',
    color: 'yellow',
  },
  {
    name: 'Flappy Bird',
    icon: '🐦',
    path: '/play/flappy-bird',
    color: 'green',
  },
  { name: 'Hangman', icon: '🧍', path: '/play/hangman', color: 'red' },
  { name: 'Connect 4', icon: '🔵', path: '/play/connect-4', color: 'blue' },
];
</script>

<template>
  <div class="content-wrap arcade-page">
    <h1 class="page-title">Arcade</h1>

    <p class="page-subtitle">A collection of modern and classic browser games.</p>

    <div class="arcade-grid">
      <div v-for="game in games" :key="game.path" class="arcade-card">
        <div class="arcade-card-top">
          <span class="arcade-icon">{{ game.icon }}</span>
          <h2 class="arcade-name">{{ game.name }}</h2>
        </div>
        <RouterLink class="arcade-card-bottom" :class="`${game.color}-btn`" :to="game.path">
          Play Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: clamp(48px, 10vw, 72px);
  line-height: 1;
  text-wrap: balance;
}

.page-subtitle {
  margin-bottom: 12px;
  color: var(--color-muted);
}

.arcade-page {
  width: min(92%, 1080px);
  padding-bottom: 60px;
}

.arcade-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 21px;
  width: 100%;
}

.arcade-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 210px;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
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
  font-size: 40px;
}

.arcade-name {
  color: #ffffff;
  font-size: 26px;
}

.arcade-card-bottom {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--game-color);
  background: color-mix(in srgb, var(--game-color) 5%, transparent);
  border-top: 1px solid var(--color-glass);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.arcade-card-bottom:hover {
  color: #1a1c24;
  background: var(--game-color);
}

.arcade-card-bottom:focus-visible {
  outline-offset: -3px;
}

.red-btn {
  --game-color: #ff4757;
}

.blue-btn {
  --game-color: #00a2ff;
}

.yellow-btn {
  --game-color: #ffd700;
}

.green-btn {
  --game-color: #2ed573;
}

@media (width <= 960px) {
  .arcade-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 480px) {
  .arcade-grid {
    grid-template-columns: 1fr;
  }
}
</style>
