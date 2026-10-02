// ---------- 地图生成 ----------
function generateBlocks() {
  blocks = Array(GRID_SIZE)
    .fill()
    .map(() => Array(GRID_SIZE).fill(TILE_EMPTY));

  // ========== 1. 先固定老家基地 ==========
  base.x = 7;
  base.y = 14;
  base.alive = true;
  blocks[base.y][base.x] = TILE_EMPTY; // 基地本身是空地

  // ========== 2. 固定老家保护墙（5块砖块） ==========
  const wallPositions = [
    [base.x - 1, base.y], // 左
    [base.x + 1, base.y], // 右
    [base.x - 1, base.y - 1], // 左上
    [base.x, base.y - 1], // 正上
    [base.x + 1, base.y - 1], // 右上
  ];
  for (let [c, r] of wallPositions) {
    if (isValidCell(c, r)) blocks[r][c] = TILE_BRICK;
  }

  // ========== 3. 固定玩家出生点 (7, 12) ==========
  // 玩家出生点及其周围一小圈设为空地（但不要清除保护墙）
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = 12 + dr,
        nc = 7 + dc;
      if (isValidCell(nc, nr) && !(nc === base.x && nr === base.y)) {
        // 不要清除基地保护墙
        if (!(nr === base.y - 1 && Math.abs(nc - base.x) <= 1)) {
          blocks[nr][nc] = TILE_EMPTY;
        }
      }
    }
  }

  // ========== 4. 固定敌人出生点安全区 ==========
  const spawnPoints = [
    [0, 0],
    [7, 0],
    [14, 0],
    [3, 0],
    [11, 0],
    [1, 1],
    [7, 1],
    [13, 1],
  ];
  for (let [c, r] of spawnPoints) {
    // 只清除出生点本身和左右相邻一格，避免随机地形把敌人堵死
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr,
          nc = c + dc;
        if (isValidCell(nc, nr)) {
          // 不要覆盖基地和保护墙
          if (nr === base.y - 1 && Math.abs(nc - base.x) <= 1) continue;
          if (nc === base.x && nr === base.y) continue;
          blocks[nr][nc] = TILE_EMPTY;
        }
      }
    }
  }

  // ========== 5. 随机生成地形 ==========
  // 定义哪些格子是"保留区"，不能随机放东西
  function isReserved(col, row) {
    // 基地
    if (col === base.x && row === base.y) return true;
    // 保护墙
    if (row === base.y - 1 && Math.abs(col - base.x) <= 1) return true;
    if (row === base.y && (col === base.x - 1 || col === base.x + 1))
      return true;
    // 玩家出生点周围 3x3
    if (Math.abs(col - 7) <= 1 && Math.abs(row - 12) <= 1) return true;
    // 敌人出生点周围 3x3
    for (let [sc, sr] of spawnPoints) {
      if (Math.abs(col - sc) <= 1 && Math.abs(row - sr) <= 1) return true;
    }
    return false;
  }

  // 随机砖块：密度约 18%
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isReserved(col, row)) continue;
      if (blocks[row][col] !== TILE_EMPTY) continue; // 已经有东西了跳过
      if (Math.random() < 0.18) {
        blocks[row][col] = TILE_BRICK;
      }
    }
  }

  // 随机金刚石：密度约 4%
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isReserved(col, row)) continue;
      if (blocks[row][col] !== TILE_EMPTY) continue;
      if (Math.random() < 0.04) {
        blocks[row][col] = TILE_STEEL;
      }
    }
  }

  // 随机草地：密度约 6%
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isReserved(col, row)) continue;
      if (blocks[row][col] !== TILE_EMPTY) continue;
      if (Math.random() < 0.06) {
        blocks[row][col] = TILE_GRASS;
      }
    }
  }

  // ========== 6. 确保连通性：从玩家出生点做一次 BFS，确保能到达敌人出生点区域 ==========
  ensureConnectivity();

  // ========== 7. 最后再次强制保证固定区域 ==========
  // 基地
  blocks[base.y][base.x] = TILE_EMPTY;
  // 保护墙
  for (let [c, r] of wallPositions) {
    if (isValidCell(c, r)) blocks[r][c] = TILE_BRICK;
  }
  // 玩家出生点
  if (isValidCell(7, 12)) blocks[12][7] = TILE_EMPTY;
  // 敌人出生点
  for (let [c, r] of spawnPoints) {
    if (isValidCell(c, r)) blocks[r][c] = TILE_EMPTY;
  }
}

// ---------- 连通性检查：确保玩家能走到敌人出生点 ----------
function ensureConnectivity() {
  // 从玩家出生点开始 BFS，只走可通行格（空地/草地）
  const visited = Array(GRID_SIZE)
    .fill()
    .map(() => Array(GRID_SIZE).fill(false));
  const queue = [[7, 12]]; // 玩家出生点
  visited[12][7] = true;

  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    for (let [dx, dy] of directions) {
      const nx = cx + dx,
        ny = cy + dy;
      if (!isValidCell(nx, ny)) continue;
      if (visited[ny][nx]) continue;
      const t = blocks[ny][nx];
      // 砖块和金刚石不可通行，草地可通行
      if (t === TILE_BRICK || t === TILE_STEEL) continue;
      visited[ny][nx] = true;
      queue.push([nx, ny]);
    }
  }

  // 检查是否所有敌人出生点都能到达
  const spawnPoints = [
    [0, 0],
    [7, 0],
    [14, 0],
    [3, 0],
    [11, 0],
    [1, 1],
    [7, 1],
    [13, 1],
  ];

  for (let [sc, sr] of spawnPoints) {
    if (!visited[sr][sc]) {
      // 不可达，清空一条路：把从该点到玩家出生点的直线上砖块/金刚石清掉
      clearPathTo(sc, sr);
    }
  }
}

// 简单暴力：从 (sc, sr) 到 (7, 12) 的曼哈顿路径，把沿途的砖块/金刚石清掉
function clearPathTo(sc, sr) {
  let cx = sc,
    cy = sr;
  const targetX = 7,
    targetY = 12;

  // 先水平走
  while (cx !== targetX) {
    const step = cx < targetX ? 1 : -1;
    cx += step;
    if (isValidCell(cx, cy)) {
      const t = blocks[cy][cx];
      if (t === TILE_BRICK || t === TILE_STEEL) {
        blocks[cy][cx] = TILE_EMPTY;
      }
    }
  }
  // 再垂直走
  while (cy !== targetY) {
    const step = cy < targetY ? 1 : -1;
    cy += step;
    if (isValidCell(cx, cy)) {
      const t = blocks[cy][cx];
      if (t === TILE_BRICK || t === TILE_STEEL) {
        blocks[cy][cx] = TILE_EMPTY;
      }
    }
  }
}
