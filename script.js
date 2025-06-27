const GOAL_CANS = 25;
let currentCans = 0;
let gameActive = false;
let spawnInterval;
let timerInterval;
let timeLeft = 30;

const DIFFICULTY_TIMES = {
  easy: 30,
  medium: 25,
  hard: 20
};
let selectedDifficulty = 'easy';
let correctStreak = 0; // Track correct (clean can) streak

// Create the 3x3 game grid
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Update score display
function updateScoreDisplay() {
  document.getElementById('current-cans').textContent = currentCans;
}

// Update timer display
function updateTimerDisplay() {
  document.getElementById('timer').textContent = timeLeft;
}

// Floating +10 / -10 animation
function createFloatingText(event, text, color) {
  const floating = document.createElement('div');
  floating.textContent = text;
  floating.className = 'floating-points';
  floating.style.color = color;

  const gridCell = event.currentTarget.closest('.grid-cell');
  if (gridCell) {
    gridCell.appendChild(floating);
  }

  setTimeout(() => floating.remove(), 700);
}

const milestoneMessages = [
  "Great start! 5 correct in a row!",
  "Awesome! 10 correct in a row!",
  "Almost there! 15 correct in a row!",
  "Incredible! 20 correct in a row!",
  "WOAH! 25 correct in a row!"
];

// Show milestone message
function showMilestoneMessage(streak) {
  const achievements = document.getElementById('achievements');
  let message = "";
  if (streak === 5) message = milestoneMessages[0];
  else if (streak === 10) message = milestoneMessages[1];
  else if (streak === 15) message = milestoneMessages[2];
  else if (streak === 20) message = milestoneMessages[3];
  else if (streak === 25) message = milestoneMessages[4];
  if (message) {
    achievements.textContent = message;
    achievements.style.opacity = 1;
    setTimeout(() => {
      achievements.style.opacity = 0;
    }, 1800);
  }
}

// Handle clicking a water can (clean or polluted)
function handleCanClick(event) {
  if (!gameActive) return;

  const isPolluted = event.currentTarget.getAttribute('data-polluted') === 'true';
  const scoreElement = document.getElementById('current-cans');
  const gridCell = event.currentTarget.closest('.grid-cell');

  if (isPolluted) {
    currentCans = Math.max(0, currentCans - 10);
    createFloatingText(event, '-10', '#F5402C');
    scoreElement.classList.add('score-loss');
    setTimeout(() => scoreElement.classList.remove('score-loss'), 300);

    // Add red highlight to the grid cell
    if (gridCell) {
      gridCell.classList.add('collected-bad');
      setTimeout(() => gridCell.classList.remove('collected-bad'), 300);
    }

    correctStreak = 0; // Reset streak on wrong click
  } else {
    currentCans += 10;
    createFloatingText(event, '+10', '#4FCB53');
    scoreElement.classList.add('score-flash');
    setTimeout(() => scoreElement.classList.remove('score-flash'), 300);

    // Add yellow highlight to the grid cell
    if (gridCell) {
      gridCell.classList.add('collected');
      setTimeout(() => gridCell.classList.remove('collected'), 300);
    }

    correctStreak++; // Increase streak on correct click

    // Show milestone message at every 5 correct in a row (up to 25)
    if (correctStreak > 0 && correctStreak % 5 === 0 && correctStreak <= 25) {
      showMilestoneMessage(correctStreak);
    }
  }

  updateScoreDisplay();

  const canWrapper = event.currentTarget.closest('.water-can-wrapper');
  if (canWrapper && canWrapper.parentElement) {
    canWrapper.parentElement.innerHTML = '';
  }
}

// Spawn water can (clean or polluted)
function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  const isPolluted = Math.random() < 0.2;
  const canClass = isPolluted ? 'polluted-can' : 'water-can';
  const emoji = isPolluted ? '💀' : '💧';

  const wrapperHTML = `
    <div class="water-can-wrapper">
      <div class="${canClass}" data-polluted="${isPolluted}">${emoji}</div>
    </div>
  `;

  randomCell.innerHTML = wrapperHTML;

  const can = randomCell.querySelector(`.${canClass}`);
  if (can) {
    can.addEventListener('click', handleCanClick);
  }
}

// Start countdown timer
function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Start or restart the game
function startGame() {
  // Get selected difficulty
  const difficultySelect = document.getElementById('difficulty');
  selectedDifficulty = difficultySelect ? difficultySelect.value : 'easy';
  timeLeft = DIFFICULTY_TIMES[selectedDifficulty] || 30;

  // Reset state
  gameActive = true;
  currentCans = 0;
  correctStreak = 0;
  updateScoreDisplay();
  updateTimerDisplay();

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  createGrid();

  // Start game
  spawnInterval = setInterval(spawnWaterCan, 1000);
  startTimer();

  const startButton = document.getElementById('start-game');
  startButton.textContent = 'Game in Progress...';
  startButton.disabled = true;
}

// End game when time runs out
function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelector('.game-grid').innerHTML = '';

  const startButton = document.getElementById('start-game');
  startButton.textContent = 'Play Again';
  startButton.disabled = false;
}

// Always active listener
document.getElementById('start-game').addEventListener('click', startGame);
createGrid();
