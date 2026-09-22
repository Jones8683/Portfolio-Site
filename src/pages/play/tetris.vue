<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import {
  onKeyStroke,
  useDevicePixelRatio,
  useMagicKeys,
  useRafFn,
  useStorage,
  useWindowFocus,
} from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Tetris' } });

const gameCanvasRef = useTemplateRef('gameCanvas');
const nextCanvasRef = useTemplateRef('nextCanvas');
const holdCanvasRef = useTemplateRef('holdCanvas');
const { pixelRatio } = useDevicePixelRatio();
const score = ref(0);
const isGameOver = ref(false);
const isPaused = ref(false);

let ctx, nextCtx, holdCtx;
let animationFrame = 0;

const colors = [null, '#0DC2FF', '#3877FF', '#FF8E0D', '#FFE138', '#0DFF72', '#FF0D72', '#F538FF'];

const arena = createMatrix(12, 20);

const highScore = useStorage('tetris-best-score', 0);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  lines: 0,
  next: null,
  hold: null,
  canHold: true,
  rotState: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lockDelayCounter = 0;
let lockMovesCounter = 0;
const LOCK_DELAY_TIME = 500;
const MAX_LOCK_MOVES = 15;
let isLanded = false;

const DAS = 170;
const ARR = 33;
const SOFT_DROP_ARR = 30;
const timers = { left: 0, right: 0, softDrop: 0 };

let hardDropEffect = {
  active: false,
  alpha: 0,
  trails: [],
};

let piecesBag = [];

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => 0));
}

function createPiece(type) {
  if (type === 'I')
    return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  if (type === 'J')
    return [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ];
  if (type === 'L')
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  if (type === 'O')
    return [
      [4, 4],
      [4, 4],
    ];
  if (type === 'S')
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  if (type === 'Z')
    return [
      [6, 6, 0],
      [0, 6, 6],
      [0, 0, 0],
    ];
  if (type === 'T')
    return [
      [0, 7, 0],
      [7, 7, 7],
      [0, 0, 0],
    ];
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

function draw() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, arena[0].length, arena.length);

  if (hardDropEffect.active && hardDropEffect.alpha > 0) {
    hardDropEffect.trails.forEach((trail) => {
      const g = ctx.createLinearGradient(0, trail.y, 0, trail.y + trail.h);

      let fadeStop = 0;
      if (trail.h > 0) {
        fadeStop = Math.min(3, trail.h) / trail.h;
      }

      g.addColorStop(0, `rgba(255, 255, 255, 0)`);
      if (fadeStop > 0 && fadeStop < 1) {
        g.addColorStop(fadeStop, `rgba(255, 255, 255, ${hardDropEffect.alpha})`);
      }
      g.addColorStop(1, `rgba(255, 255, 255, ${hardDropEffect.alpha})`);

      ctx.fillStyle = g;
      ctx.fillRect(trail.x, trail.y, 1, trail.h);
    });

    hardDropEffect.alpha -= 0.08;
    if (hardDropEffect.alpha <= 0) hardDropEffect.active = false;
  }

  drawMatrix(arena, { x: 0, y: 0 }, ctx);

  const ghostPos = { ...player.pos };
  while (!collide({ pos: ghostPos, matrix: player.matrix })) {
    ghostPos.y++;
  }
  ghostPos.y--;
  drawMatrix(player.matrix, ghostPos, ctx, true);
  drawMatrix(player.matrix, player.pos, ctx, false);
}

function drawMatrix(matrix, offset, context, isGhost = false) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        let fillStyle = colors[value];
        const bx = x + offset.x;
        const by = y + offset.y;

        if (isGhost) {
          context.fillStyle = 'rgba(255, 255, 255, 0.1)';
          context.fillRect(bx, by, 1, 1);
          return;
        }

        context.fillStyle = fillStyle;
        context.fillRect(bx, by, 1, 1);

        if (isLanded && context === ctx && matrix === player.matrix) {
          const alpha = 0.3 + 0.3 * Math.sin(animationFrame * 0.08);
          context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
          context.fillRect(bx, by, 1, 1);
        }

        context.fillStyle = 'rgba(255, 255, 255, 0.4)';
        context.fillRect(bx, by, 1, 0.15);
        context.fillRect(bx, by, 0.15, 1);
        context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        context.fillRect(bx, by + 0.85, 1, 0.15);
        context.fillRect(bx + 0.85, by, 0.15, 1);
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(bx + 0.2, by + 0.2, 0.6, 0.6);
      }
    });
  });
}

function drawPreview(context, matrix) {
  context.clearRect(0, 0, 4, 4);
  if (!matrix) return;
  const offsetX = (4 - matrix[0].length) / 2;
  const offsetY = (4 - matrix.length) / 2;
  drawMatrix(matrix, { x: offsetX, y: offsetY }, context);
}

function collide(piece) {
  const m = piece.matrix;
  const o = piece.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    rowCount++;
  }

  if (rowCount > 0) {
    const level = Math.floor(player.lines / 10) + 1;
    let base = 0;
    if (rowCount === 1) base = 100;
    else if (rowCount === 2) base = 300;
    else if (rowCount === 3) base = 500;
    else if (rowCount === 4) base = 800;

    const points = base * level;
    player.score += points;
    player.lines += rowCount;
    updateScore();
  }
}

function merge() {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
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

function playerHardDrop() {
  const startY = player.pos.y;
  let ghostY = startY;
  while (!collide({ ...player, pos: { x: player.pos.x, y: ghostY + 1 } })) {
    ghostY++;
  }

  const trails = [];
  const matrix = player.matrix;
  const pieceX = player.pos.x;

  for (let x = 0; x < matrix[0].length; x++) {
    let highestBlockY = -1;
    for (let y = 0; y < matrix.length; y++) {
      if (matrix[y][x] !== 0) {
        highestBlockY = y;
        break;
      }
    }

    if (highestBlockY !== -1) {
      trails.push({
        x: pieceX + x,
        y: startY + highestBlockY,
        h: ghostY - startY,
      });
    }
  }

  const dropDistance = ghostY - startY;
  player.score += dropDistance * 2;

  player.pos.y = ghostY;

  hardDropEffect = {
    active: true,
    alpha: 0.4,
    trails: trails,
  };

  lockDelayCounter = 0;
  lockMovesCounter = 0;

  merge();
  arenaSweep();
  updateScore();
  playerReset();
  player.canHold = true;
  dropCounter = 0;
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

function refreshLockDelay() {
  player.pos.y++;
  if (collide(player) && lockMovesCounter < MAX_LOCK_MOVES) {
    lockDelayCounter = 0;
    lockMovesCounter++;
  }
  player.pos.y--;
}

function playerReset() {
  if (player.next === null) player.next = getNextPiece();
  player.matrix = player.next;
  player.next = getNextPiece();
  drawPreview(nextCtx, player.next);
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  player.rotState = 0;
  if (collide(player)) {
    isGameOver.value = true;
    pause();
  }
}

const KICKS_JLSTZ = {
  '01': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  12: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  23: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  30: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  10: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  21: [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  32: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '03': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
};

const KICKS_I = {
  '01': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  12: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  23: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  30: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  10: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  21: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  32: [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  '03': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
};

function playerRotate(dir) {
  const prevState = player.rotState;
  const nextState = (prevState + (dir > 0 ? 1 : -1) + 4) % 4;
  const key = `${prevState}${nextState}`;

  const isIPiece = player.matrix.length === 4;
  const isOPiece = player.matrix.length === 2;

  if (isOPiece) return;

  const kicks = isIPiece ? KICKS_I[key] : KICKS_JLSTZ[key];

  rotate(player.matrix, dir);

  for (const [kx, ky] of kicks) {
    player.pos.x += kx;
    player.pos.y += ky;
    if (!collide(player)) {
      player.rotState = nextState;
      refreshLockDelay();
      return;
    }
    player.pos.x -= kx;
    player.pos.y -= ky;
  }

  rotate(player.matrix, -dir);
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) for (const row of matrix) row.reverse();
  else matrix.reverse();
}

const PIECE_TYPES = [null, 'I', 'J', 'L', 'O', 'S', 'Z', 'T'];

function getPieceType(matrix) {
  const value = matrix.flat().find((v) => v !== 0);
  return PIECE_TYPES[value];
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
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  player.rotState = 0;
  player.canHold = false;
}

function togglePause() {
  if (isGameOver.value) return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) pause();
  else resume();
}

function softDrop() {
  if (playerDrop()) {
    player.score += 1;
    updateScore();
  }
}

function handleHorizontalInput(action, direction, deltaTime) {
  if (!held[action].value) return;
  timers[action] += deltaTime;
  if (timers[action] > DAS) {
    while (timers[action] > DAS + ARR) {
      playerMove(direction);
      timers[action] -= ARR;
    }
  }
}

function handleSoftDrop(deltaTime) {
  if (!held.softDrop.value) return;
  timers.softDrop += deltaTime;
  while (timers.softDrop > SOFT_DROP_ARR) {
    softDrop();
    timers.softDrop -= SOFT_DROP_ARR;
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
  if (lockDelayCounter > LOCK_DELAY_TIME) playerLock();
}

const { pause, resume } = useRafFn(update, { immediate: false });

function update({ delta: deltaTime }) {
  animationFrame++;

  handleHorizontalInput('left', -1, deltaTime);
  handleHorizontalInput('right', 1, deltaTime);
  handleSoftDrop(deltaTime);
  handleGravityDrop(deltaTime);
  checkCollisionAndLand(deltaTime);

  draw();
}

function updateScore() {
  score.value = player.score;
  highScore.value = Math.max(highScore.value, player.score);
  const level = Math.floor(player.lines / 10) + 1;

  const gValues = {
    1: 0.01667,
    2: 0.021017,
    3: 0.026977,
    4: 0.035256,
    5: 0.04693,
    6: 0.06361,
    7: 0.0879,
    8: 0.1236,
    9: 0.1775,
    10: 0.2598,
    11: 0.388,
    12: 0.59,
    13: 0.92,
    14: 1.46,
    15: 2.36,
    16: 3.91,
    17: 6.61,
    18: 11.43,
    19: 20.0,
  };

  const currentG = gValues[level] || (level > 19 ? 20.0 : 0.01667);
  dropInterval = 1000 / (60 * currentG);
}

function resetGame() {
  pause();
  animationFrame = 0;

  arena.forEach((row) => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.hold = null;
  player.next = null;
  player.canHold = true;
  dropCounter = 0;
  dropInterval = 1000;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
  isLanded = false;
  hardDropEffect = { active: false, alpha: 0, trails: [] };
  for (const action in timers) timers[action] = 0;

  drawPreview(holdCtx, null);
  updateScore();
  isGameOver.value = false;
  isPaused.value = false;
  playerReset();
  draw();
  resume();
}

const isPlaying = () => !isGameOver.value && !isPaused.value;

const { ArrowLeft, KeyA, ArrowRight, KeyD, ArrowDown, KeyS } = useMagicKeys({
  passive: false,
  onEventFired: (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.code))
      e.preventDefault();
  },
});
const held = {
  left: computed(() => ArrowLeft.value || KeyA.value),
  right: computed(() => ArrowRight.value || KeyD.value),
  softDrop: computed(() => ArrowDown.value || KeyS.value),
};
const HELD_ACTIONS = { left: () => playerMove(-1), right: () => playerMove(1), softDrop };

for (const [action, isHeld] of Object.entries(held)) {
  watch(isHeld, (down) => {
    timers[action] = 0;
    if (down && isPlaying()) HELD_ACTIONS[action]();
  });
}

onKeyStroke(['ArrowUp', 'w', 'W'], () => isPlaying() && playerRotate(1));
onKeyStroke(' ', () => isPlaying() && playerHardDrop());
onKeyStroke(['c', 'C'], () => isPlaying() && playerHold());
onKeyStroke(['Escape', 'p', 'P'], (e) => {
  e.preventDefault();
  togglePause();
});
watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});
const setupCanvas = (c, w, h) => {
  c.width = w * pixelRatio.value;
  c.height = h * pixelRatio.value;
  c.style.width = w + 'px';
  c.style.height = h + 'px';
  const context = c.getContext('2d');
  context.scale(25 * pixelRatio.value, 25 * pixelRatio.value);
  return context;
};
watch(
  gameCanvasRef,
  (el) => {
    if (!el) return;
    ctx = setupCanvas(el, 300, 500);
    nextCtx = setupCanvas(nextCanvasRef.value, 100, 100);
    holdCtx = setupCanvas(holdCanvasRef.value, 100, 100);
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
        <div v-if="isGameOver" class="overlay-msg">
          <h2 class="menu-title">GAME OVER</h2>
          <button class="retry-btn" @click="resetGame">PLAY AGAIN</button>
        </div>
        <div v-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">PAUSED</h2>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Tetris</h1>
        <div class="row">
          <div class="info-box">
            <div class="label">Next</div>
            <canvas ref="nextCanvas" class="side-canvas"></canvas>
          </div>
          <div class="info-box">
            <div class="label">Hold</div>
            <canvas ref="holdCanvas" class="side-canvas"></canvas>
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
            { action: 'Move', key: ['←', '↓', '→'] },
            { action: 'Rotate', key: '↑' },
            { action: 'Hard Drop', key: 'Space' },
            { action: 'Hold', key: 'C' },
            { action: 'Pause', key: 'Esc' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.info-box {
  flex: 1;
  aspect-ratio: 1;
}

.score-box {
  aspect-ratio: auto;
}

.game-canvas {
  user-select: none;
  background-color: #0d0d0d;
}

.side-canvas {
  background-color: transparent;
}
</style>
