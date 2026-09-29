// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { INDEXABLE } from './src/config.ts';

// The GitHub Pages workflow passes the site origin and base path it gets from
// actions/configure-pages, e.g. SITE=https://user.github.io BASE=/fario-fly-fishing.
// With a custom domain BASE is empty. Locally both are unset.
const site = process.env.SITE || undefined;
const base = process.env.BASE || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // HTML-aware whitespace collapsing, so inline text renders exactly as in the design.
  compressHTML: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'bg'],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  vite: {
    // Keep every font subset a separate file, fetched only when a page needs it
    // (Vite would otherwise inline the small ones into the CSS as base64).
    build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) },
  },
  // No sitemap while the site is hidden from search engines (INDEXABLE in src/config.ts).
  integrations: INDEXABLE ? [
    sitemap({
      // The map is an embed, and the per-topic contact pages share /contact/'s canonical URL.
      filter: (page) => !page.includes('/map/') && !/\/contact\/[a-z]+\/$/.test(page),
      i18n: { defaultLocale: 'en', locales: { en: 'en', bg: 'bg' } },
    }),
  ] : [],
});
