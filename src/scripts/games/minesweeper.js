import { onBlur, onGameKey } from '../game';

const NEIGHBORS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 20, cols: 24, mines: 99 },
};

const NUMBER_COLORS = [
  null,
  '#5c5cff',
  '#00e600',
  '#ff3333',
  '#8888ff',
  '#ffaa00',
  '#00aaaa',
  '#ffffff',
  '#888888',
];

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function createGrid({ rows, cols }) {
  return range(rows).map((y) =>
    range(cols).map((x) => ({
      x,
      y,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    })),
  );
}

export function createMinesweeper(root) {
  const gridEl = root.querySelector('.grid');
  const cellTemplate = root.querySelector('template[data-cell]');
  const startOverlay = root.querySelector('[data-start]');
  const overOverlay = root.querySelector('[data-over]');
  const pausedOverlay = root.querySelector('[data-paused]');
  const outcomeTitle = root.querySelector('[data-outcome]');
  const minesText = root.querySelector('[data-mines]');
  const timeText = root.querySelector('[data-time]');

  let status = 'start';
  let isWon = false;
  let isPaused = false;
  let difficulty = DIFFICULTIES.medium;
  let grid = [];
  let cells = [];
  let flagsPlaced = 0;
  let timer = 0;
  let timerId;
  let isFirstClick = true;

  function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
      timer++;
      render();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerId);
  }

  function formattedTime() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function buildGrid() {
    grid = createGrid(difficulty);
    cells = grid.flat().map((_, index) => {
      const element = cellTemplate.content.firstElementChild.cloneNode(true);
      element.dataset.index = String(index);
      return element;
    });
    gridEl.style.gridTemplateColumns = `repeat(${difficulty.cols}, 1fr)`;
    gridEl.replaceChildren(...cells);
  }

  function render() {
    for (const [index, cell] of grid.flat().entries()) {
      const element = cells[index];
      element.classList.toggle('revealed', cell.isRevealed);
      element.classList.toggle('mine', cell.isRevealed && cell.isMine);

      if (cell.isFlagged) element.textContent = '🚩';
      else if (cell.isRevealed && cell.isMine) element.textContent = '💣';
      else if (cell.isRevealed && cell.neighborCount > 0)
        element.textContent = String(cell.neighborCount);
      else element.textContent = '';
      element.style.color = NUMBER_COLORS[cell.neighborCount] ?? '';
    }

    startOverlay.hidden = status !== 'start';
    overOverlay.hidden = status !== 'over';
    pausedOverlay.hidden = !isPaused;
    outcomeTitle.textContent = isWon ? 'You Win!' : 'Game Over';
    outcomeTitle.classList.toggle('won', isWon);
    minesText.textContent = String(difficulty.mines - flagsPlaced);
    timeText.textContent = formattedTime();
  }

  function resetBoard() {
    stopTimer();
    timer = 0;
    flagsPlaced = 0;
    isFirstClick = true;
    isPaused = false;
    buildGrid();
  }

  function showStartScreen() {
    status = 'start';
    resetBoard();
    render();
  }

  function startGame(level) {
    difficulty = DIFFICULTIES[level];
    status = 'playing';
    resetBoard();
    render();
  }

  function inBounds(x, y) {
    return x >= 0 && x < difficulty.cols && y >= 0 && y < difficulty.rows;
  }

  function isMineAt(x, y) {
    return inBounds(x, y) && grid[y][x].isMine;
  }

  function calculateNumbers() {
    for (let y = 0; y < difficulty.rows; y++) {
      for (let x = 0; x < difficulty.cols; x++) {
        if (grid[y][x].isMine) continue;
        grid[y][x].neighborCount = NEIGHBORS.filter(([dx, dy]) => isMineAt(x + dx, y + dy)).length;
      }
    }
  }

  function placeMines(safeX, safeY) {
    let minesToPlace = difficulty.mines;
    while (minesToPlace > 0) {
      const y = Math.floor(Math.random() * difficulty.rows);
      const x = Math.floor(Math.random() * difficulty.cols);
      if (grid[y][x].isMine) continue;
      if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
      grid[y][x].isMine = true;
      minesToPlace--;
    }
    calculateNumbers();
  }

  function revealCell(startX, startY) {
    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (!inBounds(x, y)) continue;

      const cell = grid[y][x];
      if (cell.isRevealed || cell.isFlagged) continue;
      cell.isRevealed = true;

      if (cell.neighborCount === 0 && !cell.isMine) {
        for (const [dx, dy] of NEIGHBORS) stack.push([x + dx, y + dy]);
      }
    }
  }

  function gameOver(won) {
    stopTimer();
    status = 'over';
    isWon = won;
    if (won) return;
    for (const cell of grid.flat()) {
      if (cell.isMine) cell.isRevealed = true;
    }
  }

  function checkWin() {
    const { rows, cols, mines } = difficulty;
    const revealedCount = grid.flat().filter((cell) => cell.isRevealed).length;
    if (rows * cols - revealedCount === mines) gameOver(true);
  }

  function handleLeftClick(cell) {
    if (status !== 'playing' || isPaused || cell.isRevealed || cell.isFlagged) return;
    if (isFirstClick) {
      placeMines(cell.x, cell.y);
      isFirstClick = false;
      startTimer();
    }
    if (cell.isMine) {
      gameOver(false);
    } else {
      revealCell(cell.x, cell.y);
      checkWin();
    }
  }

  function handleRightClick(cell) {
    if (status !== 'playing' || isPaused || cell.isRevealed) return;
    cell.isFlagged = !cell.isFlagged;
    flagsPlaced += cell.isFlagged ? 1 : -1;
  }

  function togglePause() {
    if (status !== 'playing') return;
    isPaused = !isPaused;
    if (isPaused) stopTimer();
    else startTimer();
    render();
  }

  function cellFrom(event) {
    const element = event.target.closest('.cell');
    return element ? grid.flat()[Number(element.dataset.index)] : null;
  }

  gridEl.addEventListener('click', (event) => {
    const cell = cellFrom(event);
    if (!cell) return;
    handleLeftClick(cell);
    render();
  });

  gridEl.addEventListener('contextmenu', (event) => {
    const cell = cellFrom(event);
    if (!cell) return;
    event.preventDefault();
    handleRightClick(cell);
    render();
  });

  for (const button of root.querySelectorAll('[data-level]')) {
    button.addEventListener('click', () => startGame(button.dataset.level));
  }
  root.querySelector('[data-restart]').addEventListener('click', showStartScreen);

  const cleanups = [
    onGameKey(['r'], showStartScreen),
    onGameKey(['Escape', 'p'], (event) => {
      event.preventDefault();
      togglePause();
    }),
    onBlur(() => {
      if (!isPaused) togglePause();
    }),
  ];

  showStartScreen();

  return () => {
    stopTimer();
    for (const cleanup of cleanups) cleanup();
  };
}
