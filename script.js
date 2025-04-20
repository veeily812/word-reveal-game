// === CONFIG ===
const secretWords = [
  { word: "COMMUNITY", row: 0, col: 0, direction: "vertical" },
  { word: "ENERGY", row: 3, col: 1, direction: "vertical" },
  { word: "CONFIDENT", row: 0, col: 2, direction: "vertical" },
  { word: "EQUITY", row: 3, col: 3, direction: "vertical" },
  { word: "CREATIVITY", row: 2, col: 4, direction: "vertical" }
];

const KEYWORD = "UNIQUE";
const ROWS = 10;
const COLS = 5;
let guessedLetters = new Set();
let timer;
let timeLeft = 15;

const board = document.getElementById("wordBoard");
const input = document.getElementById("guessInput");
const result = document.getElementById("result");
const timeDisplay = document.getElementById("timeLeft");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const endGameBtn = document.getElementById("endGameBtn");
const guessBtn = document.getElementById("guessBtn");

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

      // Check for custom highlight on row 5 (index 4) and columns 0–4
      if (r === 4 && c >= 0 && c <= 4) {
        div.className = "tile special-highlight";
      } else {
        div.className = letter ? "tile" : "tile blank";
      }

      div.textContent = guessedLetters.has(letter) ? letter : "";
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
    clearInterval(timer);
  } else {
    resetTimer();
  }
}

function isWin() {
  return secretWords.every(({ word }) =>
    [...word].every(l => guessedLetters.has(l))
  );
}

function startTimer() {
  timeLeft = 15;
  timeDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      result.innerHTML = "⏳ Time's up! Try next letter...";
      wrongSound.play();
      resetTimer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

function endGame() {
  clearInterval(timer);
  result.textContent = "🔚 Game ended by user.";
  disableGame();
}

function disableGame() {
  input.disabled = true;
  guessBtn.disabled = true;
  endGameBtn.disabled = true;
  endGameBtn.style.backgroundColor = "#aaa";
}

renderBoard();
startTimer();