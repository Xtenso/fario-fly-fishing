// Page transition, ported from the design's go(): a lime fly line sweeps across
// the screen and thickens until it covers it, a dark line follows, the page
// number and name appear, the new page is swapped in underneath, and the lines
// shrink back. cover() plays the first half and resolves once the screen is
// covered; reveal() plays the second half.
import { PAGE_TRANSITION } from '../config';

type State = 'idle' | 'covering' | 'covered' | 'revealing';

let state: State = 'idle';
let covered: Promise<void> = Promise.resolve();
let revealed: Promise<void> = Promise.resolve();
let big = 0;

const els = () => {
  const ov = document.querySelector<HTMLElement>('[data-ov]');
  return {
    ov,
    box: ov?.querySelector<HTMLElement>('[data-ov-box]') ?? null,
    tx: ov?.querySelector<HTMLElement>('[data-ov-text]') ?? null,
    num: ov?.querySelector<HTMLElement>('[data-ov-num]') ?? null,
    label: ov?.querySelector<HTMLElement>('[data-ov-label]') ?? null,
    svg: ov?.querySelector<SVGSVGElement>('svg') ?? null,
    A: ov?.querySelector<SVGPathElement>('path[data-a]') ?? null,
    B: ov?.querySelector<SVGPathElement>('path[data-b]') ?? null,
  };
};

const opts = (duration: number, delay: number, easing?: string): KeyframeAnimationOptions => ({ duration, delay, easing: easing || 'cubic-bezier(.7,0,.25,1)', fill: 'both' });
const draw = 'cubic-bezier(.3,0,.2,1)';

/** Creates the two SVG lines (once; the overlay element persists across pages). */
export function buildOverlay() {
  const { box, svg } = els(); if (!box || svg) return;
  const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
  s.setAttribute('preserveAspectRatio', 'none');
  s.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible';
  const mk = (c: string, key: string) => { const p = document.createElementNS(NS, 'path'); p.setAttribute(key, ''); [['fill', 'none'], ['stroke', c], ['stroke-width', '3'], ['stroke-linecap', 'round'], ['pathLength', '1'], ['stroke-dasharray', '1 2'], ['stroke-dashoffset', '1']].forEach((kv) => p.setAttribute(kv[0], kv[1])); s.appendChild(p); return p; };
  mk('#d2f25c', 'data-a'); mk('#0d1a17', 'data-b'); box.appendChild(s);
}

export const isCovered = () => state === 'covered';

function setLabel(info: [string, string] | null) {
  const { num, label } = els();
  if (num) num.textContent = info ? info[0] : '';
  if (label) label.textContent = info ? info[1] : '';
}

function hide(ov: HTMLElement) { ov.style.visibility = 'hidden'; ov.style.pointerEvents = 'none'; }

/**
 * Covers the screen, labelled with the target page. When a transition is
 * already under way it relabels that one, or waits for it to finish first.
 */
export function cover(info: [string, string] | null): Promise<void> {
  if (state === 'covering' || state === 'covered') { setLabel(info); return covered; }
  if (state === 'revealing') return (covered = revealed.then(() => cover(info)));
  const { ov, svg, A, B, tx } = els();
  if (!ov || !svg || !A || !B || !tx || !A.animate) return Promise.resolve();
  state = 'covering';
  ov.style.visibility = 'visible'; ov.style.pointerEvents = 'auto';
  setLabel(info);
  if (PAGE_TRANSITION === 'fade') {
    ov.style.background = '#0d1a17';
    return (covered = new Promise((res) => { ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-in', fill: 'both' }).onfinish = () => { state = 'covered'; res(); }; }));
  }
  const W = window.innerWidth, H = window.innerHeight;
  big = Math.hypot(W, H) * 1.5;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const d = 'M' + (-0.12 * W) + ' ' + (1.1 * H) + ' C' + (0.18 * W) + ' ' + (0.28 * H) + ' ' + (0.42 * W) + ' ' + (1.04 * H) + ' ' + (0.6 * W) + ' ' + (0.52 * H) + ' S' + (0.9 * W) + ' ' + (-0.12 * H) + ' ' + (1.14 * W) + ' ' + (-0.08 * H);
  A.setAttribute('d', d); B.setAttribute('d', d);
  A.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], opts(380, 0, draw));
  A.animate([{ strokeWidth: '3px' }, { strokeWidth: big + 'px' }], opts(480, 160));
  B.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], opts(380, 80, draw));
  tx.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], opts(420, 560, 'cubic-bezier(.16,.84,.24,1)'));
  return (covered = new Promise((res) => {
    B.animate([{ strokeWidth: '3px' }, { strokeWidth: big * 1.02 + 'px' }], opts(520, 260)).onfinish = () => { state = 'covered'; res(); };
  }));
}

/** Uncovers the (new) page. Resolves when the overlay is hidden again. */
export function reveal(): Promise<void> {
  if (state !== 'covered') return state === 'revealing' ? revealed : Promise.resolve();
  const { ov, A, B, tx } = els();
  state = 'revealing';
  return (revealed = new Promise((res) => {
    const done = () => { state = 'idle'; res(); };
    if (!ov || !A || !B || !tx) { if (ov) hide(ov); done(); return; }
    if (PAGE_TRANSITION === 'fade') {
      setTimeout(() => {
        ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, easing: 'ease-out', fill: 'both' }).onfinish = () => { ov.getAnimations().forEach((a) => a.cancel()); ov.style.background = ''; hide(ov); done(); };
      }, 80);
      return;
    }
    setTimeout(() => {
      tx.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-30px)' }], opts(320, 0));
      B.animate([{ strokeWidth: big * 1.02 + 'px' }, { strokeWidth: '0px' }], opts(560, 60));
      A.animate([{ strokeWidth: big + 'px' }, { strokeWidth: '3px' }], opts(620, 150));
      A.animate([{ strokeDashoffset: '0' }, { strokeDashoffset: '-1' }], opts(420, 560, 'cubic-bezier(.5,0,.7,1)')).onfinish = () => {
        [A, B, tx].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
        hide(ov); done();
      };
    }, 160);
  }));
}

/** A navigation was cancelled while the screen was covered: uncover the current page. */
export function release() {
  if (state === 'covering') covered.then(() => reveal());
  else if (state === 'covered') reveal();
}
