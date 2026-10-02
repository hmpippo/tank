// ---------- 输入处理 ----------
function handleKeyDown(e) {
  resumeAudio(); // ← 新增：首次按键时恢复音频
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
