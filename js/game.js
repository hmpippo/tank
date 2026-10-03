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
  paused = false;
  updateScoreAndLives();

  generateBlocks();

  for (let i = 0; i < MAX_ENEMIES; i++) {
    spawnEnemy();
  }

  for (let k in keys) keys[k] = false;
}

function gameLoop() {
  if (!gameOver && !paused) {
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
  paused = false;
  animationFrame = requestAnimationFrame(gameLoop);
}

// ---------- 启动 ----------
window.addEventListener("load", () => {
  const canvasEl = document.getElementById("gameCanvas");
  initRender(canvasEl);
  initInput();
  initMobileControls();
  initAudio();

  document.getElementById("restartBtn").addEventListener("click", () => {
    resumeAudio(); // ← 用户点击时恢复音频
    restartGame();
  });

  document.getElementById("pauseBtn").addEventListener("click", () => {
    resumeAudio();
    togglePause();
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

function togglePause() {
  if (gameOver) return; // 游戏结束后不能暂停
  paused = !paused;
  // 暂停时清空按键状态，防止恢复后坦克“卡方向”
  if (paused) {
    resetKeys();
  }
  // 同步按钮文字
  const btn = document.getElementById("pauseBtn");
  if (btn) {
    btn.textContent = paused ? "▶ 继续" : "⏸ 暂停";
  }
}
