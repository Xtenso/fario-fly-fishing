# Fario — fly fishing club, Smolyan

Website of Fario, a fly fishing club from Smolyan in the Central Rhodopes. Built with [Astro](https://astro.build) from the Claude Design file `Fario Website.dc.html` and published on GitHub Pages.

The design, animations and interactions match the design file. The differences are structural:

- Every page has its own URL, in English and Bulgarian: `/history/` and `/bg/history/`.
- Pages are pre-rendered HTML, with per-page titles, descriptions, `hreflang` links and a sitemap.
- Fonts and the map are separate, cached files instead of one 3 MB document.

## Commands

| Command | |
| --- | --- |
| `npm install` | Install dependencies (Node 22.12 or newer). |
| `npm run dev` | Dev server at http://localhost:4321 with live reload. |
| `npm run build` | Build the site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run check` | Type-check the project. |

## Where things are

| Path | What |
| --- | --- |
| `src/views/` | The five pages: Home, History, Activities, Achievements, Contact. English and Bulgarian copy sit side by side: `t('History', 'История')`. |
| `src/pages/` | Routes. English at the root, Bulgarian under `bg/`. Each one renders a view. |
| `src/data/` | Timeline, results, team and activities. Add an entry to add a row. |
| `src/components/` | Header, menu, footer, page transition overlay, photo slot. |
| `src/scripts/` | Browser code: hero and fly line, page transition, reveals, timeline, season dial, contact form, language switch. |
| `src/lib/` | Routes, page titles and descriptions, the trout season. |
| `src/config.ts` | Options: fly line on or off, page transition style (`'fly line'` or `'fade'`), email and social links. |
| `src/pages/map.astro` | The Rhodope waters map (Leaflet), embedded on the home page. |

## Adding photos

Each photo slot has an id, such as `fario-history-trout` or `fario-team-bachochev`. Save the photo as `src/assets/photos/<id>.jpg` (or `.png`, `.webp` or `.avif`) and rebuild. The slot shows the photo, resized and compressed, and cropped to fill the frame. Until then it shows the design's placeholder.

## Contact form

GitHub Pages can't process forms. Until a form service is connected, the form validates and shows its thank-you message but sends nothing, which is what the design file does.

To connect one:

1. Create a form at a service such as [Formspree](https://formspree.io).
2. Copy its endpoint URL, e.g. `https://formspree.io/f/abcdwxyz`.
3. Add a repository variable named `PUBLIC_FORM_ENDPOINT` with that URL (Settings → Secrets and variables → Actions → Variables). For local builds, put it in `.env` instead (see `.env.example`).

Submissions include the topic, the language and every field of the chosen topic.

## Deployment

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. The first time, set Settings → Pages → Source to **GitHub Actions**.

The workflow asks GitHub for the site's address, so links, canonical URLs and the sitemap are right both at `https://<user>.github.io/fario-fly-fishing/` and on a custom domain (Settings → Pages → Custom domain), with no code changes.
