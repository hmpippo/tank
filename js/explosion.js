// ---------- 爆炸特效 ----------
function createExplosion(col, row) {
  explosions.push({
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
    frame: 0,
    maxFrame: 18,
  });
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrame) {
      explosions.splice(i, 1);
    }
  }
}
