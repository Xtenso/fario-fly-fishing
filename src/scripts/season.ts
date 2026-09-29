// Fills in the season indicators with today's values (the build renders the build date's).
import { daysLabel, season, seasonDot, seasonText, todayText } from '../lib/season';
import { S } from './state';

export function renderSeason() {
  const s = season(), dot = seasonDot(s), text = seasonText(S.lang, s);
  document.querySelectorAll<HTMLElement>('[data-season-dot]').forEach((el) => { el.style.background = dot; });
  document.querySelectorAll<HTMLElement>('[data-season-text]').forEach((el) => { el.textContent = text; });
  document.querySelectorAll<HTMLElement>('[data-season-days]').forEach((el) => { el.textContent = String(s.days); el.style.color = dot; });
  document.querySelectorAll<HTMLElement>('[data-days-label]').forEach((el) => { el.textContent = daysLabel(S.lang, s); });
  document.querySelectorAll<HTMLElement>('[data-today]').forEach((el) => { el.textContent = todayText(S.lang); });
}
