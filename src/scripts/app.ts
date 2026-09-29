// Page script: sets up each page and connects the design's page transition,
// menu and language switch to Astro's client router.
import { navigate, swapFunctions, type TransitionBeforePreparationEvent, type TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { prefetch } from 'astro:prefetch';
import { isLang, otherLang, pageInfo, parsePath, path, type Lang, type LayoutPage, type Topic } from '../lib/i18n';
import { initContact, listenContact, pickTopic, renderContact } from './contact';
import { attachHero, bindHero, frame, introWord, restartHero, sizeHero } from './hero';
import { morph } from './morph';
import { animMenu, buildDial, drawStrips, initReveals, introHero, paintNav, paintSpine } from './motion';
import * as overlay from './overlay';
import { renderSeason } from './season';
import { S } from './state';

const html = document.documentElement;
const pageLang = (): Lang => (isLang(html.lang) ? html.lang : 'en');
const pageTopic = () => parsePath(location.pathname)?.topic ?? null;
const isLangSwitch = (info: unknown) => (info as { fario?: string } | undefined)?.fario === 'lang';
const whenIdle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(() => fn()) : setTimeout(fn, 300));

/** Tells the embedded map which language to show. */
function postLang() {
  const f = document.querySelector<HTMLIFrameElement>('iframe[data-map]');
  f?.contentWindow?.postMessage({ type: 'fario-lang', lang: S.lang }, location.origin);
}

function setMenu(open: boolean) {
  if (S.menu === open) return;
  S.menu = open;
  const m = document.querySelector<HTMLElement>('[data-menu]');
  if (m) m.hidden = !open;
  document.querySelectorAll<HTMLElement>('[data-menu-label]').forEach((el) => { el.hidden = (el.dataset.menuLabel === 'open') !== open; });
  document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', String(open));
  paintNav();
  if (open) animMenu();
}

function toWaters() {
  const w = document.getElementById('waters');
  if (w) window.scrollTo({ top: w.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
}

// The weights the pages use. A language switch needs the other script's font
// subsets loaded first: the design had every font inline, so the swap never reflowed.
const FACES = ['300 1em "Sofia Sans"', '400 1em "Sofia Sans"', '500 1em "Sofia Sans"', '600 1em "Sofia Sans"',
  '700 1em "Sofia Sans Extra Condensed"', '800 1em "Sofia Sans Extra Condensed"', '900 1em "Sofia Sans Extra Condensed"',
  '400 1em "Martian Mono"', '500 1em "Martian Mono"'];
async function loadFonts(lang: Lang) {
  const sample = lang === 'bg' ? 'Жж' : 'Aa';
  try {
    await Promise.all([...FACES.map((f) => document.fonts.load(f, sample)), document.fonts.load('italic 300 1em "Sofia Sans"', 'Aa')]);
  } catch { /* a font failed to load: switch anyway */ }
}

/** Warms the cache for the other language (page and fonts), so the EN/BG switch is instant. */
function prefetchOtherLanguage() {
  const r = S.page === 'notfound' ? null : parsePath(location.pathname);
  if (!r) return;
  prefetch(path(otherLang(S.lang), r.page, r.topic));
  if (!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) void loadFonts(otherLang(S.lang));
}

/** Sets up the current page, as the design's onPage() did after every page change. */
function onPage(topic: Topic | null) {
  const p = S.page, delay = S.busy ? 380 : 100;
  renderSeason();
  attachHero();
  if (p === 'home') {
    bindHero(); sizeHero(); restartHero(S.busy ? 250 : 0); introWord(delay + 100);
    // "Move to cast" is shown for a mouse, checked once on load like the design.
    const hint = document.querySelector<HTMLElement>('[data-fly-hint]');
    if (hint) hint.hidden = !S.fine;
  }
  if (p === 'activities') buildDial();
  if (p === 'contact') initContact(topic);
  drawStrips(); introHero(delay); initReveals(); paintSpine(); paintNav();
  whenIdle(prefetchOtherLanguage);
}

// ——— Language switch ———
let langSwitch = false;
/** Scroll position kept across the switch. */
let langSwapped: { x: number; y: number } | null = null;

function switchLang(to: Lang) {
  const r = parsePath(location.pathname);
  if (to === S.lang || !r || langSwitch) return;
  langSwitch = true;
  const href = path(to, r.page, r.topic) + location.search;
  const fontsReady = Promise.race([loadFonts(to), new Promise((res) => setTimeout(res, 1500))]);
  // Replaces the history entry: the design changed language without navigating.
  void fontsReady.then(() => { if (langSwitch) return navigate(href, { history: 'replace', info: { fario: 'lang' } }); });
}

document.addEventListener('astro:before-swap', (e) => {
  const ev = e as TransitionBeforeSwapEvent;
  if (!isLangSwitch(ev.info)) return;
  langSwapped = { x: window.scrollX, y: window.scrollY }; langSwitch = false;
  ev.swap = () => {
    const doc = ev.newDocument, a = document.getElementById('root'), b = doc.getElementById('root');
    swapFunctions.deselectScripts(doc);
    swapFunctions.swapRootAttributes(doc);
    swapFunctions.swapHeadElements(doc);
    if (a && b) morph(a, b);
    else swapFunctions.swapBodyElement(doc.body, document.body);
  };
});

function afterLangSwitch(at: { x: number; y: number }) {
  window.scrollTo({ left: at.x, top: at.y, behavior: 'instant' });
  try { localStorage.setItem('fario-lang', S.lang); } catch { /* private mode */ }
  renderSeason(); renderContact(); postLang(); paintNav();
  if (S.page === 'home') introWord(0);
  whenIdle(prefetchOtherLanguage);
}

// ——— Page transitions ———
let navToken = 0;
let traverseTo: string | null = null;

document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as TransitionBeforePreparationEvent;
  if (isLangSwitch(ev.info)) return;
  // A new navigation replaces any unfinished one.
  langSwitch = false; traverseTo = null;
  let to = parsePath(ev.to.pathname);
  // Back/forward to a page last seen in the other language: stay in the chosen language, as the design did.
  if (to && to.lang !== S.lang && ev.navigationType === 'traverse') {
    ev.to = new URL(path(S.lang, to.page, to.topic) + ev.to.search, location.href);
    traverseTo = ev.to.pathname + ev.to.search;
    to = { ...to, lang: S.lang };
  }
  if (S.reduced) return;
  const token = ++navToken;
  S.busy = true;
  const covered = overlay.cover(to ? pageInfo(to.page, S.lang) : null);
  const load = ev.loader;
  // The new page is swapped in once it has loaded and the screen is covered.
  ev.loader = async () => { await Promise.all([load(), covered]); };
  ev.signal.addEventListener('abort', () => setTimeout(() => {
    if (navToken === token) { overlay.release(); S.busy = false; }
  }, 0));
});

document.addEventListener('astro:after-swap', () => {
  html.classList.remove('fario-boot');
  S.lang = pageLang();
  if (langSwapped) { const at = langSwapped; langSwapped = null; afterLangSwitch(at); return; }
  if (traverseTo) { history.replaceState(history.state, '', traverseTo); traverseTo = null; }
  // Every page opens at the top, as in the design.
  window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
  S.page = (html.dataset.page || 'notfound') as LayoutPage;
  S.menu = false;
  onPage(pageTopic());
  if (overlay.isCovered()) {
    const token = navToken;
    void overlay.reveal().then(() => { if (token === navToken) S.busy = false; });
  } else {
    S.busy = false;
  }
});

document.addEventListener('astro:page-load', () => {
  html.classList.remove('fario-boot');
  // The router adds a screen reader announcer per navigation; the language switch keeps the body, so drop old ones.
  const ann = document.querySelectorAll('.astro-route-announcer');
  for (let i = 0; i < ann.length - 1; i++) ann[i].remove();
});

// ——— Clicks ———
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  const t = e.target;
  if (t.closest('[data-menu-toggle]')) { setMenu(!S.menu); return; }
  if (t.closest('[data-to-waters]')) { toWaters(); return; }
  // As in the design, any click on the open menu closes it (links still navigate).
  if (t.closest('[data-menu]')) setMenu(false);
  const a = t.closest('a');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  const sw = a.dataset.langSwitch;
  if (sw && isLang(sw) && S.page !== 'notfound') { e.preventDefault(); switchLang(sw); return; }
  const to = parsePath(url.pathname);
  // A link to the page you are on does nothing (the design only picked the topic of a contact link).
  if (to && !url.hash && to.page === S.page && to.lang === S.lang) {
    e.preventDefault();
    if (to.page === 'contact' && to.topic) pickTopic(to.topic);
  }
}, true);

// Once the embedded map has loaded, send it the current language.
document.addEventListener('load', (e) => {
  if (e.target instanceof HTMLIFrameElement && e.target.matches('iframe[data-map]')) postLang();
}, true);

addEventListener('resize', () => {
  const narrow = window.innerWidth < 900;
  if (narrow !== S.narrow) { S.narrow = narrow; if (!narrow) setMenu(false); }
  sizeHero(); drawStrips();
});
addEventListener('scroll', () => { paintNav(); paintSpine(); }, { passive: true });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.menu) setMenu(false); });

// ——— Boot ———
S.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
S.fine = matchMedia('(pointer: fine)').matches;
S.narrow = window.innerWidth < 900;
S.lang = pageLang();
S.page = (html.dataset.page || 'notfound') as LayoutPage;
const topic = pageTopic();
if (topic) S.topic = topic;
listenContact();
overlay.buildOverlay();
try {
  onPage(topic);
} finally {
  // Show the page in the same frame as the first animation frames.
  requestAnimationFrame(() => html.classList.remove('fario-boot'));
}
const loop = (t: number) => { requestAnimationFrame(loop); frame(t); };
requestAnimationFrame(loop);
