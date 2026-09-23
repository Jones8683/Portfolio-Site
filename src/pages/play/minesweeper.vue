<script setup>
import { computed, ref, watch } from 'vue';
import { onKeyStroke, useIntervalFn, useWindowFocus } from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Minesweeper' } });

const range = (n) => Array.from({ length: n }, (_, i) => i);

const NEIGHBORS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 20, cols: 24, mines: 99 },
};

const grid = ref([]);
const status = ref('start');
const currentDiff = ref(DIFFICULTIES.medium);
const timer = ref(0);
const { resume: startTimer, pause: stopTimer } = useIntervalFn(() => timer.value++, 1000, {
  immediate: false,
});
const flagsPlaced = ref(0);
const isPaused = ref(false);
let isFirstClick = true;

const NUMBER_COLORS = [
  null,
  '#5c5cff',
  '#00e600',
  '#ff3333',
  '#8888ff',
  '#ffaa00',
  '#00aaaa',
  '#ffffff',
  '#888888',
];

const formattedTime = computed(() => {
  const mins = Math.floor(timer.value / 60);
  const secs = timer.value % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

function initGrid(diff) {
  grid.value = range(diff.rows).map((y) =>
    range(diff.cols).map((x) => ({
      x,
      y,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    })),
  );
}

function resetBoard() {
  stopTimer();
  timer.value = 0;
  flagsPlaced.value = 0;
  isFirstClick = true;
  isPaused.value = false;
  initGrid(currentDiff.value);
}

function resetToStart() {
  status.value = 'start';
  resetBoard();
}

function initGame(difficultyKey) {
  currentDiff.value = DIFFICULTIES[difficultyKey];
  status.value = 'playing';
  resetBoard();
}

function placeMines(safeX, safeY) {
  let minesToPlace = currentDiff.value.mines;
  while (minesToPlace > 0) {
    const y = Math.floor(Math.random() * currentDiff.value.rows);
    const x = Math.floor(Math.random() * currentDiff.value.cols);
    if (grid.value[y][x].isMine) continue;
    if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
    grid.value[y][x].isMine = true;
    minesToPlace--;
  }
  calculateNumbers();
}

const inBounds = (x, y) =>
  x >= 0 && x < currentDiff.value.cols && y >= 0 && y < currentDiff.value.rows;

function calculateNumbers() {
  for (let y = 0; y < currentDiff.value.rows; y++) {
    for (let x = 0; x < currentDiff.value.cols; x++) {
      if (grid.value[y][x].isMine) continue;
      grid.value[y][x].neighborCount = NEIGHBORS.filter(
        ([dx, dy]) => inBounds(x + dx, y + dy) && grid.value[y + dy][x + dx].isMine,
      ).length;
    }
  }
}

function handleLeftClick(cell) {
  if (status.value !== 'playing' || isPaused.value || cell.isRevealed || cell.isFlagged) return;
  if (isFirstClick) {
    placeMines(cell.x, cell.y);
    isFirstClick = false;
    startTimer();
  }
  if (cell.isMine) gameOver(false);
  else {
    revealCell(cell.x, cell.y);
    checkWin();
  }
}

function handleRightClick(cell) {
  if (status.value !== 'playing' || isPaused.value || cell.isRevealed) return;
  cell.isFlagged = !cell.isFlagged;
  flagsPlaced.value += cell.isFlagged ? 1 : -1;
}

function revealCell(startX, startY) {
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (!inBounds(x, y)) continue;

    const cell = grid.value[y][x];
    if (cell.isRevealed || cell.isFlagged) continue;
    cell.isRevealed = true;

    if (cell.neighborCount === 0 && !cell.isMine) {
      for (const [dx, dy] of NEIGHBORS) stack.push([x + dx, y + dy]);
    }
  }
}

function checkWin() {
  const revealedCount = grid.value.flat().filter((c) => c.isRevealed).length;
  if (currentDiff.value.rows * currentDiff.value.cols - revealedCount === currentDiff.value.mines)
    gameOver(true);
}

function gameOver(won) {
  stopTimer();
  status.value = won ? 'won' : 'lost';
  if (!won)
    grid.value.flat().forEach((c) => {
      if (c.isMine) c.isRevealed = true;
    });
}

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) stopTimer();
  else startTimer();
}

onKeyStroke(['r', 'R'], resetToStart);
onKeyStroke(['Escape', 'p', 'P'], (e) => {
  e.preventDefault();
  togglePause();
});
watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});

initGrid(currentDiff.value);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${currentDiff.value.cols}, 1fr)`,
}));
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <div class="grid-frame">
          <div class="grid" :style="gridStyle">
            <div
              v-for="(cell, i) in grid.flat()"
              :key="i"
              class="cell"
              :class="{
                revealed: cell.isRevealed,
                mine: cell.isRevealed && cell.isMine,
              }"
              @click="handleLeftClick(cell)"
              @contextmenu.prevent="handleRightClick(cell)"
            >
              <span v-if="cell.isFlagged">🚩</span>
              <span v-else-if="cell.isRevealed && cell.isMine">💣</span>
              <span
                v-else-if="cell.isRevealed && cell.neighborCount > 0"
                :style="{ color: NUMBER_COLORS[cell.neighborCount] }"
                >{{ cell.neighborCount }}</span
              >
            </div>
          </div>
        </div>

        <div v-if="status === 'start'" class="overlay-msg">
          <h2 class="menu-title">MINESWEEPER</h2>
          <div class="overlay-actions">
            <button class="overlay-btn" @click="initGame('easy')">EASY</button>
            <button class="overlay-btn" @click="initGame('medium')">MED</button>
            <button class="overlay-btn" @click="initGame('hard')">HARD</button>
          </div>
        </div>

        <div v-if="status === 'won' || status === 'lost'" class="overlay-msg">
          <h2 class="menu-title result-title" :class="{ won: status === 'won' }">
            {{ status === 'won' ? 'YOU WIN!' : 'GAME OVER' }}
          </h2>
          <button class="overlay-btn" @click="resetToStart">PLAY AGAIN</button>
        </div>

        <div v-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">PAUSED</h2>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Minesweeper</h1>

        <div class="info-box score-box">
          <div class="label mines-label">Mines Left</div>
          <div class="value mines-value">
            {{ currentDiff.mines - flagsPlaced }}
          </div>

          <div class="mines-divider"></div>

          <div class="label time-label">Time</div>
          <div class="value time-value">{{ formattedTime }}</div>
        </div>

        <GameControls
          :controls="[
            { action: 'Reveal', key: 'Left Click' },
            { action: 'Flag', key: 'Right Click' },
            { action: 'Pause', key: 'Esc' },
            { action: 'Restart', key: 'R' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.left-section {
  min-width: 300px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-title {
  font-size: 48px;
}

.grid-frame {
  background: #444444;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333333;
}

.grid {
  display: grid;
  gap: 0;
  background: #666666;
  border: 2px solid #666666;
}

.cell {
  width: 26px;
  height: 26px;
  background: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  cursor: pointer;
  font-size: 16px;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  border-bottom: 2px solid rgba(0, 0, 0, 0.5);
  border-right: 2px solid rgba(0, 0, 0, 0.5);
}

.cell.revealed {
  background: #222222;
  border: 1px solid #333333;
}

.cell.mine {
  background: #cc0000;
  border: 1px solid #990000;
}

.result-title {
  color: #ff4757;
}

.result-title.won {
  color: #00ff00;
}

.mines-label {
  color: var(--color-gold);
  margin-bottom: 4px;
}

.mines-value {
  color: var(--color-gold);
  font-size: 38px;
}

.mines-divider {
  width: 100%;
  height: 1px;
  background: var(--color-hairline);
  margin: 12px 0;
}

.time-label {
  color: var(--color-muted);
  margin-bottom: 4px;
}

.time-value {
  color: var(--color-muted);
  font-size: 24px;
}
</style>
