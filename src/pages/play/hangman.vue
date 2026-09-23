<script setup>
import { computed, ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import GamePage from '@/components/GamePage.vue';
import GameControls from '@/components/GameControls.vue';

definePage({ meta: { title: 'Hangman' } });

const status = ref('start');
const secretWord = ref('');
const inputBuffer = ref('');
const guessedLetters = ref(new Set());
const MAX_WRONG = 6;
const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const maskedWord = computed(() =>
  [...secretWord.value].map((ch) => (ch === ' ' || guessedLetters.value.has(ch) ? ch : '_')),
);

const wrongLetters = computed(() =>
  [...guessedLetters.value].filter((l) => !secretWord.value.includes(l)),
);

const wrongGuesses = computed(() => wrongLetters.value.length);

function onInput(e) {
  inputBuffer.value = e.target.value.toUpperCase().replaceAll(/[^A-Z ]/gu, '');
}

function submitWord() {
  const w = inputBuffer.value.trim();
  if (!w) return;
  secretWord.value = w;
  inputBuffer.value = '';
  status.value = 'playing';
}

function guessLetter(letter) {
  if (status.value !== 'playing' || guessedLetters.value.has(letter)) return;
  guessedLetters.value.add(letter);
  if (!maskedWord.value.includes('_')) status.value = 'won';
  else if (wrongGuesses.value >= MAX_WRONG) status.value = 'lost';
}

function resetGame() {
  guessedLetters.value.clear();
  status.value = 'start';
}

onKeyStroke(
  (e) => /^[a-z]$/iu.test(e.key),
  (e) => guessLetter(e.key.toUpperCase()),
);
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
                aria-label="Secret word"
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
              <button class="submit-btn" @click="submitWord" :disabled="!inputBuffer.trim()">
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
            <p class="hint-text">Letters and spaces only · max 30 chars</p>
          </template>

          <template v-else>
            <p class="subtitle">Guess the hidden word</p>
          </template>
        </div>

        <div v-if="status !== 'start'" class="panel-divider"></div>

        <Transition name="slide-up">
          <div v-if="status !== 'start'" class="gallows-section">
            <svg class="gallows-svg" viewBox="0 0 220 230" fill="none" aria-hidden="true">
              <line
                x1="20"
                y1="222"
                x2="200"
                y2="222"
                stroke="rgba(255, 255, 255, 0.12)"
                stroke-width="3"
                stroke-linecap="round"
              />
              <line
                x1="58"
                y1="222"
                x2="58"
                y2="12"
                stroke="rgba(255, 255, 255, 0.12)"
                stroke-width="3"
                stroke-linecap="round"
              />
              <line
                x1="58"
                y1="12"
                x2="148"
                y2="12"
                stroke="rgba(255, 255, 255, 0.12)"
                stroke-width="3"
                stroke-linecap="round"
              />
              <line
                x1="148"
                y1="12"
                x2="148"
                y2="38"
                stroke="rgba(255, 255, 255, 0.12)"
                stroke-width="3"
                stroke-linecap="round"
              />
              <line
                x1="58"
                y1="50"
                x2="90"
                y2="12"
                stroke="rgba(255, 255, 255, 0.05)"
                stroke-width="2"
                stroke-linecap="round"
              />

              <circle
                v-if="wrongGuesses >= 1"
                cx="148"
                cy="57"
                r="19"
                stroke="#ffffff"
                stroke-width="2.5"
                class="part"
              />
              <line
                v-if="wrongGuesses >= 2"
                x1="148"
                y1="76"
                x2="148"
                y2="138"
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linecap="round"
                class="part"
              />
              <line
                v-if="wrongGuesses >= 3"
                x1="148"
                y1="94"
                x2="118"
                y2="122"
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linecap="round"
                class="part"
              />
              <line
                v-if="wrongGuesses >= 4"
                x1="148"
                y1="94"
                x2="178"
                y2="122"
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linecap="round"
                class="part"
              />
              <line
                v-if="wrongGuesses >= 5"
                x1="148"
                y1="138"
                x2="122"
                y2="178"
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linecap="round"
                class="part"
              />
              <line
                v-if="wrongGuesses >= 6"
                x1="148"
                y1="138"
                x2="174"
                y2="178"
                stroke="#ffffff"
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
                >{{ ch }}</span
              >
            </div>
          </div>
        </Transition>

        <div v-if="status === 'won' || status === 'lost'" class="overlay-msg">
          <div class="outcome-emoji">
            {{ status === 'won' ? '🎉' : '💀' }}
          </div>
          <h2 class="menu-title result-title outcome-title" :class="{ won: status === 'won' }">
            {{ status === 'won' ? 'YOU GOT IT!' : 'GAME OVER' }}
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
            <span v-for="l in wrongLetters" :key="l" class="wrong-chip">{{ l }}</span>
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

        <GameControls :controls="[{ action: 'Guess letter', key: 'A - Z' }]" />
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
  border: 1px solid var(--color-glass-border);
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
  color: var(--color-subtle);
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
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  padding: 11px 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
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

.hint-text {
  color: var(--color-faint);
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
  color: var(--color-faint);
  border-bottom: 2px solid rgba(255, 255, 255, 0.12);
  transition:
    color 0.2s,
    border-color 0.2s;
}

.letter-slot.revealed {
  color: #ffffff;
  border-bottom-color: rgba(255, 255, 255, 0.35);
}

.letter-slot.space {
  border-bottom: none;
  min-width: 12px;
}

.outcome-emoji {
  font-size: 52px;
  margin-bottom: 12px;
}

.outcome-title {
  margin-bottom: 6px;
}

.outcome-word {
  color: var(--color-subtle);
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
  transition: opacity 0.3s;
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
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-red) 7%, transparent),
    transparent
  );
  border-color: color-mix(in srgb, var(--color-red) 18%, transparent);
}

.red-lbl {
  color: var(--color-red);
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
  border: 1px solid var(--color-glass-border);
  transition:
    background 0.25s,
    box-shadow 0.25s;
}

.pip.dead {
  background: var(--color-red);
  border-color: transparent;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-red) 55%, transparent);
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
  color: var(--color-faint);
  font-size: 13px;
}

.wrong-chip {
  background: color-mix(in srgb, var(--color-red) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-red) 22%, transparent);
  color: var(--color-red);
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
  border: 1px solid var(--color-glass-border);
  border-radius: 6px;
  color: #ffffff;
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
  background: color-mix(in srgb, var(--color-green) 13%, transparent);
  border-color: color-mix(in srgb, var(--color-green) 30%, transparent);
  color: var(--color-green);
  cursor: default;
}

.key-btn.wrong {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.03);
  color: var(--color-faint);
  cursor: default;
}

.key-btn:disabled:not(.correct):not(.wrong) {
  cursor: default;
}
</style>
