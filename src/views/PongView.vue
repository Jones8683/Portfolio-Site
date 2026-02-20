<script setup>
import { onMounted, onUnmounted } from "vue";

let canvas, ctx, animationId;
const WIN_SCORE = 7;
const PADDLE_W = 12;
const PADDLE_H = 85;
const BALL_SIZE = 8;

let gameMode = "cpu";
let isPaused = false;
let isRunning = false;
let isResetting = false;

const leftPaddle = { x: 20, y: 210, score: 0, speed: 7, aiSpeed: 5.8 };
const rightPaddle = { x: 668, y: 210, score: 0, speed: 7 };
const ball = { x: 350, y: 250, dx: 0, dy: 0, speed: 4, baseSpeed: 4 };

const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
};

function showStartScreen() {
  isRunning = false;
  cancelAnimationFrame(animationId);
  document.getElementById("gameOverMsg").style.display = "none";
  document.getElementById("pauseMsg").style.display = "none";
  document.getElementById("startScreen").style.display = "flex";
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  document.getElementById("scoreDiv").innerText = "0 - 0";
}

function initGame(mode) {
  gameMode = mode;
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameOverMsg").style.display = "none";
  document.getElementById("pauseMsg").style.display = "none";
  document.getElementById("scoreDiv").innerText = "0 - 0";
  isRunning = true;
  isPaused = false;

  keys.w = false;
  keys.s = false;
  keys.ArrowUp = false;
  keys.ArrowDown = false;

  resetPositions();
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
  isResetting = true;

  setTimeout(() => {
    if (!isRunning) return;
    isResetting = false;
    let dir = Math.random() > 0.5 ? 1 : -1;
    ball.dx = dir * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * (ball.speed * 0.5);
  }, 1000);
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  document.getElementById("pauseMsg").style.display = isPaused
    ? "flex"
    : "none";
}

function update() {
  if (isPaused) return;

  if (keys.ArrowUp) rightPaddle.y -= rightPaddle.speed;
  if (keys.ArrowDown) rightPaddle.y += rightPaddle.speed;

  if (gameMode === "cpu") {
    let targetY = ball.y - PADDLE_H / 2;
    let diff = targetY - leftPaddle.y;
    let move = diff * 0.2;

    if (move > leftPaddle.aiSpeed) move = leftPaddle.aiSpeed;
    if (move < -leftPaddle.aiSpeed) move = -leftPaddle.aiSpeed;

    leftPaddle.y += move;
  } else {
    if (keys.w) leftPaddle.y -= leftPaddle.speed;
    if (keys.s) leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = Math.max(0, Math.min(canvas.height - PADDLE_H, leftPaddle.y));
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - PADDLE_H, rightPaddle.y),
  );

  if (!isResetting) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }

  if (ball.y < BALL_SIZE) {
    ball.y = BALL_SIZE;
    ball.dy *= -1;
  } else if (ball.y > canvas.height - BALL_SIZE) {
    ball.y = canvas.height - BALL_SIZE;
    ball.dy *= -1;
  }

  let paddle = ball.x < canvas.width / 2 ? leftPaddle : rightPaddle;
  if (collision(ball, paddle)) {
    let collidePoint = (ball.y - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2);

    if (collidePoint > 1) collidePoint = 1;
    if (collidePoint < -1) collidePoint = -1;

    let angleRad = (Math.PI / 4) * collidePoint;
    let direction = ball.x < canvas.width / 2 ? 1 : -1;

    ball.speed += 0.5;
    if (ball.speed > 15) ball.speed = 15;

    ball.dx = direction * ball.speed * Math.cos(angleRad);
    ball.dy = ball.speed * Math.sin(angleRad);

    if (paddle === leftPaddle) {
      ball.x = leftPaddle.x + PADDLE_W + BALL_SIZE;
    } else {
      ball.x = rightPaddle.x - BALL_SIZE;
    }
  }

  if (ball.x < 0) {
    rightPaddle.score++;
    scoreUpdate();
  } else if (ball.x > canvas.width) {
    leftPaddle.score++;
    scoreUpdate();
  }
}

function scoreUpdate() {
  document.getElementById("scoreDiv").innerText =
    `${leftPaddle.score} - ${rightPaddle.score}`;
  checkWin();
  if (isRunning) resetPositions();
}

function checkWin() {
  if (leftPaddle.score >= WIN_SCORE || rightPaddle.score >= WIN_SCORE) {
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
}

function collision(b, p) {
  return (
    b.x + BALL_SIZE > p.x &&
    b.x - BALL_SIZE < p.x + PADDLE_W &&
    b.y + BALL_SIZE > p.y &&
    b.y - BALL_SIZE < p.y + PADDLE_H
  );
}

function draw() {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#333";
  for (let i = 0; i < canvas.height; i += 30) {
    ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
  }

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.roundRect(leftPaddle.x, leftPaddle.y, PADDLE_W, PADDLE_H, 4);
  ctx.roundRect(rightPaddle.x, rightPaddle.y, PADDLE_W, PADDLE_H, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  if (!isRunning) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

const handleKeyDown = (e) => {
  if (["ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault();
  if (e.key === "Escape") {
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
  if (isRunning && !isPaused) {
    togglePause();
  }
};

onMounted(() => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);
  draw();
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
    <div class="mobile-msg">
      <div class="content-wrap">
        <h1
          class="name-title"
          style="
            font-size: 32px;
            margin-bottom: 16px;
            letter-spacing: -1px;
            margin-top: 60px;
            width: 100%;
          "
        >
          Not supported on mobile
        </h1>
        <RouterLink
          to="/games"
          class="repo-link"
          style="
            font-size: 14px;
            display: inline-block;
            color: lightskyblue;
            text-decoration: none;
          "
          >← Back to games</RouterLink
        >
      </div>
    </div>

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
              <span>Pause</span> <span class="key">ESC</span>
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
  margin: 0 0 10px 0;
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
.mobile-msg {
  display: none;
}
@media (max-width: 900px) {
  .desktop-game {
    display: none !important;
  }
  .mobile-msg {
    display: flex !important;
    flex-direction: column;
    align-items: center;
  }
}
</style>
