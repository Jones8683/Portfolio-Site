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
                :d="limb"
                stroke="#ffffff"
                stroke-width="3.5"
                stroke-linecap="round"
                class="part"
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
            {{ isWon ? 'YOU GOT IT!' : 'GAME OVER' }}
          </h2>
          <p class="outcome-word">{{ secretWord }}</p>
          <button class="overlay-btn" @click="resetGame">PLAY AGAIN</button>
        </div>
      </div>

      <div class="right-section" :class="{ faded: status === 'start' }">
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
  background: rgba(255, 255, 255, 0.07);
  margin: 0 20px;
}

.pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 4px;
}

.game-title {
  margin: 0 0 14px;
  padding-bottom: 4px;
}

.subtitle {
  color: #7c8ba1;
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
  background: var(--color-glass);
  border: 1px solid var(--color-hairline);
  border-radius: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  padding: 11px 14px;
  letter-spacing: 2px;
  min-width: 0;
  text-transform: uppercase;
}

.submit-btn {
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  padding: 11px 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.submit-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  opacity: 0.85;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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
  border-bottom: none;
  min-width: 12px;
}

.outcome-title {
  margin-bottom: 6px;
  color: #ff4757;
}

.outcome-title.won {
  color: #2ed573;
}

.outcome-word {
  color: #7c8ba1;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0 0 24px;
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
  transition: opacity 0.3s ease;
  padding-top: 1px;
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
  background: linear-gradient(135deg, color-mix(in srgb, #ff4757 7%, transparent), transparent);
  border-color: color-mix(in srgb, #ff4757 18%, transparent);
}

.red-lbl {
  color: #ff4757;
}

.pips-row {
  display: flex;
  gap: 6px;
}

.pip {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-hairline);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.pip.dead {
  background: #ff4757;
  border-color: transparent;
  box-shadow: 0 0 8px color-mix(in srgb, #ff4757 55%, transparent);
}

.wrong-count {
  font-size: 42px;
  font-weight: 900;
  color: #ffffff;
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
  background: color-mix(in srgb, #ff4757 8%, transparent);
  border: 1px solid color-mix(in srgb, #ff4757 22%, transparent);
  color: #ff4757;
  font-weight: 900;
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
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  transition: background-color 0.12s ease;
}

.key-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.13);
}

.key-btn.correct {
  background: color-mix(in srgb, #2ed573 13%, transparent);
  border-color: color-mix(in srgb, #2ed573 30%, transparent);
  color: #2ed573;
}

.key-btn.wrong {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.03);
  color: #2d3748;
}

.key-btn:disabled {
  cursor: default;
}
</style>
