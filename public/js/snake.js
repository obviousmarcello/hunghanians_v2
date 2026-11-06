// Easter egg: Ghana-flag snake. Loaded on demand (press G three times),
// so it costs nothing on normal page loads.
import { t } from './i18n.js';

const COLORS = { red: '#CE1126', yellow: '#FCD116', green: '#006B3F', black: '#000000', board: '#16130d', grid: '#221e16' };
const TILE = 20;
const BEST_KEY = 'hg-snake-best';

let overlay;
let state;

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function build() {
  overlay = document.createElement('div');
  overlay.className = 'snake';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Snake');
  overlay.innerHTML = `
    <button type="button" class="icon-btn snake-close" aria-label="Close"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
    <div class="snake-hud">
      <span>🐍 <span data-s="scoreLabel"></span>: <strong data-s="score">0</strong></span>
      <span>🏆 <span data-s="bestLabel"></span>: <strong data-s="best">0</strong></span>
    </div>
    <canvas></canvas>
    <p class="snake-help" data-s="help"></p>
    <div class="snake-over" hidden>
      <h2 data-s="over"></h2>
      <p class="snake-final" data-s="final">0</p>
      <button type="button" class="btn btn-primary" data-s="again"></button>
    </div>`;
  document.body.append(overlay);

  overlay.querySelector('.snake-close').addEventListener('click', stop);
  overlay.querySelector('[data-s="again"]').addEventListener('click', reset);
  document.addEventListener('keydown', onKey);

  let touch;
  overlay.addEventListener('touchstart', (e) => (touch = e.touches[0]), { passive: true });
  overlay.addEventListener('touchend', (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.clientX;
    const dy = e.changedTouches[0].clientY - touch.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
  });
}

const el = (name) => overlay.querySelector(`[data-s="${name}"]`);

function labels() {
  el('scoreLabel').textContent = t('snake.score');
  el('bestLabel').textContent = t('snake.best');
  el('help').textContent = t('snake.help');
  el('over').textContent = t('snake.over');
  el('again').textContent = t('snake.again');
}

function size() {
  const canvas = overlay.querySelector('canvas');
  const px = Math.floor(Math.min(innerWidth - 32, innerHeight - 220, 600) / TILE) * TILE;
  canvas.width = canvas.height = Math.max(px, TILE * 10);
  return canvas;
}

function reset() {
  const canvas = size();
  const tiles = canvas.width / TILE;
  const mid = Math.floor(tiles / 2);
  state = {
    canvas,
    ctx: canvas.getContext('2d'),
    tiles,
    snake: [0, 1, 2].map((i) => ({ x: mid - i, y: mid })),
    dir: { x: 1, y: 0 },
    queue: [],
    food: null,
    score: 0,
    best: readBest(),
    running: true,
    last: 0,
  };
  placeFood();
  overlay.querySelector('.snake-over').hidden = true;
  el('score').textContent = 0;
  el('best').textContent = state.best;
  requestAnimationFrame(loop);
}

function placeFood() {
  const free = [];
  for (let x = 0; x < state.tiles; x++)
    for (let y = 0; y < state.tiles; y++) if (!state.snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  state.food = free[Math.floor(Math.random() * free.length)];
}

function turn(dir) {
  if (!state?.running) return;
  const last = state.queue.at(-1) || state.dir;
  if (dir.x === -last.x && dir.y === -last.y) return; // no reversing into yourself
  if (dir.x === last.x && dir.y === last.y) return;
  if (state.queue.length < 3) state.queue.push(dir);
}

function onKey(e) {
  if (!overlay || overlay.hidden) return;
  const dirs = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  };
  if (e.key === 'Escape') return stop();
  const d = dirs[e.key];
  if (d) {
    e.preventDefault();
    turn(d);
  }
}

function step() {
  if (state.queue.length) state.dir = state.queue.shift();
  const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
  const hitWall = head.x < 0 || head.y < 0 || head.x >= state.tiles || head.y >= state.tiles;
  // The tail moves away this tick, so colliding with it is allowed.
  const hitSelf = state.snake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return gameOver();

  state.snake.unshift(head);
  if (head.x === state.food.x && head.y === state.food.y) {
    state.score += 10;
    el('score').textContent = state.score;
    placeFood();
  } else state.snake.pop();
}

function draw() {
  const { ctx, canvas, snake, food } = state;
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = COLORS.grid;
  for (let i = 0; i <= state.tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE + 0.5, 0);
    ctx.lineTo(i * TILE + 0.5, canvas.height);
    ctx.moveTo(0, i * TILE + 0.5);
    ctx.lineTo(canvas.width, i * TILE + 0.5);
    ctx.stroke();
  }

  // Black star of the Ghanaian flag on a yellow disc so it reads on the dark board.
  const cx = food.x * TILE + TILE / 2;
  const cy = food.y * TILE + TILE / 2;
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.arc(cx, cy, TILE / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.black;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? TILE / 6 : TILE / 2.6;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.fill();

  snake.forEach((s, i) => {
    const third = i / snake.length;
    ctx.fillStyle = third < 1 / 3 ? COLORS.red : third < 2 / 3 ? COLORS.yellow : COLORS.green;
    ctx.beginPath();
    ctx.roundRect(s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2, i === 0 ? 6 : 4);
    ctx.fill();
  });
  const h = snake[0];
  ctx.fillStyle = '#fff';
  ctx.fillRect(h.x * TILE + 5, h.y * TILE + 5, 4, 4);
  ctx.fillRect(h.x * TILE + 11, h.y * TILE + 5, 4, 4);
}

function loop(time) {
  if (!state.running) return;
  const interval = 1000 / (8 + state.score / 20);
  if (time - state.last >= interval) {
    state.last = time;
    step();
    if (!state.running) return;
    draw();
  }
  requestAnimationFrame(loop);
}

function gameOver() {
  state.running = false;
  if (state.score > state.best) {
    state.best = state.score;
    try {
      localStorage.setItem(BEST_KEY, String(state.best));
    } catch {}
  }
  el('best').textContent = state.best;
  el('final').textContent = state.score;
  overlay.querySelector('.snake-over').hidden = false;
  el('again').focus();
}

function stop() {
  if (state) state.running = false;
  overlay.hidden = true;
  document.documentElement.classList.remove('has-dialog');
}

export function startSnake() {
  if (!overlay) build();
  overlay.hidden = false;
  document.documentElement.classList.add('has-dialog');
  labels();
  if (!state?.running) reset();
}
