<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

let canvas, ctx;
let animationId = null;

const brickColors = [
  "#FF0D72",
  "#FF8E0D",
  "#FFE138",
  "#0DFF72",
  "#0DC2FF",
  "#F538FF",
];

const highScore = useStorage("breakout-best-score", 0, localStorage, {
  serializer: {
    read: (v) => {
      try {
        if (!v) return 0;
        const decoded = JSON.parse(atob(v));
        if (decoded.k !== "bk9" || typeof decoded.v !== "number") return 0;
        return decoded.v;
      } catch (e) {
        return 0;
      }
    },
    write: (v) => {
      const payload = { v: v, k: "bk9", t: Date.now() };
      return btoa(JSON.stringify(payload));
    },
  },
});

const gameState = ref({ score: 0, lives: 3, level: 1 });
let isGameOver = false;
let isPaused = false;
let hasStarted = false;

const ball = { x: 0, y: 0, dx: 0, dy: 0, radius: 6, speed: 6 };
const paddle = { x: 0, y: 0, w: 80, h: 12, speed: 8 };
let bricks = [];
let particles = [];

const brickConfig = {
  rows: 5,
  cols: 8,
  w: 42,
  h: 16,
  padding: 8,
  offsetTop: 50,
  offsetLeft: 14,
};
const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

function initLevel() {
  bricks = [];
  const currentRows = Math.min(
    brickConfig.rows + Math.floor(gameState.value.level / 2),
    10,
  );
  for (let c = 0; c < brickConfig.cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < currentRows; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1,
        color: brickColors[r % brickColors.length],
        points: (currentRows - r) * 10,
      };
    }
  }
}

function resetBallAndPaddle() {
  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.y = canvas.height - 30;
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball.radius - 1;
  ball.speed = 5 + gameState.value.level * 0.5;
  ball.dx = 0;
  ball.dy = 0;
  hasStarted = false;
}

function launchBall() {
  if (hasStarted || isPaused || isGameOver) return;
  hasStarted = true;
  const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
  ball.dx = ball.speed * Math.sin(angle);
  ball.dy = -ball.speed * Math.cos(angle);
}

function resetGame() {
  gameState.value.score = 0;
  gameState.value.lives = 3;
  gameState.value.level = 1;
  isGameOver = false;
  isPaused = false;
  particles = [];
  initLevel();
  resetBallAndPaddle();
  const goMsg = document.getElementById("gameOverMsg");
  if (goMsg) goMsg.style.display = "none";
  if (!animationId) update();
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color,
      size: Math.random() * 4 + 2,
    });
  }
}

function update() {
  if (isGameOver || isPaused) return;

  if ((keys.ArrowLeft || keys.a) && paddle.x > 0) paddle.x -= paddle.speed;
  if ((keys.ArrowRight || keys.d) && paddle.x + paddle.w < canvas.width)
    paddle.x += paddle.speed;

  if (!hasStarted) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.radius - 1;
  } else {
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (
      ball.x + ball.dx > canvas.width - ball.radius ||
      ball.x + ball.dx < ball.radius
    )
      ball.dx = -ball.dx;
    if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
    else if (ball.y + ball.dy > canvas.height - ball.radius) {
      gameState.value.lives--;
      if (gameState.value.lives <= 0) gameOver();
      else resetBallAndPaddle();
    }
    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.h &&
      ball.x + ball.radius >= paddle.x &&
      ball.x - ball.radius <= paddle.x + paddle.w &&
      ball.dy > 0
    ) {
      const hitPoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const bounceAngle = hitPoint * (Math.PI / 3);
      if (ball.speed < 10) ball.speed += 0.1;
      ball.dx = ball.speed * Math.sin(bounceAngle);
      ball.dy = -ball.speed * Math.cos(bounceAngle);
    }
    let activeBricks = 0;
    for (let c = 0; c < brickConfig.cols; c++) {
      for (let r = 0; r < bricks[c].length; r++) {
        let b = bricks[c][r];
        if (b.status === 1) {
          activeBricks++;
          const brickX =
            c * (brickConfig.w + brickConfig.padding) + brickConfig.offsetLeft;
          const brickY =
            r * (brickConfig.h + brickConfig.padding) + brickConfig.offsetTop;
          if (
            ball.x + ball.radius > brickX &&
            ball.x - ball.radius < brickX + brickConfig.w &&
            ball.y + ball.radius > brickY &&
            ball.y - ball.radius < brickY + brickConfig.h
          ) {
            b.status = 0;
            ball.dy = -ball.dy;
            gameState.value.score += b.points;
            spawnParticles(
              brickX + brickConfig.w / 2,
              brickY + brickConfig.h / 2,
              b.color,
            );
          }
        }
      }
    }
    if (activeBricks === 0) {
      gameState.value.level++;
      initLevel();
      resetBallAndPaddle();
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;
    if (p.life <= 0) particles.splice(i, 1);
  }
  draw();
  animationId = requestAnimationFrame(update);
}

function draw() {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let c = 0; c < brickConfig.cols; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      if (bricks[c][r].status === 1) {
        let b = bricks[c][r];
        const bx =
          c * (brickConfig.w + brickConfig.padding) + brickConfig.offsetLeft;
        const by =
          r * (brickConfig.h + brickConfig.padding) + brickConfig.offsetTop;
        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, brickConfig.w, brickConfig.h);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(bx, by, brickConfig.w, 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(bx, by + brickConfig.h - 2, brickConfig.w, 2);
      }
    }
  }
  particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = hasStarted ? "#0DC2FF" : "#ffffff";
  ctx.fill();
}

function gameOver() {
  isGameOver = true;
  if (gameState.value.score > highScore.value)
    highScore.value = gameState.value.score;
  const goMsg = document.getElementById("gameOverMsg");
  if (goMsg) goMsg.style.display = "flex";
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  const msg = document.getElementById("pauseMsg");
  if (isPaused) {
    if (msg) msg.style.display = "flex";
  } else {
    if (msg) msg.style.display = "none";
    update();
  }
}

const handleKeydown = (e) => {
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      e.code,
    )
  )
    e.preventDefault();
  if (e.key === "Escape" || e.key === "p" || e.key === "P") {
    togglePause();
    return;
  }
  if (e.key === "r" || e.key === "R") {
    resetGame();
    return;
  }
  if (isPaused || isGameOver) return;
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  if (e.code === "Space") launchBall();
};

const handleKeyup = (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
};

const handleMouseMove = (e) => {
  if (isPaused || isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const relativeX = (e.clientX - rect.left) * (canvas.width / rect.width);
  paddle.x = Math.max(
    0,
    Math.min(canvas.width - paddle.w, relativeX - paddle.w / 2),
  );
};

onMounted(() => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", launchBall);
  window.addEventListener("blur", () => {
    if (!isPaused && !isGameOver) togglePause();
  });
  resetGame();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyup);
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="breakout-wrapper">
    <GameMobileMessage />
    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <canvas id="gameCanvas" width="400" height="500"></canvas>
          <div id="gameOverMsg" class="overlay-msg" style="display: none">
            <h2 style="font-size: 32px; color: white; margin: 0 0 15px">
              GAME OVER
            </h2>
            <button @click="resetGame" class="retry-btn">RETRY</button>
          </div>
          <div id="pauseMsg" class="overlay-msg" style="display: none">
            <h2
              style="
                font-size: 24px;
                color: white;
                margin: 0;
                letter-spacing: 4px;
              "
            >
              PAUSED
            </h2>
          </div>
        </div>
        <div class="right-section">
          <h1 class="game-title">Breakout</h1>
          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value">{{ gameState.score }}</div>
            <div class="divider"></div>
            <div
              class="label"
              style="font-size: 11px; color: #94a3b8; margin-bottom: 2px"
            >
              HIGH SCORE
            </div>
            <div class="value" style="font-size: 24px; color: #ffd700">
              {{ highScore }}
            </div>
          </div>
          <div class="row">
            <div class="info-box stats-box">
              <div class="label">Level</div>
              <div class="value">{{ gameState.level }}</div>
            </div>
            <div class="info-box stats-box">
              <div class="label">Lives</div>
              <div class="value">{{ gameState.lives }}</div>
            </div>
          </div>
          <div class="controls-container">
            <div class="control-item">
              <span>Move</span>
              <span class="key">Mouse</span>
            </div>
            <div class="control-item sub-control">
              <span style="font-style: italic; opacity: 0.6">Alternative:</span>
              <div><span class="key">←</span> <span class="key">→</span></div>
            </div>
            <div class="control-item">
              <span>Launch</span> <span class="key">SPACE</span>
            </div>
            <div class="control-item">
              <span>Pause</span> <span class="key">ESC</span>
            </div>
            <div class="control-item">
              <span>Restart</span> <span class="key">R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.breakout-wrapper {
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
.row {
  display: flex;
  gap: 15px;
  width: 100%;
}
.game-title {
  font-size: 64px;
  margin: 0 0 10px;
  letter-spacing: -3px;
  font-weight: 900;
  color: white;
  line-height: 1;
  text-align: left;
}
.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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
}
.stats-box .value {
  font-size: 32px;
  color: white;
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
.divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}
canvas {
  display: block;
  background-color: #0d0d0d;
  border-radius: 4px;
  cursor: none;
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
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;
}
.sub-control {
  margin-top: -4px;
  border-bottom: none;
  font-size: 10px;
  padding-left: 4px;
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
  padding: 10px 24px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 4px;
}
@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
}
</style>
