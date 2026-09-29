// Page animations, ported from the design's component: intro and scroll
// reveals, ridge strips, the History timeline, the season dial on Activities,
// the menu, and the contact form.
import { S } from './state';
import { fbm } from './terrain';

const ease = 'cubic-bezier(.16,.84,.24,1)';
const root = () => document.getElementById('root');

/** Page intro: the [data-hero] elements rise in one after another, the ridge strips follow. */
export function introHero(delay: number) {
  const r = root(); if (!r || S.reduced) return;
  r.querySelectorAll<HTMLElement>('[data-hero]').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: delay + i * 90, easing: ease, fill: 'backwards' }));
  r.querySelectorAll<HTMLElement>('canvas[data-ridge]').forEach((el) => el.animate([{ opacity: 0, transform: 'translateY(30%)' }, { opacity: 1, transform: 'none' }], { duration: 1600, delay: delay + 150, easing: ease, fill: 'backwards' }));
}

/** Mountain ridge strips under the page titles. */
export function drawStrips() {
  const r = root(); if (!r) return;
  r.querySelectorAll<HTMLCanvasElement>('canvas[data-ridge]').forEach((c) => {
    const k = Number(c.getAttribute('data-ridge')) || 1, dpr = Math.min(window.devicePixelRatio || 1, 2), W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const x = c.getContext('2d')!; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    ['#2d4743', '#223834', '#192c29', '#132422', '#0d1a17'].forEach((col, i) => {
      x.fillStyle = col; x.beginPath(); x.moveTo(0, H);
      for (let px = -6; px <= W + 6; px += 5) x.lineTo(px, H * (0.16 + i * 0.19) + H * 0.3 * (0.5 - fbm(px / W * (1.4 + i * 0.8) + k * 13.7 + i * 31)));
      x.lineTo(W, H); x.closePath(); x.fill();
    });
  });
}

let io: IntersectionObserver | null = null;

/** Elements below the fold fade up as they scroll into view. */
export function initReveals() {
  if (io) io.disconnect();
  const r = root(); if (!r) return;
  const els = Array.from(r.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (S.reduced || !('IntersectionObserver' in window)) return;
  const vh = window.innerHeight;
  const obs = io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target as HTMLElement; obs.unobserve(el); el.style.opacity = '';
    const delay = Number(el.getAttribute('data-delay') || 0);
    el.animate([{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay, easing: ease, fill: 'backwards' });
    (el.hasAttribute('data-pop') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('[data-pop]'))).forEach((p) => p.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 900, delay: delay + 200, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
    if (el.hasAttribute('data-dial')) animDial();
  }), { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => { if (el.getBoundingClientRect().top > vh * 0.92) { el.style.opacity = '0'; obs.observe(el); } else if (el.hasAttribute('data-dial')) animDial(); });
}

/** The header gets its blurred background once the page scrolls, or while the menu is open. */
export function paintNav() {
  const n = document.querySelector<HTMLElement>('[data-nav]'); if (!n) return;
  const s = window.scrollY > 24 || S.menu;
  n.style.backgroundColor = s ? 'rgba(13,26,23,.82)' : 'transparent';
  n.style.backdropFilter = s ? 'blur(14px)' : 'none';
  n.style.borderBottomColor = s ? 'rgba(238,241,232,.1)' : 'transparent';
}

/** History timeline: the line fills and the fly travels down it as you scroll. */
export function paintSpine() {
  const s = document.querySelector<HTMLElement>('[data-spine]'); if (!s) return;
  const r = s.getBoundingClientRect(), mark = window.innerHeight * 0.62;
  const p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
  const fill = s.querySelector<HTMLElement>('[data-spine-fill]'), fly = s.querySelector<HTMLElement>('[data-spine-fly]');
  if (fill) fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
  if (fly) fly.style.top = (p * 100).toFixed(3) + '%';
  s.querySelectorAll<HTMLElement>('[data-entry]').forEach((el) => { el.style.opacity = el.getBoundingClientRect().top < mark + 24 ? '1' : '.38'; });
}

let dial: { open: SVGElement; closed: SVGElement; hand: SVGGElement; deg: number; done?: boolean } | null = null;

/** Activities: the year as a dial, open season in lime, closed in red, a hand on today. */
export function buildDial() {
  const box = document.querySelector<HTMLElement>('[data-dial-box]'); if (!box || box.firstChild) return;
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%'); svg.style.display = 'block'; svg.style.overflow = 'visible';
  const mk = <K extends keyof SVGElementTagNameMap>(t: K, a: Record<string, string | number>, parent?: Element) => { const e = document.createElementNS(NS, t); Object.keys(a).forEach((k) => e.setAttribute(k, String(a[k]))); (parent || svg).appendChild(e); return e; };
  const now = new Date(), y = now.getFullYear(), y0 = new Date(y, 0, 1).getTime(), span = new Date(y + 1, 0, 1).getTime() - y0;
  const ang = (m: number, d: number) => (new Date(y, m, d).getTime() - y0) / span * 360;
  const pt = (a: number, r: number) => [200 + r * Math.sin(a * Math.PI / 180), 200 - r * Math.cos(a * Math.PI / 180)];
  const arc = (a0: number, a1: number, r: number) => { const p0 = pt(a0, r), p1 = pt(a1, r); return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2); };
  const R = 158, SW = 20, gap = 1.4, aOpen = ang(1, 1), aClose = ang(9, 1);
  mk('circle', { cx: 200, cy: 200, r: R, fill: 'none', stroke: 'rgba(238,241,232,.08)', 'stroke-width': SW });
  const open = mk('path', { d: arc(aOpen + gap, aClose - gap, R), fill: 'none', stroke: '#d2f25c', 'stroke-width': SW, pathLength: 1, 'stroke-dasharray': '1 2' });
  const closed = mk('path', { d: arc(aClose + gap, aOpen + 360 - gap, R), fill: 'none', stroke: '#e2493b', 'stroke-width': SW, pathLength: 1, 'stroke-dasharray': '1 2' });
  const RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  for (let m = 0; m < 12; m++) {
    const a = ang(m, 1), b = m === 11 ? 360 : ang(m + 1, 1), t0 = pt(a, R + 16), t1 = pt(a, R + 26), lp = pt((a + b) / 2, R - 38);
    mk('line', { x1: t0[0], y1: t0[1], x2: t1[0], y2: t1[1], stroke: 'rgba(238,241,232,.3)', 'stroke-width': 1 });
    mk('text', { x: lp[0], y: lp[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#a9b8ae', 'font-family': 'Martian Mono, monospace', 'font-size': 11 }).textContent = RN[m];
  }
  const deg = (now.getTime() - y0) / span * 360, hand = mk('g', {});
  hand.style.transformOrigin = '200px 200px'; hand.style.transform = 'rotate(' + deg + 'deg)';
  mk('line', { x1: 200, y1: 108, x2: 200, y2: 200 - R - 30, stroke: '#eef1e8', 'stroke-width': 1.5 }, hand);
  mk('circle', { cx: 200, cy: 200 - R - 30, r: 6, fill: '#e2493b', stroke: '#0d1a17', 'stroke-width': 3 }, hand);
  box.appendChild(svg);
  dial = { open, closed, hand, deg };
}

export function animDial() {
  const D = dial; if (!D || S.reduced || D.done) return; D.done = true;
  const e = 'cubic-bezier(.6,0,.2,1)';
  D.open.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], { duration: 1300, delay: 150, easing: e, fill: 'backwards' });
  D.closed.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], { duration: 800, delay: 1300, easing: e, fill: 'backwards' });
  D.hand.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + D.deg + 'deg)' }], { duration: 2000, delay: 250, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
}

/** The full-screen menu wipes down and its links rise in. */
export function animMenu() {
  if (S.reduced) return;
  requestAnimationFrame(() => {
    const m = document.querySelector<HTMLElement>('[data-menu]'); if (!m) return;
    m.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 600, easing: 'cubic-bezier(.7,0,.2,1)' });
    m.querySelectorAll<HTMLElement>('[data-mi]').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 200 + i * 70, easing: ease, fill: 'backwards' }));
  });
}

/** The fields of a newly picked contact topic slide in. */
export function animFields() {
  if (S.reduced) return;
  requestAnimationFrame(() => {
    const f = document.querySelector('form[data-contact]'); if (!f) return;
    Array.from(f.querySelectorAll<HTMLElement>('[data-tf]')).filter((el) => !el.hidden)
      .forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: i * 60, easing: ease, fill: 'backwards' }));
  });
}

/** "Message sent": the fly drops onto the water and rings spread. */
export function animSent() {
  requestAnimationFrame(() => {
    const s = document.querySelector<HTMLElement>('[data-sent]'); if (!s) return;
    const top = s.getBoundingClientRect().top;
    if (top < 80 || top > window.innerHeight * 0.7) window.scrollTo({ top: window.scrollY + top - 140, behavior: 'smooth' });
    if (S.reduced) return;
    s.querySelectorAll<HTMLElement>('[data-dot]').forEach((el) => el.animate([{ transform: 'translateY(-120px) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'backwards' }));
    s.querySelectorAll<HTMLElement>('[data-ring]').forEach((el, i) => el.animate([{ transform: 'scale(.15)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 1800, delay: 480 + i * 300, easing: 'cubic-bezier(.2,.7,.3,1)', iterations: 2, fill: 'both' }));
    s.querySelectorAll<HTMLElement>('[data-sx]').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 450 + i * 90, easing: ease, fill: 'backwards' }));
  });
}
