// ---------- 工具函数 ----------
function isValidCell(col, row) {
  return col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE;
}

function hasBlock(col, row) {
  return isValidCell(col, row) && blocks[row][col] === TILE_BRICK;
}

function hasSteel(col, row) {
  return isValidCell(col, row) && blocks[row][col] === TILE_STEEL;
}

function hasGrass(col, row) {
  return isValidCell(col, row) && blocks[row][col] === TILE_GRASS;
}

// 坦克能否通过：空地或草地
function isTankPassable(col, row) {
  if (!isValidCell(col, row)) return false;
  const t = blocks[row][col];
  return t === TILE_EMPTY || t === TILE_GRASS;
}

function collidesWithPlayer(col, row) {
  return player.isAlive && player.x === col && player.y === row;
}

function collidesWithEnemies(col, row, ignoreIndex = -1) {
  for (let i = 0; i < enemies.length; i++) {
    if (i === ignoreIndex) continue;
    const e = enemies[i];
    if (e.alive && e.x === col && e.y === row) return true;
  }
  return false;
}

function updateScoreAndLives() {
  document.getElementById("scoreDisplay").textContent = score;
  document.getElementById("livesDisplay").textContent = lives;
}
