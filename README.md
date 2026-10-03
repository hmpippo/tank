# 经典坦克大战 · 网页版

一款用纯 HTML + CSS + 原生 JavaScript 实现的经典坦克大战（Battle City）风格小游戏。无需任何依赖，打开浏览器即可游玩。

---

## 玩法说明

### 操作

| 按键 | 功能 |
|------|------|
| ↑ ↓ ← → 或 W A S D | 移动坦克 |
| 空格 | 发射子弹 |

### 目标

- 消灭所有敌方坦克 → 胜利
- 保护老家基地不被击毁 → 基地被击中立即游戏结束
- 生命值归零 → 游戏结束

### 规则

- 初始 3 条命
- 击毁普通坦克 +100 分，精英坦克 +300 分
- 共有 8 辆敌方坦克，全部消灭即胜利
- 老家基地位于底部中央，被 5 块砖块保护，砖块可被打坏
- 基地一旦被任何子弹击中，立即 Game Over

---

## 地形元素

| 地形 | 外观 | 说明 |
|------|------|------|
| 空地 | 深色背景 | 可通行 |
| 砖块 | 棕色 | 不可通行，可被子弹打坏 |
| 金刚石 | 银灰色 | 不可通行，打不坏 |
| 草地 | 绿色 | 可通行，子弹穿过 |

---

## 敌人类型

| 类型 | 外观 | 生命值 | 得分 |
|------|------|--------|------|
| 普通坦克 | 绿色 | 1 发 | 100 |
| 精英坦克 | 紫色（带血条） | 3 发 | 300 |

精英坦克出现概率约 25%。

---

## 地图生成

每次开始游戏时，地图会随机生成：

- 砖块密度约 18%
- 金刚石密度约 4%
- 草地密度约 6%

固定不动的部分：

- 老家基地 (7, 14)
- 保护墙 5 块砖块（基地左、右、左上、正上、右上）
- 玩家出生点 (7, 12)
- 8 个敌人出生点及其周围安全区

地图生成后会做一次 BFS 连通性检查，确保玩家能从出生点走到所有敌人出生点，避免被随机地形堵死。

---

## 项目结构

    tank-game/
    ├── index.html              主页面
    ├── README.md               说明文档
    ├── css/
    │   └── style.css           样式
    └── js/
        ├── config.js           常量配置 + 全局状态
        ├── utils.js            工具函数（碰撞检测、地形判断）
        ├── map.js              地图生成（随机地形 + 固定老家/玩家/敌人出生点）
        ├── player.js           玩家逻辑（移动、射击、重生）
        ├── enemy.js            敌人逻辑（生成、AI、射击）
        ├── bullet.js           子弹逻辑（移动、碰撞、击中判定）
        ├── explosion.js        爆炸特效
        ├── render.js           所有绘制逻辑
        ├── input.js            键盘事件处理
        └── game.js             主循环 & 入口

---

## 运行方式

### 方式一：直接打开

1. 把项目文件夹下载到本地
2. 双击 index.html
3. 浏览器会自动打开游戏

### 方式二：本地服务器（推荐）

如果你使用 VS Code，可以安装 Live Server 插件：

1. 用 VS Code 打开项目文件夹
2. 右键 index.html → Open with Live Server
3. 浏览器自动打开，支持热更新

### 方式三：Python 简易服务器

    cd tank-game
    python -m http.server 8000

然后访问 http://localhost:8000

---

## 模块说明

| 文件 | 职责 |
|------|------|
| config.js | 所有常量（尺寸、冷却、密度）+ 全局状态变量 |
| utils.js | isValidCell / hasBlock / isTankPassable / 碰撞检测等 |
| map.js | generateBlocks() 生成地图，ensureConnectivity() 保证连通 |
| player.js | movePlayer() / playerShoot() / respawnPlayer() |
| enemy.js | spawnEnemy() / updateEnemies() / enemyShoot() |
| bullet.js | updateBullets() 处理子弹移动和所有碰撞 |
| explosion.js | createExplosion() / updateExplosions() |
| render.js | draw() 及所有子绘制函数 |
| input.js | handleKeyDown / handleKeyUp / resetKeys |
| game.js | initGame() / gameLoop() / restartGame() |

---

## 可调参数

在 js/config.js 中可以调整：

    const PLAYER_SHOOT_COOLDOWN = 12;   玩家射击冷却
    const PLAYER_MOVE_COOLDOWN = 6;     玩家移动间隔
    const ENEMY_SHOOT_COOLDOWN = 55;    敌人射击冷却
    const ENEMY_MOVE_COOLDOWN = 10;     敌人移动间隔
    const BULLET_MOVE_COOLDOWN = 4;     子弹速度

    const MAX_ENEMIES = 4;              场上同时存在
    const TOTAL_ENEMIES = 8;            总共生成

在 js/map.js 中可以调整地形密度：

    if (Math.random() < 0.18) blocks[row][col] = TILE_BRICK;    砖块
    if (Math.random() < 0.04) blocks[row][col] = TILE_STEEL;    金刚石
    if (Math.random() < 0.06) blocks[row][col] = TILE_GRASS;    草地

在 js/enemy.js 中可以调整精英出现概率：

    const isElite = Math.random() < 0.25;   25% 概率精英

---

## 技术要点

- 纯原生实现：无框架、无依赖，只用浏览器原生 API
- 模块化拆分：按职责分成 10 个 JS 文件，便于维护
- 像素风格渲染：image-rendering: pixelated 保证放大后清晰
- 帧率控制：所有速度用「每 N 帧移动一次」实现，不依赖真实时间
- 随机地图 + 连通性保证：BFS 检查确保不会生成无解地图
- 响应式画布：canvas 内部 480×480，CSS 等比放大填满屏幕

---

## 已知限制

- 没有多关卡（地图随机，但难度恒定）
- 没有双人对战模式

---

## 后续可扩展方向

- 添加道具（加速、护盾、冰冻敌人）
- 多关卡，难度递增
- 双人模式（WASD + 方向键）
- 最高分记录（localStorage）

---

## 许可

本项目仅供学习和娱乐使用，自由修改和分发。

Enjoy the game!