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
            if (powerups.some(p => p.x === col && p.y === row)) continue;
            // 不能和玩家重叠（防止一出现就被吃掉）
            if (player.isAlive && player.x === col && player.y === row) continue;
            // 不能和敌人重叠
            if (enemies.some(e => e.alive && e.x === col && e.y === row)) continue;

            candidates.push([col, row]);
        }
    }

    if (candidates.length === 0) return;

    const [col, row] = candidates[Math.floor(Math.random() * candidates.length)];
    const type = Math.random() < 0.5 ? POWERUP_SHIELD : POWERUP_FREEZE;

    powerups.push({
        x: col,
        y: row,
        type: type,
        frame: 0,       // 动画帧
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
            }
            powerups.splice(i, 1);
        }
    }

    // 玩家护盾计时
    if (playerShield > 0) playerShield--;

    // 冰冻计时
    if (freezeTimer > 0) freezeTimer--;
}

// 重置道具相关状态（重开游戏时调用）
function resetPowerups() {
    powerups = [];
    powerupTimer = 0;
    playerShield = 0;
    freezeTimer = 0;
}