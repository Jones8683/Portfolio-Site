export function onGameKey(keys, handler) {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));

  const listener = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (wanted.has(event.key?.toLowerCase())) handler(event);
  };

  addEventListener('keydown', listener);
  return () => removeEventListener('keydown', listener);
}

export function trackKeys(preventCodes, onChange) {
  const down = new Set();

  const press = (event) => {
    if (preventCodes.includes(event.code)) event.preventDefault();
    down.add(event.code.toLowerCase());
    down.add(event.key?.toLowerCase());
    onChange();
  };

  const release = (event) => {
    down.delete(event.code.toLowerCase());
    down.delete(event.key?.toLowerCase());
    onChange();
  };

  const clear = () => {
    down.clear();
    onChange();
  };

  addEventListener('keydown', press);
  addEventListener('keyup', release);
  addEventListener('blur', clear);

  return {
    isDown: (...names) => names.some((name) => down.has(name.toLowerCase())),
    isModifierDown: () => ['control', 'meta', 'alt'].some((name) => down.has(name)),
    destroy() {
      removeEventListener('keydown', press);
      removeEventListener('keyup', release);
      removeEventListener('blur', clear);
    },
  };
}

export function createLoop(update) {
  let frame = 0;
  let last = 0;
  let running = false;

  const tick = (now) => {
    if (!running) return;
    const delta = last ? now - last : 0;
    last = now;
    update(delta, now);
    if (running) frame = requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
  };
}

export function onBlur(handler) {
  addEventListener('blur', handler);
  return () => removeEventListener('blur', handler);
}

export function readNumber(key) {
  return Number(localStorage.getItem(key) ?? 0) || 0;
}

export function writeNumber(key, value) {
  localStorage.setItem(key, String(value));
}
