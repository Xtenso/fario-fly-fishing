import type { L10n, Topic } from '../lib/i18n';

export interface Activity {
  tag: L10n;
  /** The closed-season tag is drawn in red. */
  tagTone?: 'red';
  title: L10n;
  text: L10n;
  link: { topic: Topic; label: L10n };
  /** Photo slot id: a photo saved as src/assets/photos/<slot>.jpg is used automatically. */
  slot: string;
  placeholder: string;
  alt: L10n;
}

/** The activity articles on the Activities page; the layout alternates text and photo sides. */
export const activities: Activity[] = [
  {
    tag: { en: 'BFRS · FIPS-ed', bg: 'BFRS · FIPS-ed' },
    title: { en: 'Competitions', bg: 'Състезания' },
    text: {
      en: 'We fish the BFRS national championship in teams of two, under FIPS-ed rules. Every fish is measured and released.',
      bg: 'Участваме в републиканския шампионат на БФРС в отбори от двама, по правилата на FIPS-ed. Всяка риба се измерва и пуска обратно.',
    },
    link: { topic: 'competition', label: { en: 'Register for a competition →', bg: 'Запиши се за състезание →' } },
    slot: 'fario-act-competitions',
    placeholder: 'Photo: competition day on the Vacha',
    alt: { en: 'Competition day on the Vacha', bg: 'Състезателен ден на р. Въча' },
  },
  {
    tag: { en: 'Oct – Jan', bg: 'Окт – яну' },
    tagTone: 'red',
    title: { en: 'Fly-tying workshops', bg: 'Връзване на мухи' },
    text: {
      en: 'Winter evenings at the vise while the trout spawn, tying the patterns for next season. Beginners are welcome.',
      bg: 'Зимни вечери на менгемето, докато пъстървата хвърля хайвер — връзваме мухите за новия сезон. Начинаещите са добре дошли.',
    },
    link: { topic: 'general', label: { en: 'Ask about workshops →', bg: 'Попитай за работилниците →' } },
    slot: 'fario-act-flytying',
    placeholder: 'Photo: flies at the vise',
    alt: { en: 'Flies at the vise', bg: 'Мухи на менгемето' },
  },
  {
    tag: { en: 'Year-round', bg: 'Целогодишно' },
    title: { en: 'Stocking & conservation', bg: 'Зарибяване и опазване' },
    text: {
      en: 'Stocking native brown trout and looking after the rivers we fish, including keeping the closed season.',
      bg: 'Зарибяване с местна балканска пъстърва и грижа за реките, по които ловим, включително спазване на забранения период.',
    },
    link: { topic: 'sponsorship', label: { en: 'Support our rivers →', bg: 'Подкрепи реките →' } },
    slot: 'fario-act-stocking',
    placeholder: 'Photo: stocking day on the river',
    alt: { en: 'Stocking day on the river', bg: 'Зарибяване на реката' },
  },
  {
    tag: { en: 'International', bg: 'В чужбина' },
    title: { en: 'Trips abroad', bg: 'Пътувания в чужбина' },
    text: {
      en: 'Rivers and competitions beyond Bulgaria. One of our anglers also competes in Spain’s national championship.',
      bg: 'Реки и състезания извън България. Един от нашите състезатели участва и в шампионата на Испания.',
    },
    link: { topic: 'membership', label: { en: 'Join the club →', bg: 'Присъедини се →' } },
    slot: 'fario-act-abroad',
    placeholder: 'Photo: a river abroad',
    alt: { en: 'A river abroad', bg: 'Река в чужбина' },
  },
];
