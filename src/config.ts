// Site options. FLY_LINE and PAGE_TRANSITION are the component props of the Claude Design file.
// astro.config.mjs imports this file too (for INDEXABLE), outside Vite.

/**
 * Whether search engines may index the site. While false, every page has
 * <meta name="robots" content="noindex, nofollow"> and no sitemap is built.
 * Set to true when the site is ready to launch.
 */
export const INDEXABLE = false;

/** The hero's fly line that follows a mouse pointer (and the "Move to cast" hint). */
export const FLY_LINE = true;

/** Page transition: the fly line sweeping across the screen, or a plain fade. */
export const PAGE_TRANSITION: 'fly line' | 'fade' = 'fly line';

/**
 * Where the contact form is sent: a form service endpoint such as
 * https://formspree.io/f/xxxxxxxx, set as PUBLIC_FORM_ENDPOINT in .env or in the
 * deploy workflow. Left empty, the form validates and shows its thank-you
 * message but sends nothing — exactly what the design file does.
 */
export const FORM_ENDPOINT: string = import.meta.env?.PUBLIC_FORM_ENDPOINT ?? '';

/** Shown in the contact page and footer. */
export const EMAIL = 'hello@fario-smolyan.bg';
export const FACEBOOK_URL = 'https://facebook.com';
export const INSTAGRAM_URL = 'https://instagram.com';
