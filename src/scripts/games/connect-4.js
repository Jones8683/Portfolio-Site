import { defineElement, onGameKey } from '../game';

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 62;
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function createBoard() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

defineElement('game-connect-4', (root) => {
  const columns = [...root.querySelectorAll('.column')];
  const overOverlay = root.querySelector('[data-over]');
  const winnerText = root.querySelector('[data-winner]');
  const drawText = root.querySelector('[data-draw]');
  const scoreTexts = {
    1: root.querySelector('[data-score="1"]'),
    2: root.querySelector('[data-score="2"]'),
  };
  const turnPiece = root.querySelector('.turn-piece');
  const turnEmpty = root.querySelector('[data-turn-empty]');

  let status = 'playing';
  let board = createBoard();
  let currentPlayer = 1;
  let winner = null;
  let winningCells = [];
  let hoveredCol = null;
  const scores = { 1: 0, 2: 0 };
  let droppingCell = null;
  let isProcessing = false;
  let finishTimer;

  function getGhostRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) return r;
    }
    return null;
  }

  function isColFull(col) {
    return getGhostRow(col) === null;
  }

  function isGhostCell(r, c) {
    if (status !== 'playing' || isProcessing) return false;
    return hoveredCol === c && getGhostRow(c) === r;
  }

  function isDropTarget(r, c) {
    return droppingCell?.row === r && droppingCell?.col === c;
  }

  function isWinningCell(r, c) {
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  }

  function render() {
    for (const [col, column] of columns.entries()) {
      column.classList.toggle(
        'hovered',
        hoveredCol === col && status === 'playing' && !isColFull(col),
      );

      for (const [row, cell] of [...column.children].entries()) {
        const value = board[row][col];
        const dropTarget = cell.querySelector('.drop-target');
        const piece = cell.querySelector('.piece');
        const isDropping = isDropTarget(row, col);
        const isGhost = isGhostCell(row, col);

        dropTarget.hidden = !isDropping;
        dropTarget.classList.toggle('p1', value === 1);
        dropTarget.classList.toggle('p2', value === 2);

        piece.classList.toggle('p1', value === 1 || (isGhost && currentPlayer === 1));
        piece.classList.toggle('p2', value === 2 || (isGhost && currentPlayer === 2));
        piece.classList.toggle('ghost', isGhost);
        piece.classList.toggle('winning-piece', isWinningCell(row, col));
        piece.classList.toggle('dropping', isDropping);

        if (isDropping) {
          piece.style.setProperty('--drop-dist', `-${row * CELL_SIZE || 30}px`);
          piece.style.setProperty(
            '--drop-dur',
            `${row === 0 ? 0.1 : 0.08 + Math.sqrt(row) * 0.09}s`,
          );
        } else {
          piece.style.removeProperty('--drop-dist');
          piece.style.removeProperty('--drop-dur');
        }
      }
    }

    overOverlay.hidden = status !== 'over';
    winnerText.hidden = winner === null;
    drawText.hidden = winner !== null;
    winnerText.textContent = `Player ${winner} Wins!`;
    winnerText.classList.toggle('p1', winner === 1);
    winnerText.classList.toggle('p2', winner === 2);

    scoreTexts[1].textContent = String(scores[1]);
    scoreTexts[2].textContent = String(scores[2]);

    turnPiece.hidden = status !== 'playing';
    turnEmpty.hidden = status === 'playing';
    turnPiece.classList.toggle('p1', currentPlayer === 1);
    turnPiece.classList.toggle('p2', currentPlayer === 2);
  }

  function checkWinner(row, col) {
    const player = board[row][col];

    function runFrom(dr, dc) {
      const cells = [];
      for (let r = row + dr, c = col + dc; board[r]?.[c] === player; r += dr, c += dc) {
        cells.push([r, c]);
      }
      return cells;
    }

    for (const [dr, dc] of DIRECTIONS) {
      const cells = [[row, col], ...runFrom(dr, dc), ...runFrom(-dr, -dc)];
      if (cells.length >= 4) return cells;
    }
    return null;
  }

  function makeMove(col) {
    if (status !== 'playing' || isProcessing) return;

    const row = getGhostRow(col);
    if (row === null) return;

    isProcessing = true;
    droppingCell = { row, col };
    board[row][col] = currentPlayer;

    const win = checkWinner(row, col);
    if (win) {
      status = 'over';
      winner = currentPlayer;
      winningCells = win;
      scores[currentPlayer]++;
    } else if (board[0].every((cell) => cell !== null)) {
      status = 'over';
    } else {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    clearTimeout(finishTimer);
    finishTimer = setTimeout(() => {
      droppingCell = null;
      isProcessing = false;
      render();
    }, 500);
  }

  function resetGame() {
    clearTimeout(finishTimer);
    status = 'playing';
    board = createBoard();
    currentPlayer = 1;
    winner = null;
    winningCells = [];
    droppingCell = null;
    isProcessing = false;
    render();
  }

  function hover(col) {
    hoveredCol = col;
    render();
  }

  for (const [col, column] of columns.entries()) {
    column.addEventListener('click', () => {
      makeMove(col);
      render();
    });
    column.addEventListener('mouseenter', () => hover(col));
    column.addEventListener('mouseleave', () => hover(null));
  }

  root.querySelector('[data-restart]').addEventListener('click', resetGame);
  const removeKey = onGameKey(['r'], resetGame);

  render();

  return () => {
    clearTimeout(finishTimer);
    removeKey();
  };
});
