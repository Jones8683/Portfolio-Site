<script setup>
import { ref, computed, onUnmounted, onMounted } from "vue";
import { useStorage } from "@vueuse/core";

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 20, cols: 24, mines: 99 },
};

const grid = ref([]);
const gameStatus = ref("start");
const currentDiff = ref(DIFFICULTIES.medium);
const timer = ref(0);
const flagsPlaced = ref(0);
const isPaused = ref(false);
let timerInterval = null;
let isFirstClick = true;

const numberColors = [
  null,
  "#5c5cff",
  "#00e600",
  "#ff3333",
  "#8888ff",
  "#ffaa00",
  "#00aaaa",
  "#ffffff",
  "#888888",
];

const formattedTime = computed(() => {
  const mins = Math.floor(timer.value / 60);
  const secs = timer.value % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
});

function initGrid(diff) {
  grid.value = Array.from({ length: diff.rows }, (_, y) =>
    Array.from({ length: diff.cols }, (_, x) => ({
      x,
      y,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    })),
  );
}

function resetToStart() {
  gameStatus.value = "start";
  stopTimer();
  timer.value = 0;
  flagsPlaced.value = 0;
  isFirstClick = true;
  initGrid(currentDiff.value);
}

function initGame(difficultyKey) {
  currentDiff.value = DIFFICULTIES[difficultyKey];
  gameStatus.value = "playing";
  timer.value = 0;
  flagsPlaced.value = 0;
  isFirstClick = true;
  isPaused.value = false;
  stopTimer();
  startTimer();
  initGrid(currentDiff.value);
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

function calculateNumbers() {
  for (let y = 0; y < currentDiff.value.rows; y++) {
    for (let x = 0; x < currentDiff.value.cols; x++) {
      if (grid.value[y][x].isMine) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy,
            nx = x + dx;
          if (
            ny >= 0 &&
            ny < currentDiff.value.rows &&
            nx >= 0 &&
            nx < currentDiff.value.cols
          ) {
            if (grid.value[ny][nx].isMine) count++;
          }
        }
      }
      grid.value[y][x].neighborCount = count;
    }
  }
}

function handleLeftClick(cell) {
  if (
    gameStatus.value !== "playing" ||
    isPaused.value ||
    cell.isRevealed ||
    cell.isFlagged
  )
    return;
  if (isFirstClick) {
    placeMines(cell.x, cell.y);
    isFirstClick = false;
  }
  if (cell.isMine) gameOver(false);
  else {
    revealCell(cell.x, cell.y);
    checkWin();
  }
}

function handleRightClick(cell) {
  if (gameStatus.value !== "playing" || isPaused.value || cell.isRevealed)
    return;
  cell.isFlagged = !cell.isFlagged;
  flagsPlaced.value += cell.isFlagged ? 1 : -1;
}

function revealCell(x, y) {
  if (
    x < 0 ||
    x >= currentDiff.value.cols ||
    y < 0 ||
    y >= currentDiff.value.rows
  )
    return;
  const cell = grid.value[y][x];
  if (cell.isRevealed || cell.isFlagged) return;
  cell.isRevealed = true;
  if (cell.neighborCount === 0 && !cell.isMine) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) revealCell(x + dx, y + dy);
    }
  }
}

function checkWin() {
  const revealedCount = grid.value.flat().filter((c) => c.isRevealed).length;
  if (
    currentDiff.value.rows * currentDiff.value.cols - revealedCount ===
    currentDiff.value.mines
  )
    gameOver(true);
}

function gameOver(won) {
  stopTimer();
  gameStatus.value = won ? "won" : "lost";
  if (!won)
    grid.value.flat().forEach((c) => {
      if (c.isMine) c.isRevealed = true;
    });
}

function togglePause() {
  if (gameStatus.value !== "playing") return;
  isPaused.value = !isPaused.value;
  isPaused.value ? stopTimer() : startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => timer.value++, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

const handleKeydown = (e) => {
  if (e.key.toLowerCase() === "r") resetToStart();
  if (e.key === "Escape") togglePause();
};

onMounted(() => {
  initGrid(DIFFICULTIES.medium);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  stopTimer();
  window.removeEventListener("keydown", handleKeydown);
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${currentDiff.value.cols}, 1fr)`,
}));
</script>

<template>
  <div class="mines-wrapper">
    <div class="mobile-msg">
      <div class="content-wrap">
        <h1 class="name-title" style="font-size: 32px; margin-top: 60px">
          Not supported on mobile
        </h1>
        <RouterLink
          to="/games"
          class="repo-link"
          style="color: lightskyblue; text-decoration: none"
          >← Back to games</RouterLink
        >
      </div>
    </div>

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div v-if="gameStatus === 'start'" class="overlay-msg">
            <h2 style="color: white; margin-bottom: 20px">MINESWEEPER</h2>
            <div style="display: flex; gap: 10px">
              <button class="retry-btn" @click="initGame('easy')">EASY</button>
              <button class="retry-btn" @click="initGame('medium')">MED</button>
              <button class="retry-btn" @click="initGame('hard')">HARD</button>
            </div>
          </div>

          <div
            v-if="gameStatus === 'won' || gameStatus === 'lost'"
            class="overlay-msg"
          >
            <h2
              :style="{ color: gameStatus === 'won' ? '#00ff00' : '#ff4757' }"
            >
              {{ gameStatus === "won" ? "YOU WIN!" : "GAME OVER" }}
            </h2>
            <button
              class="retry-btn"
              style="margin-top: 15px"
              @click="resetToStart"
            >
              RESTART
            </button>
          </div>

          <div
            v-if="isPaused"
            class="overlay-msg"
            style="background: rgba(0, 0, 0, 0.7)"
          >
            <h2 style="color: white">PAUSED</h2>
          </div>

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
                  :style="{ color: numberColors[cell.neighborCount] }"
                  >{{ cell.neighborCount }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Minesweeper</h1>

          <div
            class="info-box score-box"
            style="border: 1px solid rgba(255, 215, 0, 0.3)"
          >
            <div class="label" style="color: #ffd700; margin-bottom: 4px">
              Mines Left
            </div>
            <div class="value" style="color: #ffd700; font-size: 38px">
              {{ currentDiff.mines - flagsPlaced }}
            </div>

            <div
              style="
                width: 100%;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 12px 0;
              "
            ></div>

            <div class="label" style="color: #94a3b8; margin-bottom: 4px">
              Time
            </div>
            <div class="value" style="color: #94a3b8; font-size: 24px">
              {{ formattedTime }}
            </div>
          </div>

          <div class="controls-container">
            <div class="control-item">
              <span>Reveal</span><span class="key">Left Click</span>
            </div>
            <div class="control-item">
              <span>Flag</span><span class="key">Right Click</span>
            </div>
            <div class="control-item">
              <span>Pause</span><span class="key">ESC</span>
            </div>
            <div class="control-item">
              <span>Restart</span><span class="key">R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mines-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 85vh;
  width: 100%;
  text-align: center;
  background: transparent;
}
.game-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
}
.left-section {
  position: relative;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  min-width: 300px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 240px;
  text-align: left;
}
.game-title {
  font-size: 48px;
  margin: 0 0 10px 0;
  letter-spacing: -2px;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.grid-frame {
  background: #444;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
}
.grid {
  display: grid;
  gap: 0;
  background: #666;
  border: 2px solid #666;
}
.cell {
  width: 26px;
  height: 26px;
  background: #333;
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
  background: #222;
  border: 1px solid #333;
}
.cell.mine {
  background: #cc0000;
  border: 1px solid #990000;
}
.info-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.score-box {
  min-height: 120px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.01)
  );
}
.label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}
.value {
  font-weight: 900;
  line-height: 1;
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
}
.overlay-msg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}
.retry-btn {
  background: white;
  color: black;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}
.mobile-msg {
  display: none;
}
@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
  .mobile-msg {
    display: flex !important;
    flex-direction: column;
    align-items: center;
  }
}
</style>
