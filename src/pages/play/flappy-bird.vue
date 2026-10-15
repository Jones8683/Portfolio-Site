<script setup>
import { ref, useTemplateRef, watch } from 'vue';
import { useRafFn, useStorage, useWindowFocus } from '@vueuse/core';
import GamePage, { onGameKey } from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Flappy Bird' } });

const WIDTH = 360;
const HEIGHT = 568;
const GROUND_Y = 480;
const GRAVITY = 0.42;
const JUMP_VY = -6.8;
const MAX_FALL = 9;
const PIPE_SPEED = 2.85;
const PIPE_WIDTH = 56;
const PIPE_GAP = 120;
const PIPE_INTERVAL_MS = 1200;
const TARGET_FPS = 60;
const STEP_MS = 1000 / TARGET_FPS;
const CAP_HEIGHT = 26;
const BODY_WIDTH = PIPE_WIDTH - 6;
const CITY_TILE_WIDTH = 720;

const CLOUDS = [
  { ox: 30, y: 60, w: 80, h: 40 },
  { ox: 200, y: 90, w: 64, h: 32 },
  { ox: 310, y: 52, w: 72, h: 36 },
];

const BUILDINGS = [
  { x: 0, w: 38, h: 90, hasWindows: true, style: 'wide' },
  { x: 40, w: 22, h: 55, hasWindows: false, style: 'thin' },
  { x: 64, w: 44, h: 130, hasWindows: true, style: 'tall' },
  { x: 110, w: 28, h: 70, hasWindows: true, style: 'wide' },
  { x: 140, w: 18, h: 48, hasWindows: false, style: 'thin' },
  { x: 160, w: 50, h: 110, hasWindows: true, style: 'tall' },
  { x: 212, w: 30, h: 65, hasWindows: true, style: 'wide' },
  { x: 244, w: 20, h: 42, hasWindows: false, style: 'thin' },
  { x: 266, w: 40, h: 95, hasWindows: true, style: 'wide' },
  { x: 308, w: 24, h: 58, hasWindows: false, style: 'thin' },
  { x: 334, w: 46, h: 120, hasWindows: true, style: 'tall' },
  { x: 382, w: 28, h: 72, hasWindows: true, style: 'wide' },
  { x: 412, w: 16, h: 44, hasWindows: false, style: 'thin' },
  { x: 430, w: 42, h: 100, hasWindows: true, style: 'tall' },
  { x: 474, w: 32, h: 60, hasWindows: true, style: 'wide' },
  { x: 508, w: 20, h: 50, hasWindows: false, style: 'thin' },
  { x: 530, w: 48, h: 115, hasWindows: true, style: 'tall' },
  { x: 580, w: 26, h: 68, hasWindows: true, style: 'wide' },
  { x: 608, w: 18, h: 40, hasWindows: false, style: 'thin' },
  { x: 628, w: 44, h: 88, hasWindows: true, style: 'wide' },
  { x: 674, w: 22, h: 54, hasWindows: false, style: 'thin' },
  { x: 698, w: 22, h: 78, hasWindows: true, style: 'wide' },
];

const canvas = useTemplateRef('canvas');
const status = ref('start');
const isPaused = ref(false);
const score = ref(0);
const highScore = useStorage('flappy-bird-best-score', 0);

let groundOffset = 0;
let cityOffset = 0;
let cloudOffset = 0;
let ctx;
let bird;
let pipes;
let lastPipeTime;
let deathTimer;
let wingFrame = 0;
let pausedAt = 0;

const { pause, resume } = useRafFn(frame, { immediate: false });

function resetGame() {
  bird = { x: 80, y: GROUND_Y / 2, vy: 0, angle: 0 };
  pipes = [];
  score.value = 0;
  lastPipeTime = -9999;
  deathTimer = 0;
  groundOffset = 0;
}

function addPipe(timestamp) {
  const minTop = 60;
  const maxTop = GROUND_Y - PIPE_GAP - 60;
  pipes.push({
    x: WIDTH + 10,
    topH: minTop + Math.random() * (maxTop - minTop),
    isPassed: false,
  });
  lastPipeTime = timestamp;
}

function hitTest() {
  const bx = bird.x;
  const by = bird.y;
  const br = 11;
  if (by + br >= GROUND_Y) return true;
  for (const pipe of pipes) {
    const inX = bx + br > pipe.x && bx - br < pipe.x + PIPE_WIDTH;
    if (inX && (by - br < pipe.topH || by + br > pipe.topH + PIPE_GAP)) return true;
  }
  return false;
}

function drawText(text, x, y, size, fill, stroke) {
  ctx.save();
  ctx.font = `900 ${size}px Satoshi, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = size * 0.22;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSky() {
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, WIDTH, GROUND_Y + 2);
}

function drawClouds() {
  ctx.fillStyle = '#ffffff';
  for (const cloud of CLOUDS) {
    const wrap = WIDTH + cloud.w + 20;
    const x = ((cloud.ox - (cloudOffset % wrap) + wrap * 2) % wrap) - cloud.w - 20;
    ctx.fillRect(x, cloud.y + cloud.h * 0.4, cloud.w, cloud.h * 0.6);
    ctx.fillRect(x + cloud.w * 0.1, cloud.y + cloud.h * 0.2, cloud.w * 0.5, cloud.h * 0.4);
    ctx.fillRect(x + cloud.w * 0.4, cloud.y, cloud.w * 0.4, cloud.h * 0.45);
  }
}

function drawCity() {
  const offset = cityOffset % CITY_TILE_WIDTH;

  for (let tile = -1; tile <= 2; tile++) {
    for (const building of BUILDINGS) {
      const rx = building.x - offset + tile * CITY_TILE_WIDTH;
      if (rx + building.w < 0 || rx > WIDTH) continue;
      const by = GROUND_Y - building.h;

      ctx.fillStyle = '#3ea8b4';
      ctx.fillRect(rx, by, building.w, building.h);

      ctx.fillStyle = '#48bcc8';
      ctx.fillRect(rx, by, 3, building.h);

      ctx.fillStyle = '#329aa6';
      ctx.fillRect(rx + building.w - 3, by, 3, building.h);

      ctx.fillStyle = '#52cad6';
      ctx.fillRect(rx, by, building.w, 2);

      if (building.style === 'tall') {
        ctx.fillStyle = '#3ea8b4';
        ctx.fillRect(rx + Math.floor(building.w / 2) - 1, by - 12, 2, 12);
        ctx.fillRect(rx + Math.floor(building.w / 2) - 3, by - 14, 6, 3);
      }

      if (building.hasWindows) {
        const ww = 5;
        const wh = 5;
        const gx = 8;
        const gy = 9;
        const cols = Math.floor((building.w - 6) / (ww + gx)) || 1;
        const rows = Math.floor((building.h - 10) / (wh + gy));
        const startX = rx + Math.floor((building.w - cols * (ww + gx) + gx) / 2);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const wx = startX + col * (ww + gx);
            const wy = by + 8 + row * (wh + gy);
            const lit = (row * 3 + col * 7 + building.x) % 5 !== 0;
            ctx.fillStyle = lit ? 'rgba(255, 240, 180, 0.55)' : 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(wx, wy, ww, wh);
          }
        }
      }
    }
  }
}

function drawGround() {
  const sandY = GROUND_Y + 18;

  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, sandY, WIDTH, HEIGHT - sandY);

  ctx.fillStyle = '#ccc07a';
  ctx.fillRect(0, sandY, WIDTH, 4);
  ctx.fillStyle = '#d4c882';
  ctx.fillRect(0, sandY + 4, WIDTH, 3);

  ctx.fillStyle = '#74bf2e';
  ctx.fillRect(0, GROUND_Y, WIDTH, 18);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, GROUND_Y, WIDTH, 18);
  ctx.clip();
  ctx.strokeStyle = '#5aa820';
  ctx.lineWidth = 3;
  const stripeOffset = Math.round(-groundOffset % 20);
  for (let x = stripeOffset - 40; x < WIDTH + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 18, GROUND_Y + 18);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#a0e050';
  ctx.fillRect(0, GROUND_Y, WIDTH, 2);
  ctx.fillStyle = '#4a9c18';
  ctx.fillRect(0, GROUND_Y + 15, WIDTH, 3);
}

function drawPipeSegment(x, y, w, h, shadeW) {
  ctx.fillStyle = '#5dbe2b';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#72d93e';
  ctx.fillRect(x + 4, y, shadeW, h);
  ctx.fillStyle = '#4aa620';
  ctx.fillRect(x + w - shadeW, y, shadeW, h);
}

function drawPipeCap(x, y, gapBelow) {
  drawPipeSegment(x, y, PIPE_WIDTH, CAP_HEIGHT, 10);
  ctx.fillStyle = '#8aee50';
  ctx.fillRect(x, gapBelow ? y : y + CAP_HEIGHT - 3, PIPE_WIDTH, 3);
  ctx.fillStyle = '#3a8a10';
  ctx.fillRect(x, gapBelow ? y + CAP_HEIGHT - 3 : y, PIPE_WIDTH, 3);
}

function drawPipes() {
  for (const pipe of pipes) {
    const bottomY = pipe.topH + PIPE_GAP;
    drawPipeSegment(pipe.x + 3, 0, BODY_WIDTH, pipe.topH - CAP_HEIGHT, 8);
    drawPipeCap(pipe.x, pipe.topH - CAP_HEIGHT, true);
    drawPipeCap(pipe.x, bottomY, false);
    drawPipeSegment(
      pipe.x + 3,
      bottomY + CAP_HEIGHT,
      BODY_WIDTH,
      GROUND_Y - (bottomY + CAP_HEIGHT),
      8,
    );
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const targetAngle = bird.vy < 0 ? Math.max(-0.4, bird.vy * 0.06) : Math.min(1.3, bird.vy * 0.09);
  bird.angle += (targetAngle - bird.angle) * 0.25;
  ctx.rotate(bird.angle);

  const radius = 13;

  ctx.fillStyle = '#f8d030';
  ctx.strokeStyle = '#b87800';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const wingY = status.value === 'over' ? 0 : Math.sin(wingFrame * 0.15) * 3.5;
  ctx.fillStyle = '#d98c10';
  ctx.strokeStyle = '#a06000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-2, 2 + wingY, 9, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff8c0';
  ctx.beginPath();
  ctx.ellipse(2, 3, 7.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(7.5, -3.5, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(8.5, -4.8, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f07010';
  ctx.strokeStyle = '#b85000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.lineTo(19, -0.5);
  ctx.lineTo(18, 3.5);
  ctx.lineTo(8, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, 0.8);
  ctx.lineTo(17, 0.8);
  ctx.stroke();

  ctx.restore();
}

function drawIdle() {
  const alpha = 0.8 + Math.sin(wingFrame * 0.05) * 0.2;
  ctx.globalAlpha = alpha;
  drawText('Tap or press SPACE', WIDTH / 2, GROUND_Y / 2 + 60, 16, '#ffffff', '#2a1a00');
  ctx.globalAlpha = 1;
}

function drawDead() {
  const flash = Math.max(0, 0.55 - deathTimer * 0.027);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (deathTimer < 20) return;

  drawText('GAME OVER', WIDTH / 2, GROUND_Y / 2 - 10, 32, '#ffffff', '#3a2a10');

  if (deathTimer > 50) {
    const alpha = 0.7 + Math.sin(wingFrame * 0.07) * 0.3;
    ctx.globalAlpha = alpha;
    drawText('Tap to retry', WIDTH / 2, GROUND_Y / 2 + 36, 16, '#ffffff', '#3a2a10');
    ctx.globalAlpha = 1;
  }
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawSky();
  drawClouds();
  drawCity();
  drawPipes();
  drawGround();
  drawBird();
  if (status.value === 'start') drawIdle();
  if (status.value === 'over') drawDead();
}

function frame({ delta, timestamp }) {
  const dt = Math.min(delta, 50) / STEP_MS;
  wingFrame++;

  if (status.value === 'start') {
    bird.y = GROUND_Y / 2 + Math.sin(wingFrame * 0.03) * 8;
    cloudOffset += 0.15;
  }

  if (status.value === 'playing') {
    groundOffset += PIPE_SPEED * 1.1 * dt;
    cityOffset += PIPE_SPEED * 0.18 * dt;
    cloudOffset += PIPE_SPEED * 0.04 * dt;
    if (timestamp - lastPipeTime > PIPE_INTERVAL_MS) addPipe(timestamp);
    bird.vy = Math.min(bird.vy + GRAVITY * dt, MAX_FALL);
    bird.y += bird.vy * dt;
    for (const pipe of pipes) {
      pipe.x -= PIPE_SPEED * dt;
      if (!pipe.isPassed && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.isPassed = true;
        score.value++;
        highScore.value = Math.max(highScore.value, score.value);
      }
    }
    pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -10);
    if (hitTest()) status.value = 'over';
  }

  if (status.value === 'over') {
    deathTimer++;
    bird.vy = Math.min(bird.vy + GRAVITY * 1.6 * dt, MAX_FALL);
    bird.y = Math.min(bird.y + bird.vy * dt, GROUND_Y - 13);
    cloudOffset += PIPE_SPEED * 0.04 * dt;
  }

  render();
}

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    pausedAt = performance.now();
    pause();
  } else {
    lastPipeTime += performance.now() - pausedAt;
    resume();
  }
}

function jump() {
  if (isPaused.value) return;
  if (status.value === 'start') {
    status.value = 'playing';
    bird.vy = JUMP_VY;
    lastPipeTime = performance.now();
    wingFrame = 0;
  } else if (status.value === 'playing') {
    bird.vy = JUMP_VY;
  } else if (deathTimer > 50) {
    resetGame();
    status.value = 'start';
    wingFrame = 0;
  }
}

onGameKey(['Escape', 'p'], (event) => {
  event.preventDefault();
  togglePause();
});

onGameKey([' ', 'ArrowUp', 'w'], (event) => {
  event.preventDefault();
  jump();
});

watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});

watch(
  canvas,
  (element) => {
    if (!element) return;
    const ratio = window.devicePixelRatio;
    element.width = WIDTH * ratio;
    element.height = HEIGHT * ratio;
    element.style.width = `${WIDTH}px`;
    element.style.height = `${HEIGHT}px`;
    ctx = element.getContext('2d');
    ctx.scale(ratio, ratio);
    resetGame();
    resume();
  },
  { flush: 'post' },
);
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <canvas ref="canvas" @mousedown="jump"></canvas>
        <div v-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">PAUSED</h2>
        </div>
      </div>
      <div class="right-section">
        <h1 class="game-title">Flappy<br />Bird</h1>
        <div class="info-box score-box">
          <div class="label score-label">Score</div>
          <div class="value score-value">{{ score }}</div>
          <div class="score-divider"></div>
          <div class="label high-score-label">High Score</div>
          <div class="value high-score-value">{{ highScore }}</div>
        </div>
        <GameControls
          :controls="[
            { action: 'Jump', key: 'Click' },
            { action: 'Alternative', key: 'Space' },
            { action: 'Pause', key: 'Esc' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
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
  background: var(--color-hairline);
}

canvas {
  cursor: pointer;
}
</style>
