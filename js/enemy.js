// ---------- 敌人逻辑 ----------
function spawnEnemy() {
  if (enemies.length >= MAX_ENEMIES) return false;
  if (enemiesSpawned >= TOTAL_ENEMIES) return false;

  const spawnPoints = [
    [0, 0],
    [7, 0],
    [14, 0],
    [3, 0],
    [11, 0],
    [7, 1],
    [1, 1],
    [13, 1],
  ];

  const shuffled = [...spawnPoints].sort(() => Math.random() - 0.5);
  for (let [col, row] of shuffled) {
    if (!isValidCell(col, row)) continue;
    if (!isTankPassable(col, row)) continue;
    if (collidesWithPlayer(col, row)) continue;
    if (collidesWithEnemies(col, row)) continue;

    const dirs = ["up", "down", "left", "right"];
    const randomDir = dirs[Math.floor(Math.random() * 4)];

    const isElite = Math.random() < 0.25;
    const enemyType = isElite ? ENEMY_TYPE_ELITE : ENEMY_TYPE_NORMAL;

    enemies.push({
      x: col,
      y: row,
      dir: randomDir,
      cooldown: Math.floor(Math.random() * 20),
      alive: true,
      type: enemyType,
      hp: isElite ? 3 : 1,
      moveCounter: 0,

      // ===== 新增 AI 字段 =====
      aiTimer: 0, // AI 决策冷却
      aiInterval: isElite
        ? 20 + Math.floor(Math.random() * 15)
        : 40 + Math.floor(Math.random() * 30),
      target: "player", // 目标："player" 或 "base"
      stuckCounter: 0, // 卡住计数
      lastX: col, // 上一帧位置（检测是否卡住）
      lastY: row,
      dodgeChance: isElite ? 0.5 : 0.25, // 躲避概率
    });
    sfxEnemySpawn();
    enemiesSpawned++;
    return true;
  }
  return false;
}

function enemyShoot(enemy) {
  if (!enemy.alive) return;
  if (enemy.cooldown > 0) return;

  const dirVec = DIRS[enemy.dir];
  const bulletX = enemy.x + dirVec.dx;
  const bulletY = enemy.y + dirVec.dy;

  bullets.push({
    x: bulletX,
    y: bulletY,
    dir: enemy.dir,
    owner: "enemy",
    alive: true,
    speed: 1,
    frameCounter: 0,
    moveCounter: 0,
  });

  sfxEnemyShoot();
  enemy.cooldown = ENEMY_SHOOT_COOLDOWN;
}

function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.alive) continue;

    // 冷却
    if (e.cooldown > 0) e.cooldown--;

    // ===== 卡住检测 =====
    if (e.x === e.lastX && e.y === e.lastY) {
      e.stuckCounter++;
    } else {
      e.stuckCounter = 0;
      e.lastX = e.x;
      e.lastY = e.y;
    }

    // ===== AI 决策（每隔 aiInterval 帧重新规划） =====
    e.aiTimer++;
    if (e.aiTimer >= e.aiInterval || e.stuckCounter > 20) {
      e.aiTimer = 0;
      e.stuckCounter = 0;

      // 选择目标：优先玩家，如果玩家离得远则打基地
      if (player.isAlive) {
        const distToPlayer =
          Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
        const distToBase = Math.abs(e.x - base.x) + Math.abs(e.y - base.y);
        // 精英更倾向于追玩家，普通敌人有时会打基地
        if (e.type === ENEMY_TYPE_ELITE || distToPlayer < 8) {
          e.target = "player";
        } else if (Math.random() < 0.3) {
          e.target = "base";
        } else {
          e.target = "player";
        }
      } else {
        e.target = "base";
      }

      // 选择最佳方向（向目标靠近 + 避开障碍）
      e.dir = chooseBestDirection(e, i);
    }

    // ===== 子弹躲避（仅精英） =====
    if (e.type === ENEMY_TYPE_ELITE && Math.random() < e.dodgeChance) {
      if (isBulletIncoming(e)) {
        // 尝试垂直方向躲
        const perpDirs =
          e.dir === "up" || e.dir === "down"
            ? ["left", "right"]
            : ["up", "down"];
        for (let pd of perpDirs) {
          const vec = DIRS[pd];
          const nx = e.x + vec.dx;
          const ny = e.y + vec.dy;
          if (
            isValidCell(nx, ny) &&
            isTankPassable(nx, ny) &&
            !collidesWithPlayer(nx, ny) &&
            !collidesWithEnemies(nx, ny, i)
          ) {
            e.dir = pd;
            break;
          }
        }
      }
    }

    // ===== 移动 =====
    if (e.moveCounter === undefined) e.moveCounter = 0;
    e.moveCounter++;

    if (e.moveCounter >= ENEMY_MOVE_COOLDOWN) {
      e.moveCounter = 0;

      const dirVec = DIRS[e.dir];
      const newX = e.x + dirVec.dx;
      const newY = e.y + dirVec.dy;

      let canMove = true;
      if (!isValidCell(newX, newY)) canMove = false;
      else if (!isTankPassable(newX, newY)) canMove = false;
      else if (collidesWithPlayer(newX, newY)) canMove = false;
      else if (collidesWithEnemies(newX, newY, i)) canMove = false;

      if (canMove) {
        e.x = newX;
        e.y = newY;
      } else {
        // 撞墙，强制重新决策
        e.aiTimer = e.aiInterval;
      }
    }

    // ===== 射击 =====
    // 只有对准玩家或基地时才射击（不会乱打）
    const aheadX = e.x + DIRS[e.dir].dx;
    const aheadY = e.y + DIRS[e.dir].dy;

    let shouldShoot = false;

    // 前方是玩家 → 射
    if (player.isAlive && player.x === aheadX && player.y === aheadY) {
      shouldShoot = true;
    }
    // 前方是基地 → 射
    else if (base.alive && base.x === aheadX && base.y === aheadY) {
      shouldShoot = true;
    }
    // 前方是砖块（挡路）→ 有机会射击清除
    else if (hasBlock(aheadX, aheadY) && Math.random() < 0.04) {
      shouldShoot = true;
    }
    // 同一直线上玩家（横向或纵向对齐）→ 射
    else if (player.isAlive && e.cooldown === 0) {
      const alignedH = e.y === player.y && Math.abs(e.x - player.x) < 8;
      const alignedV = e.x === player.x && Math.abs(e.y - player.y) < 8;
      if ((alignedH || alignedV) && Math.random() < 0.15) {
        shouldShoot = true;
      }
    }

    if (shouldShoot) {
      enemyShoot(e);
    }
  }

  // 保持敌人数量
  while (enemies.length < MAX_ENEMIES && enemiesSpawned < TOTAL_ENEMIES) {
    if (!spawnEnemy()) break;
  }
}

// 根据目标选择最有利的移动方向（会评估每个方向的“得分”）
function chooseBestDirection(e, selfIndex) {
  const dirs = ["up", "down", "left", "right"];

  // 目标坐标
  let targetX, targetY;
  if (e.target === "player" && player.isAlive) {
    targetX = player.x;
    targetY = player.y;
  } else {
    targetX = base.x;
    targetY = base.y;
  }

  let bestDir = e.dir;
  let bestScore = -Infinity;

  for (let dir of dirs) {
    const vec = DIRS[dir];
    const nx = e.x + vec.dx;
    const ny = e.y + vec.dy;

    let score = 0;

    // 1. 不能走 → 直接淘汰
    if (!isValidCell(nx, ny)) continue;
    if (!isTankPassable(nx, ny)) continue;
    if (collidesWithPlayer(nx, ny)) continue;
    if (collidesWithEnemies(nx, ny, selfIndex)) continue;

    // 2. 距离目标越近越好
    const oldDist = Math.abs(e.x - targetX) + Math.abs(e.y - targetY);
    const newDist = Math.abs(nx - targetX) + Math.abs(ny - targetY);
    score += (oldDist - newDist) * 10;

    // 3. 前方是否有砖块（挡路）→ 减分
    const aheadX = nx + vec.dx;
    const aheadY = ny + vec.dy;
    if (hasBlock(aheadX, aheadY)) score -= 5;

    // 4. 如果前方就是玩家/基地 → 大幅加分
    if (player.isAlive && player.x === aheadX && player.y === aheadY)
      score += 50;
    if (base.alive && base.x === aheadX && base.y === aheadY) score += 40;

    // 5. 随机小扰动，避免多个敌人走同一条路
    score += Math.random() * 3;

    // 6. 不要撞死胡同（如果是精英，会检查更远）
    if (e.type === ENEMY_TYPE_ELITE) {
      // 检查这个方向前方2格是否可走
      const farX = nx + vec.dx;
      const farY = ny + vec.dy;
      if (!isValidCell(farX, farY) || !isTankPassable(farX, farY)) {
        score -= 8;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  return bestDir;
}

// 检查是否有敌人子弹正在朝自己飞来
function isBulletIncoming(e) {
  for (let b of bullets) {
    if (!b.alive || b.owner !== "player") continue;
    // 子弹方向和位置
    const vec = DIRS[b.dir];
    // 判断子弹是否在同一直线上，且朝向自己
    if (b.dir === "up" && b.x === e.x && b.y > e.y) return true;
    if (b.dir === "down" && b.x === e.x && b.y < e.y) return true;
    if (b.dir === "left" && b.y === e.y && b.x > e.x) return true;
    if (b.dir === "right" && b.y === e.y && b.x < e.x) return true;
  }
  return false;
}
