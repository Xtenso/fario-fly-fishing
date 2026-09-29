import type { L10n, Lang } from '../lib/i18n';

export interface Result {
  year: string;
  event: L10n;
  place: L10n;
  /** One line per placing. */
  result: Record<Lang, string[]>;
  /** Shown in lime, like the 2023 title. */
  highlight?: boolean;
}

/** "All results" on the Achievements page, newest first. */
export const results: Result[] = [
  {
    year: '2025',
    event: { en: 'National championship, round 1', bg: 'Републикански шампионат, 1-ви кръг' },
    place: { en: 'Vacha · Kurtovo Konare', bg: 'р. Въча · Куртово Конаре' },
    result: {
      en: ['3rd — team', '3rd — individual, A. Metodiev'],
      bg: ['3-то място — отборно', '3-то място — индивидуално, А. Методиев'],
    },
  },
  {
    year: '2023',
    highlight: true,
    event: { en: 'National championship, final standings', bg: 'Републикански шампионат, крайно класиране' },
    place: { en: 'Vacha · three rounds · 30 anglers, six clubs', bg: 'р. Въча · три кръга · 30 състезатели от шест клуба' },
    result: {
      en: ['1st — team, Fario 1', '2nd — O. Bachochev · 3rd — A. Metodiev'],
      bg: ['1-во място — отборно, Фарио 1', '2-ро — О. Бачочев · 3-то — А. Методиев'],
    },
  },
  {
    year: '2023',
    event: { en: 'National championship, round 1', bg: 'Републикански шампионат, 1-ви кръг' },
    place: { en: 'Vacha · 24 anglers, six clubs', bg: 'р. Въча · 24 състезатели от шест клуба' },
    result: {
      en: ['1st — team, Fario 1', '3rd — individual, O. Bachochev'],
      bg: ['1-во място — отборно, Фарио 1', '3-то място — индивидуално, О. Бачочев'],
    },
  },
  {
    year: '2019',
    event: { en: 'First competition of the revived BFRS fly section', bg: 'Първо състезание на възобновената секция на БФРС' },
    place: { en: 'Beli Vit · Ribaritsa', bg: 'р. Бели Вит · Рибарица' },
    result: {
      en: ['1st — team, of nine teams'],
      bg: ['1-во място — отборно, от девет отбора'],
    },
  },
];
