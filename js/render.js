// ---------- 绘制 ----------
let canvas, ctx;

function initRender(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d");
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 网格
  ctx.strokeStyle = "#20281e";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // 地形
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const t = blocks[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (t === TILE_BRICK) {
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = "#b87c4b";
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = "#6b421a";
        ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      } else if (t === TILE_STEEL) {
        ctx.fillStyle = "#7a8a9a";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = "#b0c4d8";
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = "#4a5a6a";
        ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 6, y + 6, 4, 4);
      } else if (t === TILE_GRASS) {
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#1b5e20";
        for (let k = 0; k < 4; k++) {
          const gx = x + 4 + ((k * 7) % (TILE_SIZE - 8));
          const gy = y + 4 + ((k * 5) % (TILE_SIZE - 8));
          ctx.fillRect(gx, gy, 3, 6);
        }
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(x + 2, y + 2, 4, 4);
        ctx.fillRect(x + TILE_SIZE - 6, y + TILE_SIZE - 6, 4, 4);
      }
    }
  }

  // 老家基地
  drawBase();

  // 敌人
  for (let e of enemies) {
    if (!e.alive) continue;
    drawEnemy(e);
  }

  // 玩家
  if (player.isAlive) {
    drawPlayer();
  }

  // 子弹
  for (let b of bullets) {
    if (!b.alive) continue;
    drawBullet(b);
  }

  // 爆炸
  for (let ex of explosions) {
    drawExplosion(ex);
  }

  // 游戏结束/胜利
  if (gameOver) {
    drawGameOver();
  } else if (!player.isAlive && lives > 0) {
    drawRespawnTip();
  }
}

function drawBase() {
  if (base.alive) {
    const bx = base.x * TILE_SIZE;
    const by = base.y * TILE_SIZE;
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(bx + 2, by + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = "#d4a545";
    ctx.beginPath();
    ctx.moveTo(bx + TILE_SIZE / 2, by + 6);
    ctx.lineTo(bx + TILE_SIZE - 6, by + TILE_SIZE - 6);
    ctx.lineTo(bx + 6, by + TILE_SIZE - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f5e56b";
    ctx.beginPath();
    ctx.arc(bx + TILE_SIZE / 2, by + TILE_SIZE / 2 + 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const bx = base.x * TILE_SIZE;
    const by = base.y * TILE_SIZE;
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(bx + 4, by + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(bx + 8, by + 8, TILE_SIZE - 16, TILE_SIZE - 16);
  }
}

function drawEnemy(e) {
  const x = e.x * TILE_SIZE + OFFSET;
  const y = e.y * TILE_SIZE + OFFSET;

  if (e.type === ENEMY_TYPE_ELITE) {
    ctx.fillStyle = "#9c4a9e";
    ctx.fillRect(x, y, TANK_SIZE, TANK_SIZE);
    ctx.fillStyle = "#6b2e6b";
    ctx.fillRect(x + 4, y + 4, TANK_SIZE - 8, TANK_SIZE - 8);
  } else {
    ctx.fillStyle = "#4a9e4a";
    ctx.fillRect(x, y, TANK_SIZE, TANK_SIZE);
    ctx.fillStyle = "#2e6b2e";
    ctx.fillRect(x + 4, y + 4, TANK_SIZE - 8, TANK_SIZE - 8);
  }

  ctx.fillStyle = e.type === ENEMY_TYPE_ELITE ? "#e0a0e0" : "#b0d68c";
  const cx = x + TANK_SIZE / 2;
  const cy = y + TANK_SIZE / 2;
  if (e.dir === "up") {
    ctx.fillRect(cx - 3, y - 4, 6, 14);
  } else if (e.dir === "down") {
    ctx.fillRect(cx - 3, y + TANK_SIZE - 10, 6, 14);
  } else if (e.dir === "left") {
    ctx.fillRect(x - 4, cy - 3, 14, 6);
  } else if (e.dir === "right") {
    ctx.fillRect(x + TANK_SIZE - 10, cy - 3, 14, 6);
  }

  ctx.fillStyle = "#2a3a1e";
  ctx.fillRect(x, y + 6, 4, TANK_SIZE - 12);
  ctx.fillRect(x + TANK_SIZE - 4, y + 6, 4, TANK_SIZE - 12);

  if (e.type === ENEMY_TYPE_ELITE) {
    const barWidth = TANK_SIZE;
    const barHeight = 4;
    const barX = x;
    const barY = y - 8;
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(barX, barY, barWidth * (e.hp / 3), barHeight);
  }
}

function drawPlayer() {
  const x = player.x * TILE_SIZE + OFFSET;
  const y = player.y * TILE_SIZE + OFFSET;
  ctx.fillStyle = "#d4a545";
  ctx.fillRect(x, y, TANK_SIZE, TANK_SIZE);
  ctx.fillStyle = "#b8862c";
  ctx.fillRect(x + 4, y + 4, TANK_SIZE - 8, TANK_SIZE - 8);

  ctx.fillStyle = "#f5e56b";
  const cx = x + TANK_SIZE / 2;
  const cy = y + TANK_SIZE / 2;
  if (player.dir === "up") {
    ctx.fillRect(cx - 3, y - 4, 6, 14);
  } else if (player.dir === "down") {
    ctx.fillRect(cx - 3, y + TANK_SIZE - 10, 6, 14);
  } else if (player.dir === "left") {
    ctx.fillRect(x - 4, cy - 3, 14, 6);
  } else if (player.dir === "right") {
    ctx.fillRect(x + TANK_SIZE - 10, cy - 3, 14, 6);
  }

  ctx.fillStyle = "#7a5c1e";
  ctx.fillRect(x, y + 6, 4, TANK_SIZE - 12);
  ctx.fillRect(x + TANK_SIZE - 4, y + 6, 4, TANK_SIZE - 12);
}

function drawBullet(b) {
  const bx = b.x * TILE_SIZE + TILE_SIZE / 2;
  const by = b.y * TILE_SIZE + TILE_SIZE / 2;
  ctx.beginPath();
  ctx.arc(bx, by, 5, 0, Math.PI * 2);
  ctx.fillStyle = b.owner === "player" ? "#f5e56b" : "#ff7b4a";
  ctx.fill();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#fff9c4";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawExplosion(ex) {
  const progress = ex.frame / ex.maxFrame;
  const cx = ex.x;
  const cy = ex.y;

  const ringRadius = 4 + progress * 26;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, ${Math.floor(180 - progress * 120)}, 40, ${1 - progress})`;
  ctx.lineWidth = 4 * (1 - progress) + 1;
  ctx.stroke();

  const coreRadius = 12 * (1 - progress);
  if (coreRadius > 0) {
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${1 - progress})`);
    gradient.addColorStop(0.5, `rgba(255, 180, 40, ${1 - progress})`);
    gradient.addColorStop(1, `rgba(200, 40, 0, 0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  if (progress < 0.8) {
    const particleCount = 8;
    for (let p = 0; p < particleCount; p++) {
      const angle = (p / particleCount) * Math.PI * 2 + progress * 2;
      const dist = progress * 30;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const size = 3 * (1 - progress) + 1;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, ${Math.floor(220 - progress * 150)}, 60, ${1 - progress})`;
      ctx.fill();
    }
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (winFlag) {
    ctx.fillStyle = "#e6d96b";
    ctx.fillText("胜利!", canvas.width / 2, canvas.height / 2);
  } else {
    ctx.fillStyle = "#d94a4a";
    ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2);
  }
  ctx.font = '18px "Courier New"';
  ctx.fillStyle = "#ccc";
  ctx.fillText("点击「重新开始」", canvas.width / 2, canvas.height / 2 + 60);
}

function drawRespawnTip() {
  ctx.font = 'bold 24px "Courier New"';
  ctx.fillStyle = "#f0b37e";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#000";
  ctx.fillText("等待重生...", canvas.width / 2, canvas.height / 2);
  ctx.shadowBlur = 0;
}
