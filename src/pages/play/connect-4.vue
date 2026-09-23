<script setup>
import { computed, ref } from 'vue';
import { onKeyStroke, useTimeoutFn } from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Connect 4' } });

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 62;
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

const createBoard = () =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

const board = ref(createBoard());
const currentPlayer = ref(1);
const winner = ref(null);
const isDraw = ref(false);
const winningCells = ref([]);
const hoveredCol = ref(null);
const scores = ref({ 1: 0, 2: 0 });
const droppingCell = ref(null);
const isProcessing = ref(false);
const { start: finishMove } = useTimeoutFn(
  () => {
    droppingCell.value = null;
    isProcessing.value = false;
  },
  500,
  { immediate: false },
);

const getGhostRow = (col) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board.value[r][col]) return r;
  }
  return null;
};

const columns = computed(() =>
  Array.from({ length: COLS }, (_, col) =>
    Array.from({ length: ROWS }, (__, row) => ({ row, value: board.value[row][col] })),
  ),
);

const isGhostCell = (r, c) => {
  if (winner.value || isDraw.value || isProcessing.value) return false;
  return hoveredCol.value === c && getGhostRow(c) === r;
};

const isDropTarget = (r, c) => droppingCell.value?.row === r && droppingCell.value?.col === c;

const getDropStyle = (r, c) => {
  if (!isDropTarget(r, c)) return {};
  return {
    '--drop-dist': `-${r * CELL_SIZE || 30}px`,
    '--drop-dur': `${r === 0 ? 0.1 : 0.08 + Math.sqrt(r) * 0.09}s`,
  };
};

const makeMove = (col) => {
  if (winner.value || isDraw.value || isProcessing.value) return;

  const row = getGhostRow(col);
  if (row === null) return;

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

  finishMove();
};

const checkWinner = (row, col) => {
  const player = board.value[row][col];
  const runFrom = (dr, dc) => {
    const cells = [];
    for (let r = row + dr, c = col + dc; board.value[r]?.[c] === player; r += dr, c += dc) {
      cells.push([r, c]);
    }
    return cells;
  };

  for (const [dr, dc] of DIRECTIONS) {
    const cells = [[row, col], ...runFrom(dr, dc), ...runFrom(-dr, -dc)];
    if (cells.length >= 4) return cells;
  }
  return null;
};

const isWinningCell = (r, c) => winningCells.value.some(([wr, wc]) => wr === r && wc === c);

const isColFull = (col) => getGhostRow(col) === null;

const resetGame = () => {
  board.value = createBoard();
  currentPlayer.value = 1;
  winner.value = null;
  isDraw.value = false;
  winningCells.value = [];
  droppingCell.value = null;
  isProcessing.value = false;
};

onKeyStroke(['r', 'R'], resetGame);
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <div class="board">
          <div
            v-for="(cells, col) in columns"
            :key="col"
            class="column"
            :class="{ 'col-hovered': hoveredCol === col && !winner && !isDraw && !isColFull(col) }"
            @click="makeMove(col)"
            @mouseenter="hoveredCol = col"
            @mouseleave="hoveredCol = null"
          >
            <div v-for="cell in cells" :key="cell.row" class="cell">
              <div
                v-if="isDropTarget(cell.row, col)"
                class="drop-target"
                :class="`p${cell.value}`"
              ></div>
              <div
                class="piece"
                :style="getDropStyle(cell.row, col)"
                :class="[
                  cell.value && `p${cell.value}`,
                  {
                    'winning-piece': isWinningCell(cell.row, col),
                    dropping: isDropTarget(cell.row, col),
                  },
                  isGhostCell(cell.row, col) && ['ghost', `p${currentPlayer}`],
                ]"
              ></div>
            </div>
          </div>
        </div>

        <div v-if="winner || isDraw" class="overlay-msg">
          <h2 class="menu-title">
            <span v-if="winner" class="player-text" :class="`p${winner}`">
              PLAYER {{ winner }} WINS!
            </span>
            <span v-else>DRAW!</span>
          </h2>
          <button class="retry-btn" @click="resetGame">PLAY AGAIN</button>
        </div>
      </div>

      <div class="right-section">
        <h1 class="game-title">Connect 4</h1>

        <div class="row">
          <div class="info-box score-box">
            <div class="label score-label player-text p1">Player 1</div>
            <div class="value score-value">{{ scores[1] }}</div>
          </div>
          <div class="info-box score-box">
            <div class="label score-label player-text p2">Player 2</div>
            <div class="value score-value">{{ scores[2] }}</div>
          </div>
        </div>

        <div class="row">
          <div class="info-box turn-box">
            <div class="label">Turn</div>
            <div class="value">
              <div v-if="!winner && !isDraw" class="turn-piece" :class="`p${currentPlayer}`"></div>
              <span v-else class="no-turn-text">-</span>
            </div>
          </div>
        </div>

        <GameControls
          :controls="[
            { action: 'Drop Piece', key: 'Click' },
            { action: 'Restart', key: 'R' },
          ]"
        />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.game-title {
  font-size: 48px;
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
  border: 1px solid var(--color-glass);
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

.piece {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  transition:
    background 0.1s ease,
    box-shadow 0.1s ease;
}

.p1 {
  --player: #0dc2ff;
}

.p2 {
  --player: #ff0d72;
}

.player-text {
  color: var(--player);
}

.piece.p1,
.piece.p2,
.turn-piece {
  background: var(--player);
  box-shadow: 0 0 10px color-mix(in srgb, var(--player) 35%, transparent);
}

.drop-target,
.piece.ghost {
  pointer-events: none;
  background: color-mix(in srgb, var(--player) 25%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--player) 15%, transparent);
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

.info-box {
  flex: 1;
  aspect-ratio: 1;
}

.turn-box {
  aspect-ratio: auto;
  min-height: 60px;
  padding: 8px;
}

.turn-piece {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.no-turn-text {
  color: #ffffff;
}
</style>
