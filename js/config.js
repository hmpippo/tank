// ---------- 固定参数 ----------
const TILE_SIZE = 32;
const GRID_SIZE = 15;
const TANK_SIZE = 28;
const OFFSET = (TILE_SIZE - TANK_SIZE) / 2;

// 地形类型
const TILE_EMPTY = 0;
const TILE_BRICK = 1;
const TILE_STEEL = 2;
const TILE_GRASS = 3;

// 敌人类型
const ENEMY_TYPE_NORMAL = 0;
const ENEMY_TYPE_ELITE = 1;

// 方向
const DIRS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

// 冷却
const PLAYER_SHOOT_COOLDOWN = 12;
const PLAYER_MOVE_COOLDOWN = 6;
const ENEMY_SHOOT_COOLDOWN = 55;
const ENEMY_MOVE_COOLDOWN = 10;
const BULLET_MOVE_COOLDOWN = 4;

// 敌人数量
const MAX_ENEMIES = 4;
const TOTAL_ENEMIES = 8;

// ---------- 游戏全局状态 ----------
let player = {
  x: 7,
  y: 12,
  dir: "up",
  isAlive: true,
  cooldown: 0,
  moveCounter: 0,
};

let enemies = [];
let bullets = [];
let explosions = [];
let blocks = [];

let base = {
  x: 7,
  y: 14,
  alive: true,
};

let score = 0;
let lives = 3;
let gameOver = false;
let paused = false;
let winFlag = false;
let animationFrame = null;
let frameCounter = 0;
let enemiesSpawned = 0;
let enemiesKilled = 0;

// 按键状态
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
  Space: false,
};
