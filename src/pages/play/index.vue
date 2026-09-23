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
          <h3 class="arcade-name">{{ game.name }}</h3>
        </div>
        <RouterLink :to="game.path" class="arcade-card-bottom" :class="`${game.color}-btn`">
          Play Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: var(--color-surface);
  border: 1px solid var(--color-glass-border);
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
  font-size: 2.5rem;
}

.arcade-name {
  color: #ffffff;
  font-size: 1.6rem;
}

.arcade-card-bottom {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-top: 1px solid var(--color-glass);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.red-btn {
  background: color-mix(in srgb, var(--color-red) 5%, transparent);
  color: var(--color-red);
}

.red-btn:hover {
  background: var(--color-red);
  color: #ffffff;
}

.blue-btn {
  background: rgba(0, 162, 255, 0.05);
  color: #00a2ff;
}

.blue-btn:hover {
  background: #00a2ff;
  color: #ffffff;
}

.yellow-btn {
  background: rgba(255, 215, 0, 0.05);
  color: var(--color-gold);
}

.yellow-btn:hover {
  background: var(--color-gold);
  color: #000000;
}

.green-btn {
  background: color-mix(in srgb, var(--color-green) 5%, transparent);
  color: var(--color-green);
}

.green-btn:hover {
  background: var(--color-green);
  color: #ffffff;
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
