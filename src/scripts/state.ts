// Page state shared by the client scripts. It lives as long as the tab: page
// navigations swap the DOM but keep this module, as the design's single component did.
import type { Lang, LayoutPage, Topic } from '../lib/i18n';

export const S = {
  lang: 'en' as Lang,
  page: 'home' as LayoutPage,
  /** Contact topic; kept when leaving the contact page, like the design. */
  topic: 'membership' as Topic,
  exp: 'new',
  interests: {} as Record<string, boolean>,
  errors: {} as Record<string, 1>,
  sent: false,
  sentName: '',
  sentEmail: '',
  menu: false,
  narrow: false,
  /** A page transition is running. */
  busy: false,
  reduced: false,
  /** Precise pointer (mouse): enables the hero fly line. */
  fine: false,
};
