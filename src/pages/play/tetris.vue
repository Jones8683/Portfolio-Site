<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useMagicKeys, useRafFn, useStorage, useWindowFocus } from '@vueuse/core';
import GamePage, { onGameKey } from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Tetris' } });

const BLOCK_SIZE = 25;
const COLORS = [null, '#0dc2ff', '#3877ff', '#ff8e0d', '#ffe138', '#0dff72', '#ff0d72', '#f538ff'];
const LOCK_DELAY_MS = 500;
const MAX_LOCK_MOVES = 15;
const SHIFT_DELAY_MS = 170;
const SHIFT_REPEAT_MS = 33;
const SOFT_DROP_REPEAT_MS = 30;
const LINE_SCORES = [0, 100, 300, 500, 800];

const GRAVITY_BY_LEVEL = [
  0, 0.01667, 0.021017, 0.026977, 0.035256, 0.04693, 0.06361, 0.0879, 0.1236, 0.1775, 0.2598, 0.388,
  0.59, 0.92, 1.46, 2.36, 3.91, 6.61, 11.43, 20.0,
];

const PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  O: [
    [4, 4],
    [4, 4],
  ],
  S: [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  Z: [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0],
  ],
  T: [
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0],
  ],
};

const PIECE_TYPES = [null, 'I', 'J', 'L', 'O', 'S', 'Z', 'T'];

const KICKS_JLSTZ = [
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
];

const KICKS_I = [
  [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
];

const gameCanvas = useTemplateRef('gameCanvas');
const nextCanvas = useTemplateRef('nextCanvas');
const holdCanvas = useTemplateRef('holdCanvas');
const status = ref('playing');
const isPaused = ref(false);
const score = ref(0);
const highScore = useStorage('tetris-best-score', 0);

let ctx;
let nextCtx;
let holdCtx;
let animationFrame = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lockDelayCounter = 0;
let lockMovesCounter = 0;
let isLanded = false;
let hardDropEffect = { alpha: 0, trails: [] };
let piecesBag = [];

const arena = createMatrix(12, 20);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  lines: 0,
  next: null,
  hold: null,
  canHold: true,
  rotation: 0,
};
const timers = { left: 0, right: 0, softDrop: 0 };

const keys = useMagicKeys({
  passive: false,
  onEventFired: (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  },
});
const isModifierHeld = computed(() => keys.ctrl.value || keys.meta.value || keys.alt.value);
const held = {
  left: isHeld('ArrowLeft', 'KeyA'),
  right: isHeld('ArrowRight', 'KeyD'),
  softDrop: isHeld('ArrowDown', 'KeyS'),
};
const heldActions = { left: () => playerMove(-1), right: () => playerMove(1), softDrop };

const { pause, resume } = useRafFn(update, { immediate: false });

function createMatrix(width, height) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
}

function isHeld(...names) {
  return computed(() => !isModifierHeld.value && names.some((name) => keys[name].value));
}

function isPlaying() {
  return status.value === 'playing' && !isPaused.value;
}

function createPiece(type) {
  return structuredClone(PIECES[type]);
}

function getNextPiece() {
  if (piecesBag.length === 0) {
    piecesBag = ['I', 'L', 'J', 'O', 'Z', 'S', 'T'];
    for (let i = piecesBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piecesBag[i], piecesBag[j]] = [piecesBag[j], piecesBag[i]];
    }
  }
  return createPiece(piecesBag.pop());
}

function getPieceType(matrix) {
  const value = matrix.flat().find((v) => v !== 0);
  return PIECE_TYPES[value];
}

function collide(piece) {
  const { matrix, pos } = piece;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0 && arena[y + pos.y]?.[x + pos.x] !== 0) {
        return true;
      }
    }
  }
  return false;
}

function getGhostY() {
  const pos = { ...player.pos };
  while (!collide({ pos, matrix: player.matrix })) pos.y++;
  return pos.y - 1;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) for (const row of matrix) row.reverse();
  else matrix.reverse();
}

function drawMatrix(matrix, offset, target, isGhost = false) {
  for (const [y, row] of matrix.entries()) {
    for (const [x, value] of row.entries()) {
      if (value === 0) continue;

      const bx = x + offset.x;
      const by = y + offset.y;

      if (isGhost) {
        target.fillStyle = 'rgba(255, 255, 255, 0.1)';
        target.fillRect(bx, by, 1, 1);
        continue;
      }

      target.fillStyle = COLORS[value];
      target.fillRect(bx, by, 1, 1);

      if (isLanded && target === ctx && matrix === player.matrix) {
        const alpha = 0.3 + 0.3 * Math.sin(animationFrame * 0.08);
        target.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        target.fillRect(bx, by, 1, 1);
      }

      target.fillStyle = 'rgba(255, 255, 255, 0.4)';
      target.fillRect(bx, by, 1, 0.15);
      target.fillRect(bx, by, 0.15, 1);
      target.fillStyle = 'rgba(0, 0, 0, 0.4)';
      target.fillRect(bx, by + 0.85, 1, 0.15);
      target.fillRect(bx + 0.85, by, 0.15, 1);
      target.fillStyle = 'rgba(0, 0, 0, 0.1)';
      target.fillRect(bx + 0.2, by + 0.2, 0.6, 0.6);
    }
  }
}

function drawPreview(target, matrix) {
  target.clearRect(0, 0, 4, 4);
  if (!matrix) return;
  const offsetX = (4 - matrix[0].length) / 2;
  const offsetY = (4 - matrix.length) / 2;
  drawMatrix(matrix, { x: offsetX, y: offsetY }, target);
}

function draw() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, arena[0].length, arena.length);

  if (hardDropEffect.alpha > 0) {
    for (const trail of hardDropEffect.trails) {
      const gradient = ctx.createLinearGradient(0, trail.y, 0, trail.y + trail.h);

      let fadeStop = 0;
      if (trail.h > 0) {
        fadeStop = Math.min(3, trail.h) / trail.h;
      }

      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      if (fadeStop > 0 && fadeStop < 1) {
        gradient.addColorStop(fadeStop, `rgba(255, 255, 255, ${hardDropEffect.alpha})`);
      }
      gradient.addColorStop(1, `rgba(255, 255, 255, ${hardDropEffect.alpha})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(trail.x, trail.y, 1, trail.h);
    }

    hardDropEffect.alpha -= 0.08;
  }

  drawMatrix(arena, { x: 0, y: 0 }, ctx);

  drawMatrix(player.matrix, { x: player.pos.x, y: getGhostY() }, ctx, true);
  drawMatrix(player.matrix, player.pos, ctx, false);
}

function setupCanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const canvasCtx = canvas.getContext('2d');
  canvasCtx.scale(BLOCK_SIZE * ratio, BLOCK_SIZE * ratio);
  return canvasCtx;
}

function updateScore() {
  highScore.value = Math.max(highScore.value, score.value);
  const level = Math.min(Math.floor(player.lines / 10) + 1, GRAVITY_BY_LEVEL.length - 1);
  dropInterval = 1000 / (60 * GRAVITY_BY_LEVEL[level]);
}

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    rowCount++;
  }

  const level = Math.floor(player.lines / 10) + 1;
  score.value += LINE_SCORES[rowCount] * level;
  player.lines += rowCount;
}

function merge() {
  for (const [y, row] of player.matrix.entries()) {
    for (const [x, value] of row.entries()) {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    }
  }
}

function centerPiece() {
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  player.rotation = 0;
}

function playerReset() {
  if (player.next === null) player.next = getNextPiece();
  player.matrix = player.next;
  player.next = getNextPiece();
  drawPreview(nextCtx, player.next);
  centerPiece();
  if (collide(player)) {
    status.value = 'over';
    pause();
  }
}

function playerLock() {
  merge();
  arenaSweep();
  updateScore();
  playerReset();
  player.canHold = true;
  dropCounter = 0;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
}

function playerDrop() {
  player.pos.y++;
  if (collide(player)) {
    player.pos.y--;
    return false;
  }
  dropCounter = 0;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
  return true;
}

function refreshLockDelay() {
  player.pos.y++;
  if (collide(player) && lockMovesCounter < MAX_LOCK_MOVES) {
    lockDelayCounter = 0;
    lockMovesCounter++;
  }
  player.pos.y--;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(player)) {
    player.pos.x -= dir;
    return false;
  }
  refreshLockDelay();
  return true;
}

function playerRotate(dir) {
  const prevState = player.rotation;
  const nextState = (prevState + (dir > 0 ? 1 : -1) + 4) % 4;

  const isIPiece = player.matrix.length === 4;
  const isOPiece = player.matrix.length === 2;

  if (isOPiece) return;

  const table = isIPiece ? KICKS_I : KICKS_JLSTZ;
  const kicks = dir > 0 ? table[prevState] : table[nextState].map(([kx, ky]) => [-kx, -ky]);

  rotate(player.matrix, dir);

  for (const [kx, ky] of kicks) {
    player.pos.x += kx;
    player.pos.y += ky;
    if (!collide(player)) {
      player.rotation = nextState;
      refreshLockDelay();
      return;
    }
    player.pos.x -= kx;
    player.pos.y -= ky;
  }

  rotate(player.matrix, -dir);
}

function playerHardDrop() {
  const startY = player.pos.y;
  const ghostY = getGhostY();
  const trails = [];

  for (let x = 0; x < player.matrix[0].length; x++) {
    const topY = player.matrix.findIndex((row) => row[x] !== 0);
    if (topY !== -1) {
      trails.push({ x: player.pos.x + x, y: startY + topY, h: ghostY - startY });
    }
  }

  score.value += (ghostY - startY) * 2;
  player.pos.y = ghostY;
  hardDropEffect = { alpha: 0.4, trails };
  playerLock();
}

function playerHold() {
  if (!player.canHold) return;

  if (player.hold === null) {
    player.hold = getPieceType(player.matrix);
    player.matrix = createPiece(getPieceType(player.next));
    player.next = getNextPiece();
    drawPreview(nextCtx, player.next);
  } else {
    const currentType = getPieceType(player.matrix);
    const holdType = player.hold;
    player.matrix = createPiece(holdType);
    player.hold = currentType;
  }
  drawPreview(holdCtx, createPiece(player.hold));
  centerPiece();
  player.canHold = false;
}

function softDrop() {
  if (playerDrop()) {
    score.value++;
    updateScore();
  }
}

function handleHorizontalInput(action, direction, deltaTime) {
  if (!held[action].value) return;
  timers[action] += deltaTime;
  if (timers[action] > SHIFT_DELAY_MS) {
    while (timers[action] > SHIFT_DELAY_MS + SHIFT_REPEAT_MS) {
      playerMove(direction);
      timers[action] -= SHIFT_REPEAT_MS;
    }
  }
}

function handleSoftDrop(deltaTime) {
  if (!held.softDrop.value) return;
  timers.softDrop += deltaTime;
  while (timers.softDrop > SOFT_DROP_REPEAT_MS) {
    softDrop();
    timers.softDrop -= SOFT_DROP_REPEAT_MS;
  }
}

function handleGravityDrop(deltaTime) {
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
    dropCounter = 0;
  }
}

function checkCollisionAndLand(deltaTime) {
  player.pos.y++;
  isLanded = collide(player);
  player.pos.y--;
  if (!isLanded) {
    lockDelayCounter = 0;
    return;
  }
  lockDelayCounter += deltaTime;
  if (lockDelayCounter > LOCK_DELAY_MS) playerLock();
}

function update({ delta: deltaTime }) {
  animationFrame++;

  handleHorizontalInput('left', -1, deltaTime);
  handleHorizontalInput('right', 1, deltaTime);
  handleSoftDrop(deltaTime);
  handleGravityDrop(deltaTime);
  checkCollisionAndLand(deltaTime);

  draw();
}

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) pause();
  else resume();
}

function resetGame() {
  pause();
  animationFrame = 0;

  for (const row of arena) row.fill(0);
  score.value = 0;
  player.lines = 0;
  player.hold = null;
  player.next = null;
  player.canHold = true;
  dropCounter = 0;
  dropInterval = 1000;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
  isLanded = false;
  hardDropEffect = { alpha: 0, trails: [] };
  for (const action of Object.keys(timers)) timers[action] = 0;

  drawPreview(holdCtx, null);
  updateScore();
  status.value = 'playing';
  isPaused.value = false;
  playerReset();
  draw();
  resume();
}

for (const [action, key] of Object.entries(held)) {
  watch(key, (down) => {
    timers[action] = 0;
    if (down && isPlaying()) heldActions[action]();
  });
}

onGameKey(['ArrowUp', 'w'], () => isPlaying() && playerRotate(1));
onGameKey([' '], () => isPlaying() && playerHardDrop());
onGameKey(['c'], () => isPlaying() && playerHold());
onGameKey(['Escape', 'p'], (event) => {
  event.preventDefault();
  togglePause();
});

watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});

watch(
  gameCanvas,
  (element) => {
    if (!element) return;
    ctx = setupCanvas(element, 300, 500);
    nextCtx = setupCanvas(nextCanvas.value, 100, 100);
    holdCtx = setupCanvas(holdCanvas.value, 100, 100);
    resetGame();
  },
  { flush: 'post' },
);
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <canvas ref="gameCanvas" class="game-canvas"></canvas>
        <div v-if="status === 'over'" class="overlay-msg">
          <h2 class="menu-title">Game Over</h2>
          <button class="overlay-btn" @click="resetGame">Play Again</button>
        </div>
        <div v-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">Paused</h2>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Tetris</h1>
        <div class="row">
          <div class="info-box">
            <div class="label">Next</div>
            <canvas ref="nextCanvas"></canvas>
          </div>
          <div class="info-box">
            <div class="label">Hold</div>
            <canvas ref="holdCanvas"></canvas>
          </div>
        </div>
        <div class="info-box score-box">
          <div class="label score-label">Score</div>
          <div class="value score-value">{{ score }}</div>
          <div class="score-divider"></div>
          <div class="label high-score-label">High Score</div>
          <div class="value high-score-value">{{ highScore }}</div>
        </div>
        <GameControls
          :controls="[
            { action: 'Move', keys: ['←', '↓', '→'] },
            { action: 'Rotate', keys: '↑' },
            { action: 'Alternative', keys: ['A', 'S', 'D', 'W'] },
            { action: 'Hard Drop', keys: 'Space' },
            { action: 'Hold', keys: 'C' },
            { action: 'Pause', keys: ['Esc', 'P'] },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.high-score-label {
  margin-bottom: 2px;
  font-size: 11px;
}

.high-score-value {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.score-divider {
  width: 100%;
  height: 1px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.1);
}

.info-box {
  flex: 1;
  aspect-ratio: 1;
}

.score-box {
  aspect-ratio: auto;
}

.game-canvas {
  background: #0d0d0d;
  user-select: none;
}
</style>
