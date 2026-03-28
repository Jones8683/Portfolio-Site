<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const highScore = useStorage("flappy-best-score", 0, localStorage, {
  serializer: {
    read: (v) => {
      try {
        if (!v) return 0;
        const d = JSON.parse(atob(v));
        return d.k === "fb7" ? d.v : 0;
      } catch {
        return 0;
      }
    },
    write: (v) => btoa(JSON.stringify({ v, k: "fb7", t: Date.now() })),
  },
});

const scoreRef = ref(0);
const gameState = ref("idle");

const W = 360,
  H = 568;
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

let groundOff = 0,
  cityOff = 0,
  cloudOff = 0;
let canvas,
  ctx,
  dpr,
  raf,
  rafIdle,
  lastTs = 0;
let bird, pipes, score, lastPipeTs, deathTimer, isNewBest;

let isPaused = false;
let pauseTs = 0;

function initState() {
  bird = { x: 80, y: GROUND_Y / 2, vy: 0, angle: 0, flapT: 0 };
  pipes = [];
  score = 0;
  scoreRef.value = 0;
  lastPipeTs = -9999;
  deathTimer = 0;
  isNewBest = false;
  groundOff = 0;
}

function addPipe(ts) {
  const minTop = 60,
    maxTop = GROUND_Y - PIPE_GAP - 60;
  pipes.push({
    x: W + 10,
    topH: minTop + Math.random() * (maxTop - minTop),
    passed: false,
  });
  lastPipeTs = ts;
}

function hitTest() {
  const bx = bird.x,
    by = bird.y,
    br = 11;
  if (by + br >= GROUND_Y) return true;
  for (const p of pipes) {
    const inX = bx + br > p.x && bx - br < p.x + PIPE_W;
    if (inX && (by - br < p.topH || by + br > p.topH + PIPE_GAP)) return true;
  }
  return false;
}

function txt(str, x, y, size, fill, strokeCol) {
  ctx.save();
  ctx.font = `900 ${size}px 'Arial Black', Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (strokeCol) {
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = size * 0.22;
    ctx.lineJoin = "round";
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function drawSky() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
}

function drawClouds() {
  const clouds = [
    { ox: 30, y: 60, w: 80, h: 40 },
    { ox: 200, y: 90, w: 64, h: 32 },
    { ox: 310, y: 52, w: 72, h: 36 },
  ];
  ctx.fillStyle = "#fff";
  for (const c of clouds) {
    const wrap = W + c.w + 20;
    const x = ((c.ox - (cloudOff % wrap) + wrap * 2) % wrap) - c.w - 20;
    ctx.fillRect(x, c.y + c.h * 0.4, c.w, c.h * 0.6);
    ctx.fillRect(x + c.w * 0.1, c.y + c.h * 0.2, c.w * 0.5, c.h * 0.4);
    ctx.fillRect(x + c.w * 0.4, c.y, c.w * 0.4, c.h * 0.45);
  }
}

function drawCity() {
  const TILE_W = 720;
  const off = cityOff % TILE_W;

  const buildings = [
    { x: 0, w: 38, h: 90, windows: true, style: "wide" },
    { x: 40, w: 22, h: 55, windows: false, style: "thin" },
    { x: 64, w: 44, h: 130, windows: true, style: "tall" },
    { x: 110, w: 28, h: 70, windows: true, style: "wide" },
    { x: 140, w: 18, h: 48, windows: false, style: "thin" },
    { x: 160, w: 50, h: 110, windows: true, style: "tall" },
    { x: 212, w: 30, h: 65, windows: true, style: "wide" },
    { x: 244, w: 20, h: 42, windows: false, style: "thin" },
    { x: 266, w: 40, h: 95, windows: true, style: "wide" },
    { x: 308, w: 24, h: 58, windows: false, style: "thin" },
    { x: 334, w: 46, h: 120, windows: true, style: "tall" },
    { x: 382, w: 28, h: 72, windows: true, style: "wide" },
    { x: 412, w: 16, h: 44, windows: false, style: "thin" },
    { x: 430, w: 42, h: 100, windows: true, style: "tall" },
    { x: 474, w: 32, h: 60, windows: true, style: "wide" },
    { x: 508, w: 20, h: 50, windows: false, style: "thin" },
    { x: 530, w: 48, h: 115, windows: true, style: "tall" },
    { x: 580, w: 26, h: 68, windows: true, style: "wide" },
    { x: 608, w: 18, h: 40, windows: false, style: "thin" },
    { x: 628, w: 44, h: 88, windows: true, style: "wide" },
    { x: 674, w: 22, h: 54, windows: false, style: "thin" },
    { x: 698, w: 22, h: 78, windows: true, style: "wide" },
  ];

  for (let rep = -1; rep <= 2; rep++) {
    for (const b of buildings) {
      const rx = b.x - off + rep * TILE_W;
      if (rx + b.w < 0 || rx > W) continue;
      const by = GROUND_Y - b.h;

      ctx.fillStyle = "#3ea8b4";
      ctx.fillRect(rx, by, b.w, b.h);

      ctx.fillStyle = "#48bcc8";
      ctx.fillRect(rx, by, 3, b.h);

      ctx.fillStyle = "#329aa6";
      ctx.fillRect(rx + b.w - 3, by, 3, b.h);

      ctx.fillStyle = "#52cad6";
      ctx.fillRect(rx, by, b.w, 2);

      if (b.style === "tall") {
        ctx.fillStyle = "#3ea8b4";
        ctx.fillRect(rx + Math.floor(b.w / 2) - 1, by - 12, 2, 12);
        ctx.fillRect(rx + Math.floor(b.w / 2) - 3, by - 14, 6, 3);
      }

      if (b.windows) {
        const ww = 5,
          wh = 5,
          gx = 8,
          gy = 9;
        const cols = Math.floor((b.w - 6) / (ww + gx)) || 1;
        const rows = Math.floor((b.h - 10) / (wh + gy));
        const startX = rx + Math.floor((b.w - cols * (ww + gx) + gx) / 2);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const wx = startX + col * (ww + gx);
            const wy = by + 8 + row * (wh + gy);
            const lit = (row * 3 + col * 7 + b.x) % 5 !== 0;
            ctx.fillStyle = lit
              ? "rgba(255, 240, 180, 0.55)"
              : "rgba(0,0,0,0.2)";
            ctx.fillRect(wx, wy, ww, wh);
          }
        }
      }
    }
  }
}

function drawGround() {
  const SAND_Y = GROUND_Y + 18;

  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, SAND_Y, W, H - SAND_Y);

  ctx.fillStyle = "#ccc07a";
  ctx.fillRect(0, SAND_Y, W, 4);
  ctx.fillStyle = "#d4c882";
  ctx.fillRect(0, SAND_Y + 4, W, 3);

  ctx.fillStyle = "#74bf2e";
  ctx.fillRect(0, GROUND_Y, W, 18);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, GROUND_Y, W, 18);
  ctx.clip();
  ctx.strokeStyle = "#5aa820";
  ctx.lineWidth = 3;
  const stripeOff = Math.round(-groundOff % 20);
  for (let x = stripeOff - 40; x < W + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 18, GROUND_Y + 18);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "#a0e050";
  ctx.fillRect(0, GROUND_Y, W, 2);
  ctx.fillStyle = "#4a9c18";
  ctx.fillRect(0, GROUND_Y + 15, W, 3);
}

function drawPipes() {
  for (const p of pipes) {
    const botY = p.topH + PIPE_GAP;
    const bodyX = p.x + 3;
    const bodyW = PIPE_W - 6;
    const capX = p.x;
    const capW = PIPE_W;
    const capH = 26;

    ctx.fillStyle = "#5dbe2b";
    ctx.fillRect(bodyX, 0, bodyW, p.topH - capH);
    ctx.fillStyle = "#72d93e";
    ctx.fillRect(bodyX + 4, 0, 8, p.topH - capH);
    ctx.fillStyle = "#4aa620";
    ctx.fillRect(bodyX + bodyW - 8, 0, 8, p.topH - capH);

    ctx.fillStyle = "#5dbe2b";
    ctx.fillRect(capX, p.topH - capH, capW, capH);
    ctx.fillStyle = "#72d93e";
    ctx.fillRect(capX + 4, p.topH - capH, 10, capH);
    ctx.fillStyle = "#4aa620";
    ctx.fillRect(capX + capW - 10, p.topH - capH, 10, capH);
    ctx.fillStyle = "#8aee50";
    ctx.fillRect(capX, p.topH - capH, capW, 3);
    ctx.fillStyle = "#3a8a10";
    ctx.fillRect(capX, p.topH - 3, capW, 3);

    ctx.fillStyle = "#5dbe2b";
    ctx.fillRect(capX, botY, capW, capH);
    ctx.fillStyle = "#72d93e";
    ctx.fillRect(capX + 4, botY, 10, capH);
    ctx.fillStyle = "#4aa620";
    ctx.fillRect(capX + capW - 10, botY, 10, capH);
    ctx.fillStyle = "#3a8a10";
    ctx.fillRect(capX, botY, capW, 3);
    ctx.fillStyle = "#8aee50";
    ctx.fillRect(capX, botY + capH - 3, capW, 3);

    ctx.fillStyle = "#5dbe2b";
    ctx.fillRect(bodyX, botY + capH, bodyW, GROUND_Y - (botY + capH));
    ctx.fillStyle = "#72d93e";
    ctx.fillRect(bodyX + 4, botY + capH, 8, GROUND_Y - (botY + capH));
    ctx.fillStyle = "#4aa620";
    ctx.fillRect(bodyX + bodyW - 8, botY + capH, 8, GROUND_Y - (botY + capH));
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  const targetAngle =
    bird.vy < 0
      ? Math.max(-0.4, bird.vy * 0.06)
      : Math.min(1.3, bird.vy * 0.09);
  bird.angle += (targetAngle - bird.angle) * 0.25;
  ctx.rotate(bird.angle);

  const R = 13;

  ctx.fillStyle = "#f8d030";
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b87800";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();

  const wingY =
    gameState.value === "dead" ? 0 : Math.sin(Date.now() * 0.015) * 3.5;
  ctx.fillStyle = "#d98c10";
  ctx.beginPath();
  ctx.ellipse(-2, 2 + wingY, 9, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a06000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-2, 2 + wingY, 9, 5, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fff8c0";
  ctx.beginPath();
  ctx.ellipse(2, 3, 7.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(7.5, -3.5, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(8.5, -4.8, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f07010";
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.lineTo(19, -0.5);
  ctx.lineTo(18, 3.5);
  ctx.lineTo(8, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#b85000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.lineTo(19, -0.5);
  ctx.lineTo(18, 3.5);
  ctx.lineTo(8, 3.5);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "#b85000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, 0.8);
  ctx.lineTo(17, 0.8);
  ctx.stroke();

  ctx.restore();
}

function drawScore() {
  txt(String(score), W / 2, 48, 46, "#fff", "#3a2a10");
}

function drawIdle() {
  const a = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
  ctx.globalAlpha = a;
  txt("Tap or press SPACE", W / 2, GROUND_Y / 2 + 60, 16, "#fff", "#2a1a00");
  ctx.globalAlpha = 1;
}

function drawDead() {
  const flash = Math.max(0, 0.55 - deathTimer * 0.027);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (deathTimer < 20) return;

  txt("GAME OVER", W / 2, GROUND_Y / 2 - 10, 32, "#fff", "#3a2a10");

  if (deathTimer > 50) {
    const a = 0.7 + Math.sin(Date.now() * 0.007) * 0.3;
    ctx.globalAlpha = a;
    txt("Tap to retry", W / 2, GROUND_Y / 2 + 36, 16, "#fff", "#3a2a10");
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
  if (gameState.value === "idle") drawIdle();
  if (gameState.value === "dead") drawDead();
}

function gameLoop(ts) {
  if (isPaused) return;
  const dt = Math.min(ts - lastTs, 50) / STEP;
  lastTs = ts;

  if (gameState.value === "playing") {
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
        score++;
        scoreRef.value = score;
        if (score > highScore.value) {
          highScore.value = score;
          isNewBest = true;
        }
      }
    }
    pipes = pipes.filter((p) => p.x + PIPE_W > -10);
    if (hitTest()) gameState.value = "dead";
  }

  if (gameState.value === "dead") {
    deathTimer++;
    bird.vy = Math.min(bird.vy + GRAVITY * 1.6 * dt, MAX_FALL);
    bird.y = Math.min(bird.y + bird.vy * dt, GROUND_Y - 13);
    cloudOff += PIPE_SPEED * 0.04 * dt;
  }

  render();
  raf = requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (gameState.value !== "playing") return;
  isPaused = !isPaused;
  const msg = document.getElementById("pauseMsg");
  if (msg) msg.style.display = isPaused ? "flex" : "none";
  if (isPaused) {
    pauseTs = performance.now();
  } else {
    const pausedFor = performance.now() - pauseTs;
    lastTs = performance.now();
    lastPipeTs += pausedFor;
    raf = requestAnimationFrame(gameLoop);
  }
}

const onBlur = () => {
  if (gameState.value === "playing" && !isPaused) togglePause();
};

function idleLoop() {
  bird.y = GROUND_Y / 2 + Math.sin(Date.now() * 0.003) * 8;
  bird.angle = 0;
  bird.flapT += 0.08;
  cloudOff += 0.15;
  render();
  rafIdle = requestAnimationFrame(idleLoop);
}

function jump() {
  if (isPaused) return;
  if (gameState.value === "idle") {
    cancelAnimationFrame(rafIdle);
    gameState.value = "playing";
    bird.vy = JUMP_VY;
    lastPipeTs = performance.now();
    lastTs = performance.now();
    raf = requestAnimationFrame(gameLoop);
  } else if (gameState.value === "playing") {
    bird.vy = JUMP_VY;
  } else if (gameState.value === "dead" && deathTimer > 50) {
    cancelAnimationFrame(raf);
    initState();
    gameState.value = "idle";
    render();
    rafIdle = requestAnimationFrame(idleLoop);
  }
}

const onKey = (e) => {
  if (e.code === "Escape" || e.code === "KeyP") {
    e.preventDefault();
    togglePause();
    return;
  }
  if (isPaused) return;
  if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
    e.preventDefault();
    jump();
  }
};

onMounted(() => {
  canvas = document.getElementById("flappyCanvas");
  ctx = canvas.getContext("2d");
  dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
  document.addEventListener("keydown", onKey);
  canvas.addEventListener("mousedown", jump);
  window.addEventListener("blur", onBlur);
  initState();
  render();
  rafIdle = requestAnimationFrame(idleLoop);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKey);
  canvas?.removeEventListener("mousedown", jump);
  window.removeEventListener("blur", onBlur);
  cancelAnimationFrame(raf);
  cancelAnimationFrame(rafIdle);
});
</script>

<template>
  <div class="flappy-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <canvas id="flappyCanvas"></canvas>
          <div
            id="pauseMsg"
            class="overlay-msg"
            style="display: none; background: rgba(0, 0, 0, 0.85)"
          >
            <h2
              style="
                font-size: 24px;
                color: white;
                margin: 0;
                letter-spacing: 2px;
              "
            >
              PAUSED
            </h2>
          </div>
        </div>
        <div class="right-section">
          <h1 class="game-title">Flappy<br />Bird</h1>
          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value">{{ scoreRef }}</div>
            <div
              style="
                width: 100%;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 8px 0;
              "
            ></div>
            <div
              class="label"
              style="font-size: 11px; color: #94a3b8; margin-bottom: 2px"
            >
              HIGH SCORE
            </div>
            <div
              class="value"
              style="
                font-size: 24px;
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
              "
            >
              {{ highScore }}
            </div>
          </div>
          <div class="controls-container">
            <div class="control-item">
              <span>Jump</span>
              <span class="key">Click</span>
            </div>
            <div class="control-item">
              <span>Alternative</span>
              <span class="key">SPACE</span>
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
.flappy-wrapper {
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
}
.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 240px;
  text-align: left;
}
.game-title {
  font-size: 72px;
  margin: 0 0 10px;
  letter-spacing: -4px;
  font-weight: 900;
  color: white;
  line-height: 1;
  text-align: left;
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
}
.score-box {
  min-height: 120px;
  width: 100%;
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
  margin-bottom: 4px;
}
.value {
  font-size: 20px;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.score-value {
  font-size: 42px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}
canvas {
  display: block;
  border-radius: 4px;
  cursor: pointer;
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
.overlay-msg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}
.mobile-msg {
  display: none;
}
.desktop-game {
  display: block;
}
@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
  .mobile-msg {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
    padding: 0 20px;
  }
}
</style>
