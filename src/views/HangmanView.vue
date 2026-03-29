<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const phase = ref("input");
const secretWord = ref("");
const inputBuffer = ref("");
const guessedLetters = ref(new Set());
const wrongGuesses = ref(0);
const MAX_WRONG = 6;

const normalizedWord = computed(() => secretWord.value.toUpperCase().trim());

const maskedWord = computed(() =>
  normalizedWord.value
    .split("")
    .map((ch) => (ch === " " ? " " : guessedLetters.value.has(ch) ? ch : "_")),
);

const wrongLetters = computed(() =>
  [...guessedLetters.value].filter((l) => !normalizedWord.value.includes(l)),
);

const correctLetters = computed(() =>
  [...guessedLetters.value].filter((l) => normalizedWord.value.includes(l)),
);

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function onInput(e) {
  inputBuffer.value = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, "");
}

function submitWord() {
  const w = inputBuffer.value.trim();
  if (!w) return;
  secretWord.value = w;
  inputBuffer.value = "";
  guessedLetters.value = new Set();
  wrongGuesses.value = 0;
  phase.value = "playing";
}

function guessLetter(letter) {
  if (phase.value !== "playing") return;
  if (guessedLetters.value.has(letter)) return;

  const newSet = new Set(guessedLetters.value);
  newSet.add(letter);
  guessedLetters.value = newSet;

  if (!normalizedWord.value.includes(letter)) wrongGuesses.value++;

  const allRevealed = normalizedWord.value
    .split("")
    .every((ch) => ch === " " || newSet.has(ch));

  if (allRevealed) phase.value = "won";
  else if (wrongGuesses.value >= MAX_WRONG) phase.value = "lost";
}

function resetGame() {
  secretWord.value = "";
  inputBuffer.value = "";
  guessedLetters.value = new Set();
  wrongGuesses.value = 0;
  phase.value = "input";
}

const handleKeydown = (e) => {
  if (phase.value !== "playing") return;
  const key = e.key.toUpperCase();
  if (key.length === 1 && /[A-Z]/.test(key)) guessLetter(key);
};

onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));

const bodyVisible = computed(() => ({
  head: wrongGuesses.value >= 1,
  body: wrongGuesses.value >= 2,
  leftArm: wrongGuesses.value >= 3,
  rightArm: wrongGuesses.value >= 4,
  leftLeg: wrongGuesses.value >= 5,
  rightLeg: wrongGuesses.value >= 6,
}));
</script>

<template>
  <div class="hangman-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-layout">
        <div class="left-section">
          <div class="panel-header">
            <span class="pill">{{
              phase === "playing" || phase === "won" || phase === "lost"
                ? "Player 2"
                : "Player 1"
            }}</span>
            <h1 class="game-title">Hangman</h1>

            <template v-if="phase === 'input'">
              <p class="subtitle">Enter a secret word for Player 2 to guess</p>
              <div class="word-input-row">
                <input
                  id="secret-word-input"
                  name="secretWord"
                  :value="inputBuffer"
                  @input="onInput"
                  class="word-input"
                  type="text"
                  maxlength="30"
                  placeholder="TYPE A WORD OR PHRASE..."
                  @keydown.enter="submitWord"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button
                  class="submit-btn"
                  @click="submitWord"
                  :disabled="!inputBuffer.trim()"
                >
                  Set Word →
                </button>
              </div>
              <p class="hint-text">Letters and spaces only · max 30 chars</p>
            </template>

            <template v-else>
              <p class="subtitle">Guess the hidden word</p>
            </template>
          </div>

          <div v-if="phase !== 'input'" class="panel-divider"></div>

          <transition name="slide-up">
            <div
              v-if="phase === 'playing' || phase === 'won' || phase === 'lost'"
              class="gallows-section"
            >
              <svg class="gallows-svg" viewBox="0 0 220 230" fill="none">
                <line
                  x1="20"
                  y1="222"
                  x2="200"
                  y2="222"
                  stroke="rgba(255,255,255,0.12)"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <line
                  x1="58"
                  y1="222"
                  x2="58"
                  y2="12"
                  stroke="rgba(255,255,255,0.12)"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <line
                  x1="58"
                  y1="12"
                  x2="148"
                  y2="12"
                  stroke="rgba(255,255,255,0.12)"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <line
                  x1="148"
                  y1="12"
                  x2="148"
                  y2="38"
                  stroke="rgba(255,255,255,0.12)"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <line
                  x1="58"
                  y1="50"
                  x2="90"
                  y2="12"
                  stroke="rgba(255,255,255,0.05)"
                  stroke-width="2"
                  stroke-linecap="round"
                />

                <circle
                  v-if="bodyVisible.head"
                  cx="148"
                  cy="57"
                  r="19"
                  stroke="white"
                  stroke-width="2.5"
                  class="part"
                />
                <line
                  v-if="bodyVisible.body"
                  x1="148"
                  y1="76"
                  x2="148"
                  y2="138"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="part"
                />
                <line
                  v-if="bodyVisible.leftArm"
                  x1="148"
                  y1="94"
                  x2="118"
                  y2="122"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="part"
                />
                <line
                  v-if="bodyVisible.rightArm"
                  x1="148"
                  y1="94"
                  x2="178"
                  y2="122"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="part"
                />
                <line
                  v-if="bodyVisible.leftLeg"
                  x1="148"
                  y1="138"
                  x2="122"
                  y2="178"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="part"
                />
                <line
                  v-if="bodyVisible.rightLeg"
                  x1="148"
                  y1="138"
                  x2="174"
                  y2="178"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="part"
                />
              </svg>

              <div class="word-display">
                <span
                  v-for="(ch, i) in maskedWord"
                  :key="i"
                  class="letter-slot"
                  :class="{
                    revealed: ch !== '_' && ch !== ' ',
                    space: ch === ' ',
                  }"
                >
                  <template v-if="ch === ' '">&nbsp;</template>
                  <template v-else>{{ ch }}</template>
                </span>
              </div>
            </div>
          </transition>

          <div
            v-if="phase === 'won' || phase === 'lost'"
            class="outcome-overlay"
          >
            <div class="outcome-inner">
              <div class="outcome-emoji">
                {{ phase === "won" ? "🎉" : "💀" }}
              </div>
              <h2 class="outcome-title">
                {{ phase === "won" ? "You got it!" : "Game Over" }}
              </h2>
              <p class="outcome-word">{{ normalizedWord }}</p>
              <button class="retry-btn" @click="resetGame">Play Again</button>
            </div>
          </div>
        </div>

        <div class="right-section" :class="{ faded: phase === 'input' }">
          <div class="info-box danger-box">
            <div class="label red-lbl">Wrong Guesses</div>
            <div class="pips-row">
              <span
                v-for="n in MAX_WRONG"
                :key="n"
                class="pip"
                :class="{ dead: n <= wrongGuesses }"
              ></span>
            </div>
            <div class="wrong-count">
              {{ wrongGuesses }}<span class="out-of">/{{ MAX_WRONG }}</span>
            </div>
          </div>

          <div class="info-box">
            <div class="label">Wrong Letters</div>
            <div class="wrong-letters">
              <span v-if="wrongLetters.length === 0" class="no-letters">—</span>
              <span v-for="l in wrongLetters" :key="l" class="wrong-chip">{{
                l
              }}</span>
            </div>
          </div>

          <div class="keyboard-grid">
            <button
              v-for="letter in alphabet"
              :key="letter"
              class="key-btn"
              :class="{
                correct: correctLetters.includes(letter),
                wrong: wrongLetters.includes(letter),
              }"
              :disabled="guessedLetters.has(letter) || phase !== 'playing'"
              @click="guessLetter(letter)"
            >
              {{ letter }}
            </button>
          </div>

          <div class="controls-list">
            <div class="ctrl-row">
              <span>Guess letter</span><span class="kbd">A – Z</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.hangman-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 85vh;
  width: 100%;
  text-align: center;
  background: transparent;
}

.desktop-game {
  display: block;
}

.game-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
}

.left-section {
  width: 420px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  position: relative;
}

.panel-header {
  padding: 12px 20px 18px;
  text-align: left;
}

.panel-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 20px;
}

.pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 4px;
}

.game-title {
  font-size: 72px;
  margin: 0 0 14px;
  letter-spacing: -4px;
  font-weight: 900;
  color: white;
  line-height: 1;
  padding-bottom: 4px;
}

.subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 14px;
}

.word-input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.word-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 11px 14px;
  outline: none;
  letter-spacing: 2px;
  transition: border-color 0.2s;
  min-width: 0;
  text-transform: uppercase;
}

.word-input::placeholder {
  color: #334155;
  font-weight: 400;
  letter-spacing: 1px;
  font-size: 12px;
  text-transform: uppercase;
}

.word-input:focus {
  border-color: rgba(255, 255, 255, 0.25);
}

.submit-btn {
  background: white;
  color: black;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  padding: 11px 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.submit-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}
.submit-btn:not(:disabled):hover {
  opacity: 0.85;
}

.hint-text {
  color: #2d3748;
  font-size: 11px;
  margin: 0;
}

.gallows-section {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.gallows-svg {
  width: 100%;
  max-width: 260px;
  height: auto;
}

.part {
  animation: pop-in 0.15s ease-out;
}

@keyframes pop-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.word-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 10px;
}

.letter-slot {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  min-width: 28px;
  height: 42px;
  font-size: 24px;
  font-weight: 900;
  color: #2d3748;
  border-bottom: 2px solid rgba(255, 255, 255, 0.12);
  transition:
    color 0.2s,
    border-color 0.2s;
}

.letter-slot.revealed {
  color: white;
  border-bottom-color: rgba(255, 255, 255, 0.35);
}

.letter-slot.space {
  border-bottom: none;
  min-width: 12px;
}

.outcome-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(4px);
  border-radius: 16px;
  z-index: 10;
}

.outcome-inner {
  text-align: center;
}
.outcome-emoji {
  font-size: 52px;
  margin-bottom: 12px;
}

.outcome-title {
  font-size: 30px;
  font-weight: 900;
  color: white;
  margin: 0 0 6px;
  letter-spacing: -1px;
}

.outcome-word {
  color: #64748b;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0 0 24px;
}

.retry-btn {
  background: white;
  color: black;
  border: none;
  padding: 10px 28px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: opacity 0.15s;
}

.retry-btn:hover {
  opacity: 0.85;
}

.slide-up-enter-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 240px;
  text-align: left;
  transition: opacity 0.3s;
  padding-top: 1px;
}

.right-section.faded {
  opacity: 0.2;
  pointer-events: none;
}

.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.danger-box {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.07), transparent);
  border-color: rgba(255, 107, 107, 0.18);
}

.label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.red-lbl {
  color: #ff6b6b;
}

.pips-row {
  display: flex;
  gap: 6px;
}

.pip {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    background 0.25s,
    box-shadow 0.25s;
}

.pip.dead {
  background: #ff6b6b;
  border-color: transparent;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.55);
}

.wrong-count {
  font-size: 42px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.out-of {
  font-size: 20px;
  color: #475569;
}

.wrong-letters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 26px;
  align-items: center;
}

.no-letters {
  color: #2d3748;
  font-size: 13px;
}

.wrong-chip {
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.22);
  color: #ff6b6b;
  font-weight: 800;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.key-btn {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: background 0.12s;
}

.key-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.13);
}

.key-btn.correct {
  background: rgba(13, 255, 114, 0.13);
  border-color: rgba(13, 255, 114, 0.3);
  color: #0dff72;
  cursor: default;
}

.key-btn.wrong {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.03);
  color: #2d3748;
  cursor: default;
}

.key-btn:disabled:not(.correct):not(.wrong) {
  cursor: default;
}

.desktop-game {
  display: block;
}

@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }
}

.controls-list {
  margin-top: 5px;
  padding: 0 5px;
}

.ctrl-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;
}

.ctrl-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.kbd {
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
</style>
