<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const GRID = 20;
const CELL = 22;
const CANVAS = GRID * CELL;
const MAX_FRAME_MS = 50;

const highScore = useStorage("snake-high-score", 0);

const canvasRef = ref(null);
const scoreRef = ref(0);
const phase = ref("idle");
const isNewBest = ref(false);

let ctx = null;
let dpr = 1;
let rafId = 0;
let lastTs = 0;
let acc = 0;
let tickMs = 130;
/** 0–1 progress within current tick (smooth slide to next grid state) */
let alpha = 1;

let snake = [];
let snakeBefore = [];
let dir = { dx: 1, dy: 0 };
/** Buffered turns (max 2) so rapid keypresses are not lost between ticks */
let dirQueue = [];
let food = { x: 0, y: 0 };

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function syncSnakeBefore() {
  snakeBefore = snake.map((s) => ({ x: s.x, y: s.y }));
}

function spawnFood() {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  let p;
  let guard = 0;
  do {
    p = { x: randInt(GRID - 1), y: randInt(GRID - 1) };
    guard++;
  } while (occupied.has(`${p.x},${p.y}`) && guard < 500);
  food = p;
}

function resetPlaying() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dir = { dx: 1, dy: 0 };
  dirQueue = [];
  spawnFood();
  scoreRef.value = 0;
  tickMs = 130;
  acc = 0;
  lastTs = 0;
  alpha = 1;
  isNewBest.value = false;
  syncSnakeBefore();
  phase.value = "playing";
}

function enqueueDir(ndx, ndy) {
  if (phase.value !== "playing") return;
  let rdx = dir.dx;
  let rdy = dir.dy;
  if (dirQueue.length > 0) {
    const last = dirQueue[dirQueue.length - 1];
    rdx = last.dx;
    rdy = last.dy;
  }
  if (ndx === -rdx && ndy === -rdy) return;
  if (ndx === rdx && ndy === rdy) return;
  if (dirQueue.length < 2) {
    dirQueue.push({ dx: ndx, dy: ndy });
  } else {
    dirQueue[1] = { dx: ndx, dy: ndy };
  }
}

function step() {
  snakeBefore = snake.map((s) => ({ x: s.x, y: s.y }));

  if (dirQueue.length > 0) {
    const next = dirQueue.shift();
    if (!(next.dx === -dir.dx && next.dy === -dir.dy)) {
      dir = next;
    }
  }

  const head = snake[0];
  const newHead = { x: head.x + dir.dx, y: head.y + dir.dy };

  if (
    newHead.x < 0 ||
    newHead.x >= GRID ||
    newHead.y < 0 ||
    newHead.y >= GRID
  ) {
    endGame();
    return;
  }

  const ate = newHead.x === food.x && newHead.y === food.y;

  snake.unshift(newHead);
  if (ate) {
    scoreRef.value += 1;
    tickMs = Math.max(68, 130 - scoreRef.value * 2);
    spawnFood();
  } else {
    snake.pop();
  }

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      endGame();
      return;
    }
  }
}

function endGame() {
  phase.value = "gameover";
  alpha = 1;
  syncSnakeBefore();
  if (scoreRef.value > highScore.value) {
    highScore.value = scoreRef.value;
    isNewBest.value = true;
  }
}

/** Pixel centers for each chain link, interpolated between logical steps */
function getSnakePoints() {
  const t = phase.value === "playing" ? alpha : 1;
  const pts = [];
  for (let i = 0; i < snake.length; i++) {
    let gx;
    let gy;
    if (i < snakeBefore.length) {
      gx = snakeBefore[i].x + (snake[i].x - snakeBefore[i].x) * t;
      gy = snakeBefore[i].y + (snake[i].y - snakeBefore[i].y) * t;
    } else {
      const prev = snakeBefore[snakeBefore.length - 1];
      const cur = snake[i];
      gx = prev.x + (cur.x - prev.x) * t;
      gy = prev.y + (cur.y - prev.y) * t;
    }
    pts.push({ x: (gx + 0.5) * CELL, y: (gy + 0.5) * CELL });
  }
  return pts;
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS);
  g.addColorStop(0, "#152028");
  g.addColorStop(0.45, "#0d1418");
  g.addColorStop(1, "#080c10");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS, CANVAS);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, CANVAS - 1, CANVAS - 1);
}

function drawFood(ts) {
  const bob = Math.sin(ts * 0.003) * 1.2;
  const cx = (food.x + 0.5) * CELL;
  const cy = (food.y + 0.5) * CELL + bob;
  const r = CELL * 0.38;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  glow.addColorStop(0, "rgba(255, 90, 90, 0.45)");
  glow.addColorStop(0.5, "rgba(255, 60, 80, 0.12)");
  glow.addColorStop(1, "rgba(255, 40, 60, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  body.addColorStop(0, "#ff8a8a");
  body.addColorStop(0.55, "#ff4757");
  body.addColorStop(1, "#c62a3a");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,220,200,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnakeTube(pts) {
  if (pts.length === 0) return;

  const thick = CELL * 0.82;
  const headR = CELL * 0.48;

  ctx.save();
  ctx.shadowColor = "rgba(46, 213, 115, 0.35)";
  ctx.shadowBlur = 12;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (pts.length === 1) {
    const g = ctx.createRadialGradient(
      pts[0].x,
      pts[0].y,
      0,
      pts[0].x,
      pts[0].y,
      headR,
    );
    g.addColorStop(0, "#5cff9a");
    g.addColorStop(1, "#1fa855");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawSnakeHead(pts[0], null);
    return;
  }

  const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts.at(-1).x, pts.at(-1).y);
  grad.addColorStop(0, "#5cff9a");
  grad.addColorStop(0.35, "#2ed573");
  grad.addColorStop(1, "#169650");

  ctx.strokeStyle = grad;
  ctx.lineWidth = thick;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  for (let i = 1; i < pts.length; i++) {
    const t = i / (pts.length - 1);
    const r = (CELL * 0.42) * (1 - t * 0.15);
    ctx.fillStyle = `rgba(30, 180, 95, ${0.35 + (1 - t) * 0.4})`;
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const hg = ctx.createRadialGradient(
    pts[0].x - 2,
    pts[0].y - 2,
    0,
    pts[0].x,
    pts[0].y,
    headR,
  );
  hg.addColorStop(0, "#8fffbe");
  hg.addColorStop(0.55, "#3ae884");
  hg.addColorStop(1, "#14924a");
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(pts[0].x, pts[0].y, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(pts[0].x, pts[0].y, headR, 0, Math.PI * 2);
  ctx.stroke();

  drawSnakeHead(pts[0], pts[1]);
}

function drawSnakeHead(head, next) {
  let ang = 0;
  if (next) {
    ang = Math.atan2(head.y - next.y, head.x - next.x);
  } else {
    ang = Math.atan2(dir.dy, dir.dx);
  }
  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);

  const eyeX = CELL * 0.18;
  const eyeY = CELL * 0.16;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.ellipse(eyeX, -eyeY, 2.8, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(eyeX, eyeY, 2.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0a1620";
  ctx.beginPath();
  ctx.arc(eyeX + 0.8, -eyeY, 1.4, 0, Math.PI * 2);
  ctx.arc(eyeX + 0.8, eyeY, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function overlayText(title, sub, small) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const stroke = "rgba(0,0,0,0.55)";
  const w = 3;

  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.strokeStyle = stroke;
  ctx.lineWidth = w;
  ctx.lineJoin = "round";
  ctx.strokeText(title, CANVAS / 2, CANVAS / 2 - 18);
  ctx.fillStyle = "#fff";
  ctx.fillText(title, CANVAS / 2, CANVAS / 2 - 18);

  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeText(sub, CANVAS / 2, CANVAS / 2 + 10);
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(sub, CANVAS / 2, CANVAS / 2 + 10);

  if (small) {
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeText(small, CANVAS / 2, CANVAS / 2 + 28);
    ctx.fillStyle = "#64748b";
    ctx.fillText(small, CANVAS / 2, CANVAS / 2 + 28);
  }
}

function draw(ts) {
  if (!ctx) return;

  drawBackground();
  drawFood(ts);

  const pts = getSnakePoints();
  drawSnakeTube(pts);

  if (phase.value === "idle") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    overlayText("Snake", "Enter / Start", null);
  } else if (phase.value === "paused") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("Paused", CANVAS / 2, CANVAS / 2);
  } else if (phase.value === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    ctx.textAlign = "center";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("Game Over", CANVAS / 2, CANVAS / 2 - 28);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Score ${scoreRef.value}`, CANVAS / 2, CANVAS / 2 - 2);
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("R · Play again", CANVAS / 2, CANVAS / 2 + 22);
  }
}

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  const raw = ts - lastTs;
  lastTs = ts;
  const dt = Math.min(raw, MAX_FRAME_MS);

  if (phase.value === "playing") {
    acc += dt;
    while (acc >= tickMs && phase.value === "playing") {
      acc -= tickMs;
      step();
    }
    alpha = acc / tickMs;
  }

  draw(ts);
}

function setupCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS * dpr;
  canvas.height = CANVAS * dpr;
  canvas.style.width = `${CANVAS}px`;
  canvas.style.height = `${CANVAS}px`;
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function handleKeydown(e) {
  if (e.code === "Escape") {
    e.preventDefault();
    if (phase.value === "playing") {
      phase.value = "paused";
    } else if (phase.value === "paused") {
      phase.value = "playing";
      lastTs = 0;
    }
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();
    if (phase.value === "playing") {
      phase.value = "paused";
    } else if (phase.value === "paused") {
      phase.value = "playing";
      lastTs = 0;
    }
    return;
  }

  if (e.code === "KeyR" || e.key?.toLowerCase() === "r") {
    e.preventDefault();
    if (phase.value === "gameover" || phase.value === "paused") {
      resetPlaying();
    }
    return;
  }

  if (e.key === "Enter" && phase.value === "idle") {
    resetPlaying();
    return;
  }

  if (phase.value !== "playing") return;

  if (
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    e.preventDefault();
  }

  switch (e.code) {
    case "ArrowUp":
      enqueueDir(0, -1);
      break;
    case "ArrowDown":
      enqueueDir(0, 1);
      break;
    case "ArrowLeft":
      enqueueDir(-1, 0);
      break;
    case "ArrowRight":
      enqueueDir(1, 0);
      break;
    case "KeyW":
      enqueueDir(0, -1);
      break;
    case "KeyS":
      enqueueDir(0, 1);
      break;
    case "KeyA":
      enqueueDir(-1, 0);
      break;
    case "KeyD":
      enqueueDir(1, 0);
      break;
    default:
      break;
  }
}

onMounted(() => {
  setupCanvas();
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  syncSnakeBefore();
  spawnFood();
  window.addEventListener("keydown", handleKeydown);
  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  cancelAnimationFrame(rafId);
});

function resumeGame() {
  phase.value = "playing";
  lastTs = 0;
}
</script>

<template>
  <div class="game-page-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div class="canvas-wrap">
            <canvas
              ref="canvasRef"
              class="game-canvas"
              width="440"
              height="440"
              aria-label="Snake game board"
            />
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Snake</h1>

          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value">{{ scoreRef }}</div>

            <div class="score-divider"></div>

            <div
              class="label"
              style="font-size: 11px; color: #94a3b8; margin-bottom: 2px"
            >
              HIGH SCORE
            </div>
            <div class="value high-score-value">{{ highScore }}</div>
          </div>

          <p v-if="isNewBest && phase === 'gameover'" class="new-best">
            New best score!
          </p>

          <div class="btn-row">
            <button
              v-if="phase === 'idle' || phase === 'gameover'"
              type="button"
              class="action-btn"
              @click="resetPlaying"
            >
              {{ phase === "idle" ? "Start" : "Play again" }}
            </button>
            <button
              v-if="phase === 'playing'"
              type="button"
              class="action-btn ghost"
              @click="phase = 'paused'"
            >
              Pause
            </button>
            <button
              v-if="phase === 'paused'"
              type="button"
              class="action-btn"
              @click="resumeGame"
            >
              Resume
            </button>
          </div>

          <div class="controls-container">
            <div class="control-item">
              <span>Move</span>
              <span class="key">Arrows · WASD</span>
            </div>
            <div class="control-item">
              <span>Pause</span>
              <span class="key">Space · Esc</span>
            </div>
            <div class="control-item">
              <span>Restart</span>
              <span class="key">R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page-wrapper {
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
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.canvas-wrap {
  line-height: 0;
  border-radius: 8px;
  overflow: hidden;
}

.game-canvas {
  display: block;
  border-radius: 8px;
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
  aspect-ratio: auto;
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

.score-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
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
  word-break: break-all;
  line-height: 1;
}

.score-value {
  font-size: 42px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.high-score-value {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.new-best {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  background: white;
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 10px 18px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn:hover {
  opacity: 0.88;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.controls-container {
  margin-top: 4px;
  padding: 0 4px;
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
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
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
