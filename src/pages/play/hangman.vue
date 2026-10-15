<script setup>
import { computed, ref } from 'vue';
import GamePage, { onGameKey } from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Hangman' } });

const MAX_WRONG = 6;
const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const LIMBS = [
  'M148 76V136',
  'M148 92L120 118',
  'M148 92L176 118',
  'M148 136L124 178',
  'M148 136L172 178',
];

const status = ref('start');
const secretWord = ref('');
const inputBuffer = ref('');
const guessedLetters = ref(new Set());

const maskedWord = computed(() =>
  [...secretWord.value].map((char) =>
    char === ' ' || guessedLetters.value.has(char) ? char : '_',
  ),
);

const wrongLetters = computed(() =>
  [...guessedLetters.value].filter((letter) => !secretWord.value.includes(letter)),
);

const wrongGuesses = computed(() => wrongLetters.value.length);

const isWon = computed(() => !maskedWord.value.includes('_'));

const limbs = computed(() => LIMBS.slice(0, Math.max(wrongGuesses.value - 1, 0)));

function handleInput(event) {
  inputBuffer.value = event.target.value.toUpperCase().replaceAll(/[^A-Z ]/gu, '');
}

function submitWord() {
  const word = inputBuffer.value.trim();
  if (!word) return;
  secretWord.value = word;
  inputBuffer.value = '';
  status.value = 'playing';
}

function guessLetter(letter) {
  if (status.value !== 'playing' || guessedLetters.value.has(letter)) return;
  guessedLetters.value.add(letter);
  if (isWon.value || wrongGuesses.value >= MAX_WRONG) status.value = 'over';
}

function resetGame() {
  guessedLetters.value.clear();
  status.value = 'start';
}

onGameKey(ALPHABET, (event) => guessLetter(event.key.toUpperCase()));
</script>

<template>
  <GamePage>
    <div class="game-wrapper">
      <div class="left-section">
        <div class="panel-header">
          <span class="pill">{{ status === 'start' ? 'Player 1' : 'Player 2' }}</span>
          <h1 class="game-title">Hangman</h1>

          <template v-if="status === 'start'">
            <p class="subtitle">Enter a secret word for Player 2 to guess</p>
            <div class="word-input-row">
              <input
                class="word-input"
                type="text"
                aria-label="Secret word"
                :value="inputBuffer"
                maxlength="30"
                autocomplete="off"
                spellcheck="false"
                @input="handleInput"
                @keydown.enter="submitWord"
              />
              <button class="submit-btn" :disabled="!inputBuffer.trim()" @click="submitWord">
                Set Word
                <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h11m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </template>

          <p v-else class="subtitle">Guess the hidden word</p>
        </div>

        <div v-if="status !== 'start'" class="panel-divider"></div>

        <Transition name="slide-up">
          <div v-if="status !== 'start'" class="gallows-section">
            <svg class="gallows-svg" viewBox="0 0 220 230" fill="none" aria-hidden="true">
              <path
                d="M30 220H190M62 220V14H148M62 58L106 14"
                stroke="#4a4a4e"
                stroke-width="9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="148"
                y1="18"
                x2="148"
                y2="40"
                stroke="#9a9a9e"
                stroke-width="3"
                stroke-linecap="round"
              />

              <g v-if="wrongGuesses >= 1" class="part">
                <circle
                  cx="148"
                  cy="58"
                  r="18"
                  fill="rgba(255, 255, 255, 0.06)"
                  stroke="#ffffff"
                  stroke-width="3.5"
                />
                <circle cx="142" cy="55" r="2.2" fill="#ffffff" />
                <circle cx="154" cy="55" r="2.2" fill="#ffffff" />
                <path d="M142 66h12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
              </g>
              <path
                v-for="(limb, index) in limbs"
                :key="index"
                class="part"
                :d="limb"
                stroke="#ffffff"
                stroke-width="3.5"
                stroke-linecap="round"
              />
            </svg>

            <div class="word-display">
              <span
                v-for="(char, index) in maskedWord"
                :key="index"
                class="letter-slot"
                :class="{
                  revealed: char !== '_' && char !== ' ',
                  space: char === ' ',
                }"
                >{{ char }}</span
              >
            </div>
          </div>
        </Transition>

        <div v-if="status === 'over'" class="overlay-msg">
          <h2 class="menu-title outcome-title" :class="{ won: isWon }">
            {{ isWon ? 'You Win!' : 'Game Over' }}
          </h2>
          <p class="outcome-word">{{ secretWord }}</p>
          <button class="overlay-btn" @click="resetGame">Play Again</button>
        </div>
      </div>

      <div class="right-section" :class="{ faded: status === 'start' }">
        <div class="info-box danger-box">
          <div class="label danger-label">Wrong Guesses</div>
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
            <span v-for="letter in wrongLetters" :key="letter" class="wrong-chip">{{
              letter
            }}</span>
          </div>
        </div>

        <div class="keyboard-grid">
          <button
            v-for="letter in ALPHABET"
            :key="letter"
            class="key-btn"
            :class="{
              correct: guessedLetters.has(letter) && secretWord.includes(letter),
              wrong: wrongLetters.includes(letter),
            }"
            :disabled="guessedLetters.has(letter) || status !== 'playing'"
            @click="guessLetter(letter)"
          >
            {{ letter }}
          </button>
        </div>

        <GameControls :controls="[{ action: 'Guess Letter', key: 'A - Z' }]" />
      </div>
    </div>
  </GamePage>
</template>

<style scoped>
.left-section {
  width: 420px;
  overflow: hidden;
  padding: 0;
}

.panel-header {
  padding: 12px 20px 18px;
  text-align: left;
}

.panel-divider {
  height: 1px;
  margin: 0 20px;
  background: rgba(255, 255, 255, 0.07);
}

.pill {
  display: inline-block;
  padding: 4px 10px;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
}

.game-title {
  margin: 0 0 14px;
  padding-bottom: 4px;
}

.subtitle {
  margin: 0 0 14px;
  color: #7c8ba1;
  font-size: 13px;
}

.word-input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.word-input {
  flex: 1;
  min-width: 0;
  padding: 11px 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.125em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.submit-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  color: #000000;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  background: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.submit-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  opacity: 0.85;
}

.arrow-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.gallows-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 16px 20px 24px;
}

.gallows-svg {
  width: 100%;
  max-width: 260px;
  height: auto;
}

.part {
  animation: pop-in 0.15s ease-out;
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
    color 0.2s ease,
    border-color 0.2s ease;
}

.letter-slot.revealed {
  color: #ffffff;
  border-bottom-color: rgba(255, 255, 255, 0.35);
}

.letter-slot.space {
  min-width: 12px;
  border-bottom: none;
}

.outcome-title {
  margin-bottom: 6px;
  color: #ff4757;
}

.outcome-title.won {
  color: #2ed573;
}

.outcome-word {
  margin: 0 0 24px;
  color: #7c8ba1;
  font-size: 11px;
  letter-spacing: 0.27em;
  text-transform: uppercase;
}

.slide-up-enter-active {
  transition:
    opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.right-section {
  padding-top: 1px;
  transition: opacity 0.3s ease;
}

.right-section.faded {
  opacity: 0.2;
  pointer-events: none;
}

.info-box {
  gap: 7px;
  padding: 10px 12px;
}

.danger-box {
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.07), transparent);
  border-color: rgba(255, 71, 87, 0.18);
}

.danger-label {
  color: #ff4757;
}

.pips-row {
  display: flex;
  gap: 6px;
}

.pip {
  width: 11px;
  height: 11px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.pip.dead {
  background: #ff4757;
  border-color: transparent;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.55);
}

.wrong-count {
  font-size: 42px;
  font-weight: 900;
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
  align-items: center;
  min-height: 26px;
}

.no-letters {
  color: #2d3748;
  font-size: 13px;
}

.wrong-chip {
  padding: 3px 8px;
  color: #ff4757;
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.09em;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.22);
  border-radius: 4px;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.key-btn {
  aspect-ratio: 1;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.key-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.13);
}

.key-btn.correct {
  color: #2ed573;
  background: rgba(46, 213, 115, 0.13);
  border-color: rgba(46, 213, 115, 0.3);
}

.key-btn.wrong {
  color: #2d3748;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.03);
}

.key-btn:disabled {
  cursor: default;
}

@keyframes pop-in {
  from {
    opacity: 0;
  }
}
</style>
