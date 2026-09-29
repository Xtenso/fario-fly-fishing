// Contact form, ported from the design's component: topics, per-topic fields,
// experience and interest chips, validation, and the "Message sent" state.
import { FORM_ENDPOINT } from '../config';
import { isTopic, pageMeta, path, type Topic } from '../lib/i18n';
import { messageLabel } from '../lib/season';
import { animFields, animSent } from './motion';
import { S } from './state';

const form = () => document.querySelector<HTMLFormElement>('form[data-contact]');

// Selected / unselected colours of the topic buttons and chips (the design's on()).
function paint(el: HTMLElement, active: boolean) {
  el.style.borderColor = active ? '#d2f25c' : 'rgba(238,241,232,.22)';
  el.style.background = active ? '#d2f25c' : 'transparent';
  el.style.color = active ? '#0d1a17' : '#eef1e8';
  el.setAttribute('aria-pressed', String(active));
}

function setHidden(f: HTMLFormElement, name: string, value: string) {
  const i = f.elements.namedItem(name);
  if (i instanceof HTMLInputElement) i.value = value;
}

/** Brings the form in line with the state, like the design's re-render. */
export function renderContact() {
  const f = form(); if (!f) return;
  document.querySelectorAll<HTMLElement>('[data-topic-pick]').forEach((b) => paint(b, b.dataset.topicPick === S.topic));
  // Fields of the other topics are removed (hidden, emptied and not sent), as in the design.
  f.querySelectorAll<HTMLElement>('[data-topic]').forEach((g) => {
    const show = g.dataset.topic === S.topic;
    if (g.hidden === show) {
      g.hidden = !show;
      g.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((i) => { if (!show && i.type !== 'hidden') i.value = ''; i.disabled = !show; });
    }
  });
  f.querySelectorAll<HTMLElement>('[data-exp]').forEach((b) => paint(b, b.dataset.exp === S.exp));
  f.querySelectorAll<HTMLElement>('[data-interest]').forEach((b) => paint(b, !!S.interests[b.dataset.interest!]));
  setHidden(f, 'topic', S.topic);
  setHidden(f, 'language', S.lang);
  setHidden(f, 'experience', S.exp);
  setHidden(f, 'interests', Object.keys(S.interests).filter((k) => S.interests[k]).join(', '));
  f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-checked]').forEach((i) => {
    const bad = !!S.errors[i.name];
    i.style.borderBottomColor = bad ? '#ff8a78' : 'rgba(238,241,232,.3)';
    if (bad) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
  });
  f.querySelectorAll<HTMLElement>('[data-error-for]').forEach((m) => { m.hidden = !S.errors[m.dataset.errorFor!]; });
  const label = f.querySelector('[data-message-label]');
  if (label) label.textContent = messageLabel(S.lang, S.topic);
  const sent = document.querySelector<HTMLElement>('[data-sent]');
  f.hidden = S.sent;
  if (sent) {
    sent.hidden = !S.sent;
    sent.querySelectorAll('[data-sent-name]').forEach((el) => { el.textContent = S.sentName; });
    sent.querySelectorAll('[data-sent-email]').forEach((el) => { el.textContent = S.sentEmail; });
  }
}

/** Entering the contact page: a topic in the URL wins, otherwise the last one picked stays. */
export function initContact(urlTopic: Topic | null) {
  const prev = S.topic;
  if (urlTopic) S.topic = urlTopic;
  S.sent = false; S.errors = {};
  hideSendError();
  renderContact();
  if (S.topic !== prev) animFields();
}

export function pickTopic(t: Topic) {
  if (t !== S.topic) { S.topic = t; S.errors = {}; renderContact(); animFields(); }
  try {
    history.replaceState(history.state, '', path(S.lang, 'contact', t));
    document.title = pageMeta('contact', S.lang, t).title;
  } catch { /* ignore */ }
}

function hideSendError() { document.querySelectorAll<HTMLElement>('[data-send-error]').forEach((e) => { e.hidden = true; }); }

let sending = false;

async function submit(e: SubmitEvent) {
  const f = e.target;
  if (!(f instanceof HTMLFormElement) || !f.matches('form[data-contact]')) return;
  e.preventDefault();
  if (sending) return;
  const fd = new FormData(f), v = (k: string) => String(fd.get(k) || '').trim(), t = S.topic, errors: Record<string, 1> = {};
  if (!v('name')) errors.name = 1;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) errors.email = 1;
  if (t === 'sponsorship' && !v('org')) errors.org = 1;
  if (t === 'competition' && !v('event')) errors.event = 1;
  if ((t === 'sponsorship' || t === 'general') && !v('message')) errors.message = 1;
  const keys = Object.keys(errors);
  if (keys.length) {
    S.errors = errors; renderContact();
    const first = f.querySelector<HTMLElement>('[name="' + keys[0] + '"]');
    if (first) { first.focus(); if (!S.reduced) first.animate([{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { duration: 420, easing: 'ease-out' }); }
    return;
  }
  hideSendError();
  if (FORM_ENDPOINT) {
    sending = true;
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch {
      document.querySelectorAll<HTMLElement>('[data-send-error]').forEach((el) => { el.hidden = false; });
      return;
    } finally {
      sending = false;
    }
  }
  S.sent = true; S.errors = {}; S.sentName = v('name').split(/\s+/)[0]; S.sentEmail = v('email');
  renderContact();
  animSent();
}

/** Delegated listeners, attached once for the whole visit. */
export function listenContact() {
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const el = e.target.closest<HTMLElement>('[data-topic-pick], [data-exp], [data-interest], [data-again]');
    if (!el) return;
    if (el.dataset.topicPick && isTopic(el.dataset.topicPick)) pickTopic(el.dataset.topicPick);
    else if (el.dataset.exp) { S.exp = el.dataset.exp; renderContact(); }
    else if (el.dataset.interest) { S.interests = { ...S.interests, [el.dataset.interest]: !S.interests[el.dataset.interest] }; renderContact(); }
    else if (el.hasAttribute('data-again')) { S.sent = false; S.errors = {}; form()?.reset(); renderContact(); }
  });
  // Capture phase, so the page router never treats the form as a navigation.
  document.addEventListener('submit', (e) => { void submit(e as SubmitEvent); }, true);
  document.addEventListener('input', (e) => {
    const i = e.target;
    if (!(i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement) || !i.name || !S.errors[i.name] || !i.closest('form[data-contact]')) return;
    const errors = { ...S.errors }; delete errors[i.name]; S.errors = errors; renderContact();
  });
}
