// ---------- 道具 ----------

// 生成一个随机道具
function spawnPowerup() {
  if (powerups.length >= POWERUP_MAX) return;

  // 找一个合法空地
  const candidates = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // 必须是空地（可以站人）
      if (blocks[row][col] !== TILE_EMPTY) continue;
      // 不能是基地和保护墙的位置
      if (col === base.x && row === base.y) continue;
      if (row === base.y - 1 && Math.abs(col - base.x) <= 1) continue;
      // 不能和现有道具重叠
      if (powerups.some((p) => p.x === col && p.y === row)) continue;
      // 不能和玩家重叠（防止一出现就被吃掉）
      if (player.isAlive && player.x === col && player.y === row) continue;
      // 不能和敌人重叠
      if (enemies.some((e) => e.alive && e.x === col && e.y === row)) continue;

      candidates.push([col, row]);
    }
  }

  if (candidates.length === 0) return;

  const [col, row] = candidates[Math.floor(Math.random() * candidates.length)];
  const roll = Math.random();
  let type;
  if (roll < 0.34) type = POWERUP_SHIELD;
  else if (roll < 0.67) type = POWERUP_FREEZE;
  else type = POWERUP_BASE_FORTIFY;

  powerups.push({
    x: col,
    y: row,
    type: type,
    frame: 0, // 动画帧
  });
}

// 更新道具（动画、计时、拾取）
function updatePowerups() {
  // 刷新计时
  powerupTimer++;
  if (powerupTimer >= POWERUP_SPAWN_INTERVAL) {
    powerupTimer = 0;
    spawnPowerup();
  }

  // 道具动画和拾取
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.frame++;

    // 玩家碰到道具
    if (player.isAlive && player.x === p.x && player.y === p.y) {
      if (p.type === POWERUP_SHIELD) {
        playerShield = SHIELD_DURATION;
        sfxPowerupShield && sfxPowerupShield();
      } else if (p.type === POWERUP_FREEZE) {
        freezeTimer = FREEZE_DURATION;
        sfxPowerupFreeze && sfxPowerupFreeze();
      } else if (p.type === POWERUP_BASE_FORTIFY) {
        activateBaseFortify();
        sfxPowerupFortify && sfxPowerupFortify();
      }
      powerups.splice(i, 1);
    }
  }

  // 玩家护盾计时
  if (playerShield > 0) playerShield--;

  // 冰冻计时
  if (freezeTimer > 0) freezeTimer--;

  // 老家加固计时
  if (baseFortifyTimer > 0) {
    baseFortifyTimer--;
    if (baseFortifyTimer === 0) {
      // 时间到，恢复原状
      restoreBaseWalls();
    }
  }
}

// 重置道具相关状态（重开游戏时调用）
function resetPowerups() {
  powerups = [];
  powerupTimer = 0;
  playerShield = 0;
  freezeTimer = 0;
  // 如果加固还在生效，先恢复
  if (baseFortifyTimer > 0) {
    restoreBaseWalls();
  }
  baseFortifyTimer = 0;
  baseWallBackup = null;
}

// ---------- 老家金刚石加固 ----------
function getBaseWallPositions() {
  return [
    [base.x - 1, base.y], // 左
    [base.x + 1, base.y], // 右
    [base.x - 1, base.y - 1], // 左上
    [base.x, base.y - 1], // 正上
    [base.x + 1, base.y - 1], // 右上
  ];
}

// 激活加固：5 个保护墙位置全部变成金刚石
function activateBaseFortify() {
  // 如果已经在加固中，先恢复再重新加固（刷新时间）
  if (baseFortifyTimer > 0) {
    restoreBaseWalls();
  }

  // 备份原来的状态
  baseWallBackup = {};
  const positions = getBaseWallPositions();

  for (let [c, r] of positions) {
    if (!isValidCell(c, r)) continue;
    const key = c + "," + r;
    // 记录原来的地形类型（可能是砖块、空地、金刚石等）
    baseWallBackup[key] = blocks[r][c];
  }

  // 全部变成金刚石
  for (let [c, r] of positions) {
    if (!isValidCell(c, r)) continue;
    blocks[r][c] = TILE_STEEL;
  }

  baseFortifyTimer = BASE_FORTIFY_DURATION;
}

// 恢复：把备份的状态还原
function restoreBaseWalls() {
  if (!baseWallBackup) return;

  const positions = getBaseWallPositions();
  for (let [c, r] of positions) {
    if (!isValidCell(c, r)) continue;
    const key = c + "," + r;
    // 恢复成备份的地形类型
    // 如果备份里没有（理论上不会），默认为砖块
    const originalType =
      key in baseWallBackup ? baseWallBackup[key] : TILE_BRICK;
    blocks[r][c] = originalType;
  }

  baseWallBackup = null;
  baseFortifyTimer = 0;
}
