<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useStorage } from "@vueuse/core";
import GameMobileMessage from "../components/GameMobileMessage.vue";

const W = 560;
const H = 380;
const MAX_DT = 50;
const START_AMMO = 10;
const SPAWN_INTERVAL_MS = 680;
const CROSS_R = 18;
const BASE_SPEED = 2.15;
const MAX_ON_SCREEN = 10;
/** Tighter hitbox (pixels beyond body radius) — smaller = harder */
const HIT_SLACK = 4;

const MAG_CAP = 18;
const MAX_SHELL_BANK = 60;
const DUCK_SHELL_BANK_MIN = 1;
const DUCK_SHELL_BANK_FAST = 2;
const RELOAD_COOLDOWN_MS = 900;
const STREAK_WINDOW_MS = 2200;
const STREAK_MULT_STEP = 0.12;
const STREAK_MULT_CAP = 2.6;

const CRATE_INTERVAL_MS = 5200;
const CRATE_MAX_ON_SCREEN = 2;
const CRATE_TTL_MS = 7200;
const CRATE_SHELLS = 12;
const CRATE_HIT_SLACK = 2;

const highScore = useStorage("duck-hunt-high-score", 0);

const canvasRef = ref(null);
const scoreRef = ref(0);
const ammoRef = ref(START_AMMO);
const shellBankRef = ref(0);
const phase = ref("idle");
const streakRef = ref(0);
const isNewBest = ref(false);

let ctx = null;
let dpr = 1;
let rafId = 0;
let lastTs = 0;
let spawnAcc = 0;
let crateAcc = 0;
let lastHitAt = 0;
let lastReloadAt = 0;

let aimX = W / 2;
let aimY = H / 2;
let targets = [];
let particles = [];
let muzzleT = 0;

let popups = [];
let lastBlankAt = 0;
const BLANK_COOLDOWN_MS = 420;

const AIM_SPEED = 5.2;
const keys = { u: false, d: false, l: false, r: false };

function spawnTarget() {
  const fromLeft = Math.random() < 0.5;
  const r = 15 + Math.random() * 9;
  const y = 48 + Math.random() * (H - 135);
  const fast = Math.random() < 0.22;
  const vx =
    (fromLeft ? 1 : -1) *
    (BASE_SPEED + Math.random() * 1.15 + (fast ? 0.85 : 0));
  targets.push({
    kind: "duck",
    x: fromLeft ? -r - 5 : W + r + 5,
    y,
    vx,
    vy: (Math.random() - 0.5) * 0.55,
    r,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpd: 0.028 + Math.random() * 0.042,
    alive: true,
    hue: 22 + Math.random() * 20,
    fast,
  });
}

function spawnCrate() {
  const size = 17 + Math.random() * 8;
  const xPad = 70;
  const x = xPad + Math.random() * (W - xPad * 2);
  const y = 70 + Math.random() * (H - 170);
  const wobble = Math.random() * Math.PI * 2;
  const wobbleSpd = 0.012 + Math.random() * 0.03;

  targets.push({
    kind: "crate",
    x,
    y,
    baseY: y,
    r: size,
    vx: 0,
    vy: 0,
    wobble,
    wobbleSpd,
    hue: 18 + Math.random() * 14,
    ttlMs: CRATE_TTL_MS,
  });
}

function spawnFeathers(x, y, hue) {
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1,
      life: 1,
      decay: 0.02 + Math.random() * 0.035,
      hue,
    });
  }
}

function addPopup(text, x, y, color, ttlMs = 760, size = 18, glow = 18) {
  popups.push({
    id: Math.random().toString(16).slice(2),
    text,
    x,
    y,
    bornAt: performance.now(),
    ttlMs,
    color,
    size,
    glow,
  });
}

function spawnBlankPuff(x, y) {
  const baseHue = 35;
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.9 + Math.random() * 3.2;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1.2,
      life: 1,
      decay: 0.03 + Math.random() * 0.03,
      hue: baseHue + Math.random() * 12,
    });
  }
}

function resetPlaying() {
  scoreRef.value = 0;
  ammoRef.value = START_AMMO;
  shellBankRef.value = 0;
  streakRef.value = 0;
  targets = [];
  particles = [];
  popups = [];
  spawnAcc = 0;
  crateAcc = 0;
  lastHitAt = 0;
  lastReloadAt = 0;
  aimX = W / 2;
  aimY = H / 2;
  muzzleT = 0;
  isNewBest.value = false;
  phase.value = "playing";
}

function endGame() {
  phase.value = "gameover";
  if (scoreRef.value > highScore.value) {
    highScore.value = scoreRef.value;
    isNewBest.value = true;
  }
}

function canvasPoint(e) {
  const canvas = canvasRef.value;
  if (!canvas) return { x: aimX, y: aimY };
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H,
  };
}

function shoot() {
  if (phase.value !== "playing" || ammoRef.value <= 0) return;

  const now = performance.now();
  ammoRef.value -= 1;
  muzzleT = 10;

  let hitSomething = false;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const kind = t.kind || "duck";
    const dx = t.x - aimX;
    const dy = t.y - aimY;

    const slack = kind === "crate" ? CRATE_HIT_SLACK : HIT_SLACK;
    if (dx * dx + dy * dy > (t.r + slack) * (t.r + slack)) continue;

    hitSomething = true;

    if (kind === "crate") {
      const gainedBank = Math.min(
        MAX_SHELL_BANK,
        shellBankRef.value + CRATE_SHELLS,
      );
      const actualAdded = gainedBank - shellBankRef.value;
      shellBankRef.value = gainedBank;
      const gained = 18 + Math.round(actualAdded * 0.9);
      scoreRef.value += gained;
      if (actualAdded > 0) {
        addPopup(
          `+${actualAdded} bank`,
          t.x,
          t.y - t.r * 0.9,
          "rgba(0,162,255,1)",
          820,
          18,
          20,
        );
      }
      spawnFeathers(t.x, t.y, t.hue);
    } else {
      const within = now - lastHitAt <= STREAK_WINDOW_MS;
      streakRef.value = within ? streakRef.value + 1 : 1;
      lastHitAt = now;

      const mult = Math.min(
        STREAK_MULT_CAP,
        1 + streakRef.value * STREAK_MULT_STEP,
      );
      const base = Math.max(
        8,
        Math.round(22 - t.r * 0.35 + (t.fast ? 6 : 0)),
      );
      const gained = Math.round(base * mult);
      scoreRef.value += gained;
      addPopup(`x${mult.toFixed(2)}`, aimX, aimY - 10, "rgba(255,215,0,1)", 820, 22, 26);
      if (streakRef.value >= 2) {
        addPopup(
          `Streak x${streakRef.value}`,
          t.x,
          t.y - t.r * 1.05,
          "rgba(255,95,95,1)",
          920,
          16,
          22,
        );
      }

      const addBank =
        DUCK_SHELL_BANK_MIN + (t.fast ? DUCK_SHELL_BANK_FAST : 0);
      shellBankRef.value = Math.min(MAX_SHELL_BANK, shellBankRef.value + addBank);
      if (streakRef.value >= 3) {
        // When you are on a streak, slightly encourage crate spawns.
        crateAcc = Math.min(crateAcc, CRATE_INTERVAL_MS * 0.5);
      }

      spawnFeathers(t.x, t.y, t.hue);
    }

    targets.splice(i, 1);
    break;
  }

  if (!hitSomething) {
    streakRef.value = 0;
  }

  if (ammoRef.value <= 0 && shellBankRef.value <= 0) {
    endGame();
  }
}

function onMouseMove(e) {
  if (phase.value !== "playing" && phase.value !== "idle") return;
  const p = canvasPoint(e);
  aimX = Math.max(CROSS_R, Math.min(W - CROSS_R, p.x));
  aimY = Math.max(CROSS_R, Math.min(H - CROSS_R, p.y));
}

function onMouseDown(e) {
  if (phase.value === "idle") {
    resetPlaying();
    const p = canvasPoint(e);
    aimX = Math.max(CROSS_R, Math.min(W - CROSS_R, p.x));
    aimY = Math.max(CROSS_R, Math.min(H - CROSS_R, p.y));
    return;
  }
  if (phase.value !== "playing") return;
  e.preventDefault();
  const p = canvasPoint(e);
  aimX = Math.max(CROSS_R, Math.min(W - CROSS_R, p.x));
  aimY = Math.max(CROSS_R, Math.min(H - CROSS_R, p.y));

  if (ammoRef.value <= 0 && shellBankRef.value > 0) {
    const now = performance.now();
    if (now - lastBlankAt > BLANK_COOLDOWN_MS) {
      lastBlankAt = now;
      muzzleT = 8;
      spawnBlankPuff(aimX, aimY);
      addPopup("BLANK", aimX, aimY, "rgba(148,163,184,1)", 650, 22, 22);
      addPopup("Press E", aimX, aimY + 26, "rgba(255,95,95,1)", 900, 14, 14);
    }
    return;
  }

  shoot();
}

function drawSky(ts) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#87ceeb");
  g.addColorStop(0.55, "#6ec6e8");
  g.addColorStop(1, "#4a9fd4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const drift = ts * 0.012;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 137 + drift) % (W + 100)) - 50;
    const cy = 40 + i * 28;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 36 + i * 5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGrass() {
  const gh = 48;
  const gy = H - gh;
  const g = ctx.createLinearGradient(0, gy, 0, H);
  g.addColorStop(0, "#5cb85c");
  g.addColorStop(1, "#3d8b3d");
  ctx.fillStyle = g;
  ctx.fillRect(0, gy, W, gh);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, gy, W, 3);
}

function drawDuck(t) {
  const s = t.r / 21;
  const flip = t.vx >= 0 ? 1 : -1;
  const flap = 0.92 + Math.sin(t.wobble * 1.7) * 0.06;
  const dh = t.hue;

  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(flip, 1);

  ctx.fillStyle = "rgba(15, 40, 25, 0.2)";
  ctx.beginPath();
  ctx.ellipse(4 * s, 26 * s, 22 * s, 6 * s, 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `hsl(${dh}, 55%, 28%)`;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-26 * s - i * 5 * s, 6 * s + i * 2 * s, 8 * s, 5 * s, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const bodyG = ctx.createRadialGradient(-4 * s, 0, 2 * s, 10 * s, 10 * s, 30 * s);
  bodyG.addColorStop(0, `hsl(${dh}, 42%, 52%)`);
  bodyG.addColorStop(0.55, `hsl(${dh}, 62%, 38%)`);
  bodyG.addColorStop(1, `hsl(${dh + 8}, 72%, 24%)`);
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.ellipse(4 * s, 6 * s, 21 * s, 14 * s, 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(4 * s, 6 * s, 21 * s, 14 * s, 0.08, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(2 * s, 8 * s);
  ctx.scale(1, flap);
  const wingG = ctx.createLinearGradient(0, -8 * s, 12 * s, 8 * s);
  wingG.addColorStop(0, `hsla(${dh}, 65%, 32%, 0.95)`);
  wingG.addColorStop(1, `hsla(${dh + 5}, 75%, 22%, 0.95)`);
  ctx.fillStyle = wingG;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(16 * s, -4 * s, 20 * s, 6 * s);
  ctx.quadraticCurveTo(10 * s, 10 * s, 0, 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = `hsl(${dh}, 35%, 70%)`;
  ctx.beginPath();
  ctx.ellipse(-4 * s, -2 * s, 7 * s, 9 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const headG = ctx.createRadialGradient(-18 * s, -8 * s, 1 * s, -12 * s, -4 * s, 14 * s);
  headG.addColorStop(0, `hsl(${dh}, 38%, 58%)`);
  headG.addColorStop(0.45, `hsl(${dh}, 48%, 46%)`);
  headG.addColorStop(1, `hsl(${dh}, 62%, 34%)`);
  ctx.fillStyle = headG;
  ctx.beginPath();
  ctx.ellipse(-12 * s, -4 * s, 12 * s, 11 * s, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-12 * s, -4 * s, 12 * s, 11 * s, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  const beakG = ctx.createLinearGradient(2 * s, -2 * s, 22 * s, 6 * s);
  beakG.addColorStop(0, "#ffb347");
  beakG.addColorStop(0.5, "#ff8c28");
  beakG.addColorStop(1, "#c45c10");
  ctx.fillStyle = beakG;
  ctx.beginPath();
  ctx.moveTo(2 * s, -1 * s);
  ctx.quadraticCurveTo(20 * s, 2 * s, 22 * s, 6 * s);
  ctx.quadraticCurveTo(14 * s, 9 * s, 4 * s, 6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 50, 0, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-18 * s, -8 * s, 4.2 * s, 4.5 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-17 * s, -7.5 * s, 2 * s, 2.1 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(-16 * s, -8.8 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.fill();

  if (t.fast) {
    ctx.strokeStyle = "rgba(40, 200, 90, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-12 * s, -4 * s, 14 * s, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCrate(t) {
  ctx.save();
  ctx.translate(t.x, t.y);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, t.r * 2.1);
  glow.addColorStop(0, `hsla(${t.hue}, 90%, 65%, 0.35)`);
  glow.addColorStop(1, `hsla(${t.hue}, 90%, 55%, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, t.r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  const w = t.r * 1.35;
  const h = t.r * 1.05;
  const r = 6;

  const ox = -w / 2;
  const oy = -h / 2;
  ctx.fillStyle = `rgba(255, 195, 70, 0.14)`;
  ctx.strokeStyle = `hsla(${t.hue}, 85%, 62%, 0.6)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(ox + rr, oy);
  ctx.arcTo(ox + w, oy, ox + w, oy + h, rr);
  ctx.arcTo(ox + w, oy + h, ox, oy + h, rr);
  ctx.arcTo(ox, oy + h, ox, oy, rr);
  ctx.arcTo(ox, oy, ox + w, oy, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // X latch
  ctx.strokeStyle = `rgba(0,0,0,0.35)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox + w * 0.28, oy + h * 0.28);
  ctx.lineTo(ox + w * 0.72, oy + h * 0.72);
  ctx.moveTo(ox + w * 0.72, oy + h * 0.28);
  ctx.lineTo(ox + w * 0.28, oy + h * 0.72);
  ctx.stroke();

  ctx.restore();
}

function drawCrosshair() {
  if (muzzleT > 0) {
    ctx.fillStyle = "rgba(255, 220, 120, 0.45)";
    ctx.beginPath();
    ctx.arc(aimX, aimY, 28, 0, Math.PI * 2);
    ctx.fill();
    muzzleT -= 1;
  }

  ctx.strokeStyle = "rgba(255, 50, 50, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(aimX, aimY, CROSS_R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(aimX - 28, aimY);
  ctx.lineTo(aimX - 8, aimY);
  ctx.moveTo(aimX + 8, aimY);
  ctx.lineTo(aimX + 28, aimY);
  ctx.moveTo(aimX, aimY - 28);
  ctx.lineTo(aimX, aimY - 8);
  ctx.moveTo(aimX, aimY + 8);
  ctx.lineTo(aimX, aimY + 28);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(aimX, aimY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.globalAlpha = p.life;
    ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, 1)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function update(dt) {
  if (phase.value !== "playing") return;

  const step = dt / 16.67;
  spawnAcc += dt;
  while (spawnAcc >= SPAWN_INTERVAL_MS) {
    spawnAcc -= SPAWN_INTERVAL_MS;
    const duckCount = targets.filter((t) => (t.kind || "duck") !== "crate")
      .length;
    if (duckCount < MAX_ON_SCREEN) spawnTarget();
  }

  crateAcc += dt;
  const effectiveCrateInterval = Math.max(
    2400,
    CRATE_INTERVAL_MS - Math.min(6, streakRef.value) * 300,
  );
  while (crateAcc >= effectiveCrateInterval) {
    crateAcc -= effectiveCrateInterval;
    const crateCount = targets.filter((t) => t.kind === "crate").length;
    if (crateCount < CRATE_MAX_ON_SCREEN && ammoRef.value < MAG_CAP) {
      spawnCrate();
    }
  }

  if (keys.u) aimY = Math.max(CROSS_R, aimY - AIM_SPEED * step);
  if (keys.d) aimY = Math.min(H - CROSS_R, aimY + AIM_SPEED * step);
  if (keys.l) aimX = Math.max(CROSS_R, aimX - AIM_SPEED * step);
  if (keys.r) aimX = Math.min(W - CROSS_R, aimX + AIM_SPEED * step);

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    if ((t.kind || "duck") === "crate") {
      t.ttlMs -= dt;
      t.wobble += t.wobbleSpd * step * 60 * 0.016;
      t.y = t.baseY + Math.sin(t.wobble) * 4.2;
      if (t.ttlMs <= 0) targets.splice(i, 1);
      continue;
    }

    t.x += t.vx * step * 60 * 0.016;
    t.wobble += t.wobbleSpd * step * 60 * 0.016;
    t.y +=
      t.vy * step * 60 * 0.016 +
      Math.sin(t.wobble) * (0.55 + (t.fast ? 0.2 : 0)) * step;

    if (t.x < -60 || t.x > W + 60) targets.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.vy += 0.12 * step;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawHudText() {
  if (phase.value !== "playing") return;
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.textAlign = "left";
  const showReloadHint =
    ammoRef.value <= 0 && shellBankRef.value > 0 ? " · Press E to reload" : "";
  const showStreak =
    streakRef.value >= 2 ? ` · Streak x${streakRef.value}` : "";
  ctx.fillText(
    `Click to shoot · WASD aim${showStreak}${showReloadHint}`,
    12,
    H - 14,
  );
}

function drawReloadCue(ts) {
  if (phase.value !== "playing") return;
  const needsReload = ammoRef.value <= 0 && shellBankRef.value > 0;
  if (!needsReload) return;

  const blink = 0.45 + 0.55 * Math.sin(ts * 0.03);
  const alpha = Math.max(0, blink);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${22}px system-ui, sans-serif`;
  ctx.shadowColor = "rgba(255, 80, 80, 0.85)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = `rgba(255, 95, 95, ${0.95 * alpha})`;
  ctx.fillText("RELOAD!", W / 2, 44);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 6;
  ctx.strokeText("RELOAD!", W / 2, 44);
  ctx.restore();
}

function drawPopups() {
  if (!popups.length) return;

  const now = performance.now();
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    const t = (now - p.bornAt) / p.ttlMs;
    if (t >= 1) {
      popups.splice(i, 1);
      continue;
    }

    const a = 1 - t;
    const y = p.y - t * 28;
    const s = p.size * (0.96 + (1 - t) * 0.12);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${s}px system-ui, sans-serif`;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.glow;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = a;
    ctx.fillText(p.text, p.x, y);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.globalAlpha = a;
    ctx.strokeText(p.text, p.x, y);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawOverlay() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (phase.value === "idle") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 4;
    ctx.strokeText("Duck Hunt", W / 2, H / 2 - 28);
    ctx.fillText("Duck Hunt", W / 2, H / 2 - 28);
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillStyle = "#f0f8ff";
    ctx.fillText("Move mouse to aim · Click to start & shoot", W / 2, H / 2 + 4);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`${START_AMMO} shells · Enter`, W / 2, H / 2 + 26);
  } else if (phase.value === "paused") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("Paused", W / 2, H / 2);
  } else if (phase.value === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("Out of shells!", W / 2, H / 2 - 18);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Score ${scoreRef.value}`, W / 2, H / 2 + 10);
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("R · Play again", W / 2, H / 2 + 34);
  }
}

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  const raw = ts - lastTs;
  lastTs = ts;
  const dt = Math.min(raw, MAX_DT);

  update(dt);

  if (!ctx) return;
  drawSky(ts);
  drawGrass();

  for (const t of targets) {
    if ((t.kind || "duck") === "crate") drawCrate(t);
    else drawDuck(t);
  }

  drawParticles();
  drawCrosshair();
  drawPopups();
  drawReloadCue(ts);
  drawHudText();
  drawOverlay();
}

function setupCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function onKeyDown(e) {
  if (e.code === "Escape") {
    e.preventDefault();
    if (phase.value === "playing") phase.value = "paused";
    else if (phase.value === "paused") phase.value = "playing";
    return;
  }

  if (e.code === "KeyE") {
    e.preventDefault();
    reloadShells();
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();
    if (phase.value === "idle") resetPlaying();
    else if (phase.value === "playing") phase.value = "paused";
    else if (phase.value === "paused") phase.value = "playing";
    return;
  }

  if (e.code === "KeyR" || e.key?.toLowerCase() === "r") {
    e.preventDefault();
    if (
      phase.value === "gameover" ||
      phase.value === "paused" ||
      phase.value === "playing"
    ) {
      resetPlaying();
    }
    return;
  }

  if (e.key === "Enter" && phase.value === "idle") {
    e.preventDefault();
    resetPlaying();
    return;
  }

  if (phase.value === "playing") {
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      keys.u = true;
      e.preventDefault();
    }
    if (e.code === "KeyS" || e.code === "ArrowDown") {
      keys.d = true;
      e.preventDefault();
    }
    if (e.code === "KeyA" || e.code === "ArrowLeft") {
      keys.l = true;
      e.preventDefault();
    }
    if (e.code === "KeyD" || e.code === "ArrowRight") {
      keys.r = true;
      e.preventDefault();
    }
  }
}

function onKeyUp(e) {
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.u = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.d = false;
  if (e.code === "KeyA" || e.code === "ArrowLeft") keys.l = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") keys.r = false;
}

function resumeGame() {
  phase.value = "playing";
  lastTs = 0;
}

function reloadShells() {
  if (phase.value !== "playing") return;
  if (ammoRef.value >= MAG_CAP) return;
  if (shellBankRef.value <= 0) return;

  const now = performance.now();
  if (now - lastReloadAt < RELOAD_COOLDOWN_MS) return;
  lastReloadAt = now;

  const fill = Math.min(shellBankRef.value, MAG_CAP - ammoRef.value);
  shellBankRef.value -= fill;
  ammoRef.value += fill;

  // Tiny feedback burst (no gameplay effect).
  muzzleT = 8;
  addPopup(`Reloaded +${fill}`, W / 2, 86, "rgba(0,162,255,1)", 950, 18, 24);
}

onMounted(() => {
  setupCanvas();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="game-page-wrapper">
    <GameMobileMessage />

    <div class="desktop-game">
      <div class="game-wrapper">
        <div class="left-section">
          <div
            class="canvas-wrap"
            @mousemove="onMouseMove"
            @mousedown="onMouseDown"
          >
            <canvas
              ref="canvasRef"
              class="game-canvas"
              width="560"
              height="380"
              aria-label="Duck Hunt game"
            />
          </div>
        </div>

        <div class="right-section">
          <h1 class="game-title">Duck Hunt</h1>

          <div class="info-box score-box">
            <div class="label score-label">Score</div>
            <div class="value score-value">{{ scoreRef }}</div>

            <div class="score-divider"></div>

            <div class="ammo-sandwich">
              <div class="label ammo-label">Shells</div>
              <div class="value ammo-value">{{ ammoRef }}</div>
            </div>

            <div class="score-divider"></div>

            <div class="bank-sandwich">
              <div class="label bank-label">Shell Bank</div>
              <div class="value bank-value">{{ shellBankRef }}</div>
            </div>

            <div class="score-divider"></div>

            <div
              class="label"
              style="font-size: 11px; color: #94a3b8; margin-bottom: 2px"
            >
              HIGH SCORE
            </div>
            <div class="value high-score-value">{{ highScore }}</div>
          </div>

          <p v-if="isNewBest && phase === 'gameover'" class="new-best">
            New best score!
          </p>

          <div class="btn-row">
            <button
              v-if="phase === 'idle' || phase === 'gameover'"
              type="button"
              class="action-btn"
              @click="resetPlaying"
            >
              {{ phase === "idle" ? "Start" : "Play again" }}
            </button>
            <button
              v-if="phase === 'playing'"
              type="button"
              class="action-btn ghost"
              @click="phase = 'paused'"
            >
              Pause
            </button>
            <button
              v-if="phase === 'paused'"
              type="button"
              class="action-btn"
              @click="resumeGame"
            >
              Resume
            </button>
            <button
              v-if="
                phase === 'playing' &&
                ammoRef < MAG_CAP &&
                shellBankRef > 0
              "
              type="button"
              class="action-btn ghost"
              @click="reloadShells"
            >
              Reload
            </button>
          </div>

          <div class="controls-container">
            <div class="control-item">
              <span>Aim</span>
              <span class="key">Mouse · WASD · Arrows</span>
            </div>
            <div class="control-item">
              <span>Shoot</span>
              <span class="key">Click</span>
            </div>
            <div class="control-item">
              <span>Pause</span>
              <span class="key">Esc · Space</span>
            </div>
            <div class="control-item">
              <span>Restart</span>
              <span class="key">R</span>
            </div>
            <div class="control-item">
              <span>Reload</span>
              <span class="key">E</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 85vh;
  width: 100%;
  text-align: center;
  background: transparent;
}

.game-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
}

.left-section {
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.canvas-wrap {
  line-height: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
}

.game-canvas {
  display: block;
  border-radius: 8px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 240px;
  text-align: left;
}

.game-title {
  font-size: 52px;
  margin: 0 0 10px;
  letter-spacing: -3px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-box {
  aspect-ratio: auto;
  min-height: 120px;
  width: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.05),
    rgba(255, 215, 0, 0.01)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.score-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.ammo-sandwich {
  align-self: stretch;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(255, 80, 80, 0.12),
    rgba(180, 40, 40, 0.06)
  );
  border: 1px solid rgba(255, 100, 100, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.bank-sandwich {
  align-self: stretch;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(0, 162, 255, 0.12),
    rgba(0, 162, 255, 0.04)
  );
  border: 1px solid rgba(0, 162, 255, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
  font-weight: 700;
}

.score-label {
  color: #ffd700;
  margin-bottom: 4px;
}

.ammo-label {
  color: #ff8a8a;
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
}

.bank-label {
  color: #00a2ff;
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
}

.value {
  font-size: 20px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.score-value {
  font-size: 42px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.ammo-value {
  display: block;
  width: 100%;
  font-size: 36px;
  font-variant-numeric: tabular-nums;
  color: #ff5c5c;
  text-shadow: 0 0 14px rgba(255, 80, 80, 0.45);
  text-align: center;
  line-height: 1.1;
}

.bank-value {
  display: block;
  width: 100%;
  font-size: 34px;
  font-variant-numeric: tabular-nums;
  color: #00a2ff;
  text-shadow: 0 0 14px rgba(0, 162, 255, 0.35);
  text-align: center;
  line-height: 1.1;
}

.high-score-value {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.new-best {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  background: white;
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 10px 18px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn:hover {
  opacity: 0.88;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.controls-container {
  margin-top: 4px;
  padding: 0 4px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;
  gap: 8px;
}

.control-item:last-child {
  border-bottom: none;
}

.key {
  color: #fff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  flex-shrink: 0;
}

.mobile-msg {
  display: none;
}

.desktop-game {
  display: block;
}

@media (max-width: 850px) {
  .desktop-game {
    display: none !important;
  }

  .mobile-msg {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
    padding: 0 20px;
  }
}
</style>
