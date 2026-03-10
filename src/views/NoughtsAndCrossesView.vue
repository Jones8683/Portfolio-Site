<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const board = ref(Array(9).fill(null));
const currentPlayer = ref("X");
const winner = ref(null);
const isDraw = ref(false);

const scores = ref({ X: 0, O: 0 });

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const makeMove = (index) => {
  if (board.value[index] || winner.value) return;

  board.value[index] = currentPlayer.value;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  if (checkWinner()) {
    winner.value = currentPlayer.value;
    scores.value[currentPlayer.value]++;
  } else if (board.value.every((cell) => cell !== null)) {
    isDraw.value = true;
  } else {
    currentPlayer.value = currentPlayer.value === "X" ? "O" : "X";
  }
};

const checkWinner = () => {
  return winningCombos.some((combo) => {
    const [a, b, c] = combo;
    return (
      board.value[a] &&
      board.value[a] === board.value[b] &&
      board.value[a] === board.value[c]
    );
  });
};

const resetGame = () => {
  board.value = Array(9).fill(null);
  currentPlayer.value = "X";
  winner.value = null;
  isDraw.value = false;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

const handleKeydown = (event) => {
  if (event.key.toLowerCase() === "r") {
    resetGame();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="game-page-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div class="board">
            <button
              v-for="(cell, index) in board"
              :key="index"
              class="cell"
              :class="{
                'x-cell': cell === 'X',
                'o-cell': cell === 'O',
                disabled: cell !== null || winner !== null,
              }"
              @click="makeMove(index)"
            >
              <svg
                v-if="cell === 'X'"
                class="mark-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>

              <svg
                v-if="cell === 'O'"
                class="mark-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="8"></circle>
              </svg>
            </button>
          </div>

          <div v-if="winner || isDraw" class="overlay-msg">
            <h2 style="font-size: 24px; color: white; margin: 0 0 10px">
              <span v-if="winner">PLAYER {{ winner }} WINS!</span>
              <span v-else>DRAW!</span>
            </h2>
            <button @click="resetGame" class="retry-btn">PLAY AGAIN</button>
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Noughts<br />& Crosses</h1>

          <div class="row">
            <div class="info-box score-box">
              <div class="label score-label" style="color: #0dc2ff">
                Player X
              </div>
              <div class="value score-value">{{ scores.X }}</div>
            </div>
            <div class="info-box score-box">
              <div class="label score-label" style="color: #ff0d72">
                Player O
              </div>
              <div class="value score-value">{{ scores.O }}</div>
            </div>
          </div>

          <div class="row">
            <div class="info-box turn-box">
              <div class="label">Turn</div>
              <div
                class="value turn-value"
                :class="{
                  'x-cell': currentPlayer === 'X' && !winner && !isDraw,
                  'o-cell': currentPlayer === 'O' && !winner && !isDraw,
                }"
              >
                <svg
                  v-if="currentPlayer === 'X' && !winner && !isDraw"
                  class="mark-icon-small"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <svg
                  v-else-if="currentPlayer === 'O' && !winner && !isDraw"
                  class="mark-icon-small"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="8"></circle>
                </svg>
                <span v-else>-</span>
              </div>
            </div>
          </div>

          <div class="controls-container">
            <div class="control-item">
              <span>Action</span>
              <div><span class="key">CLICK CELL</span></div>
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
  position: relative;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
  width: 420px;
  height: 420px;
  background-color: #0d0d0d;
  padding: 12px;
  border-radius: 4px;
}

.cell {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  outline: none;
  user-select: none;
}

.mark-icon {
  width: 100px;
  height: 100px;
}

.mark-icon-small {
  width: 36px;
  height: 36px;
}

.cell:focus {
  outline: none;
}

.cell:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.97);
}

.cell.disabled {
  cursor: default;
}

.x-cell {
  color: #0dc2ff !important;
  text-shadow: 0 0 20px rgba(13, 194, 255, 0.5);
  filter: drop-shadow(0 0 10px rgba(13, 194, 255, 0.4));
}

.o-cell {
  color: #ff0d72 !important;
  text-shadow: 0 0 20px rgba(255, 13, 114, 0.5);
  filter: drop-shadow(0 0 10px rgba(255, 13, 114, 0.4));
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
  outline: none;
}

.retry-btn:focus {
  outline: none;
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
