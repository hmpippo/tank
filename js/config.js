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
let TOTAL_ENEMIES = 8;

// 每关敌人数量公式：基础8个 + 每关+2，上限20
function getEnemiesForLevel(lv) {
  return Math.min(20, 8 + (lv - 1) * 2);
}

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

// ---------- 关卡 ----------
let level = 1; // 当前关卡（从1开始）
const LIVES_REWARD_EVERY = 3; // 每3关奖励1条命
let levelTransitionTimer = 0; // 关卡切换过渡倒计时（帧）
const LEVEL_TRANSITION_DURATION = 120; // 2秒过渡展示
let levelCleared = false; // 是否处于过关过渡状态

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

// ---------- 道具 ----------
let powerups = []; // 场上道具数组

// 道具类型
const POWERUP_SHIELD = 0;
const POWERUP_FREEZE = 1;
const POWERUP_BASE_FORTIFY = 2;

// 道具刷新
const POWERUP_SPAWN_INTERVAL = 300; // 约5秒刷新一个（60帧 × 5）
const POWERUP_MAX = 2; // 场上最多同时存在2个
let powerupTimer = 0; // 计时器

// 效果持续（帧数）
const SHIELD_DURATION = 600; // 护盾持续 10 秒
const FREEZE_DURATION = 300; // 冰冻持续 5 秒
const BASE_FORTIFY_DURATION = 300; // 老家加固持续时间 5秒

// 玩家效果状态
let playerShield = 0; // 剩余护盾帧数，>0 表示有护盾
let freezeTimer = 0; // 剩余冰冻帧数，>0 表示敌人被冻住
let baseFortifyTimer = 0; // 剩余老家加固帧数

// 备份原来的保护墙状态（用于恢复）
let baseWallBackup = null; // { [key]: tileType }  key = "col,row"
