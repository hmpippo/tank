// ---------- 初始化 & 主循环 ----------
function initGame() {
  player = {
    x: 7,
    y: 12,
    dir: "up",
    isAlive: true,
    cooldown: 0,
    moveCounter: 0,
  };

  enemies = [];
  enemiesSpawned = 0;
  enemiesKilled = 0;

  bullets = [];
  explosions = [];

  score = 0;
  lives = 3;
  gameOver = false;
  winFlag = false;
  updateScoreAndLives();

  generateBlocks();

  for (let i = 0; i < MAX_ENEMIES; i++) {
    spawnEnemy();
  }

  for (let k in keys) keys[k] = false;
}

function gameLoop() {
  if (!gameOver) {
    handlePlayerInput();
    updateEnemies();
    updateBullets();
    updateExplosions();

    if (!player.isAlive && lives > 0) {
      respawnPlayer();
    }

    if (enemiesKilled >= TOTAL_ENEMIES) {
      winFlag = true;
      gameOver = true;
      sfxWin();
    }
  }

  draw();
  frameCounter++;
  animationFrame = requestAnimationFrame(gameLoop);
}

function restartGame() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  initGame();
  resetKeys();
  gameOver = false;
  winFlag = false;
  animationFrame = requestAnimationFrame(gameLoop);
}

// ---------- 启动 ----------
window.addEventListener("load", () => {
  const canvasEl = document.getElementById("gameCanvas");
  initRender(canvasEl);
  initInput();
  initAudio();

  document.getElementById("restartBtn").addEventListener("click", () => {
    resumeAudio(); // ← 用户点击时恢复音频
    restartGame();
  });

  document.getElementById("soundBtn").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    document.getElementById("soundBtn").textContent = soundEnabled
      ? "🔊 音效"
      : "🔇 静音";
  });

  initGame();
  animationFrame = requestAnimationFrame(gameLoop);

  window.addEventListener("beforeunload", () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
});
