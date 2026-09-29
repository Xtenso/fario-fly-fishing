// Home page hero: the Rhodope skyline with mist and sun, parallax on the
// pointer, the fly line that follows the mouse, ripples where it lands, and the
// FARIO letters. Ported from the design's component.
import { FLY_LINE } from '../config';
import { S } from './state';
import { fbm, layers, ridge } from './terrain';

interface Knot { x: number; y: number; ox: number; oy: number }
interface MistCanvas extends HTMLCanvasElement { _g?: CanvasGradient | null }

const ptr = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, px: 0, py: 0, inside: false, last: 0 };
let rope: Knot[] | null = [];
let tip: { x: number; y: number; vx: number; vy: number } | null = null;
let ripples: { x: number; y: number; t: number }[] = [];
let lineAlpha = 0;
let t0 = performance.now();
let W = 0, H = 0;
let sized: HTMLCanvasElement | null = null;
let mc: MistCanvas | null = null;

let hero: HTMLElement | null = null;
let back: HTMLCanvasElement | null = null, front: HTMLCanvasElement | null = null, line: HTMLCanvasElement | null = null;

/** Picks up the hero elements of the current page (none outside the home page). */
export function attachHero() {
  hero = document.querySelector<HTMLElement>('[data-hero-section]');
  back = document.querySelector<HTMLCanvasElement>('canvas[data-hero-back]');
  front = document.querySelector<HTMLCanvasElement>('canvas[data-hero-front]');
  line = document.querySelector<HTMLCanvasElement>('canvas[data-hero-line]');
}

/** Restarts the intro (sun rising, ridges settling), optionally after a delay. */
export function restartHero(delayMs = 0) { t0 = performance.now() + delayMs; }

/** Called every animation frame; draws while the hero is on screen. */
export function frame(t: number) {
  if (hero && window.scrollY < hero.offsetHeight + 50) drawHero(t);
}

export function bindHero() {
  const h = hero as (HTMLElement & { _bound?: boolean }) | null;
  if (!h || h._bound) return; h._bound = true;
  const local = (e: PointerEvent): [number, number, DOMRect] => { const r = h.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r]; };
  h.addEventListener('pointermove', (e) => {
    const [x, y, r] = local(e);
    ptr.x = x / r.width; ptr.y = y / r.height; ptr.px = x; ptr.py = y; ptr.last = performance.now();
    if (!ptr.inside) { ptr.inside = true; rope = null; }
  });
  h.addEventListener('pointerleave', () => { ptr.inside = false; });
  h.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest?.('a,button')) return;
    const [x, y] = local(e);
    ripples.push({ x, y, t: performance.now() });
    if (rope) { const n = rope.length; rope.forEach((p, i) => { p.oy = p.y + 10 * (i / n); p.ox = p.x + 5 * (i / n); }); }
  });
}

export function sizeHero() {
  const b = back; if (!b) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  [back, front, line].forEach((c) => { if (!c) return; c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr); c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0); });
  W = b.clientWidth; H = b.clientHeight; sized = b;
}

function mist(c: CanvasRenderingContext2D, W: number, H: number, el: number, i: number, yAt: (x: number) => number, dx: number) {
  const sc = 0.25, mw = Math.ceil(W * sc), mh = Math.ceil(H * sc);
  const m: MistCanvas = mc || (mc = document.createElement('canvas'));
  if (m.width !== mw || m.height !== mh) { m.width = mw; m.height = mh; m._g = null; }
  const mx = m.getContext('2d')!; mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalAlpha = 1; mx.clearRect(0, 0, mw, mh);
  const g = m._g || (m._g = (() => { const q = mx.createLinearGradient(0, 0, 0, 1); q.addColorStop(0, 'rgba(206,222,212,0)'); q.addColorStop(0.7, 'rgba(206,222,212,.6)'); q.addColorStop(1, 'rgba(206,222,212,1)'); return q; })());
  const n = mw + 1, ys = new Float32Array(n), r = 20, amp = i === 1 ? 0.1 : 0.08;
  for (let k = 0; k < n; k++) ys[k] = yAt(k / sc) * sc;
  mx.fillStyle = g;
  for (let k = 0; k < n; k++) {
    let sum = 0, cnt = 0; for (let j = Math.max(0, k - r); j <= Math.min(n - 1, k + r); j++) { sum += ys[j]; cnt++; }
    const depth = Math.max(0, Math.min(1, ((ys[k] - sum / cnt) / (mh * 0.03) - 0.35) * 1.6));
    if (depth <= 0) continue;
    const u = (k / sc - dx) / W, patch = Math.max(0, Math.min(1, (fbm(u * 3.2 + i * 9.1 - el * 0.015) - 0.42) * 3));
    const al = amp * patch * depth; if (al < 0.003) continue;
    const h = mh * (0.008 + 0.022 * depth);
    mx.globalAlpha = al; mx.setTransform(1, h + 1, 0, 1, 0, 0); mx.setTransform(1, 0, 0, h + 1, k, ys[k] - h); mx.fillRect(0, 0, 1, 1);
  }
  c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(m, 0, 0, mw / sc, mh / sc); c.restore();
}

function drawHero(t: number) {
  if (sized !== back) sizeHero();
  const bc = back, fc = front, lc = line;
  if (!W || !H || !bc || !fc || !lc) return;
  const el = (t - t0) / 1000, p = ptr;
  p.sx += (p.x - p.sx) * 0.04; p.sy += (p.y - p.sy) * 0.04;
  const k = S.reduced ? 1 : Math.max(0, Math.min(1, el / 2.8)), e = 1 - Math.pow(1 - k, 3);
  const b = bc.getContext('2d')!, f = fc.getContext('2d')!, l = lc.getContext('2d')!;
  b.clearRect(0, 0, W, H); f.clearRect(0, 0, W, H); l.clearRect(0, 0, W, H);
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d1a17'); g.addColorStop(0.55, '#1b2f2b'); g.addColorStop(1, '#223a36');
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  const sr = Math.min(W, H) * 0.075, sx = W * 0.64 - (p.sx - 0.5) * 12, sy = H * (0.36 + (1 - e) * 0.12) - (p.sy - 0.5) * 6;
  b.globalAlpha = e; b.fillStyle = '#e2493b'; b.beginPath(); b.arc(sx, sy, sr, 0, 6.2832); b.fill();
  b.strokeStyle = 'rgba(238,241,232,.45)'; b.lineWidth = 1.2; b.beginPath(); b.arc(sx, sy, sr * 1.45, 0, 6.2832); b.stroke(); b.globalAlpha = 1;
  const fr = Math.max(0.35, Math.min(1.35, W / H / 1.6));
  layers.forEach((L, i) => {
    const c = L.front ? f : b;
    const dx = (p.sx - 0.5) * L.d * -46, dy = (p.sy - 0.5) * L.d * -14 + (1 - e) * H * 0.06 * (1 + i * 0.4);
    c.fillStyle = L.c; c.beginPath(); c.moveTo(0, H);
    const dipW = Math.min(W * 0.28, H * 0.4);
    for (let x = -8; x <= W + 8; x += 6) {
      const dip = L.front ? H * 0.07 * (i === 5 ? 1.25 : 1) * Math.max(0, 1 - Math.pow(Math.max(0, x) / dipW, 2)) : 0;
      c.lineTo(x, H * ridge(L.p, 0.5 + ((x - dx) / W - 0.5) * fr) + dy + dip);
    }
    c.lineTo(W, H); c.closePath(); c.fill();
    if (i === 1 || i === 3) mist(c, W, H, el, i, (x) => H * ridge(L.p, 0.5 + ((x - dx) / W - 0.5) * fr) + dy, dx);
  });
  drawLine(l, t);
}

function drawLine(l: CanvasRenderingContext2D, now: number) {
  const p = ptr, N = 36, SEG = 7, NL = 25;
  const active = S.fine && FLY_LINE && p.inside && now - p.last < 2600;
  lineAlpha += ((active ? 1 : 0) - lineAlpha) * 0.08;
  if (p.inside && (!rope || rope.length !== N)) {
    rope = Array.from({ length: N }, (_, i) => ({ x: p.px, y: p.py + i * SEG, ox: p.px, oy: p.py + i * SEG }));
    tip = { x: p.px, y: p.py, vx: 0, vy: 0 };
  }
  const R = rope, T = tip;
  if (R && R.length === N && T && lineAlpha > 0.01) {
    T.vx += (p.px - T.x - T.vx) * 0.3; T.vy += (p.py - T.y - T.vy) * 0.3; T.x = p.px; T.y = p.py;
    R[0].x = R[0].ox = T.x; R[0].y = R[0].oy = T.y;
    for (let i = 1; i < N; i++) { const q = R[i], vx = (q.x - q.ox) * 0.985, vy = (q.y - q.oy) * 0.985; q.ox = q.x; q.oy = q.y; q.x += vx; q.y += vy + 0.18; }
    for (let it = 0; it < 12; it++) {
      for (let i = 0; i < N - 1; i++) {
        const a = R[i], c = R[i + 1], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1, k = (d - SEG) / d;
        if (i === 0) { c.x -= dx * k; c.y -= dy * k; } else { a.x += dx * k * 0.5; a.y += dy * k * 0.5; c.x -= dx * k * 0.5; c.y -= dy * k * 0.5; }
      }
      for (let i = 0; i < N - 2; i++) {
        const a = R[i], c = R[i + 2], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1, mn = SEG * (i < NL ? 1.92 : 1.5);
        if (d >= mn) continue;
        const k = (i < NL ? 0.28 : 0.06) * (d - mn) / d;
        if (i === 0) { c.x -= dx * k * 2; c.y -= dy * k * 2; } else { a.x += dx * k; a.y += dy * k; c.x -= dx * k; c.y -= dy * k; }
      }
    }
    const path = (ox: number, oy: number, from: number, to: number) => { l.beginPath(); l.moveTo(R[from].x + ox, R[from].y + oy); for (let i = from + 1; i < to; i++) l.quadraticCurveTo(R[i].x + ox, R[i].y + oy, (R[i].x + R[i + 1].x) / 2 + ox, (R[i].y + R[i + 1].y) / 2 + oy); l.lineTo(R[to].x + ox, R[to].y + oy); };
    l.globalAlpha = lineAlpha; l.lineCap = 'round'; l.lineJoin = 'round';
    l.strokeStyle = 'rgba(4,10,9,.45)'; l.lineWidth = 3; path(3, 6, 0, N - 1); l.stroke();
    const mid = (i: number) => ({ x: (R[i].x + R[i + 1].x) / 2, y: (R[i].y + R[i + 1].y) / 2 });
    for (let i = 0; i < N - 1; i++) {
      const a = i ? mid(i - 1) : R[0], c = i < N - 2 ? mid(i) : R[N - 1], isLine = i < NL, u = isLine ? i / NL : (i - NL) / (N - 1 - NL);
      l.strokeStyle = isLine ? '#d2f25c' : 'rgba(238,241,232,' + (0.6 - 0.35 * u).toFixed(3) + ')';
      l.lineWidth = isLine ? 2.4 - u : 0.9 - 0.4 * u;
      l.beginPath(); l.moveTo(a.x, a.y); l.quadraticCurveTo(R[i].x, R[i].y, c.x, c.y); l.stroke();
    }
    l.strokeStyle = 'rgba(250,255,220,.55)'; l.lineWidth = 0.7; path(-0.5, -0.7, 0, NL); l.stroke();
    // The fly: hook, tail, body, hackle and a red post.
    const E = R[N - 1], D = R[N - 2];
    l.save(); l.translate(E.x, E.y); l.rotate(Math.atan2(E.y - D.y, E.x - D.x));
    l.strokeStyle = 'rgba(200,205,200,.85)'; l.lineWidth = 0.9; l.beginPath(); l.moveTo(0, 0); l.lineTo(11, 0); l.arc(11, 3, 3, -Math.PI / 2, Math.PI / 2); l.lineTo(8, 5.2); l.stroke();
    l.strokeStyle = 'rgba(214,194,152,.9)'; l.lineWidth = 0.7;
    [[17, -1.8], [17.6, 0], [17, 1.8]].forEach((q) => { l.beginPath(); l.moveTo(10, 0); l.lineTo(q[0], q[1]); l.stroke(); });
    l.strokeStyle = '#8a7556'; l.lineWidth = 3.4; l.beginPath(); l.moveTo(3, 0); l.lineTo(7, 0); l.stroke();
    l.lineWidth = 2.4; l.beginPath(); l.moveTo(7, 0); l.lineTo(10.5, 0); l.stroke();
    l.strokeStyle = 'rgba(196,170,120,.85)'; l.lineWidth = 0.7;
    for (let k = 0; k < 14; k++) { const an = k / 14 * 6.2832; l.beginPath(); l.moveTo(2.5, 0); l.lineTo(2.5 + Math.cos(an) * 5.5, Math.sin(an) * 5.5); l.stroke(); }
    l.strokeStyle = '#e2493b'; l.lineWidth = 2.2; l.beginPath(); l.moveTo(3, -1); l.lineTo(3, -8.5); l.stroke();
    l.restore();
    l.globalAlpha = 1;
  }
  ripples = ripples.filter((r) => now - r.t < 1900);
  ripples.forEach((r) => {
    for (let k = 0; k < 3; k++) {
      const tk = (now - r.t) / 1500 - k * 0.14; if (tk <= 0 || tk >= 1) continue;
      const e = 1 - Math.pow(1 - tk, 3), rad = 6 + e * 120;
      l.strokeStyle = 'rgba(238,241,232,' + (0.6 * (1 - tk)).toFixed(3) + ')'; l.lineWidth = 1.2;
      l.beginPath(); l.ellipse(r.x, r.y, rad, rad * 0.32, 0, 0, 6.2832); l.stroke();
    }
  });
}

/** The FARIO / ФАРИО letters settle in from a blur. */
export function introWord(delay: number) {
  if (S.reduced) return;
  requestAnimationFrame(() => {
    const w = document.querySelector('[data-word]'); if (!w) return;
    w.querySelectorAll<HTMLElement>('[data-l]').forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(-26%)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      { duration: 1300, delay: (delay || 0) + i * 110, easing: 'cubic-bezier(.16,.84,.24,1)', fill: 'backwards' }));
  });
}
