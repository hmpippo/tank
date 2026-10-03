// ---------- 输入处理 ----------
function handleKeyDown(e) {
  resumeAudio(); // ← 新增：首次按键时恢复音频
  const code = e.code;

  // ===== 暂停键 =====
  if (code === "KeyP" || code === "Escape") {
    e.preventDefault();
    togglePause();
    return;
  }

  if (
    code.startsWith("Arrow") ||
    code === "Space" ||
    code === "KeyW" ||
    code === "KeyA" ||
    code === "KeyS" ||
    code === "KeyD"
  ) {
    e.preventDefault();
  }
  if (code in keys) keys[code] = true;
  if (code === "KeyW") keys.ArrowUp = true;
  if (code === "KeyS") keys.ArrowDown = true;
  if (code === "KeyA") keys.ArrowLeft = true;
  if (code === "KeyD") keys.ArrowRight = true;
}

function handleKeyUp(e) {
  const code = e.code;
  if (
    code.startsWith("Arrow") ||
    code === "Space" ||
    code === "KeyW" ||
    code === "KeyA" ||
    code === "KeyS" ||
    code === "KeyD"
  ) {
    e.preventDefault();
  }
  if (code in keys) keys[code] = false;
  if (code === "KeyW") keys.ArrowUp = false;
  if (code === "KeyS") keys.ArrowDown = false;
  if (code === "KeyA") keys.ArrowLeft = false;
  if (code === "KeyD") keys.ArrowRight = false;
}

function resetKeys() {
  for (let k in keys) keys[k] = false;
}

function initInput() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", resetKeys);
}

// ---------- 移动端虚拟按键 ----------
function initMobileControls() {
  const buttons = document.querySelectorAll(".ctrl-btn");
  if (buttons.length === 0) return;

  buttons.forEach((btn) => {
    const key = btn.dataset.key;
    if (!key) return;

    // 触摸开始 → 按下
    btn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        resumeAudio();
        pressKey(key);
        btn.classList.add("active");
      },
      { passive: false },
    );

    // 触摸结束 → 松开
    btn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        releaseKey(key);
        btn.classList.remove("active");
      },
      { passive: false },
    );

    // 触摸取消（比如手指滑出按钮）→ 松开
    btn.addEventListener(
      "touchcancel",
      (e) => {
        e.preventDefault();
        releaseKey(key);
        btn.classList.remove("active");
      },
      { passive: false },
    );

    // 鼠标也支持（方便桌面调试）
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      resumeAudio();
      pressKey(key);
      btn.classList.add("active");
    });
    btn.addEventListener("mouseup", (e) => {
      e.preventDefault();
      releaseKey(key);
      btn.classList.remove("active");
    });
    btn.addEventListener("mouseleave", () => {
      releaseKey(key);
      btn.classList.remove("active");
    });
  });
}

// 按下某个键（模拟键盘）
function pressKey(key) {
  if (key in keys) keys[key] = true;
  // 同时映射到方向键别名
  if (key === "KeyW" || key === "ArrowUp") keys.ArrowUp = true;
  if (key === "KeyS" || key === "ArrowDown") keys.ArrowDown = true;
  if (key === "KeyA" || key === "ArrowLeft") keys.ArrowLeft = true;
  if (key === "KeyD" || key === "ArrowRight") keys.ArrowRight = true;
}

// 松开某个键
function releaseKey(key) {
  if (key in keys) keys[key] = false;
  if (key === "KeyW" || key === "ArrowUp") keys.ArrowUp = false;
  if (key === "KeyS" || key === "ArrowDown") keys.ArrowDown = false;
  if (key === "KeyA" || key === "ArrowLeft") keys.ArrowLeft = false;
  if (key === "KeyD" || key === "ArrowRight") keys.ArrowRight = false;
}
