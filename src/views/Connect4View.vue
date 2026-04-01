<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameMobileMessage from "../components/GameMobileMessage.vue";
import GameControls from "../components/GameControls.vue";

const ROWS = 6;
const COLS = 7;

const createBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const board = ref(createBoard());
const currentPlayer = ref(1);
const winner = ref(null);
const isDraw = ref(false);
let moveTimeout = null;
const winningCells = ref([]);
const hoveredCol = ref(null);
const scores = ref({ 1: 0, 2: 0 });
const droppingCell = ref(null);
const isProcessing = ref(false);

const playerColors = { 1: "#0dc2ff", 2: "#ff0d72" };

const getGhostRow = (col) => {
  if (col === null || col === undefined) return null;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board.value[r][col]) return r;
  }
  return null;
};

const isGhostCell = (r, c) => {
  if (winner.value || isDraw.value || isProcessing.value) return false;
  return hoveredCol.value === c && getGhostRow(c) === r;
};

const isDropTarget = (r, c) =>
  droppingCell.value?.row === r && droppingCell.value?.col === c;

const getDropStyle = (r, c) => {
  if (
    !droppingCell.value ||
    droppingCell.value.row !== r ||
    droppingCell.value.col !== c
  )
    return {};
  const cellSize = 62;
  const dist = r * cellSize || 30;
  const dur = r === 0 ? 0.1 : 0.08 + Math.sqrt(r) * 0.09;
  return {
    "--drop-dist": `-${dist}px`,
    "--drop-dur": `${dur}s`,
  };
};

const makeMove = (col) => {
  if (winner.value || isDraw.value || isProcessing.value) return;

  let row = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board.value[r][col]) {
      row = r;
      break;
    }
  }
  if (row === -1) return;

  isProcessing.value = true;
  droppingCell.value = { row, col };
  board.value[row][col] = currentPlayer.value;

  const win = checkWinner(row, col);
  if (win) {
    winner.value = currentPlayer.value;
    winningCells.value = win;
    scores.value[currentPlayer.value]++;
  } else if (board.value[0].every((cell) => cell !== null)) {
    isDraw.value = true;
  } else {
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  }

  if (moveTimeout) clearTimeout(moveTimeout);
  moveTimeout = setTimeout(() => {
    droppingCell.value = null;
    isProcessing.value = false;
  }, 500);
};

const checkWinner = (row, col) => {
  const player = board.value[row][col];
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dr, dc] of directions) {
    const cells = [[row, col]];

    for (let i = 1; i < 4; i++) {
      const r = row + dr * i,
        c = col + dc * i;
      if (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board.value[r][c] === player
      )
        cells.push([r, c]);
      else break;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i,
        c = col - dc * i;
      if (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board.value[r][c] === player
      )
        cells.push([r, c]);
      else break;
    }

    if (cells.length >= 4) return cells;
  }
  return null;
};

const isWinningCell = (r, c) =>
  winningCells.value.some(([wr, wc]) => wr === r && wc === c);

const isDroppingCell = (r, c) =>
  droppingCell.value?.row === r && droppingCell.value?.col === c;

const isColFull = (col) => board.value[0][col] !== null;

const resetGame = () => {
  board.value = createBoard();
  currentPlayer.value = 1;
  winner.value = null;
  isDraw.value = false;
  winningCells.value = [];
  droppingCell.value = null;
  isProcessing.value = false;
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur();
};

const handleKeydown = (e) => {
  if (e.key.toLowerCase() === "r") resetGame();
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (moveTimeout) clearTimeout(moveTimeout);
});
</script>

<template>
  <div class="game-page-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div class="board">
            <div
              v-for="col in COLS"
              :key="col"
              class="column"
              :class="{
                'col-hovered':
                  hoveredCol === col - 1 &&
                  !winner &&
                  !isDraw &&
                  !isColFull(col - 1),
              }"
              @click="makeMove(col - 1)"
              @mouseenter="hoveredCol = col - 1"
              @mouseleave="hoveredCol = null"
            >
              <div v-for="row in ROWS" :key="row" class="cell">
                <div
                  v-if="isDropTarget(row - 1, col - 1)"
                  class="drop-target"
                  :class="{
                    'ghost-p1': board[row - 1][col - 1] === 1,
                    'ghost-p2': board[row - 1][col - 1] === 2,
                  }"
                ></div>
                <div
                  class="piece"
                  :style="getDropStyle(row - 1, col - 1)"
                  :class="{
                    p1: board[row - 1][col - 1] === 1,
                    p2: board[row - 1][col - 1] === 2,
                    'winning-piece': isWinningCell(row - 1, col - 1),
                    dropping: isDroppingCell(row - 1, col - 1),
                    ghost: isGhostCell(row - 1, col - 1),
                    'ghost-p1':
                      isGhostCell(row - 1, col - 1) && currentPlayer === 1,
                    'ghost-p2':
                      isGhostCell(row - 1, col - 1) && currentPlayer === 2,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div v-if="winner || isDraw" class="overlay-msg">
            <h2 style="font-size: 24px; margin: 0 0 10px">
              <span v-if="winner" :style="{ color: playerColors[winner] }">
                PLAYER {{ winner }} WINS!
              </span>
              <span v-else style="color: white">DRAW!</span>
            </h2>
            <button @click="resetGame" class="retry-btn">PLAY AGAIN</button>
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Connect 4</h1>

          <div class="row">
            <div class="info-box score-box">
              <div class="label score-label" style="color: #0dc2ff">
                Player 1
              </div>
              <div class="value score-value">{{ scores[1] }}</div>
            </div>
            <div class="info-box score-box">
              <div class="label score-label" style="color: #ff0d72">
                Player 2
              </div>
              <div class="value score-value">{{ scores[2] }}</div>
            </div>
          </div>

          <div class="row">
            <div class="info-box turn-box">
              <div class="label">Turn</div>
              <div class="value">
                <div
                  v-if="!winner && !isDraw"
                  class="turn-piece"
                  :class="{ p1: currentPlayer === 1, p2: currentPlayer === 2 }"
                ></div>
                <span v-else style="color: white">-</span>
              </div>
            </div>
          </div>

          <GameControls
            :controls="[
              { action: 'Drop Piece', key: 'CLICK' },
              { action: 'Restart', key: 'R' },
            ]"
          />
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
  position: relative;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.board {
  display: flex;
  gap: 8px;
  background-color: #0d0d0d;
  padding: 16px;
  border-radius: 12px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  transition: background 0.15s ease;
}

.column.col-hovered {
  background: rgba(255, 255, 255, 0.04);
}

.cell {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  position: relative;
}

.drop-target {
  position: absolute;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  pointer-events: none;
}

.drop-target.ghost-p1 {
  background: rgba(13, 194, 255, 0.25);
  box-shadow: 0 0 8px rgba(13, 194, 255, 0.15);
}

.drop-target.ghost-p2 {
  background: rgba(255, 13, 114, 0.25);
  box-shadow: 0 0 8px rgba(255, 13, 114, 0.15);
}

.piece {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: transparent;
  transition:
    background 0.1s ease,
    box-shadow 0.1s ease;
}

.piece.p1 {
  background: #0dc2ff;
  box-shadow: 0 0 10px rgba(13, 194, 255, 0.35);
}

.piece.p2 {
  background: #ff0d72;
  box-shadow: 0 0 10px rgba(255, 13, 114, 0.35);
}

.piece.ghost {
  pointer-events: none;
}

.piece.ghost-p1 {
  background: rgba(13, 194, 255, 0.25);
  box-shadow: 0 0 8px rgba(13, 194, 255, 0.15);
}

.piece.ghost-p2 {
  background: rgba(255, 13, 114, 0.25);
  box-shadow: 0 0 8px rgba(255, 13, 114, 0.15);
}

.piece.dropping {
  position: relative;
  z-index: 10;
  animation: drop-in var(--drop-dur, 0.25s) forwards;
}

@keyframes drop-in {
  0% {
    transform: translateY(var(--drop-dist, -200px));
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.6);
  }
  82% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.33, 1, 0.66, 1);
  }
  91% {
    transform: translateY(5px);
    animation-timing-function: ease-out;
  }
  96% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0);
  }
}

.piece.winning-piece {
  animation: pulse 0.75s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0.55;
    transform: scale(0.88);
  }
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
  font-size: 48px;
  margin: 0 0 10px;
  letter-spacing: -2px;
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
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.01)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.turn-box {
  aspect-ratio: auto;
  min-height: 60px;
  padding: 8px;
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
  margin-bottom: 4px;
}

.value {
  font-size: 32px;
  font-weight: 900;
  color: white;
  word-break: break-all;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 32px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.turn-piece {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.turn-piece.p1 {
  background: #0dc2ff;
  box-shadow: 0 0 10px rgba(13, 194, 255, 0.35);
}

.turn-piece.p2 {
  background: #ff0d72;
  box-shadow: 0 0 10px rgba(255, 13, 114, 0.35);
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
  outline: none;
}

.retry-btn:focus {
  outline: none;
}
</style>
