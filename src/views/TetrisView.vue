<script setup>
import { onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";

let canvas, ctx, nextCtx, holdCtx;
let animationId = null;

const colors = [
  null,
  "#0DC2FF",
  "#3877FF",
  "#FF8E0D",
  "#FFE138",
  "#0DFF72",
  "#FF0D72",
  "#F538FF",
];

const arena = createMatrix(12, 20);
const highScore = useStorage("tetris-best-score", 0);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  lines: 0,
  next: null,
  hold: null,
  canHold: true,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;
let lockDelayCounter = 0;
let lockMovesCounter = 0;
const LOCK_DELAY_TIME = 500;
const MAX_LOCK_MOVES = 15;
let isLanded = false;

const DAS = 170;
const ARR = 50;
const SOFT_DROP_ARR = 30;
const keys = {
  37: { down: false, timer: 0 },
  39: { down: false, timer: 0 },
  40: { down: false, timer: 0 },
};

let hardDropEffect = {
  active: false,
  alpha: 0,
  trails: [],
};

let piecesBag = [];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  if (type === "I")
    return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  if (type === "J")
    return [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ];
  if (type === "L")
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  if (type === "O")
    return [
      [4, 4],
      [4, 4],
    ];
  if (type === "S")
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  if (type === "Z")
    return [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ];
  if (type === "T")
    return [
      [0, 7, 0],
      [7, 7, 7],
      [0, 0, 0],
    ];
}

function getNextPiece() {
  if (piecesBag.length === 0) {
    piecesBag = ["I", "L", "J", "O", "Z", "S", "T"];
    for (let i = piecesBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piecesBag[i], piecesBag[j]] = [piecesBag[j], piecesBag[i]];
    }
  }
  return createPiece(piecesBag.pop());
}

function draw() {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (hardDropEffect.active && hardDropEffect.alpha > 0) {
    hardDropEffect.trails.forEach((trail) => {
      const g = ctx.createLinearGradient(0, trail.y, 0, trail.y + trail.h);

      let fadeStop = 0;
      if (trail.h > 0) {
        fadeStop = Math.min(3, trail.h) / trail.h;
      }

      g.addColorStop(0, `rgba(255, 255, 255, 0)`);
      if (fadeStop > 0 && fadeStop < 1) {
        g.addColorStop(
          fadeStop,
          `rgba(255, 255, 255, ${hardDropEffect.alpha})`,
        );
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
  while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
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
          context.fillStyle = "rgba(255, 255, 255, 0.1)";
          context.fillRect(bx, by, 1, 1);
          return;
        }

        if (isLanded && context === ctx && matrix === player.matrix) {
          const now = Date.now();
          const intensity = (Math.sin(now / 50) + 1) / 2;
        }

        context.fillStyle = fillStyle;
        context.fillRect(bx, by, 1, 1);

        if (isLanded && context === ctx && matrix === player.matrix) {
          const now = Date.now();
          const alpha = 0.3 + 0.3 * Math.sin(now / 75);
          context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
          context.fillRect(bx, by, 1, 1);
        }

        context.fillStyle = "rgba(255, 255, 255, 0.4)";
        context.fillRect(bx, by, 1, 0.15);
        context.fillRect(bx, by, 0.15, 1);
        context.fillStyle = "rgba(0, 0, 0, 0.4)";
        context.fillRect(bx, by + 0.85, 1, 0.15);
        context.fillRect(bx + 0.85, by, 0.15, 1);
        context.fillStyle = "rgba(0, 0, 0, 0.1)";
        context.fillRect(bx + 0.2, by + 0.2, 0.6, 0.6);
      }
    });
  });
}

function drawPreview(ctx, matrix) {
  ctx.clearRect(0, 0, 400, 400);
  if (!matrix) return;
  const offsetX = (4 - matrix[0].length) / 2;
  const offsetY = (4 - matrix.length) / 2;
  drawMatrix(matrix, { x: offsetX, y: offsetY }, ctx);
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
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
    let type = "";
    if (rowCount === 1) {
      base = 100;
      type = "Single";
    } else if (rowCount === 2) {
      base = 300;
      type = "Double";
    } else if (rowCount === 3) {
      base = 500;
      type = "Triple";
    } else if (rowCount === 4) {
      base = 800;
      type = "Tetris";
    }

    const points = base * level;
    player.score += points;
    player.lines += rowCount;
    updateScore();
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    return false;
  }
  dropCounter = 0;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
  return true;
}

function playerLock() {
  merge(arena, player);
  playerReset();
  arenaSweep();
  updateScore();
  player.canHold = true;
  dropCounter = 0;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
}

function getPieceBounds(matrix) {
  let minX = matrix[0].length;
  let maxX = 0;
  let found = false;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        found = true;
      }
    }
  }
  if (!found) return { xOffset: 0, width: matrix[0].length };
  return { xOffset: minX, width: maxX - minX + 1 };
}

function playerHardDrop() {
  const startY = player.pos.y;
  let ghostY = startY;
  while (
    !collide(arena, { ...player, pos: { x: player.pos.x, y: ghostY + 1 } })
  ) {
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

  merge(arena, player);
  playerReset();
  arenaSweep();
  updateScore();
  player.canHold = true;
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
    return;
  }
  player.pos.y++;
  if (collide(arena, player)) {
    if (lockMovesCounter < MAX_LOCK_MOVES) {
      lockDelayCounter = 0;
      lockMovesCounter++;
    }
  }
  player.pos.y--;
}

function playerReset() {
  if (player.next === null) player.next = getNextPiece();
  player.matrix = player.next;
  player.next = getNextPiece();
  drawPreview(nextCtx, player.next);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    isGameOver = true;
    if (player.score > highScore.value) {
      highScore.value = player.score;
    }
    const gameOverEl = document.getElementById("gameOverMsg");
    if (gameOverEl) gameOverEl.style.display = "flex";
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  const initY = player.pos.y;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      player.pos.x = pos;
      player.pos.y--;
      if (!collide(arena, player)) {
        lockDelayCounter = 0;
        lockMovesCounter = 0;
        return;
      }
      player.pos.y++;
      player.pos.x = pos;
      rotate(player.matrix, -dir);
      return;
    }
  }

  if (player.pos.y === initY) {
    player.pos.y++;
    if (collide(arena, player)) {
      if (lockMovesCounter < MAX_LOCK_MOVES) {
        lockDelayCounter = 0;
        lockMovesCounter++;
      }
    }
    player.pos.y--;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach((row) => row.reverse());
  else matrix.reverse();
}

function playerHold() {
  if (!player.canHold) return;
  if (player.hold === null) {
    player.hold = player.matrix;
    player.matrix = player.next;
    player.next = getNextPiece();
    drawPreview(nextCtx, player.next);
  } else {
    const temp = player.matrix;
    player.matrix = player.hold;
    player.hold = temp;
  }
  drawPreview(holdCtx, player.hold);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  player.canHold = false;
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

function update(time = 0) {
  if (isGameOver || isPaused) return;
  const deltaTime = time - lastTime;
  lastTime = time;

  if (keys[37].down) {
    keys[37].timer += deltaTime;
    if (keys[37].timer > DAS) {
      while (keys[37].timer > DAS + ARR) {
        playerMove(-1);
        keys[37].timer -= ARR;
      }
    }
  }
  if (keys[39].down) {
    keys[39].timer += deltaTime;
    if (keys[39].timer > DAS) {
      while (keys[39].timer > DAS + ARR) {
        playerMove(1);
        keys[39].timer -= ARR;
      }
    }
  }
  if (keys[40].down) {
    keys[40].timer += deltaTime;
    while (keys[40].timer > SOFT_DROP_ARR) {
      if (playerDrop()) {
        player.score += 1;
        updateScore();
      }
      keys[40].timer -= SOFT_DROP_ARR;
    }
  }

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    isLanded = true;
    lockDelayCounter += deltaTime;
    if (lockDelayCounter > LOCK_DELAY_TIME) {
      playerLock();
    }
  } else {
    player.pos.y--;
    isLanded = false;
    lockDelayCounter = 0;
  }

  draw();
  animationId = requestAnimationFrame(update);
}

let lastLoggedLevel = 0;

function updateScore() {
  const el = document.getElementById("scoreDiv");
  if (el) el.innerText = player.score;
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
  };

  const currentG = gValues[level] || (level > 15 ? 20.0 : 0.01667);
  dropInterval = 1000 / (60 * currentG);

  if (level > lastLoggedLevel) {
    console.log(`Level ${level}: Current G: ${currentG}`);
    lastLoggedLevel = level;
  }
}

function resetGame() {
  lastLoggedLevel = 0;
  arena.forEach((row) => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.hold = null;
  player.next = null;
  drawPreview(holdCtx, null);
  updateScore();
  isGameOver = false;
  isPaused = false;
  const goMsg = document.getElementById("gameOverMsg");
  if (goMsg) goMsg.style.display = "none";
  const pMsg = document.getElementById("pauseMsg");
  if (pMsg) pMsg.style.display = "none";
  playerReset();
  update();
}

const handleKeydown = (event) => {
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      event.code,
    )
  ) {
    event.preventDefault();
  }
  if (isGameOver) return;
  if (event.keyCode === 27) {
    event.preventDefault();
    togglePause();
    return;
  }
  if (isPaused) return;

  if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 40) {
    if (event.repeat) return;

    if (keys[event.keyCode]) {
      keys[event.keyCode].down = true;
      keys[event.keyCode].timer = 0;
      if (event.keyCode === 37) playerMove(-1);
      if (event.keyCode === 39) playerMove(1);
      if (event.keyCode === 40) {
        if (playerDrop()) {
          player.score += 1;
          updateScore();
        }
      }
    }
    return;
  }

  if (event.keyCode === 38) {
    playerRotate(1);
  } else if (event.keyCode === 32) {
    playerHardDrop();
  } else if (event.keyCode === 67) {
    playerHold();
  }
};

const handleKeyup = (event) => {
  if (keys[event.keyCode]) {
    keys[event.keyCode].down = false;
    keys[event.keyCode].timer = 0;
  }
};

onMounted(() => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  nextCtx = document.getElementById("nextCanvas").getContext("2d");
  holdCtx = document.getElementById("holdCanvas").getContext("2d");
  ctx.scale(25, 25);
  nextCtx.scale(25, 25);
  holdCtx.scale(25, 25);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  playerReset();
  updateScore();
  update();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyup);
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="tetris-wrapper">
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
          <canvas id="gameCanvas" width="300" height="500"></canvas>
          <div id="gameOverMsg" class="overlay-msg" style="display: none">
            <h2 style="font-size: 24px; color: white; margin: 0 0 10px 0">
              GAME OVER
            </h2>
            <button @click="resetGame" class="retry-btn">RETRY</button>
          </div>
          <div
            id="pauseMsg"
            class="overlay-msg"
            style="display: none; background: rgba(0, 0, 0, 0.8)"
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
          <h1 class="game-title">Tetris</h1>
          <div class="row">
            <div class="info-box">
              <div class="label">Next</div>
              <canvas
                id="nextCanvas"
                width="100"
                height="100"
                class="side-canvas"
              ></canvas>
            </div>
            <div class="info-box">
              <div class="label">Hold</div>
              <canvas
                id="holdCanvas"
                width="100"
                height="100"
                class="side-canvas"
              ></canvas>
            </div>
          </div>
          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value" id="scoreDiv">0</div>

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
              <span>Move</span>
              <div><span class="key">←</span> <span class="key">→</span></div>
            </div>
            <div class="control-item">
              <span>Rotate</span> <span class="key">↑</span>
            </div>
            <div class="control-item">
              <span>Hard Drop</span> <span class="key">SPACE</span>
            </div>
            <div class="control-item">
              <span>Hold</span> <span class="key">C</span>
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
.tetris-wrapper {
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
  font-size: 72px;
  margin: 0 0 10px 0;
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
  flex: 1;
  aspect-ratio: 1;
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
canvas {
  display: block;
  background-color: #0d0d0d;
  border-radius: 4px;
}
.side-canvas {
  background-color: transparent;
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
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
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
