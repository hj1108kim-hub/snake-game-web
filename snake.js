const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const grid = 20;
let snake, apple, score, gameOver, speed, speedName, ranking;
let frameCount, intervalId;

const SPEEDS = {
  easy: 10,
  normal: 6,
  hard: 4,
  hell: 2
};

function loadRanking() {
  let data = localStorage.getItem('snakeRanking');
  if (data) return JSON.parse(data);
  return [];
}

function saveRanking(ranking) {
  localStorage.setItem('snakeRanking', JSON.stringify(ranking));
}

function updateRanking(newScore) {
  ranking.push(newScore);
  ranking.sort((a, b) => b - a);
  ranking = ranking.slice(0, 5);
  saveRanking(ranking);
  renderRanking();
}

function renderRanking() {
  const rankingList = document.getElementById('rankingList');
  rankingList.innerHTML = '';
  ranking.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}위: ${s}점`;
    rankingList.appendChild(li);
  });
}

function setSpeed(level) {
  speedName = level;
  speed = SPEEDS[level];
  document.querySelectorAll('.controls button').forEach(btn => btn.disabled = false);
  document.getElementById('restartBtn').disabled = true;
  restartGame();
}

function restartGame() {
  snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
  apple = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid };
  score = 0;
  gameOver = false;
  frameCount = 0;
  document.getElementById('restartBtn').disabled = true;
  if (intervalId) cancelAnimationFrame(intervalId);
  gameLoop();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function gameLoop() {
  intervalId = requestAnimationFrame(gameLoop);
  frameCount++;
  if (frameCount < speed) return;
  frameCount = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    snake.x += snake.dx;
    snake.y += snake.dy;

    // 벽에 부딪히면 게임 오버
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
      gameOver = true;
      updateRanking(score);
      document.getElementById('restartBtn').disabled = false;
      return;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) snake.cells.pop();

    // 자기 몸에 부딪히면 게임 오버
    for (let i = 1; i < snake.cells.length; i++) {
      if (snake.cells[0].x === snake.cells[i].x && snake.cells[0].y === snake.cells[i].y) {
        gameOver = true;
        updateRanking(score);
        document.getElementById('restartBtn').disabled = false;
        return;
      }
    }

    ctx.fillStyle = '#4caf50';
    snake.cells.forEach(cell => ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1));

    ctx.fillStyle = '#e91e63';
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    if (snake.x === apple.x && snake.y === apple.y) {
      snake.maxCells++;
      score++;
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 390);
    ctx.fillText('Speed: ' + speedName, 300, 390);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.fillText('Game Over!', 110, 200);
    ctx.font = '18px Arial';
    ctx.fillText('점수: ' + score, 170, 240);
    ctx.fillText('Restart 버튼을 누르세요.', 110, 270);
  }
}

document.addEventListener('keydown', function (e) {
  if (gameOver) return;
  if (e.key === 'ArrowLeft' && snake.dx === 0) {
    snake.dx = -grid; snake.dy = 0;
  } else if (e.key === 'ArrowUp' && snake.dy === 0) {
    snake.dy = -grid; snake.dx = 0;
  } else if (e.key === 'ArrowRight' && snake.dx === 0) {
    snake.dx = grid; snake.dy = 0;
  } else if (e.key === 'ArrowDown' && snake.dy === 0) {
    snake.dy = grid; snake.dx = 0;
  }
});

// 최초 세팅
window.onload = function () {
  ranking = loadRanking();
  renderRanking();
  setSpeed('normal');
};
