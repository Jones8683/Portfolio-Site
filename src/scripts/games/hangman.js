import { defineElement, onGameKey } from '../game';

const MAX_WRONG = 6;
const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

function clone(template, text) {
  const element = template.content.firstElementChild.cloneNode(true);
  element.textContent = text;
  return element;
}

defineElement('game-hangman', (root) => {
  const playerPill = root.querySelector('.pill');
  const startGroup = root.querySelector('[data-start]');
  const playingSubtitle = root.querySelector('[data-playing]');
  const divider = root.querySelector('.panel-divider');
  const gallows = root.querySelector('.gallows-section');
  const head = root.querySelector('[data-head]');
  const limbs = [...root.querySelectorAll('[data-limb]')];
  const wordDisplay = root.querySelector('.word-display');
  const slotTemplate = root.querySelector('template[data-slot]');
  const input = root.querySelector('.word-input');
  const submitButton = root.querySelector('.submit-btn');
  const overOverlay = root.querySelector('[data-over]');
  const outcomeTitle = root.querySelector('[data-outcome]');
  const outcomeWord = root.querySelector('.outcome-word');
  const rightSection = root.querySelector('.right-section');
  const pips = [...root.querySelectorAll('.pip')];
  const wrongCount = root.querySelector('[data-wrong-count]');
  const wrongLetterList = root.querySelector('.wrong-letters');
  const noLetters = root.querySelector('.no-letters');
  const chipTemplate = root.querySelector('template[data-chip]');
  const keyButtons = [...root.querySelectorAll('.key-btn')];

  let status = 'start';
  let secretWord = '';
  let slots = [];
  const guessedLetters = new Set();

  const maskedWord = () =>
    [...secretWord].map((char) => (char === ' ' || guessedLetters.has(char) ? char : '_'));
  const wrongLetters = () => [...guessedLetters].filter((letter) => !secretWord.includes(letter));
  const isWon = () => !maskedWord().includes('_');

  function render() {
    const isStart = status === 'start';
    const wrong = wrongLetters();

    playerPill.textContent = isStart ? 'Player 1' : 'Player 2';
    startGroup.hidden = !isStart;
    playingSubtitle.hidden = isStart;
    divider.hidden = isStart;
    gallows.hidden = isStart;
    submitButton.disabled = !input.value.trim();

    head.toggleAttribute('hidden', wrong.length === 0);
    for (const [index, limb] of limbs.entries()) {
      limb.toggleAttribute('hidden', index >= wrong.length - 1);
    }

    for (const [index, char] of maskedWord().entries()) {
      const slot = slots[index];
      slot.textContent = char;
      slot.classList.toggle('revealed', char !== '_' && char !== ' ');
      slot.classList.toggle('space', char === ' ');
    }

    overOverlay.hidden = status !== 'over';
    outcomeTitle.textContent = isWon() ? 'You Win!' : 'Game Over';
    outcomeTitle.classList.toggle('won', isWon());
    outcomeWord.textContent = secretWord;

    rightSection.classList.toggle('faded', isStart);
    for (const [index, pip] of pips.entries()) pip.classList.toggle('dead', index < wrong.length);
    wrongCount.textContent = String(wrong.length);
    wrongLetterList.replaceChildren(
      ...(wrong.length > 0 ? wrong.map((letter) => clone(chipTemplate, letter)) : [noLetters]),
    );

    for (const button of keyButtons) {
      const { letter } = button.dataset;
      button.classList.toggle('correct', guessedLetters.has(letter) && secretWord.includes(letter));
      button.classList.toggle('wrong', wrong.includes(letter));
      button.disabled = guessedLetters.has(letter) || status !== 'playing';
    }
  }

  function submitWord() {
    const word = input.value.trim();
    if (!word) return;
    secretWord = word;
    slots = [...word].map((char) => clone(slotTemplate, char));
    wordDisplay.replaceChildren(...slots);
    input.value = '';
    status = 'playing';
    render();
  }

  function guessLetter(letter) {
    if (status !== 'playing' || guessedLetters.has(letter)) return;
    guessedLetters.add(letter);
    if (isWon() || wrongLetters().length >= MAX_WRONG) status = 'over';
    render();
  }

  function resetGame() {
    guessedLetters.clear();
    status = 'start';
    render();
  }

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase().replaceAll(/[^A-Z ]/gu, '');
    submitButton.disabled = !input.value.trim();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitWord();
  });
  submitButton.addEventListener('click', submitWord);
  root.querySelector('[data-restart]').addEventListener('click', resetGame);
  for (const button of keyButtons) {
    button.addEventListener('click', () => guessLetter(button.dataset.letter));
  }

  const removeKey = onGameKey(ALPHABET, (event) => guessLetter(event.key.toUpperCase()));

  render();

  return removeKey;
});
