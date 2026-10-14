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

  // 绘制道具
  for (let p of powerups) {
    drawPowerup(p);
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

  // 玩家护盾光环
  if (player.isAlive && playerShield > 0) {
    drawShieldAura();
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

  if (levelCleared) {
    drawLevelClear();
  } else if (gameOver) {
    drawGameOver();
  } else if (!player.isAlive && lives > 0) {
    drawRespawnTip();
  } else if (paused) {
    drawPauseOverlay();
  }
}

function drawBase() {
  const bx = base.x * TILE_SIZE;
  const by = base.y * TILE_SIZE;
  const cx = bx + TILE_SIZE / 2;
  const cy = by + TILE_SIZE / 2;

  // 加固中：画狐狸脸
  if (baseFortifyTimer > 0 && base.alive) {
    drawFoxFace(cx, cy);
    return;
  }

  // 正常状态
  if (base.alive) {
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(bx + 2, by + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = "#d4a545";
    ctx.beginPath();
    ctx.moveTo(cx, by + 6);
    ctx.lineTo(bx + TILE_SIZE - 6, by + TILE_SIZE - 6);
    ctx.lineTo(bx + 6, by + TILE_SIZE - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f5e56b";
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(bx + 4, by + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(bx + 8, by + 8, TILE_SIZE - 16, TILE_SIZE - 16);
  }
}

// ---------- 狐狸脸（可爱眼睛 + 胡须 + 耳朵抖动） ----------
function drawFoxFace(cx, cy) {
  const scale = TILE_SIZE / 100;

  // 加固光晕
  const time = Date.now() * 0.005;
  const glowAlpha = 0.3 + Math.sin(time) * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, TILE_SIZE / 2 + 2, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(200, 230, 255, ${glowAlpha})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== 耳朵抖动角度 =====
  // 用时间驱动，左右耳朵反相抖动
  const t = Date.now() * 0.012;
  // 每 ~1.5 秒抖动一次，每次抖动是短暂的
  const wiggleWave = Math.sin(t * 3.5); // -1 ~ 1
  const wiggleGate = Math.max(0, Math.sin(t * 1.2)); // 0~1，门控：让抖动有间隔
  const wiggleAmount = wiggleWave * wiggleGate * 6; // 最大 ±6 度

  // 左耳往左偏，右耳往右偏（反相）
  const leftEarAngle = (-wiggleAmount * Math.PI) / 180;
  const rightEarAngle = (wiggleAmount * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx - TILE_SIZE / 2, cy - TILE_SIZE / 2);
  ctx.scale(scale, scale);

  // 工具函数
  function triangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  const brown = "#8b5a2b";
  const white = "#ffffff";
  const orange = "#e2761b";
  const charcoal = "#1a1a1a";

  // ===== 左耳（绕耳根旋转） =====
  // 耳根大约在 (30, 40)
  ctx.save();
  ctx.translate(30, 40);
  ctx.rotate(leftEarAngle);
  ctx.translate(-30, -40);
  triangle(10, 5, 10, 40, 50, 40, brown);
  ctx.restore();

  // ===== 右耳（绕耳根旋转） =====
  // 耳根大约在 (70, 40)
  ctx.save();
  ctx.translate(70, 40);
  ctx.rotate(rightEarAngle);
  ctx.translate(-70, -40);
  triangle(90, 5, 90, 40, 50, 40, brown);
  ctx.restore();

  // ===== 脸颊（白） =====
  triangle(10, 40, 5, 60, 50, 95, white);
  triangle(90, 40, 95, 60, 50, 95, white);

  // ===== 脸主体（橙） =====
  triangle(10, 40, 50, 30, 50, 95, orange);
  triangle(90, 40, 50, 30, 50, 95, orange);

  // ===== 胡须 =====
  ctx.strokeStyle = "rgba(60, 40, 20, 0.75)";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";

  const whiskerStartsL = [
    [42, 82],
    [42, 86],
    [42, 90],
  ];
  for (let [sx, sy] of whiskerStartsL) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx - 18, sy - 2, sx - 28, sy - 4);
    ctx.stroke();
  }

  const whiskerStartsR = [
    [58, 82],
    [58, 86],
    [58, 90],
  ];
  for (let [sx, sy] of whiskerStartsR) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 18, sy - 2, sx + 28, sy - 4);
    ctx.stroke();
  }

  // ===== 可爱眼睛 =====
  // 左眼
  ctx.beginPath();
  ctx.arc(36, 54, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(36.5, 55, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(34.8, 53.2, 1.6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(38, 56.5, 0.8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fill();

  // 右眼
  ctx.beginPath();
  ctx.arc(64, 54, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(63.5, 55, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(61.8, 53.2, 1.6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(65, 56.5, 0.8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fill();

  // ===== 鼻子 =====
  triangle(40, 90, 60, 90, 50, 85, charcoal);
  triangle(40, 90, 60, 90, 50, 95, charcoal);

  ctx.restore();
}

function drawEnemy(e) {
  const x = e.x * TILE_SIZE + OFFSET;
  const y = e.y * TILE_SIZE + OFFSET;

  // ===== 冰冻时全部变蓝白 =====
  const frozen = freezeTimer > 0;

  if (frozen) {
    // 冰霜覆盖效果
    ctx.fillStyle = "#6ab8e8";
    ctx.fillRect(x, y, TANK_SIZE, TANK_SIZE);
    ctx.fillStyle = "#3a7ab8";
    ctx.fillRect(x + 4, y + 4, TANK_SIZE - 8, TANK_SIZE - 8);

    // 炮塔
    ctx.fillStyle = "#c8ecff";
    const cx = x + TANK_SIZE / 2;
    const cy = y + TANK_SIZE / 2;
    if (e.dir === "up") ctx.fillRect(cx - 3, y - 4, 6, 14);
    else if (e.dir === "down") ctx.fillRect(cx - 3, y + TANK_SIZE - 10, 6, 14);
    else if (e.dir === "left") ctx.fillRect(x - 4, cy - 3, 14, 6);
    else if (e.dir === "right") ctx.fillRect(x + TANK_SIZE - 10, cy - 3, 14, 6);

    // 履带
    ctx.fillStyle = "#2a4a6a";
    ctx.fillRect(x, y + 6, 4, TANK_SIZE - 12);
    ctx.fillRect(x + TANK_SIZE - 4, y + 6, 4, TANK_SIZE - 12);

    // 精英血条
    if (e.type === ENEMY_TYPE_ELITE) {
      const barWidth = TANK_SIZE;
      const barHeight = 4;
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y - 8, barWidth, barHeight);
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(x, y - 8, barWidth * (e.hp / 3), barHeight);
    }

    return; // 冰冻状态画完就返回，不画普通颜色
  }

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

// ---------- 过关提示 ----------
function drawLevelClear() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 第X关通过
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillStyle = "#e6d96b";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#000";
  ctx.fillText(`第 ${level} 关通过!`, canvas.width / 2, canvas.height / 2 - 50);

  // 下一关
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = "#b8e8a0";
  ctx.fillText(
    `准备第 ${level + 1} 关`,
    canvas.width / 2,
    canvas.height / 2 + 10,
  );

  // 显示奖励提示（如果这关刚好是3的倍数）
  if (level % LIVES_REWARD_EVERY === 0) {
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = "#f5a5b0";
    ctx.fillText("❤️ 奖励一条命!", canvas.width / 2, canvas.height / 2 + 60);
  }

  // 倒计时
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = "#ccc";
  const seconds = Math.ceil(levelTransitionTimer / 60);
  ctx.fillText(
    `${seconds} 秒后开始`,
    canvas.width / 2,
    canvas.height / 2 + 110,
  );
  ctx.shadowBlur = 0;
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 标题
  ctx.font = 'bold 40px "Courier New", monospace';
  ctx.fillStyle = "#d94a4a";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#000";
  ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2 - 70);
  ctx.shadowBlur = 0;

  // 最终关卡
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = "#e6d96b";
  ctx.fillText(`到达第 ${level} 关`, canvas.width / 2, canvas.height / 2 - 10);

  // 最终分数
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = "#f0d87a";
  ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 30);

  // 提示
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = "#ccc";
  ctx.fillText(
    "点击「重新开始」再来一局",
    canvas.width / 2,
    canvas.height / 2 + 90,
  );
}

function drawRespawnTip() {
  ctx.font = 'bold 24px "Courier New"';
  ctx.fillStyle = "#f0b37e";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#000";
  ctx.fillText("等待重生...", canvas.width / 2, canvas.height / 2);
  ctx.shadowBlur = 0;
}

function drawPauseOverlay() {
  // 半透明黑遮罩
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 暂停文字
  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e6d96b";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#000";
  ctx.fillText("暂停", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = '18px "Courier New"';
  ctx.fillStyle = "#ccc";
  ctx.fillText("按 P 或 Esc 继续", canvas.width / 2, canvas.height / 2 + 40);
  ctx.shadowBlur = 0;
}

// ---------- 道具绘制 ----------
function drawPowerup(p) {
  const x = p.x * TILE_SIZE;
  const y = p.y * TILE_SIZE;
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  // 上下浮动动画
  const float = Math.sin(p.frame * 0.1) * 3;

  if (p.type === POWERUP_SHIELD) {
    // 护盾：蓝色圆环
    ctx.beginPath();
    ctx.arc(cx, cy + float, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "#4aa3ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + float, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(74, 163, 255, 0.4)";
    ctx.fill();

    // 小亮点
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3 + float, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#b8dcff";
    ctx.fill();
  } else if (p.type === POWERUP_FREEZE) {
    // 冰冻：雪花
    ctx.strokeStyle = "#9de8ff";
    ctx.lineWidth = 2;
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2 + p.frame * 0.02;
      ctx.beginPath();
      ctx.moveTo(cx, cy + float);
      ctx.lineTo(cx + Math.cos(angle) * 10, cy + float + Math.sin(angle) * 10);
      ctx.stroke();
    }
    // 中心
    ctx.beginPath();
    ctx.arc(cx, cy + float, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#e0f7ff";
    ctx.fill();
  } else if (p.type === POWERUP_BASE_FORTIFY) {
    // 老家金刚石护盾：一个银色盾牌 + 星形
    ctx.save();
    ctx.translate(cx, cy + float);

    // 盾牌轮廓
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(9, -6);
    ctx.lineTo(9, 4);
    ctx.lineTo(0, 11);
    ctx.lineTo(-9, 4);
    ctx.lineTo(-9, -6);
    ctx.closePath();

    // 填充
    const grad = ctx.createLinearGradient(0, -10, 0, 11);
    grad.addColorStop(0, "#d8e8f8");
    grad.addColorStop(0.5, "#9ab8d8");
    grad.addColorStop(1, "#5a7a9a");
    ctx.fillStyle = grad;
    ctx.fill();

    // 描边
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 中间星形
    ctx.beginPath();
    const spikes = 5;
    const outerR = 5;
    const innerR = 2.5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2 + p.frame * 0.03;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = "#fff9c4";
    ctx.fill();

    ctx.restore();
  }
}

// ---------- 玩家护盾光环 ----------
function drawShieldAura() {
  const x = player.x * TILE_SIZE + OFFSET + TANK_SIZE / 2;
  const y = player.y * TILE_SIZE + OFFSET + TANK_SIZE / 2;
  const time = Date.now() * 0.005;
  const radius = 18 + Math.sin(time) * 2;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(74, 163, 255, ${0.5 + Math.sin(time) * 0.3})`;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(150, 210, 255, ${0.3 + Math.sin(time) * 0.2})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}
