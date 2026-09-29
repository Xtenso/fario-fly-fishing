// The trout season (open 1 February – 30 September), as computed by the design.
// Rendered at build time and refreshed in the browser, since it depends on today's date.

import type { Lang, Topic } from './i18n';

export interface Season {
  open: boolean;
  /** Days until the season closes (when open) or opens (when closed). */
  days: number;
}

export function season(d = new Date()): Season {
  const y = d.getFullYear(), m = d.getMonth(), today = new Date(y, m, d.getDate());
  const open = m >= 1 && m <= 8;
  const target = open ? new Date(y, 9, 1) : new Date(m >= 9 ? y + 1 : y, 1, 1);
  return { open, days: Math.round((target.getTime() - today.getTime()) / 864e5) };
}

export const seasonDot = (s: Season) => (s.open ? '#d2f25c' : '#e2493b');

export function seasonText(lang: Lang, s: Season): string {
  const d = s.days;
  return lang === 'en'
    ? (s.open ? 'Season open · closes in ' + d + (d === 1 ? ' day' : ' days') : 'Closed season · opens in ' + d + (d === 1 ? ' day' : ' days'))
    : (s.open ? 'Сезонът е открит · затваря след ' + d + (d === 1 ? ' ден' : ' дни') : 'Сезонът е закрит · открива се след ' + d + (d === 1 ? ' ден' : ' дни'));
}

export function daysLabel(lang: Lang, s: Season): string {
  const d = s.days;
  return lang === 'en'
    ? (s.open ? (d === 1 ? 'day left in the season' : 'days left in the season') : (d === 1 ? 'day until the season opens' : 'days until the season opens'))
    : (s.open ? (d === 1 ? 'ден до края на сезона' : 'дни до края на сезона') : (d === 1 ? 'ден до откриването на сезона' : 'дни до откриването на сезона'));
}

const MEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MBG = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

export function todayText(lang: Lang, now = new Date()): string {
  return now.getDate() + ' ' + (lang === 'en' ? MEN : MBG)[now.getMonth()] + ' ' + now.getFullYear() + (lang === 'en' ? '' : ' г.');
}

/** Label of the contact form's message field, which depends on the topic. */
export function messageLabel(lang: Lang, topic: Topic): string {
  return lang === 'en'
    ? (topic === 'membership' ? 'Tell us about your fishing (optional)' : topic === 'competition' ? 'Notes (optional)' : 'Message')
    : (topic === 'membership' ? 'Разкажете ни за вашия риболов (по желание)' : topic === 'competition' ? 'Бележки (по желание)' : 'Съобщение');
}
