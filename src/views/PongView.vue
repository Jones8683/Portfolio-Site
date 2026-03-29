<script setup>
import { onMounted, onUnmounted } from "vue";
import GameMobileMessage from "../components/GameMobileMessage.vue";

let canvas, ctx, animationId;

const WIN_SCORE = 7;
const PADDLE_W = 12;
const PADDLE_H = 85;
const BALL_R = 7;
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;

let gameMode = "cpu";
let isPaused = false;
let isRunning = false;
let isResetting = false;
let lastTs = 0;

const leftPaddle = {
  x: 20,
  y: 210,
  score: 0,
  speed: 10.5,
  aiSpeed: 5.7,
  flash: 0,
};
const rightPaddle = { x: 668, y: 210, score: 0, speed: 10.5, flash: 0 };
const ball = { x: 350, y: 250, dx: 0, dy: 0, speed: 4, baseSpeed: 4 };

let trail = [];
let particles = [];
let shakeFrames = 0;
let shakeIntensity = 0;

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx && typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(freq, duration, type = "square", vol = 0.15) {
  const ac = getAudioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

function spawnParticles(x, y, color) {
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
      color,
    });
  }
}

const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

function showStartScreen() {
  isRunning = false;
  cancelAnimationFrame(animationId);
  document.getElementById("gameOverMsg").style.display = "none";
  document.getElementById("pauseMsg").style.display = "none";
  document.getElementById("startScreen").style.display = "flex";
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  trail = [];
  particles = [];
  document.getElementById("scoreDiv").innerText = "0 - 0";
  drawStatic();
}

function initGame(mode) {
  gameMode = mode;
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  trail = [];
  particles = [];
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameOverMsg").style.display = "none";
  document.getElementById("pauseMsg").style.display = "none";
  document.getElementById("scoreDiv").innerText = "0 - 0";
  isRunning = true;
  isPaused = false;
  keys.w = keys.s = keys.ArrowUp = keys.ArrowDown = false;
  getAudioCtx();
  resetPositions();
  lastTs = performance.now();
  gameLoop();
}

function resetPositions() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = ball.baseSpeed;
  ball.dx = 0;
  ball.dy = 0;
  leftPaddle.y = canvas.height / 2 - PADDLE_H / 2;
  rightPaddle.y = canvas.height / 2 - PADDLE_H / 2;
  trail = [];
  isResetting = true;
  setTimeout(() => {
    if (!isRunning) return;
    isResetting = false;
    const dir = Math.random() > 0.5 ? 1 : -1;
    ball.dx = dir * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed * 0.5;
  }, 1000);
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  document.getElementById("pauseMsg").style.display = isPaused
    ? "flex"
    : "none";
  if (!isPaused) {
    lastTs = performance.now();
    gameLoop();
  }
}

function updatePaddles(dt) {
  if (keys.ArrowUp) rightPaddle.y -= rightPaddle.speed * dt;
  if (keys.ArrowDown) rightPaddle.y += rightPaddle.speed * dt;

  if (gameMode === "cpu") {
    const target = ball.y - PADDLE_H / 2;
    let move = (target - leftPaddle.y) * 0.18;
    move = Math.max(-leftPaddle.aiSpeed, Math.min(leftPaddle.aiSpeed, move));
    leftPaddle.y += move * dt;
  } else {
    if (keys.w) leftPaddle.y -= leftPaddle.speed * dt;
    if (keys.s) leftPaddle.y += leftPaddle.speed * dt;
  }

  leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_H, leftPaddle.y));
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - PADDLE_H, rightPaddle.y),
  );
}

function updateBallWallCollision() {
  if (ball.y - BALL_R < 0) {
    ball.y = BALL_R;
    ball.dy *= -1;
    beep(220, 0.07);
    shakeFrames = 4;
    shakeIntensity = 2;
  } else if (ball.y + BALL_R > canvas.height) {
    ball.y = canvas.height - BALL_R;
    ball.dy *= -1;
    beep(220, 0.07);
    shakeFrames = 4;
    shakeIntensity = 2;
  }
}

function updateBallPaddleCollision() {
  const paddle = ball.x < canvas.width / 2 ? leftPaddle : rightPaddle;
  if (!collision(ball, paddle)) return;

  const cp = Math.max(
    -1,
    Math.min(1, (ball.y - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2)),
  );
  const angle = (Math.PI / 4) * cp;
  const dir = ball.x < canvas.width / 2 ? 1 : -1;
  ball.speed = Math.min(ball.speed + 0.45, 16);
  ball.dx = dir * ball.speed * Math.cos(angle);
  ball.dy = ball.speed * Math.sin(angle);
  if (paddle === leftPaddle) {
    ball.x = leftPaddle.x + PADDLE_W + BALL_R;
    leftPaddle.flash = 8;
  } else {
    ball.x = rightPaddle.x - BALL_R;
    rightPaddle.flash = 8;
  }
  beep(300 + Math.abs(cp) * 100, 0.07, "square");
  shakeFrames = 6;
  shakeIntensity = 3.5;
}

function updateBallScoring() {
  if (ball.x < 0) {
    spawnParticles(0, ball.y, "rgba(255,100,100,0.9)");
    rightPaddle.score++;
    beep(140, 0.35, "sawtooth", 0.2);
    shakeFrames = 14;
    shakeIntensity = 7;
    scoreUpdate();
  } else if (ball.x > canvas.width) {
    spawnParticles(canvas.width, ball.y, "rgba(100,200,255,0.9)");
    leftPaddle.score++;
    beep(140, 0.35, "sawtooth", 0.2);
    shakeFrames = 14;
    shakeIntensity = 7;
    scoreUpdate();
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.92, dt);
    p.vy *= Math.pow(0.92, dt);
    p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function update(dt) {
  if (isPaused) return;

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

function scoreUpdate() {
  document.getElementById("scoreDiv").innerText =
    `${leftPaddle.score} - ${rightPaddle.score}`;
  checkWin();
  if (isRunning) resetPositions();
}

function checkWin() {
  if (leftPaddle.score < WIN_SCORE && rightPaddle.score < WIN_SCORE) return;
  isRunning = false;
  let name = "";
  if (gameMode === "cpu") {
    name = rightPaddle.score >= WIN_SCORE ? "YOU WIN!" : "COMPUTER WINS!";
  } else {
    name =
      rightPaddle.score >= WIN_SCORE
        ? "RIGHT PLAYER WINS!"
        : "LEFT PLAYER WINS!";
  }
  document.getElementById("winnerName").innerText = name;
  document.getElementById("gameOverMsg").style.display = "flex";
}

function collision(b, p) {
  return (
    b.x + BALL_R > p.x &&
    b.x - BALL_R < p.x + PADDLE_W &&
    b.y + BALL_R > p.y &&
    b.y - BALL_R < p.y + PADDLE_H
  );
}

function drawStatic() {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
}

function drawCenterLine() {
  const segH = 18;
  const segGap = 12;
  const totalSegs = Math.floor(canvas.height / (segH + segGap));
  const startY = (canvas.height - totalSegs * (segH + segGap) + segGap) / 2;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let i = 0; i < totalSegs; i++) {
    const y = startY + i * (segH + segGap);
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 1.5, y, 3, segH, 2);
    ctx.fill();
  }
}

function draw() {
  const sx = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
  const sy = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;

  ctx.save();
  ctx.translate(sx, sy);

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);

  drawCenterLine();

  if (trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const frac = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(255,255,255,${frac * 0.22})`;
      ctx.lineWidth = frac * BALL_R * 1.4;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace("0.9", String(p.life * 0.9));
    ctx.fill();
  }

  const drawPaddle = (paddle) => {
    const isFlashing = paddle.flash > 0;
    ctx.save();
    if (isFlashing) {
      ctx.shadowColor = "white";
      ctx.shadowBlur = 24;
    }
    ctx.fillStyle = isFlashing
      ? `rgba(255,255,255,${0.7 + 0.3 * (paddle.flash / 8)})`
      : "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
    ctx.restore();
  };

  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function gameLoop(ts = performance.now()) {
  if (!isRunning || isPaused) return;
  const raw = ts - lastTs;
  lastTs = ts;
  const dt = Math.min(raw, 50) / STEP;
  update(dt);
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

const handleKeyDown = (e) => {
  if (["ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault();
  if (e.key === "Escape" || e.key.toLowerCase() === "p") {
    e.preventDefault();
    togglePause();
    return;
  }
  if (e.key.toLowerCase() === "w") keys.w = true;
  if (e.key.toLowerCase() === "s") keys.s = true;
  if (e.key === "ArrowUp") keys.ArrowUp = true;
  if (e.key === "ArrowDown") keys.ArrowDown = true;
};

const handleKeyUp = (e) => {
  if (e.key.toLowerCase() === "w") keys.w = false;
  if (e.key.toLowerCase() === "s") keys.s = false;
  if (e.key === "ArrowUp") keys.ArrowUp = false;
  if (e.key === "ArrowDown") keys.ArrowDown = false;
};

const handleBlur = () => {
  if (isRunning && !isPaused) togglePause();
};

onMounted(() => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);
  drawStatic();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("blur", handleBlur);
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="pong-container">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <canvas id="gameCanvas" width="700" height="500"></canvas>
          <div id="startScreen" class="overlay" style="display: flex">
            <h2 class="menu-title">PONG</h2>
            <button class="menu-btn" @click="initGame('cpu')">1 PLAYER</button>
            <button class="menu-btn" @click="initGame('pvp')">2 PLAYERS</button>
          </div>
          <div id="gameOverMsg" class="overlay">
            <h2 class="menu-title">GAME OVER</h2>
            <div
              style="color: #94a3b8; margin-bottom: 20px; font-size: 14px"
              id="winnerName"
            >
              PLAYER 1 WINS
            </div>
            <button class="menu-btn" @click="showStartScreen">MENU</button>
          </div>
          <div
            id="pauseMsg"
            class="overlay"
            style="background: rgba(0, 0, 0, 0.6)"
          >
            <h2 class="menu-title">PAUSED</h2>
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Pong</h1>
          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value" id="scoreDiv">0 - 0</div>
          </div>
          <div class="controls-container">
            <div class="control-item">
              <span>Left Paddle</span>
              <div><span class="key">W</span> <span class="key">S</span></div>
            </div>
            <div class="control-item">
              <span>Right Paddle</span>
              <div><span class="key">↑</span> <span class="key">↓</span></div>
            </div>
            <div class="control-item">
              <span>Pause</span>
              <span class="key">ESC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pong-container {
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
  width: 724px;
  height: 524px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 220px;
  text-align: left;
}
.game-title {
  font-size: 72px;
  margin: 0 0 10px;
  letter-spacing: -4px;
  font-weight: 900;
  color: white;
  line-height: 1;
}
canvas {
  background-color: #0d0d0d;
  border-radius: 8px;
  display: block;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}
.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.score-box {
  min-height: 100px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.01)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
  font-weight: 700;
}
.score-label {
  color: #ffd700;
}
.score-value {
  font-size: 42px;
  color: #fff;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
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
.control-item:last-child {
  border-bottom: none;
}
.key {
  color: #fff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  min-width: 18px;
  text-align: center;
  display: inline-block;
}
.overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}
.menu-title {
  font-size: 32px;
  color: white;
  margin-bottom: 20px;
}
.menu-btn {
  background: white;
  color: black;
  border: none;
  padding: 12px 24px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 4px;
  margin: 5px;
  min-width: 140px;
}
.desktop-game {
  display: block;
}

@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
}
</style>
