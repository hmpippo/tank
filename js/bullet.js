// ---------- 子弹逻辑 ----------
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b.alive) {
      bullets.splice(i, 1);
      continue;
    }

    if (b.moveCounter === undefined) b.moveCounter = 0;
    b.moveCounter++;

    if (b.moveCounter < BULLET_MOVE_COOLDOWN) continue;
    b.moveCounter = 0;

    // 先检查当前位置（防止近距离穿透）
    if (checkBulletHitAt(b, b.x, b.y, i)) continue;

    // 计算移动后的位置
    const dirVec = DIRS[b.dir];
    const newX = b.x + dirVec.dx;
    const newY = b.y + dirVec.dy;

    // 边界
    if (!isValidCell(newX, newY)) {
      bullets.splice(i, 1);
      continue;
    }

    // 检查移动后的位置
    if (checkBulletHitAt(b, newX, newY, i)) continue;

    // 更新位置
    b.x = newX;
    b.y = newY;
  }
}

// 检查子弹在指定格子是否命中目标
// 返回 true 表示命中并已处理（子弹应被移除）
function checkBulletHitAt(b, x, y, bulletIndex) {
  // 地形
  const tileType = blocks[y][x];
  if (tileType === TILE_BRICK) {
    blocks[y][x] = TILE_EMPTY;
    sfxHitBrick();
    bullets.splice(bulletIndex, 1);
    return true;
  }
  if (tileType === TILE_STEEL) {
    sfxHitSteel();
    bullets.splice(bulletIndex, 1);
    return true;
  }
  // 草地：穿过

  // 老家基地
  if (base.alive && x === base.x && y === base.y) {
    createExplosion(base.x, base.y);
    sfxBaseDestroyed();
    base.alive = false;
    gameOver = true;
    winFlag = false;
    bullets.splice(bulletIndex, 1);
    return true;
  }

  // 击中玩家（敌人子弹）
  if (
    b.owner === "enemy" &&
    player.isAlive &&
    player.x === x &&
    player.y === y
  ) {
    bullets.splice(bulletIndex, 1); // 子弹消失

    // 有护盾 → 免疫这次伤害
    if (playerShield > 0) {
      playerShield = 0; // 护盾破掉
      sfxShieldBreak && sfxShieldBreak();
      return true;
    }

    // 无护盾 → 正常受伤
    createExplosion(player.x, player.y);
    sfxPlayerHit();
    player.isAlive = false;
    lives--;
    updateScoreAndLives();

    if (lives <= 0) {
      gameOver = true;
      sfxGameOver();
    } else {
      respawnPlayer();
    }
    return true;
  }

  // 击中敌人（玩家子弹）
  if (b.owner === "player") {
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (e.alive && e.x === x && e.y === y) {
        e.hp--;
        bullets.splice(bulletIndex, 1);

        if (e.hp <= 0) {
          createExplosion(e.x, e.y);
          sfxEnemyDestroyed();
          e.alive = false;
          enemies.splice(j, 1);
          enemiesKilled++;
          score += e.type === ENEMY_TYPE_ELITE ? 300 : 100;
          updateScoreAndLives();

          if (enemiesKilled >= TOTAL_ENEMIES) {
            winFlag = true;
            gameOver = true;
            sfxWin();
          } else {
            if (enemiesSpawned < TOTAL_ENEMIES) {
              spawnEnemy();
            }
          }
        }
        return true;
      }
    }
  }

  return false;
}
