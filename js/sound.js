// ---------- 音效（Web Audio API 合成） ----------
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    soundEnabled = false;
    console.warn("Web Audio API 不可用，音效已关闭");
  }
}

// 确保音频上下文在用户交互后可用（浏览器策略）
function resumeAudio() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// 通用：播放一个简单音调
function playTone(
  freq,
  duration,
  type = "square",
  volume = 0.08,
  fadeOut = true,
) {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(volume, now);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// ---------- 具体音效 ----------

// 玩家射击：短促的"哔"
function sfxPlayerShoot() {
  playTone(880, 0.08, "square", 0.06);
  playTone(1200, 0.05, "square", 0.04);
}

// 敌人射击：低沉一点
function sfxEnemyShoot() {
  playTone(320, 0.1, "sawtooth", 0.05);
}

// 击中砖块：沙沙声
function sfxHitBrick() {
  playTone(180, 0.06, "square", 0.05);
}

// 击中金刚石：金属"叮"
function sfxHitSteel() {
  playTone(1600, 0.05, "square", 0.04);
  playTone(2400, 0.04, "square", 0.03);
}

// 敌人被击毁：爆炸噪音
function sfxEnemyDestroyed() {
  playNoise(0.25, 0.12);
}

// 玩家被击中：更长的爆炸
function sfxPlayerHit() {
  playNoise(0.4, 0.15);
  playTone(120, 0.3, "sawtooth", 0.08);
}

// 基地被毁：低沉爆炸
function sfxBaseDestroyed() {
  playNoise(0.6, 0.18);
  playTone(80, 0.5, "sawtooth", 0.1);
}

// 敌人出现：短促上升音
function sfxEnemySpawn() {
  playTone(300, 0.05, "square", 0.04);
  setTimeout(() => playTone(450, 0.05, "square", 0.04), 50);
}

// 胜利：上升琶音
function sfxWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "square", 0.08), i * 120);
  });
}

// 游戏结束：下降音
function sfxGameOver() {
  const notes = [400, 300, 200, 120];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, "sawtooth", 0.08), i * 180);
  });
}

// 噪音（用于爆炸）
function playNoise(duration, volume) {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // 白噪音 + 衰减
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // 加一个低通滤波器让声音更"闷"
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, now);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  source.start(now);
  source.stop(now + duration);
}

// 拾取护盾
function sfxPowerupShield() {
  playTone(660, 0.1, "square", 0.06);
  setTimeout(() => playTone(990, 0.15, "square", 0.06), 80);
}

// 拾取冰冻
function sfxPowerupFreeze() {
  playTone(1200, 0.08, "sine", 0.06);
  setTimeout(() => playTone(1600, 0.12, "sine", 0.06), 70);
  setTimeout(() => playTone(2000, 0.15, "sine", 0.06), 140);
}

// 护盾破碎
function sfxShieldBreak() {
  playTone(300, 0.15, "sawtooth", 0.08);
}
