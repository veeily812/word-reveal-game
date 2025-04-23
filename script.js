// === CONFIG ===
const secretWords =[
  { word: "COMMUNITY", row: 0, col: 0, direction: "horizontal" },
  { word: "ENERGY", row: 1, col: 3, direction: "horizontal" },
  { word: "CONFIDENT", row: 2, col: 0, direction: "horizontal" },
  { word: "QUALITY", row: 3, col: 4, direction: "horizontal" },
  { word: "CREATIVE", row: 5, col: 2, direction: "horizontal" },
  { word: "ENTHUSIASTIC", row: 4, col: 0, direction: "horizontal" }
];

const KEYWORD = "UNIQUE";
const ROWS = 6;
const COLS = 12;
let revealedRows = new Set();
let guessedLetters = new Set();

const board = document.getElementById("wordBoard");
const input = document.getElementById("guessInput");
const result = document.getElementById("result");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicControl = document.getElementById("musicControl");
const endGameBtn = document.getElementById("endGameBtn");
const guessBtn = document.getElementById("guessBtn");
const rowButtons = document.querySelectorAll('.row-btn');

// Start background music only after user interaction
document.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(error => {
      console.log("Autoplay prevented. Please interact with the page to start music.");
    });
  }
}, { once: true });

function toggleMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    musicControl.textContent = "🔊";
    musicControl.classList.remove("muted");
  } else {
    backgroundMusic.pause();
    musicControl.textContent = "🔇";
    musicControl.classList.add("muted");
  }
}

// Create keyword reveal line but hide it initially
const keywordLine = document.createElement("div");
keywordLine.className = "keyword-line";
keywordLine.style.display = "none";
KEYWORD.split('').forEach(char => {
  const tile = document.createElement("div");
  tile.className = "keyword-tile";
  tile.textContent = char;
  keywordLine.appendChild(tile);
});
document.querySelector(".container").appendChild(keywordLine);

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

secretWords.forEach(({ word, row, col, direction }) => {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "horizontal" ? row : row + i;
    const c = direction === "horizontal" ? col + i : col;
    grid[r][c] = word[i];
  }
});

function renderBoard() {
  board.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const letter = grid[r][c];
      const div = document.createElement("div");

      // Check for custom highlight on column 5 (index 4)
      if (c === 4) {
        div.className = "tile column-highlight";
      }
      else {
        div.className = letter ? "tile" : "tile blank";
      }

      // Show letter if either:
      // 1. The row has been revealed and it's part of the word in that row
      // 2. The letter has been correctly guessed
      const isInRevealedRow = revealedRows.has(r) && 
        secretWords.some(word => word.row === r && c >= word.col && c < word.col + word.word.length);
      
      div.textContent = (isInRevealedRow || (letter && guessedLetters.has(letter))) ? letter : "";
      board.appendChild(div);
    }
  }
}

function checkGuess() {
  const guess = input.value.trim().toUpperCase();
  input.value = "";

  if (!guess || guess.length !== 1 || guessedLetters.has(guess)) {
    result.textContent = "⛔ Please enter a new single letter.";
    return;
  }

  guessedLetters.add(guess);
  let foundCount = 0;

  secretWords.forEach(({ word }) => {
    foundCount += [...word].filter(l => l === guess).length;
  });

  if (foundCount > 0) {
    result.innerHTML = `✅ Found ${foundCount} '${guess}'!`;
    correctSound.play();
  } else {
    result.innerHTML = `❌ No '${guess}' found.`;
    wrongSound.play();
  }

  renderBoard();

  if (isWin()) {
    result.innerHTML = "🏆 You revealed all letters! Game Over.";
    keywordLine.style.display = "flex";
    disableGame();
  }
}

function revealRow(rowIndex) {
  // Check if row has already been revealed
  if (revealedRows.has(rowIndex)) {
    result.textContent = `⛔ This row has already been reviewed!`;
    return;
  }

  // Find the word in this row
  const wordInRow = secretWords.find(word => word.row === rowIndex);
  if (!wordInRow) {
    result.textContent = `⛔ No word found in this row!`;
    return;
  }

  // Mark row as revealed and update button
  revealedRows.add(rowIndex);
  const rowButton = document.querySelector(`.row-btn[onclick="revealRow(${rowIndex})"]`);
  if (rowButton) {
    rowButton.disabled = true;
    rowButton.style.opacity = '0.5';
  }

  result.textContent = `✅ Revealed word "${wordInRow.word}"!`;
  correctSound.play();
  renderBoard();

  if (isWin()) {
    result.innerHTML = "🏆 You revealed all letters! Game Over.";
    keywordLine.style.display = "flex";
    disableGame();
  }
}

function isWin() {
  // Win if either all rows are revealed OR all letters have been guessed
  const allRowsRevealed = secretWords.every(({ row }) => revealedRows.has(row));
  const allLettersGuessed = secretWords.every(({ word }) =>
    [...word].every(l => guessedLetters.has(l))
  );
  return allRowsRevealed || allLettersGuessed;
}

function endGame() {
  result.textContent = "🔚 Game ended by user.";
  disableGame();
}

function disableGame() {
  input.disabled = true;
  guessBtn.disabled = true;
  endGameBtn.disabled = true;
  endGameBtn.style.backgroundColor = "#aaa";
  // Disable all remaining review buttons
  document.querySelectorAll('.row-btn').forEach(btn => {
    btn.disabled = true;
    btn.style.backgroundColor = '#ccc';
  });
}

renderBoard();
