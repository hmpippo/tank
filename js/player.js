// ---------- 玩家逻辑 ----------
function movePlayer(dx, dy, newDir) {
  if (!player.isAlive || gameOver) return;
  if (newDir) player.dir = newDir;

  const newX = player.x + dx;
  const newY = player.y + dy;

  if (!isTankPassable(newX, newY)) return;
  if (collidesWithEnemies(newX, newY)) return;

  player.x = newX;
  player.y = newY;
}

function playerShoot() {
  if (!player.isAlive || gameOver) return;
  if (player.cooldown > 0) return;

  const dirVec = DIRS[player.dir];
  const bulletX = player.x + dirVec.dx;
  const bulletY = player.y + dirVec.dy;

  bullets.push({
    x: bulletX,
    y: bulletY,
    dir: player.dir,
    owner: "player",
    alive: true,
    speed: 1,
    frameCounter: 0,
    moveCounter: 0,
  });

  sfxPlayerShoot();
  player.cooldown = PLAYER_SHOOT_COOLDOWN;
}

function handlePlayerInput() {
  if (!player.isAlive || gameOver) return;

  if (player.cooldown > 0) player.cooldown--;

  if (player.moveCounter === undefined) player.moveCounter = 0;
  player.moveCounter++;

  if (player.moveCounter >= PLAYER_MOVE_COOLDOWN) {
    let moved = false;
    if (keys.ArrowUp || keys.KeyW) {
      movePlayer(0, -1, "up");
      moved = true;
    } else if (keys.ArrowDown || keys.KeyS) {
      movePlayer(0, 1, "down");
      moved = true;
    } else if (keys.ArrowLeft || keys.KeyA) {
      movePlayer(-1, 0, "left");
      moved = true;
    } else if (keys.ArrowRight || keys.KeyD) {
      movePlayer(1, 0, "right");
      moved = true;
    }
    player.moveCounter = 0;
  }

  if (keys.Space) {
    playerShoot();
  }
}

function respawnPlayer() {
  const candidates = [
    [7, 12],
    [7, 13],
    [6, 12],
    [8, 12],
    [7, 11],
  ];
  for (let [c, r] of candidates) {
    if (
      isValidCell(c, r) &&
      isTankPassable(c, r) &&
      !collidesWithEnemies(c, r)
    ) {
      player.x = c;
      player.y = r;
      player.dir = "up";
      player.isAlive = true;
      player.cooldown = 15;
      bullets = bullets.filter(
        (b) =>
          !(
            b.owner === "enemy" &&
            Math.abs(b.x - c) < 2 &&
            Math.abs(b.y - r) < 2
          ),
      );
      return;
    }
  }
  player.x = 7;
  player.y = 12;
  player.dir = "up";
  player.isAlive = true;
  if (isValidCell(7, 12)) blocks[12][7] = TILE_EMPTY;
}
