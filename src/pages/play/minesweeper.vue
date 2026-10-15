<script setup>
import { computed, ref, watch } from 'vue';
import { useIntervalFn, useWindowFocus } from '@vueuse/core';
import GamePage, { onGameKey } from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Minesweeper' } });

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

const status = ref('start');
const isWon = ref(false);
const isPaused = ref(false);
const difficulty = ref(DIFFICULTIES.medium);
const grid = ref(createGrid(difficulty.value));
const flagsPlaced = ref(0);
const timer = ref(0);
const { resume: startTimer, pause: stopTimer } = useIntervalFn(() => timer.value++, 1000, {
  immediate: false,
});
let isFirstClick = true;

const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${difficulty.value.cols}, 1fr)`,
}));

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function createGrid({ rows, cols }) {
  return range(rows).map((y) =>
    range(cols).map((x) => ({
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
  grid.value = createGrid(difficulty.value);
}

function showStartScreen() {
  status.value = 'start';
  resetBoard();
}

function startGame(level) {
  difficulty.value = DIFFICULTIES[level];
  status.value = 'playing';
  resetBoard();
}

function inBounds(x, y) {
  return x >= 0 && x < difficulty.value.cols && y >= 0 && y < difficulty.value.rows;
}

function calculateNumbers() {
  for (let y = 0; y < difficulty.value.rows; y++) {
    for (let x = 0; x < difficulty.value.cols; x++) {
      if (grid.value[y][x].isMine) continue;
      grid.value[y][x].neighborCount = NEIGHBORS.filter(
        ([dx, dy]) => inBounds(x + dx, y + dy) && grid.value[y + dy][x + dx].isMine,
      ).length;
    }
  }
}

function placeMines(safeX, safeY) {
  let minesToPlace = difficulty.value.mines;
  while (minesToPlace > 0) {
    const y = Math.floor(Math.random() * difficulty.value.rows);
    const x = Math.floor(Math.random() * difficulty.value.cols);
    if (grid.value[y][x].isMine) continue;
    if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
    grid.value[y][x].isMine = true;
    minesToPlace--;
  }
  calculateNumbers();
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

function gameOver(won) {
  stopTimer();
  status.value = 'over';
  isWon.value = won;
  if (won) return;
  for (const cell of grid.value.flat()) {
    if (cell.isMine) cell.isRevealed = true;
  }
}

function checkWin() {
  const { rows, cols, mines } = difficulty.value;
  const revealedCount = grid.value.flat().filter((cell) => cell.isRevealed).length;
  if (rows * cols - revealedCount === mines) gameOver(true);
}

function handleLeftClick(cell) {
  if (status.value !== 'playing' || isPaused.value || cell.isRevealed || cell.isFlagged) return;
  if (isFirstClick) {
    placeMines(cell.x, cell.y);
    isFirstClick = false;
    startTimer();
  }
  if (cell.isMine) {
    gameOver(false);
  } else {
    revealCell(cell.x, cell.y);
    checkWin();
  }
}

function handleRightClick(cell) {
  if (status.value !== 'playing' || isPaused.value || cell.isRevealed) return;
  cell.isFlagged = !cell.isFlagged;
  flagsPlaced.value += cell.isFlagged ? 1 : -1;
}

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) stopTimer();
  else startTimer();
}

onGameKey(['r'], showStartScreen);
onGameKey(['Escape', 'p'], (event) => {
  event.preventDefault();
  togglePause();
});

watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <div class="grid-frame">
          <div class="grid" :style="gridStyle">
            <div
              v-for="(cell, index) in grid.flat()"
              :key="index"
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
          <h2 class="menu-title">Minesweeper</h2>
          <div class="overlay-actions">
            <button class="overlay-btn" @click="startGame('easy')">Easy</button>
            <button class="overlay-btn" @click="startGame('medium')">Medium</button>
            <button class="overlay-btn" @click="startGame('hard')">Hard</button>
          </div>
        </div>

        <div v-if="status === 'over'" class="overlay-msg">
          <h2 class="menu-title outcome-title" :class="{ won: isWon }">
            {{ isWon ? 'You Win!' : 'Game Over' }}
          </h2>
          <button class="overlay-btn" @click="showStartScreen">Play Again</button>
        </div>

        <div v-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">Paused</h2>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Minesweeper</h1>

        <div class="info-box score-box">
          <div class="label mines-label">Mines Left</div>
          <div class="value mines-value">
            {{ difficulty.mines - flagsPlaced }}
          </div>

          <div class="score-divider"></div>

          <div class="label time-label">Time</div>
          <div class="value time-value">{{ formattedTime }}</div>
        </div>

        <GameControls
          :controls="[
            { action: 'Reveal', keys: 'Click' },
            { action: 'Flag', keys: 'Right Click' },
            { action: 'Pause', keys: ['Esc', 'P'] },
            { action: 'Restart', keys: 'R' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.left-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  min-height: 300px;
}

.game-title {
  font-size: 48px;
}

.overlay-actions {
  display: flex;
  gap: 10px;
}

.outcome-title {
  color: #ff4757;
}

.outcome-title.won {
  color: #2ed573;
}

.grid-frame {
  padding: 10px;
  background: #444444;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-weight: 900;
  font-size: 16px;
  background: #333333;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  border-bottom: 2px solid rgba(0, 0, 0, 0.5);
  border-right: 2px solid rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.cell.revealed {
  background: #222222;
  border: 1px solid #333333;
}

.cell.mine {
  background: #cc0000;
  border: 1px solid #990000;
}

.mines-label {
  margin-bottom: 4px;
  color: #ffd700;
}

.mines-value {
  color: #ffd700;
  font-size: 38px;
}

.score-divider {
  width: 100%;
  height: 1px;
  margin: 12px 0;
  background: rgba(255, 255, 255, 0.1);
}

.time-label {
  margin-bottom: 4px;
  color: #94a3b8;
}

.time-value {
  color: #94a3b8;
  font-size: 24px;
}
</style>
