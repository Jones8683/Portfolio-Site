<script setup>
import { ref, useTemplateRef, watch } from 'vue';
import {
  onKeyStroke,
  useDevicePixelRatio,
  useRafFn,
  useStorage,
  useWindowFocus,
} from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Flappy Bird' } });

const highScore = useStorage('flappy-bird-best-score', 0);

const canvasRef = useTemplateRef('canvas');
const { pixelRatio } = useDevicePixelRatio();
const score = ref(0);
const status = ref('start');
const isPaused = ref(false);

const W = 360;
const H = 568;
const GROUND_Y = 480;
const GRAVITY = 0.42;
const JUMP_VY = -6.8;
const MAX_FALL = 9;
const PIPE_SPEED = 2.85;
const PIPE_W = 56;
const PIPE_GAP = 120;
const PIPE_EVERY = 1200;
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;

let groundOff = 0;
let cityOff = 0;
let cloudOff = 0;
let ctx;
let bird, pipes, lastPipeTs, deathTimer;
let wingFrame = 0;
let pauseTs = 0;

function initState() {
  bird = { x: 80, y: GROUND_Y / 2, vy: 0, angle: 0 };
  pipes = [];
  score.value = 0;
  lastPipeTs = -9999;
  deathTimer = 0;
  groundOff = 0;
}

function addPipe(ts) {
  const minTop = 60;
  const maxTop = GROUND_Y - PIPE_GAP - 60;
  pipes.push({
    x: W + 10,
    topH: minTop + Math.random() * (maxTop - minTop),
    passed: false,
  });
  lastPipeTs = ts;
}

function hitTest() {
  const bx = bird.x;
  const by = bird.y;
  const br = 11;
  if (by + br >= GROUND_Y) return true;
  for (const p of pipes) {
    const inX = bx + br > p.x && bx - br < p.x + PIPE_W;
    if (inX && (by - br < p.topH || by + br > p.topH + PIPE_GAP)) return true;
  }
  return false;
}

function txt(str, x, y, size, fill, strokeCol) {
  ctx.save();
  ctx.font = `900 ${size}px Satoshi, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (strokeCol) {
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = size * 0.22;
    ctx.lineJoin = 'round';
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function drawSky() {
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
}

const CLOUDS = [
  { ox: 30, y: 60, w: 80, h: 40 },
  { ox: 200, y: 90, w: 64, h: 32 },
  { ox: 310, y: 52, w: 72, h: 36 },
];

function drawClouds() {
  ctx.fillStyle = '#ffffff';
  for (const c of CLOUDS) {
    const wrap = W + c.w + 20;
    const x = ((c.ox - (cloudOff % wrap) + wrap * 2) % wrap) - c.w - 20;
    ctx.fillRect(x, c.y + c.h * 0.4, c.w, c.h * 0.6);
    ctx.fillRect(x + c.w * 0.1, c.y + c.h * 0.2, c.w * 0.5, c.h * 0.4);
    ctx.fillRect(x + c.w * 0.4, c.y, c.w * 0.4, c.h * 0.45);
  }
}

const CITY_TILE_W = 720;
const BUILDINGS = [
  { x: 0, w: 38, h: 90, windows: true, style: 'wide' },
  { x: 40, w: 22, h: 55, windows: false, style: 'thin' },
  { x: 64, w: 44, h: 130, windows: true, style: 'tall' },
  { x: 110, w: 28, h: 70, windows: true, style: 'wide' },
  { x: 140, w: 18, h: 48, windows: false, style: 'thin' },
  { x: 160, w: 50, h: 110, windows: true, style: 'tall' },
  { x: 212, w: 30, h: 65, windows: true, style: 'wide' },
  { x: 244, w: 20, h: 42, windows: false, style: 'thin' },
  { x: 266, w: 40, h: 95, windows: true, style: 'wide' },
  { x: 308, w: 24, h: 58, windows: false, style: 'thin' },
  { x: 334, w: 46, h: 120, windows: true, style: 'tall' },
  { x: 382, w: 28, h: 72, windows: true, style: 'wide' },
  { x: 412, w: 16, h: 44, windows: false, style: 'thin' },
  { x: 430, w: 42, h: 100, windows: true, style: 'tall' },
  { x: 474, w: 32, h: 60, windows: true, style: 'wide' },
  { x: 508, w: 20, h: 50, windows: false, style: 'thin' },
  { x: 530, w: 48, h: 115, windows: true, style: 'tall' },
  { x: 580, w: 26, h: 68, windows: true, style: 'wide' },
  { x: 608, w: 18, h: 40, windows: false, style: 'thin' },
  { x: 628, w: 44, h: 88, windows: true, style: 'wide' },
  { x: 674, w: 22, h: 54, windows: false, style: 'thin' },
  { x: 698, w: 22, h: 78, windows: true, style: 'wide' },
];

function drawCity() {
  const off = cityOff % CITY_TILE_W;

  for (let tile = -1; tile <= 2; tile++) {
    for (const b of BUILDINGS) {
      const rx = b.x - off + tile * CITY_TILE_W;
      if (rx + b.w < 0 || rx > W) continue;
      const by = GROUND_Y - b.h;

      ctx.fillStyle = '#3ea8b4';
      ctx.fillRect(rx, by, b.w, b.h);

      ctx.fillStyle = '#48bcc8';
      ctx.fillRect(rx, by, 3, b.h);

      ctx.fillStyle = '#329aa6';
      ctx.fillRect(rx + b.w - 3, by, 3, b.h);

      ctx.fillStyle = '#52cad6';
      ctx.fillRect(rx, by, b.w, 2);

      if (b.style === 'tall') {
        ctx.fillStyle = '#3ea8b4';
        ctx.fillRect(rx + Math.floor(b.w / 2) - 1, by - 12, 2, 12);
        ctx.fillRect(rx + Math.floor(b.w / 2) - 3, by - 14, 6, 3);
      }

      if (b.windows) {
        const ww = 5;
        const wh = 5;
        const gx = 8;
        const gy = 9;
        const cols = Math.floor((b.w - 6) / (ww + gx)) || 1;
        const rows = Math.floor((b.h - 10) / (wh + gy));
        const startX = rx + Math.floor((b.w - cols * (ww + gx) + gx) / 2);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const wx = startX + col * (ww + gx);
            const wy = by + 8 + row * (wh + gy);
            const lit = (row * 3 + col * 7 + b.x) % 5 !== 0;
            ctx.fillStyle = lit ? 'rgba(255, 240, 180, 0.55)' : 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(wx, wy, ww, wh);
          }
        }
      }
    }
  }
}

function drawGround() {
  const SAND_Y = GROUND_Y + 18;

  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, SAND_Y, W, H - SAND_Y);

  ctx.fillStyle = '#ccc07a';
  ctx.fillRect(0, SAND_Y, W, 4);
  ctx.fillStyle = '#d4c882';
  ctx.fillRect(0, SAND_Y + 4, W, 3);

  ctx.fillStyle = '#74bf2e';
  ctx.fillRect(0, GROUND_Y, W, 18);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, GROUND_Y, W, 18);
  ctx.clip();
  ctx.strokeStyle = '#5aa820';
  ctx.lineWidth = 3;
  const stripeOff = Math.round(-groundOff % 20);
  for (let x = stripeOff - 40; x < W + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 18, GROUND_Y + 18);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#a0e050';
  ctx.fillRect(0, GROUND_Y, W, 2);
  ctx.fillStyle = '#4a9c18';
  ctx.fillRect(0, GROUND_Y + 15, W, 3);
}

const CAP_H = 26;
const BODY_W = PIPE_W - 6;

function drawPipeSegment(x, y, w, h, shadeW) {
  ctx.fillStyle = '#5dbe2b';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#72d93e';
  ctx.fillRect(x + 4, y, shadeW, h);
  ctx.fillStyle = '#4aa620';
  ctx.fillRect(x + w - shadeW, y, shadeW, h);
}

function drawPipeCap(x, y, gapBelow) {
  drawPipeSegment(x, y, PIPE_W, CAP_H, 10);
  ctx.fillStyle = '#8aee50';
  ctx.fillRect(x, gapBelow ? y : y + CAP_H - 3, PIPE_W, 3);
  ctx.fillStyle = '#3a8a10';
  ctx.fillRect(x, gapBelow ? y + CAP_H - 3 : y, PIPE_W, 3);
}

function drawPipes() {
  for (const p of pipes) {
    const botY = p.topH + PIPE_GAP;
    drawPipeSegment(p.x + 3, 0, BODY_W, p.topH - CAP_H, 8);
    drawPipeCap(p.x, p.topH - CAP_H, true);
    drawPipeCap(p.x, botY, false);
    drawPipeSegment(p.x + 3, botY + CAP_H, BODY_W, GROUND_Y - (botY + CAP_H), 8);
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const targetAngle = bird.vy < 0 ? Math.max(-0.4, bird.vy * 0.06) : Math.min(1.3, bird.vy * 0.09);
  bird.angle += (targetAngle - bird.angle) * 0.25;
  ctx.rotate(bird.angle);

  const R = 13;

  ctx.fillStyle = '#f8d030';
  ctx.strokeStyle = '#b87800';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
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

function drawScore() {
  txt(String(score.value), W / 2, 48, 46, '#ffffff', '#3a2a10');
}

function drawIdle() {
  const a = 0.8 + Math.sin(wingFrame * 0.05) * 0.2;
  ctx.globalAlpha = a;
  txt('Tap or press SPACE', W / 2, GROUND_Y / 2 + 60, 16, '#ffffff', '#2a1a00');
  ctx.globalAlpha = 1;
}

function drawDead() {
  const flash = Math.max(0, 0.55 - deathTimer * 0.027);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (deathTimer < 20) return;

  txt('GAME OVER', W / 2, GROUND_Y / 2 - 10, 32, '#ffffff', '#3a2a10');

  if (deathTimer > 50) {
    const a = 0.7 + Math.sin(wingFrame * 0.07) * 0.3;
    ctx.globalAlpha = a;
    txt('Tap to retry', W / 2, GROUND_Y / 2 + 36, 16, '#ffffff', '#3a2a10');
    ctx.globalAlpha = 1;
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  drawSky();
  drawClouds();
  drawCity();
  drawPipes();
  drawGround();
  drawBird();
  if (status.value === 'start') drawIdle();
  if (status.value === 'over') drawDead();
}

function frame({ delta, timestamp: ts }) {
  const dt = Math.min(delta, 50) / STEP;
  wingFrame++;

  if (status.value === 'start') {
    bird.y = GROUND_Y / 2 + Math.sin(wingFrame * 0.03) * 8;
    cloudOff += 0.15;
  }

  if (status.value === 'playing') {
    groundOff += PIPE_SPEED * 1.1 * dt;
    cityOff += PIPE_SPEED * 0.18 * dt;
    cloudOff += PIPE_SPEED * 0.04 * dt;
    if (ts - lastPipeTs > PIPE_EVERY) addPipe(ts);
    bird.vy = Math.min(bird.vy + GRAVITY * dt, MAX_FALL);
    bird.y += bird.vy * dt;
    for (const p of pipes) {
      p.x -= PIPE_SPEED * dt;
      if (!p.passed && p.x + PIPE_W < bird.x) {
        p.passed = true;
        score.value++;
        highScore.value = Math.max(highScore.value, score.value);
      }
    }
    pipes = pipes.filter((p) => p.x + PIPE_W > -10);
    if (hitTest()) status.value = 'over';
  }

  if (status.value === 'over') {
    deathTimer++;
    bird.vy = Math.min(bird.vy + GRAVITY * 1.6 * dt, MAX_FALL);
    bird.y = Math.min(bird.y + bird.vy * dt, GROUND_Y - 13);
    cloudOff += PIPE_SPEED * 0.04 * dt;
  }

  render();
}

const { pause, resume } = useRafFn(frame, { immediate: false });

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    pauseTs = performance.now();
    pause();
  } else {
    lastPipeTs += performance.now() - pauseTs;
    resume();
  }
}

function jump() {
  if (isPaused.value) return;
  if (status.value === 'start') {
    status.value = 'playing';
    bird.vy = JUMP_VY;
    lastPipeTs = performance.now();
    wingFrame = 0;
  } else if (status.value === 'playing') {
    bird.vy = JUMP_VY;
  } else if (deathTimer > 50) {
    initState();
    status.value = 'start';
    wingFrame = 0;
  }
}

onKeyStroke(['Escape', 'p', 'P'], (e) => {
  e.preventDefault();
  togglePause();
});
onKeyStroke([' ', 'ArrowUp', 'w', 'W'], (e) => {
  e.preventDefault();
  jump();
});
watch(useWindowFocus(), (focused) => {
  if (!focused && !isPaused.value) togglePause();
});

watch(
  canvasRef,
  (el) => {
    if (!el) return;
    ctx = el.getContext('2d');
    el.width = W * pixelRatio.value;
    el.height = H * pixelRatio.value;
    el.style.width = W + 'px';
    el.style.height = H + 'px';
    ctx.scale(pixelRatio.value, pixelRatio.value);
    ctx.imageSmoothingEnabled = false;
    initState();
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
canvas {
  cursor: pointer;
}
</style>
