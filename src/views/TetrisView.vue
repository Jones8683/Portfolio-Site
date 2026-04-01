<script setup>
import { onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";
import GameControls from "../components/GameControls.vue";

const STORAGE_TOKEN = "arcade-unity-v1";

function scoreSig(payload, ts) {
  const raw = `${STORAGE_TOKEN}:${payload}:${ts}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 33) ^ raw.charCodeAt(i);
  }
  return (h >>> 0).toString(36).padStart(15, "0").slice(0, 15);
}

function toBase64Url(text) {
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(b64 + pad);
}

function packValue(value) {
  const ts = Date.now();
  const safe = Number.isInteger(value) && value >= 0 ? value : 0;
  const payload = `j${toBase64Url(JSON.stringify(safe))}`;
  const sig = scoreSig(payload, ts);
  const body = `${ts.toString(36)}:${sig}:${payload}`;
  return `au1${toBase64Url(body)}`;
}

function unpackValue(raw) {
  if (typeof raw !== "string" || !raw.startsWith("au1")) return null;
  const body = fromBase64Url(raw.slice(3));
  const firstSep = body.indexOf(":");
  const secondSep = body.indexOf(":", firstSep + 1);
  if (firstSep <= 0 || secondSep <= firstSep + 1) return null;
  const ts = Number.parseInt(body.slice(0, firstSep), 36);
  const sig = body.slice(firstSep + 1, secondSep);
  const payload = body.slice(secondSep + 1);
  if (!Number.isInteger(ts) || ts <= 0) return null;
  if (sig !== scoreSig(payload, ts)) return null;
  if (!payload.startsWith("j")) return null;
  const parsed = JSON.parse(fromBase64Url(payload.slice(1)));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 9_999_999
    ? parsed
    : null;
}

let canvas, ctx, nextCtx, holdCtx;
let animationId = null;
let animationFrame = 0;

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

const highScore = useStorage("tetris-best-score", 0, localStorage, {
  serializer: {
    read: (v) => {
      try {
        if (!v) return 0;
        const parsed = unpackValue(v);
        if (Number.isInteger(parsed) && parsed >= 0) return parsed;
        localStorage.removeItem("tetris-best-score");
        return 0;
      } catch (e) {
        localStorage.removeItem("tetris-best-score");
        return 0;
      }
    },
    write: (v) => packValue(v),
  },
});

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  lines: 0,
  next: null,
  hold: null,
  canHold: true,
  rotState: 0,
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
const ARR = 33;
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
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  if (type === "Z")
    return [
      [6, 6, 0],
      [0, 6, 6],
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

        context.fillStyle = fillStyle;
        context.fillRect(bx, by, 1, 1);

        if (isLanded && context === ctx && matrix === player.matrix) {
          const alpha = 0.3 + 0.3 * Math.sin(animationFrame * 0.08);
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
    if (rowCount === 1) base = 100;
    else if (rowCount === 2) base = 300;
    else if (rowCount === 3) base = 500;
    else if (rowCount === 4) base = 800;

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
  arenaSweep();
  updateScore();
  playerReset();
  player.canHold = true;
  dropCounter = 0;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
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
  arenaSweep();
  updateScore();
  playerReset();
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
  player.rotState = 0;
  if (collide(arena, player)) {
    isGameOver = true;
    if (player.score > highScore.value) {
      highScore.value = player.score;
    }
    const gameOverEl = document.getElementById("gameOverMsg");
    if (gameOverEl) gameOverEl.style.display = "flex";
  }
}

const KICKS_JLSTZ = {
  "01": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  12: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  23: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  30: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  10: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  21: [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  32: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "03": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
};

const KICKS_I = {
  "01": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  12: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  23: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  30: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  10: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  21: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  32: [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  "03": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
};

function playerRotate(dir) {
  const prevState = player.rotState;
  const nextState = (prevState + (dir > 0 ? 1 : -1) + 4) % 4;
  const key = `${prevState}${nextState}`;

  const isIPiece = player.matrix.length === 4;
  const isOPiece = player.matrix.length === 2;

  if (isOPiece) return;

  const kicks = isIPiece ? KICKS_I[key] : KICKS_JLSTZ[key];

  rotate(player.matrix, dir);

  for (const [kx, ky] of kicks) {
    player.pos.x += kx;
    player.pos.y += ky;
    if (!collide(arena, player)) {
      player.rotState = nextState;
      player.pos.y++;
      if (collide(arena, player)) {
        if (lockMovesCounter < MAX_LOCK_MOVES) {
          lockDelayCounter = 0;
          lockMovesCounter++;
        }
      }
      player.pos.y--;
      return;
    }
    player.pos.x -= kx;
    player.pos.y -= ky;
  }

  rotate(player.matrix, -dir);
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
  function getPieceType(matrix) {
    const types = ["I", "J", "L", "O", "S", "Z", "T"];
    for (const type of types) {
      const defaultMatrix = createPiece(type);
      if (
        matrix.length === defaultMatrix.length &&
        matrix[0].length === defaultMatrix[0].length &&
        matrix.every((row, y) => row.every((v, x) => v === defaultMatrix[y][x]))
      ) {
        return type;
      }
    }
    for (const type of types) {
      const val =
        createPiece(type)[1][1] ||
        createPiece(type)[0][1] ||
        createPiece(type)[1][0];
      if (matrix.flat().includes(val)) return type;
    }
    return null;
  }

  if (player.hold === null) {
    player.hold = getPieceType(player.matrix);
    player.matrix = createPiece(getPieceType(player.next));
    player.next = getNextPiece();
    drawPreview(nextCtx, player.next);
  } else {
    const currentType = getPieceType(player.matrix);
    const holdType = player.hold;
    player.matrix = createPiece(holdType);
    player.hold = currentType;
  }
  drawPreview(holdCtx, createPiece(player.hold));
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  player.rotState = 0;
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
    lastTime = performance.now();
    update(performance.now());
  }
}

function handleHorizontalInput(keyCode, direction, deltaTime) {
  if (!keys[keyCode].down) return;
  keys[keyCode].timer += deltaTime;
  if (keys[keyCode].timer > DAS) {
    while (keys[keyCode].timer > DAS + ARR) {
      playerMove(direction);
      keys[keyCode].timer -= ARR;
    }
  }
}

function handleSoftDrop(deltaTime) {
  if (!keys[40].down) return;
  keys[40].timer += deltaTime;
  while (keys[40].timer > SOFT_DROP_ARR) {
    if (playerDrop()) {
      player.score += 1;
      updateScore();
    }
    keys[40].timer -= SOFT_DROP_ARR;
  }
}

function handleGravityDrop(deltaTime) {
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
    dropCounter = 0;
  }
}

function checkCollisionAndLand(deltaTime) {
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
}

function update(time = 0) {
  if (isGameOver || isPaused) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  animationFrame++;

  handleHorizontalInput(37, -1, deltaTime);
  handleHorizontalInput(39, 1, deltaTime);
  handleSoftDrop(deltaTime);
  handleGravityDrop(deltaTime);
  checkCollisionAndLand(deltaTime);

  draw();
  if (animationId) cancelAnimationFrame(animationId);
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
    16: 3.91,
    17: 6.61,
    18: 11.43,
    19: 20.0,
  };

  const currentG = gValues[level] || (level > 19 ? 20.0 : 0.01667);
  dropInterval = 1000 / (60 * currentG);

  if (level > lastLoggedLevel) {
    lastLoggedLevel = level;
  }
}

function resetGame() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  animationFrame = 0;

  lastLoggedLevel = 0;
  arena.forEach((row) => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.hold = null;
  player.next = null;
  player.canHold = true;
  dropCounter = 0;
  dropInterval = 1000;
  lockDelayCounter = 0;
  lockMovesCounter = 0;
  isLanded = false;
  hardDropEffect = { active: false, alpha: 0, trails: [] };
  keys[37].down = false;
  keys[37].timer = 0;
  keys[39].down = false;
  keys[39].timer = 0;
  keys[40].down = false;
  keys[40].timer = 0;

  drawPreview(holdCtx, null);
  updateScore();
  isGameOver = false;
  isPaused = false;
  const goMsg = document.getElementById("gameOverMsg");
  if (goMsg) goMsg.style.display = "none";
  const pMsg = document.getElementById("pauseMsg");
  if (pMsg) pMsg.style.display = "none";
  playerReset();
  draw();
  lastTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(update);
}

const preventDefaultKeys = (event) => {
  const defaultKeys = [
    "Space",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
  ];
  if (defaultKeys.includes(event.code)) event.preventDefault();
};

const handleMovementKey = (event, isLeft, isRight, isDown) => {
  if (event.repeat) return;
  const targetKey = isLeft ? 37 : isRight ? 39 : 40;
  keys[targetKey].down = true;
  keys[targetKey].timer = 0;
  if (isLeft) playerMove(-1);
  if (isRight) playerMove(1);
  if (isDown && playerDrop()) {
    player.score += 1;
    updateScore();
  }
};

const handleActionKey = (event, isUp) => {
  if (isUp) playerRotate(1);
  else if (event.keyCode === 32) playerHardDrop();
  else if (event.keyCode === 67) playerHold();
};

const handleKeydown = (event) => {
  preventDefaultKeys(event);
  if (isGameOver) return;
  if (event.keyCode === 27 || event.key === "p" || event.key === "P") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (isPaused) return;

  const isLeft = event.keyCode === 37 || event.keyCode === 65;
  const isRight = event.keyCode === 39 || event.keyCode === 68;
  const isDown = event.keyCode === 40 || event.keyCode === 83;
  const isUp = event.keyCode === 38 || event.keyCode === 87;

  if (isLeft || isRight || isDown) {
    handleMovementKey(event, isLeft, isRight, isDown);
    return;
  }
  handleActionKey(event, isUp);
};

const handleKeyup = (event) => {
  const isLeft = event.keyCode === 37 || event.keyCode === 65;
  const isRight = event.keyCode === 39 || event.keyCode === 68;
  const isDown = event.keyCode === 40 || event.keyCode === 83;

  if (isLeft) {
    keys[37].down = false;
    keys[37].timer = 0;
  }
  if (isRight) {
    keys[39].down = false;
    keys[39].timer = 0;
  }
  if (isDown) {
    keys[40].down = false;
    keys[40].timer = 0;
  }
};

const handleBlur = () => {
  if (!isPaused && !isGameOver) {
    togglePause();
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
  window.addEventListener("blur", handleBlur);
  arena.forEach((row) => row.fill(0));
  dropCounter = 0;
  lastTime = performance.now();
  player.lines = 0;
  player.score = 0;
  player.hold = null;
  player.next = null;
  dropInterval = 1000;
  isGameOver = false;
  isPaused = false;
  playerReset();
  updateScore();
  update(performance.now());
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyup);
  window.removeEventListener("blur", handleBlur);
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="tetris-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <canvas id="gameCanvas" width="300" height="500"></canvas>
          <div id="gameOverMsg" class="overlay-msg" style="display: none">
            <h2 style="font-size: 24px; color: white; margin: 0 0 10px">
              GAME OVER
            </h2>
            <button @click="resetGame" class="retry-btn">RETRY</button>
          </div>
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
          <GameControls
            :controls="[
              { action: 'Move', key: ['←', '→'] },
              { action: 'Rotate', key: '↑' },
              { action: 'Hard Drop', key: 'SPACE' },
              { action: 'Hold', key: 'C' },
              { action: 'Pause', key: 'ESC' },
            ]"
          />
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
</style>
