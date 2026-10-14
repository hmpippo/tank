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
  resetPowerups();

  level = 1;
  score = 0;
  lives = 3;
  levelTransitionTimer = 0;
  levelCleared = false;
  TOTAL_ENEMIES = getEnemiesForLevel(level);
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
  // ===== 过关过渡中 =====
  if (levelCleared) {
    levelTransitionTimer--;
    if (levelTransitionTimer <= 0) {
      // 过渡结束，开始新一关
      startNextLevel();
    }
    draw();
    frameCounter++;
    animationFrame = requestAnimationFrame(gameLoop);
    return;
  }

  if (!gameOver && !paused) {
    handlePlayerInput();
    updateEnemies();
    updateBullets();
    updateExplosions();
    updatePowerups();

    if (!player.isAlive && lives > 0) {
      respawnPlayer();
    }

    // 敌人全灭 → 过关
    if (enemiesKilled >= TOTAL_ENEMIES && !levelCleared) {
      levelCleared = true;
      levelTransitionTimer = LEVEL_TRANSITION_DURATION;
      sfxLevelClear && sfxLevelClear();
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
  levelCleared = false;
  levelTransitionTimer = 0;
  animationFrame = requestAnimationFrame(gameLoop);
}

// ---------- 启动 ----------
window.addEventListener("load", () => {
  const canvasEl = document.getElementById("gameCanvas");
  initRender(canvasEl);
  initInput();
  initMobileControls && initMobileControls();
  initAudio && initAudio();

  // 重新开始
  document.getElementById("restartBtn").addEventListener("click", () => {
    resumeAudio && resumeAudio();
    restartGame();
  });

  // 暂停
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      resumeAudio && resumeAudio();
      togglePause();
    });
  }

  // 全屏切换
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      resumeAudio && resumeAudio();
      toggleFullscreen();
    });
    // 全屏状态变化时同步按钮文字
    document.addEventListener("fullscreenchange", updateFullscreenBtnText);
    document.addEventListener(
      "webkitfullscreenchange",
      updateFullscreenBtnText,
    );
    updateFullscreenBtnText();
  }

  // 音效开关
  const soundBtn = document.getElementById("soundBtn");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      if (typeof soundEnabled !== "undefined") {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? "🔊 音效" : "🔇 静音";
      } else {
        soundBtn.textContent = "🔇 静音";
      }
    });
  }

  initGame();
  animationFrame = requestAnimationFrame(gameLoop);

  window.addEventListener("beforeunload", () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
});

// ---------- 全屏 ----------
function toggleFullscreen() {
  const el = document.documentElement;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;

  if (!isFs) {
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) req.call(el);
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  }
}

function updateFullscreenBtnText() {
  const btn = document.getElementById("fullscreenBtn");
  if (!btn) return;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  btn.textContent = isFs ? "⛶ 退出全屏" : "⛶ 全屏";
}

// ---------- 暂停 ----------
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

// 开始新一关（保留分数、生命、关卡数）
function startNextLevel() {
  // 关卡 +1
  level++;

  // 每 3 关奖励 1 条命
  if ((level - 1) % LIVES_REWARD_EVERY === 0 && level > 1) {
    lives++;
    updateScoreAndLives();
    sfxExtraLife && sfxExtraLife();
  }

  // 重新生成地图
  generateBlocks();

  // 重置玩家位置
  player.x = 7;
  player.y = 12;
  player.dir = "up";
  player.isAlive = true;
  player.cooldown = 0;
  player.moveCounter = 0;

  // 清空子弹、爆炸、道具
  bullets = [];
  explosions = [];
  resetPowerups();

  // 重置敌人
  enemies = [];
  enemiesSpawned = 0;
  enemiesKilled = 0;
  TOTAL_ENEMIES = getEnemiesForLevel(level);

  // 生成初始敌人
  for (let i = 0; i < MAX_ENEMIES; i++) {
    spawnEnemy();
  }

  // 重置按键
  for (let k in keys) keys[k] = false;

  // 进入过渡状态
  levelCleared = false;
  levelTransitionTimer = 0;
  gameOver = false;
  winFlag = false;
}
