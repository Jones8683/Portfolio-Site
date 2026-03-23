<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const W = 360;
const H = 420;
const PADDLE_W = 76;
const PADDLE_H = 11;
const PADDLE_Y = H - 40;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_TOP = 52;
const BRICK_GAP = 5;
const BRICK_H = 18;
const MAX_DT = 50;
const BASE_SPEED = 4.2;

const highScore = useStorage("breakout-high-score", 0);

const canvasRef = ref(null);
const scoreRef = ref(0);
const livesRef = ref(3);
const phase = ref("idle");
const isNewBest = ref(false);
const ballOnPaddle = ref(true);

let ctx = null;
let dpr = 1;
let rafId = 0;
let lastTs = 0;

let paddleX = W / 2 - PADDLE_W / 2;
let ball = { x: W / 2, y: PADDLE_Y - BALL_R - 1, dx: 0, dy: 0 };
let speed = BASE_SPEED;
let bricks = [];
let particles = [];

const keys = { left: false, right: false };

function pathRoundRect(c, x, y, w, h, r) {
  c.beginPath();
  if (typeof c.roundRect === "function") {
    c.roundRect(x, y, w, h, r);
  } else {
    const rad = Math.min(r, w / 2, h / 2);
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  }
}

function marginX() {
  return 18;
}

function brickWidth() {
  const mx = marginX();
  const total = W - mx * 2 - (BRICK_COLS - 1) * BRICK_GAP;
  return total / BRICK_COLS;
}

function buildBricks() {
  const bw = brickWidth();
  const mx = marginX();
  bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const hue = 195 + (r / BRICK_ROWS) * 85;
      const light = 0.55 + (c % 3) * 0.08;
      bricks.push({
        x: mx + c * (bw + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        w: bw,
        h: BRICK_H,
        alive: true,
        hue,
        light,
      });
    }
  }
}

function spawnParticles(x, y, hue) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.2 + Math.random() * 3.5;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 1,
      decay: 0.028 + Math.random() * 0.04,
      hue,
    });
  }
}

function resetBallOnPaddle() {
  paddleX = Math.max(8, Math.min(W - PADDLE_W - 8, paddleX));
  ball.x = paddleX + PADDLE_W / 2;
  ball.y = PADDLE_Y - BALL_R - 1;
  ball.dx = 0;
  ball.dy = 0;
  ballOnPaddle.value = true;
}

function launchBall() {
  if (!ballOnPaddle.value || phase.value !== "playing") return;
  const angle = (-Math.PI / 2) + (Math.random() * 0.5 - 0.25);
  ball.dx = Math.cos(angle) * speed;
  ball.dy = Math.sin(angle) * speed;
  ballOnPaddle.value = false;
}

function resetPlaying() {
  buildBricks();
  scoreRef.value = 0;
  livesRef.value = 3;
  speed = BASE_SPEED;
  particles = [];
  paddleX = W / 2 - PADDLE_W / 2;
  resetBallOnPaddle();
  isNewBest.value = false;
  phase.value = "playing";
}

function loseLife() {
  livesRef.value -= 1;
  particles = [];
  if (livesRef.value <= 0) {
    phase.value = "gameover";
    if (scoreRef.value > highScore.value) {
      highScore.value = scoreRef.value;
      isNewBest.value = true;
    }
    return;
  }
  resetBallOnPaddle();
}

function normBall() {
  const len = Math.hypot(ball.dx, ball.dy) || 1;
  ball.dx = (ball.dx / len) * speed;
  ball.dy = (ball.dy / len) * speed;
}

function update(dt) {
  if (phase.value !== "playing") return;

  const step = dt / 16.67;
  const move = 7.2 * step;

  if (keys.left) paddleX -= move;
  if (keys.right) paddleX += move;
  paddleX = Math.max(6, Math.min(W - PADDLE_W - 6, paddleX));

  if (ballOnPaddle.value) {
    ball.x = paddleX + PADDLE_W / 2;
    ball.y = PADDLE_Y - BALL_R - 1;
    return;
  }

  ball.x += ball.dx * step;
  ball.y += ball.dy * step;

  if (ball.x - BALL_R < 0) {
    ball.x = BALL_R;
    ball.dx *= -1;
  } else if (ball.x + BALL_R > W) {
    ball.x = W - BALL_R;
    ball.dx *= -1;
  }

  if (ball.y - BALL_R < 0) {
    ball.y = BALL_R;
    ball.dy *= -1;
  }

  const py = PADDLE_Y;
  if (
    ball.dy > 0 &&
    ball.y + BALL_R >= py &&
    ball.y + BALL_R <= py + PADDLE_H + 4 &&
    ball.x >= paddleX &&
    ball.x <= paddleX + PADDLE_W
  ) {
    ball.y = py - BALL_R;
    const hit = (ball.x - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
    ball.dy = -Math.abs(ball.dy);
    ball.dx += hit * 3.2;
    normBall();
  }

  for (const b of bricks) {
    if (!b.alive) continue;
    const cx = ball.x;
    const cy = ball.y;
    const nx = Math.max(b.x, Math.min(cx, b.x + b.w));
    const ny = Math.max(b.y, Math.min(cy, b.y + b.h));
    const ddx = cx - nx;
    const ddy = cy - ny;
    if (ddx * ddx + ddy * ddy >= BALL_R * BALL_R) continue;

    b.alive = false;
    scoreRef.value += 10;
    spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.hue);
    speed = Math.min(8.5, speed + 0.06);

    if (Math.abs(ddx) > Math.abs(ddy)) ball.dx *= -1;
    else ball.dy *= -1;

    normBall();
    break;
  }

  if (ball.y - BALL_R > H) {
    loseLife();
    return;
  }

  if (!bricks.some((b) => b.alive)) {
    phase.value = "win";
    speed = BASE_SPEED;
    if (scoreRef.value > highScore.value) {
      highScore.value = scoreRef.value;
      isNewBest.value = true;
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.vy += 0.15 * step;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#142030");
  g.addColorStop(1, "#0a1018");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
}

function drawBricks() {
  for (const b of bricks) {
    if (!b.alive) continue;
    const { hue, light } = b;
    const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    g.addColorStop(0, `hsla(${hue}, 85%, ${light * 52 + 18}%, 1)`);
    g.addColorStop(1, `hsla(${hue + 12}, 70%, ${light * 35 + 12}%, 1)`);
    ctx.fillStyle = g;
    pathRoundRect(ctx, b.x, b.y, b.w, b.h, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawPaddle() {
  const x = paddleX;
  const y = PADDLE_Y;
  const g = ctx.createLinearGradient(x, y, x, y + PADDLE_H);
  g.addColorStop(0, "#5adbff");
  g.addColorStop(1, "#0088cc");
  ctx.fillStyle = g;
  pathRoundRect(ctx, x, y, PADDLE_W, PADDLE_H, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBall() {
  const g = ctx.createRadialGradient(
    ball.x - 2,
    ball.y - 2,
    0,
    ball.x,
    ball.y,
    BALL_R + 2,
  );
  g.addColorStop(0, "#fff8e8");
  g.addColorStop(0.45, "#ffd54a");
  g.addColorStop(1, "#c48000");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(180,100,0,0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, 1)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawHint(text, sub) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeText(text, W / 2, H / 2 - 16);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, W / 2, H / 2 - 16);
  if (sub) {
    ctx.font = "12px system-ui, sans-serif";
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeText(sub, W / 2, H / 2 + 12);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(sub, W / 2, H / 2 + 12);
  }
}

function draw(ts) {
  if (!ctx) return;
  drawBackground();
  drawBricks();
  drawPaddle();
  drawBall();
  drawParticles();

  if (phase.value === "idle") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    drawHint("Breakout", "Enter / Start");
  } else if (phase.value === "paused") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W / 2, H / 2);
  } else if (phase.value === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, W, H);
    drawHint("Game Over", `Score ${scoreRef.value} · R to retry`);
  } else if (phase.value === "win") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);
    drawHint("Cleared!", "R · Play again");
  } else if (phase.value === "playing" && ballOnPaddle.value) {
    const a = 0.75 + Math.sin(ts * 0.004) * 0.25;
    ctx.globalAlpha = a;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText("Space · Launch", W / 2, H / 2);
    ctx.globalAlpha = 1;
  }
}

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  const raw = ts - lastTs;
  lastTs = ts;
  const dt = Math.min(raw, MAX_DT);

  if (phase.value === "playing") {
    update(dt);
  }

  draw(ts);
}

function setupCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function onKeyDown(e) {
  if (e.code === "Space") {
    e.preventDefault();
    if (phase.value === "idle") {
      resetPlaying();
      return;
    }
    if (phase.value === "playing") {
      if (ballOnPaddle.value) launchBall();
      else phase.value = "paused";
      return;
    }
    if (phase.value === "paused") {
      phase.value = "playing";
      lastTs = 0;
    }
    return;
  }

  if (e.key.toLowerCase() === "r") {
    if (phase.value === "gameover" || phase.value === "win") {
      resetPlaying();
    }
    return;
  }

  if (e.key === "Enter" && phase.value === "idle") {
    resetPlaying();
    return;
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = true;
    e.preventDefault();
  }
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = true;
    e.preventDefault();
  }
}

function onKeyUp(e) {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = false;
}

function onMouseMove(e) {
  if (phase.value !== "playing" && phase.value !== "idle") return;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const mx = ((e.clientX - rect.left) / rect.width) * W;
  paddleX = Math.max(6, Math.min(W - PADDLE_W - 6, mx - PADDLE_W / 2));
  if (ballOnPaddle.value) {
    ball.x = paddleX + PADDLE_W / 2;
  }
}

function resumeGame() {
  phase.value = "playing";
  lastTs = 0;
}

onMounted(() => {
  setupCanvas();
  buildBricks();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="game-page-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div
            class="canvas-wrap"
            @mousemove="onMouseMove"
          >
            <canvas
              ref="canvasRef"
              class="game-canvas"
              width="360"
              height="420"
              aria-label="Breakout game"
            />
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Breakout</h1>

          <div class="row trio">
            <div class="info-box score-box">
              <div class="label score-label">Score</div>
              <div class="value score-value">{{ scoreRef }}</div>
            </div>
            <div class="info-box lives-box">
              <div class="label">Lives</div>
              <div class="value lives-value">{{ livesRef }}</div>
            </div>
            <div class="info-box best-box">
              <div class="label score-label gold">Best</div>
              <div class="value score-value gold">{{ highScore }}</div>
            </div>
          </div>

          <p v-if="isNewBest && (phase === 'gameover' || phase === 'win')" class="new-best">
            New best score!
          </p>

          <div class="btn-row">
            <button
              v-if="phase === 'idle' || phase === 'gameover' || phase === 'win'"
              type="button"
              class="action-btn"
              @click="resetPlaying"
            >
              {{
                phase === "idle"
                  ? "Start"
                  : phase === "win"
                    ? "Play again"
                    : "Try again"
              }}
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
              <span>Paddle</span>
              <span class="key">← → · A D · Mouse</span>
            </div>
            <div class="control-item">
              <span>Launch / Pause</span>
              <span class="key">Space</span>
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
  cursor: none;
}

.game-canvas {
  display: block;
  border-radius: 8px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 280px;
  text-align: left;
}

.game-title {
  font-size: 48px;
  margin: 0 0 6px;
  letter-spacing: -2px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.row.trio .info-box {
  min-height: 76px;
  padding: 8px 6px;
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
  flex: 1;
}

.score-box {
  background: linear-gradient(
    135deg,
    rgba(0, 162, 255, 0.1),
    rgba(0, 162, 255, 0.02)
  );
  border: 1px solid rgba(0, 162, 255, 0.28);
}

.lives-box {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 107, 0.08),
    rgba(255, 107, 107, 0.02)
  );
  border: 1px solid rgba(255, 107, 107, 0.22);
}

.best-box {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.06),
    rgba(255, 215, 0, 0.02)
  );
  border: 1px solid rgba(255, 215, 0, 0.28);
}

.label {
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
  font-weight: 700;
}

.score-label.gold {
  color: #ffd700;
}

.value {
  font-size: 26px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.score-value {
  color: #00a2ff;
  text-shadow: 0 0 10px rgba(0, 162, 255, 0.2);
}

.lives-value {
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.2);
}

.score-value.gold {
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
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
  gap: 8px;
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
  font-size: 9px;
  text-align: right;
  flex-shrink: 0;
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
