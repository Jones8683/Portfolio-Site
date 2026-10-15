<script setup>
import { computed, onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { useMagicKeys, useRafFn, useTimeoutFn, useWindowFocus } from '@vueuse/core';
import GamePage, { onGameKey } from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Pong' } });

const WIDTH = 700;
const HEIGHT = 500;
const WIN_SCORE = 7;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 85;
const PADDLE_Y = (HEIGHT - PADDLE_HEIGHT) / 2;
const BALL_RADIUS = 7;
const TARGET_FPS = 60;
const STEP_MS = 1000 / TARGET_FPS;

const canvas = useTemplateRef('canvas');
const status = ref('start');
const isPaused = ref(false);
const outcome = ref('');
const scores = ref({ left: 0, right: 0 });

let ctx;
let audioCtx = null;
let gameMode = 'cpu';
let isResetting = false;
let trail = [];
let particles = [];
let shakeFrames = 0;
let shakeIntensity = 0;

const leftPaddle = { x: 20, y: PADDLE_Y, speed: 10.5, aiSpeed: 5.7, flash: 0 };
const rightPaddle = { x: WIDTH - 20 - PADDLE_WIDTH, y: PADDLE_Y, speed: 10.5, flash: 0 };
const ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: 0, dy: 0, speed: 4, baseSpeed: 4 };

const keys = useMagicKeys({
  passive: false,
  onEventFired: (event) => {
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();
  },
});
const isModifierHeld = computed(() => keys.ctrl.value || keys.meta.value || keys.alt.value);
const leftUp = isHeld('w');
const leftDown = isHeld('s');
const rightUp = isHeld('ArrowUp');
const rightDown = isHeld('ArrowDown');

const { start: serveBall, stop: cancelServe } = useTimeoutFn(
  () => {
    isResetting = false;
    const dir = Math.random() > 0.5 ? 1 : -1;
    ball.dx = dir * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed * 0.5;
  },
  1000,
  { immediate: false },
);

const { pause, resume } = useRafFn(
  ({ delta }) => {
    update(Math.min(delta, 50) / STEP_MS);
    draw();
  },
  { immediate: false },
);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isHeld(...names) {
  return computed(() => !isModifierHeld.value && names.some((name) => keys[name].value));
}

function getAudioCtx() {
  if (!audioCtx && typeof AudioContext !== 'undefined') {
    audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(frequency, duration, type = 'square', volume = 0.15) {
  const audio = getAudioCtx();
  if (!audio) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
}

function spawnParticles(x, y, rgb) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.04,
      size: 2 + Math.random() * 3,
      rgb,
    });
  }
}

function hitsPaddle(paddle) {
  return (
    ball.x + BALL_RADIUS > paddle.x &&
    ball.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH &&
    ball.y + BALL_RADIUS > paddle.y &&
    ball.y - BALL_RADIUS < paddle.y + PADDLE_HEIGHT
  );
}

function drawCenterLine() {
  const segmentHeight = 18;
  const segmentGap = 12;
  const segmentCount = Math.floor(HEIGHT / (segmentHeight + segmentGap));
  const startY = (HEIGHT - segmentCount * (segmentHeight + segmentGap) + segmentGap) / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  for (let i = 0; i < segmentCount; i++) {
    const y = startY + i * (segmentHeight + segmentGap);
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 1.5, y, 3, segmentHeight, 2);
    ctx.fill();
  }
}

function drawField() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(-10, -10, WIDTH + 20, HEIGHT + 20);
  drawCenterLine();
}

function drawPaddle(paddle) {
  const isFlashing = paddle.flash > 0;
  ctx.save();
  if (isFlashing) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 24;
  }
  ctx.fillStyle = isFlashing
    ? `rgba(255, 255, 255, ${0.7 + 0.3 * (paddle.flash / 8)})`
    : 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
  ctx.fill();
  ctx.restore();
}

function draw() {
  const shakeX = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
  const shakeY = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawField();

  for (let i = 1; i < trail.length; i++) {
    const fraction = i / trail.length;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${fraction * 0.22})`;
    ctx.lineWidth = fraction * BALL_RADIUS * 1.4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  for (const particle of particles) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particle.rgb}, ${particle.life * 0.9})`;
    ctx.fill();
  }

  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function resetMatch() {
  scores.value.left = 0;
  scores.value.right = 0;
  trail = [];
  particles = [];
}

function resetPositions() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.speed = ball.baseSpeed;
  ball.dx = 0;
  ball.dy = 0;
  leftPaddle.y = PADDLE_Y;
  rightPaddle.y = PADDLE_Y;
  trail = [];
  isResetting = true;
  serveBall();
}

function showStartScreen() {
  status.value = 'start';
  cancelServe();
  pause();
  resetMatch();
  drawField();
}

function startGame(mode) {
  gameMode = mode;
  status.value = 'playing';
  isPaused.value = false;
  resetMatch();
  getAudioCtx();
  resetPositions();
  resume();
}

function togglePause() {
  if (status.value !== 'playing') return;
  isPaused.value = !isPaused.value;
  if (isPaused.value) pause();
  else resume();
}

function checkWin() {
  if (scores.value.left < WIN_SCORE && scores.value.right < WIN_SCORE) {
    resetPositions();
    return;
  }
  status.value = 'over';
  pause();
  const rightWon = scores.value.right >= WIN_SCORE;
  if (gameMode === 'cpu') outcome.value = rightWon ? 'YOU WIN!' : 'COMPUTER WINS!';
  else outcome.value = rightWon ? 'RIGHT PLAYER WINS!' : 'LEFT PLAYER WINS!';
}

function updatePaddles(dt) {
  if (rightUp.value) rightPaddle.y -= rightPaddle.speed * dt;
  if (rightDown.value) rightPaddle.y += rightPaddle.speed * dt;

  if (gameMode === 'cpu') {
    const target = ball.y - PADDLE_HEIGHT / 2;
    const move = clamp((target - leftPaddle.y) * 0.18, -leftPaddle.aiSpeed, leftPaddle.aiSpeed);
    leftPaddle.y += move * dt;
  } else {
    if (leftUp.value) leftPaddle.y -= leftPaddle.speed * dt;
    if (leftDown.value) leftPaddle.y += leftPaddle.speed * dt;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, HEIGHT - PADDLE_HEIGHT);
  rightPaddle.y = clamp(rightPaddle.y, 0, HEIGHT - PADDLE_HEIGHT);
}

function updateBallWallCollision() {
  if (ball.y - BALL_RADIUS < 0) ball.y = BALL_RADIUS;
  else if (ball.y + BALL_RADIUS > HEIGHT) ball.y = HEIGHT - BALL_RADIUS;
  else return;

  ball.dy *= -1;
  beep(220, 0.07);
  shakeFrames = 4;
  shakeIntensity = 2;
}

function updateBallPaddleCollision() {
  const paddle = ball.x < WIDTH / 2 ? leftPaddle : rightPaddle;
  if (!hitsPaddle(paddle)) return;

  const hitOffset = clamp((ball.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2), -1, 1);
  const angle = (Math.PI / 4) * hitOffset;
  const dir = ball.x < WIDTH / 2 ? 1 : -1;
  ball.speed = Math.min(ball.speed + 0.45, 16);
  ball.dx = dir * ball.speed * Math.cos(angle);
  ball.dy = ball.speed * Math.sin(angle);
  if (paddle === leftPaddle) {
    ball.x = leftPaddle.x + PADDLE_WIDTH + BALL_RADIUS;
    leftPaddle.flash = 8;
  } else {
    ball.x = rightPaddle.x - BALL_RADIUS;
    rightPaddle.flash = 8;
  }
  beep(300 + Math.abs(hitOffset) * 100, 0.07, 'square');
  shakeFrames = 6;
  shakeIntensity = 3.5;
}

function updateBallScoring() {
  const scorer = ball.x < 0 ? 'right' : ball.x > WIDTH ? 'left' : null;
  if (!scorer) return;

  spawnParticles(
    scorer === 'right' ? 0 : WIDTH,
    ball.y,
    scorer === 'right' ? '255,100,100' : '100,200,255',
  );
  scores.value[scorer]++;
  beep(140, 0.35, 'sawtooth', 0.2);
  shakeFrames = 14;
  shakeIntensity = 7;
  checkWin();
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.92 ** dt;
    particle.vy *= 0.92 ** dt;
    particle.life -= particle.decay * dt;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}

function update(dt) {
  if (isPaused.value) return;

  updatePaddles(dt);

  if (leftPaddle.flash > 0) leftPaddle.flash -= dt;
  if (rightPaddle.flash > 0) rightPaddle.flash -= dt;
  if (shakeFrames > 0) shakeFrames -= dt;

  if (!isResetting) {
    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > 10) trail.shift();

    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    updateBallWallCollision();
    updateBallPaddleCollision();
    updateBallScoring();
  }

  updateParticles(dt);
}

onGameKey(['Escape', 'p'], (event) => {
  event.preventDefault();
  togglePause();
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
    drawField();
  },
  { flush: 'post' },
);

onScopeDispose(() => {
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close();
  }
});
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <canvas ref="canvas"></canvas>
        <div v-if="status === 'start'" class="overlay-msg">
          <h2 class="menu-title">PONG</h2>
          <div class="overlay-actions">
            <button class="overlay-btn" @click="startGame('cpu')">1 PLAYER</button>
            <button class="overlay-btn" @click="startGame('pvp')">2 PLAYERS</button>
          </div>
        </div>
        <div v-else-if="status === 'over'" class="overlay-msg">
          <h2 class="menu-title">GAME OVER</h2>
          <div class="outcome">{{ outcome }}</div>
          <button class="overlay-btn" @click="showStartScreen">MENU</button>
        </div>
        <div v-else-if="isPaused" class="overlay-msg">
          <h2 class="menu-title">PAUSED</h2>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Pong</h1>
        <div class="info-box score-box">
          <div class="label score-label">Score</div>
          <div class="value score-value">{{ scores.left }} - {{ scores.right }}</div>
        </div>
        <GameControls
          :controls="[
            { action: 'Left Paddle', key: ['WIDTH', 'S'] },
            { action: 'Right Paddle', key: ['↑', '↓'] },
            { action: 'Pause', key: 'Esc' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.left-section {
  width: 724px;
  height: 524px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-actions {
  display: flex;
  gap: 10px;
}

canvas {
  background-color: #0d0d0d;
  border-radius: 8px;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
  border: 1px solid #333333;
}

.outcome {
  color: var(--color-muted);
  margin-bottom: 20px;
  font-size: 14px;
}

.score-box {
  min-height: 100px;
}
</style>
