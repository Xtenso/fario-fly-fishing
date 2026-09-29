import type { APIRoute } from 'astro';
import { INDEXABLE } from '../config';

// Crawling stays allowed even while the site is hidden: search engines have to
// fetch a page to see its noindex tag (a blocked page can still get indexed from links).
export const GET: APIRoute = ({ site }) => {
  const sitemap = INDEXABLE && site ? `Sitemap: ${new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'sitemap-index.xml', site).href}\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
