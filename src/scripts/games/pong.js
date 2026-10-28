import { createLoop, onBlur, onGameKey, trackKeys } from '../game';

const WIDTH = 700;
const HEIGHT = 500;
const WIN_SCORE = 7;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 85;
const PADDLE_Y = (HEIGHT - PADDLE_HEIGHT) / 2;
const BALL_RADIUS = 7;
const TARGET_FPS = 60;
const STEP_MS = 1000 / TARGET_FPS;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createPong(root) {
  const canvas = root.querySelector('canvas');
  const startOverlay = root.querySelector('[data-start]');
  const overOverlay = root.querySelector('[data-over]');
  const pausedOverlay = root.querySelector('[data-paused]');
  const outcomeText = root.querySelector('[data-outcome]');
  const scoreText = root.querySelector('[data-score]');

  const ratio = window.devicePixelRatio;
  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  let status = 'start';
  let isPaused = false;
  let outcome = '';
  const scores = { left: 0, right: 0 };

  let audioCtx = null;
  let gameMode = 'cpu';
  let isResetting = false;
  let serveTimer;
  let trail = [];
  let particles = [];
  let shakeFrames = 0;
  let shakeIntensity = 0;

  const leftPaddle = { x: 20, y: PADDLE_Y, speed: 10.5, aiSpeed: 5.7, flash: 0 };
  const rightPaddle = { x: WIDTH - 20 - PADDLE_WIDTH, y: PADDLE_Y, speed: 10.5, flash: 0 };
  const ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: 0, dy: 0, speed: 4, baseSpeed: 4 };

  const keys = trackKeys(['ArrowUp', 'ArrowDown', 'Space'], () => {});
  const isHeld = (name) => !keys.isModifierDown() && keys.isDown(name);

  const loop = createLoop((delta) => {
    update(Math.min(delta, 50) / STEP_MS);
    draw();
    sync();
  });

  function sync() {
    startOverlay.hidden = status !== 'start';
    overOverlay.hidden = status !== 'over';
    pausedOverlay.hidden = status === 'start' || status === 'over' || !isPaused;
    outcomeText.textContent = outcome;
    scoreText.textContent = `${scores.left} - ${scores.right}`;
  }

  function serveBall() {
    clearTimeout(serveTimer);
    serveTimer = setTimeout(() => {
      isResetting = false;
      const dir = Math.random() > 0.5 ? 1 : -1;
      ball.dx = dir * ball.speed;
      ball.dy = (Math.random() * 2 - 1) * ball.speed * 0.5;
    }, 1000);
  }

  function getAudioCtx() {
    if (!audioCtx && typeof AudioContext !== 'undefined') {
      audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(frequency, duration, type = 'square', volume = 0.15) {
    const audio = getAudioCtx();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + duration);
  }

  function spawnParticles(x, y, rgb) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        size: 2 + Math.random() * 3,
        rgb,
      });
    }
  }

  function hitsPaddle(paddle) {
    return (
      ball.x + BALL_RADIUS > paddle.x &&
      ball.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH &&
      ball.y + BALL_RADIUS > paddle.y &&
      ball.y - BALL_RADIUS < paddle.y + PADDLE_HEIGHT
    );
  }

  function drawCenterLine() {
    const segmentHeight = 18;
    const segmentGap = 12;
    const segmentCount = Math.floor(HEIGHT / (segmentHeight + segmentGap));
    const startY = (HEIGHT - segmentCount * (segmentHeight + segmentGap) + segmentGap) / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    for (let i = 0; i < segmentCount; i++) {
      const y = startY + i * (segmentHeight + segmentGap);
      ctx.beginPath();
      ctx.roundRect(WIDTH / 2 - 1.5, y, 3, segmentHeight, 2);
      ctx.fill();
    }
  }

  function drawField() {
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(-10, -10, WIDTH + 20, HEIGHT + 20);
    drawCenterLine();
  }

  function drawPaddle(paddle) {
    const isFlashing = paddle.flash > 0;
    ctx.save();
    if (isFlashing) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 24;
    }
    ctx.fillStyle = isFlashing
      ? `rgba(255, 255, 255, ${0.7 + 0.3 * (paddle.flash / 8)})`
      : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const shakeX = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
    const shakeY = shakeFrames > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawField();

    for (let i = 1; i < trail.length; i++) {
      const fraction = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${fraction * 0.22})`;
      ctx.lineWidth = fraction * BALL_RADIUS * 1.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.rgb}, ${particle.life * 0.9})`;
      ctx.fill();
    }

    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function resetMatch() {
    scores.left = 0;
    scores.right = 0;
    trail = [];
    particles = [];
  }

  function resetPositions() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = ball.baseSpeed;
    ball.dx = 0;
    ball.dy = 0;
    leftPaddle.y = PADDLE_Y;
    rightPaddle.y = PADDLE_Y;
    trail = [];
    isResetting = true;
    serveBall();
  }

  function showStartScreen() {
    status = 'start';
    clearTimeout(serveTimer);
    loop.stop();
    resetMatch();
    drawField();
    sync();
  }

  function startGame(mode) {
    gameMode = mode;
    status = 'playing';
    isPaused = false;
    resetMatch();
    getAudioCtx();
    resetPositions();
    sync();
    loop.start();
  }

  function togglePause() {
    if (status !== 'playing') return;
    isPaused = !isPaused;
    if (isPaused) loop.stop();
    else loop.start();
    sync();
  }

  function checkWin() {
    if (scores.left < WIN_SCORE && scores.right < WIN_SCORE) {
      resetPositions();
      return;
    }
    status = 'over';
    loop.stop();
    const rightWon = scores.right >= WIN_SCORE;
    if (gameMode === 'cpu') outcome = rightWon ? 'You Win!' : 'Computer Wins!';
    else outcome = rightWon ? 'Right Player Wins!' : 'Left Player Wins!';
  }

  function updatePaddles(dt) {
    if (isHeld('ArrowUp')) rightPaddle.y -= rightPaddle.speed * dt;
    if (isHeld('ArrowDown')) rightPaddle.y += rightPaddle.speed * dt;

    if (gameMode === 'cpu') {
      const target = ball.y - PADDLE_HEIGHT / 2;
      const move = clamp((target - leftPaddle.y) * 0.18, -leftPaddle.aiSpeed, leftPaddle.aiSpeed);
      leftPaddle.y += move * dt;
    } else {
      if (isHeld('w')) leftPaddle.y -= leftPaddle.speed * dt;
      if (isHeld('s')) leftPaddle.y += leftPaddle.speed * dt;
    }

    leftPaddle.y = clamp(leftPaddle.y, 0, HEIGHT - PADDLE_HEIGHT);
    rightPaddle.y = clamp(rightPaddle.y, 0, HEIGHT - PADDLE_HEIGHT);
  }

  function updateBallWallCollision() {
    if (ball.y - BALL_RADIUS < 0) ball.y = BALL_RADIUS;
    else if (ball.y + BALL_RADIUS > HEIGHT) ball.y = HEIGHT - BALL_RADIUS;
    else return;

    ball.dy *= -1;
    beep(220, 0.07);
    shakeFrames = 4;
    shakeIntensity = 2;
  }

  function updateBallPaddleCollision() {
    const paddle = ball.x < WIDTH / 2 ? leftPaddle : rightPaddle;
    if (!hitsPaddle(paddle)) return;

    const hitOffset = clamp((ball.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2), -1, 1);
    const angle = (Math.PI / 4) * hitOffset;
    const dir = ball.x < WIDTH / 2 ? 1 : -1;
    ball.speed = Math.min(ball.speed + 0.45, 16);
    ball.dx = dir * ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);
    if (paddle === leftPaddle) {
      ball.x = leftPaddle.x + PADDLE_WIDTH + BALL_RADIUS;
      leftPaddle.flash = 8;
    } else {
      ball.x = rightPaddle.x - BALL_RADIUS;
      rightPaddle.flash = 8;
    }
    beep(300 + Math.abs(hitOffset) * 100, 0.07, 'square');
    shakeFrames = 6;
    shakeIntensity = 3.5;
  }

  function updateBallScoring() {
    const scorer = ball.x < 0 ? 'right' : ball.x > WIDTH ? 'left' : null;
    if (!scorer) return;

    spawnParticles(
      scorer === 'right' ? 0 : WIDTH,
      ball.y,
      scorer === 'right' ? '255,100,100' : '100,200,255',
    );
    scores[scorer]++;
    beep(140, 0.35, 'sawtooth', 0.2);
    shakeFrames = 14;
    shakeIntensity = 7;
    checkWin();
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.92 ** dt;
      particle.vy *= 0.92 ** dt;
      particle.life -= particle.decay * dt;
      if (particle.life <= 0) particles.splice(i, 1);
    }
  }

  function update(dt) {
    if (isPaused) return;

    updatePaddles(dt);

    if (leftPaddle.flash > 0) leftPaddle.flash -= dt;
    if (rightPaddle.flash > 0) rightPaddle.flash -= dt;
    if (shakeFrames > 0) shakeFrames -= dt;

    if (!isResetting) {
      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 10) trail.shift();

      ball.x += ball.dx * dt;
      ball.y += ball.dy * dt;

      updateBallWallCollision();
      updateBallPaddleCollision();
      updateBallScoring();
    }

    updateParticles(dt);
  }

  const cleanups = [
    onGameKey(['Escape', 'p'], (event) => {
      event.preventDefault();
      togglePause();
    }),
    onBlur(() => {
      if (!isPaused) togglePause();
    }),
  ];

  root.querySelector('[data-mode="cpu"]').addEventListener('click', () => startGame('cpu'));
  root.querySelector('[data-mode="pvp"]').addEventListener('click', () => startGame('pvp'));
  root.querySelector('[data-restart]').addEventListener('click', showStartScreen);

  drawField();
  sync();

  return () => {
    loop.stop();
    clearTimeout(serveTimer);
    keys.destroy();
    for (const cleanup of cleanups) cleanup();
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
  };
}
