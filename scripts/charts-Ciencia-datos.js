const ROWS = 6;
const COLS = 10;
const HIGHLIGHT_DURATION_MS = 900;
const SPAWN_INTERVAL_MS = 220;

function buildGrid() {
  const grid = document.getElementById('grid');
  const cells = [];

  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
    cells.push(cell);
  }

  return cells;
}

function highlightRandomCell(cells) {
  const index = Math.floor(Math.random() * cells.length);
  const cell = cells[index];

  if (cell.classList.contains('active')) return;

  cell.classList.add('active');
  setTimeout(() => {
    cell.classList.remove('active');
  }, HIGHLIGHT_DURATION_MS);
}

function init() {
  const cells = buildGrid();
  setInterval(() => highlightRandomCell(cells), SPAWN_INTERVAL_MS);
}

document.addEventListener('DOMContentLoaded', init);