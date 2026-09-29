// Languages, routes and page metadata. Used by the pages at build time and by
// the client scripts (routing, page transition labels, language switch).

export const LANGS = ['en', 'bg'] as const;
export type Lang = (typeof LANGS)[number];
/** Served without a prefix: /history/ is English, /bg/history/ is Bulgarian. */
export const DEFAULT_LANG: Lang = 'en';

export const PAGES = ['home', 'history', 'activities', 'achievements', 'contact'] as const;
export type Page = (typeof PAGES)[number];

export const TOPICS = ['membership', 'competition', 'sponsorship', 'general'] as const;
export type Topic = (typeof TOPICS)[number];

/** Pages outside the main navigation that still use the site layout. */
export type LayoutPage = Page | 'notfound';

/** Deployment base path with a trailing slash: "/" or e.g. "/fario-fly-fishing/". */
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
export const isPage = (v: unknown): v is Page => PAGES.includes(v as Page);
export const isTopic = (v: unknown): v is Topic => TOPICS.includes(v as Topic);

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'bg' : 'en');

/** A piece of copy in both languages. */
export type L10n = Record<Lang, string>;

/** Picks the string for a language — the design's paired en/bg copy. */
export const pick = (lang: Lang) => (en: string, bg: string) => (lang === 'en' ? en : bg);

/** URL path of a page, e.g. path('bg', 'contact', 'sponsorship') → /bg/contact/sponsorship/. */
export function path(lang: Lang, page: LayoutPage, topic?: Topic | null): string {
  let p = BASE + (lang === DEFAULT_LANG ? '' : lang + '/');
  if (page !== 'home' && page !== 'notfound') p += page + '/';
  if (page === 'contact' && topic) p += topic + '/';
  return p;
}

export interface Route {
  lang: Lang;
  page: Page;
  topic: Topic | null;
}

/** The route of a URL path, or null when it isn't one of the site's pages. */
export function parsePath(pathname: string): Route | null {
  const base = BASE.replace(/\/$/, '');
  if (!pathname.startsWith(base + '/')) return null;
  const parts = pathname.slice(base.length).split('/').filter(Boolean);
  let lang: Lang = DEFAULT_LANG;
  if (parts[0] !== DEFAULT_LANG && isLang(parts[0])) lang = parts.shift() as Lang;
  const page = parts.length ? parts[0] : 'home';
  if (!isPage(page) || parts.length > (page === 'contact' ? 2 : 1)) return null;
  const topic = page === 'contact' && isTopic(parts[1]) ? parts[1] : null;
  if (page === 'contact' && parts[1] !== undefined && !topic) return null;
  return { lang, page, topic };
}

/** Number and name shown by the page transition, as in the design's pageInfo(). */
export function pageInfo(page: Page, lang: Lang): [string, string] {
  const t = pick(lang);
  return ({
    home: ['', t('Fario', 'Фарио')],
    history: ['01', t('History', 'История')],
    activities: ['02', t('Activities', 'Дейности')],
    achievements: ['03', t('Achievements', 'Постижения')],
    contact: ['04', t('Contact', 'Контакт')],
  } as const)[page] as [string, string];
}

export function topicName(topic: Topic, lang: Lang): string {
  const t = pick(lang);
  return {
    membership: t('Membership', 'Членство'),
    competition: t('Competition registration', 'Записване за състезание'),
    sponsorship: t('Sponsorship & partners', 'Спонсорство и партньорство'),
    general: t('General inquiry', 'Общо запитване'),
  }[topic];
}

/** <title> and meta description of each page, taken from the pages' own copy. */
export function pageMeta(page: LayoutPage, lang: Lang, topic?: Topic | null): { title: string; description: string } {
  const t = pick(lang);
  const site = t('Fario', 'Фарио');
  switch (page) {
    case 'home':
      return {
        title: t('Fario — Fly fishing club · Smolyan, Bulgaria', 'Фарио — Клуб по риболов на муха · Смолян'),
        description: t(
          'A fly fishing club from Smolyan. We fish the mountain rivers of the Central Rhodopes and compete for the club in the national championship.',
          'Клуб по риболов на муха от Смолян. Ловим по планинските реки на Средните Родопи и се състезаваме за клуба в републиканския шампионат.',
        ),
      };
    case 'history':
      return {
        title: `${t('History', 'История')} — ${site}`,
        description: t(
          'A fly fishing club from Smolyan, in the Central Rhodopes. Registered in 2020, national team champions in 2023.',
          'Клуб по риболов на муха от Смолян, в Средните Родопи. Регистриран през 2020 г., отборен шампион на България през 2023 г.',
        ),
      };
    case 'activities':
      return {
        title: `${t('Activities', 'Дейности')} — ${site}`,
        description: t(
          'Competitions, fly tying, stocking and trips abroad. The club’s year follows the trout season.',
          'Състезания, връзване на мухи, зарибяване и пътувания в чужбина. Годината на клуба следва сезона на пъстървата.',
        ),
      };
    case 'achievements':
      return {
        title: `${t('Achievements', 'Постижения')} — ${site}`,
        description: t(
          'Ognyan Bachochev and Alexander Metodiev won the 2023 national team title over three rounds on the Vacha, in a field of 30 anglers from six clubs, and finished second and third individually.',
          'Огнян Бачочев и Александър Методиев спечелиха отборната титла за 2023 г. след три кръга на р. Въча, в конкуренция на 30 състезатели от шест клуба, и завършиха втори и трети индивидуално.',
        ),
      };
    case 'contact':
      return {
        title: topic
          ? `${topicName(topic, lang)} — ${t('Contact', 'Контакт')} — ${site}`
          : `${t('Contact', 'Контакт')} — ${site}`,
        description: t(
          'Membership, competitions, partnerships or a question about the rivers. Choose a topic and we’ll get back to you.',
          'Членство, състезания, партньорство или въпрос за реките. Изберете тема и ще ви отговорим.',
        ),
      };
    case 'notfound':
      return {
        title: `${t('Page not found', 'Страницата не е намерена')} — ${site}`,
        description: t('This page does not exist.', 'Тази страница не съществува.'),
      };
  }
}
