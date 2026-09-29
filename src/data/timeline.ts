import type { L10n } from '../lib/i18n';

export interface TimelineEntry {
  year: string;
  title: L10n;
  text: L10n;
  /** Shown in lime, like the championship year. */
  highlight?: boolean;
}

/** History page timeline, oldest first. */
export const timeline: TimelineEntry[] = [
  {
    year: '2019',
    title: { en: 'First competition, first title', bg: 'Първо състезание, първа титла' },
    text: {
      en: 'The BFRS revives its fly fishing section. At its first competition, on the Beli Vit near Ribaritsa, Fario wins the team event among nine teams.',
      bg: 'БФРС възобновява секцията си по риболов на муха. На първото ѝ състезание, на р. Бели Вит край Рибарица, Фарио печели отборно сред девет отбора.',
    },
  },
  {
    year: '2020',
    title: { en: 'A registered club', bg: 'Регистриран клуб' },
    text: { en: 'Fario is registered as an association in Smolyan.', bg: 'Фарио е регистриран като сдружение в Смолян.' },
  },
  {
    year: '2023',
    title: { en: 'Round one', bg: 'Първи кръг' },
    text: {
      en: 'Team Fario 1 wins the first round of the national championship on the Vacha. Ognyan Bachochev is third individually, among 24 anglers from six clubs.',
      bg: 'Отбор Фарио 1 печели първия кръг на републиканския шампионат на р. Въча. Огнян Бачочев е трети индивидуално сред 24 състезатели от шест клуба.',
    },
  },
  {
    year: '2023',
    highlight: true,
    title: { en: 'National team champions', bg: 'Отборни шампиони на България' },
    text: {
      en: 'After three rounds, Fario 1 are national team champions. Bachochev finishes second and Alexander Metodiev third individually, in a field of 30 anglers. Metodiev flew from Bilbao to Sofia three times to fish the championship.',
      bg: 'След три кръга Фарио 1 са отборни шампиони на България. Бачочев завършва втори, а Александър Методиев — трети индивидуално, в конкуренция на 30 състезатели. Методиев лети три пъти от Билбао до София, за да участва в шампионата.',
    },
  },
  {
    year: '2025',
    title: { en: 'Back on the podium', bg: 'Отново на подиума' },
    text: {
      en: 'Third in the team event at round one, on the Vacha at Kurtovo Konare. Metodiev is third individually.',
      bg: 'Трето място отборно в първия кръг, на р. Въча при Куртово Конаре. Методиев е трети индивидуално.',
    },
  },
];
