import type { L10n } from '../lib/i18n';

export interface Member {
  /** Photo slot id: a portrait saved as src/assets/photos/<slot>.jpg is used automatically. */
  slot: string;
  placeholder: string;
  name: L10n;
  placings: { rank: L10n; text: L10n; highlight?: boolean }[];
}

/** "The team" on the Achievements page. */
export const team: Member[] = [
  {
    slot: 'fario-team-bachochev',
    placeholder: 'Portrait: Ognyan Bachochev',
    name: { en: 'Ognyan Bachochev', bg: 'Огнян Бачочев' },
    placings: [
      { rank: { en: '2nd', bg: '2-ро' }, text: { en: 'National championship 2023, individual', bg: 'Републикански шампионат 2023, индивидуално' }, highlight: true },
      { rank: { en: '3rd', bg: '3-то' }, text: { en: 'Round 1, 2023, individual', bg: '1-ви кръг 2023, индивидуално' } },
    ],
  },
  {
    slot: 'fario-team-metodiev',
    placeholder: 'Portrait: Alexander Metodiev',
    name: { en: 'Alexander Metodiev', bg: 'Александър Методиев' },
    placings: [
      { rank: { en: '3rd', bg: '3-то' }, text: { en: 'National championship 2023, individual', bg: 'Републикански шампионат 2023, индивидуално' }, highlight: true },
      { rank: { en: '3rd', bg: '3-то' }, text: { en: 'Round 1, 2025, individual', bg: '1-ви кръг 2025, индивидуално' } },
      { rank: { en: 'ES', bg: 'ES' }, text: { en: 'Also competes in Spain’s national championship', bg: 'Състезава се и в шампионата на Испания' } },
    ],
  },
];
