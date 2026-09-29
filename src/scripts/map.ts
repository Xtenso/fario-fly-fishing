// The Rhodope waters map (Leaflet), ported from the design's embedded map document.
import * as L from 'leaflet';

type Lang = 'en' | 'bg';
type Text = Record<Lang, string>;
type Kind = 'home' | 'stream' | 'champ';
interface Beat {
  id: string; n: string; lat: number; lng: number; kind: Kind;
  river: Text; place: Text; sp: ('brown' | 'rainbow')[]; tags?: 'cr'[]; note: Text;
}

const q = new URLSearchParams(location.search);
const theme = (['night', 'paper', 'skin'] as const).find((t) => t === q.get('theme')) ?? 'night';
document.body.setAttribute('data-theme', theme);
let lang: Lang = q.get('lang') === 'bg' ? 'bg' : 'en';

const T = {
  beats: { en: 'Beats', bg: 'Участъци' }, all: { en: 'Show all', bg: 'Всички' },
  hint: { en: 'Click the map to zoom with scroll', bg: 'Кликнете картата, за да мащабирате' },
  intro: { en: 'Six beats the club fishes across the Rhodopes. Select one on the map or in the list.', bg: 'Шест участъка, по които ловим в Родопите. Изберете от картата или от списъка.' },
  species: { en: 'Species', bg: 'Видове' },
  rule: { en: 'Brown trout are protected from 1 October to 31 January while they spawn.', bg: 'Балканската пъстърва е защитена от 1 октомври до 31 януари, докато хвърля хайвер.' },
  home: { en: 'Home water', bg: 'Домашна вода' }, stream: { en: 'Mountain stream', bg: 'Планински поток' }, champ: { en: 'Championship water', bg: 'Състезателна вода' },
  cr: { en: 'Catch & release', bg: 'Хвани и пусни' },
} satisfies Record<string, Text>;
const SP = { brown: { en: 'Brown trout', bg: 'Балканска пъстърва' }, rainbow: { en: 'Rainbow trout', bg: 'Дъгова пъстърва' } } satisfies Record<string, Text>;
const B: Beat[] = [
  { id: 'cherna', n: '01', lat: 41.5775, lng: 24.7011, kind: 'home', river: { en: 'Cherna reka', bg: 'Черна река' }, place: { en: 'Smolyan', bg: 'Смолян' }, sp: ['brown'], note: { en: 'The river that runs through Smolyan, the club’s home town.', bg: 'Реката, която тече през Смолян — града на клуба.' } },
  { id: 'shiroka', n: '02', lat: 41.6833, lng: 24.5833, kind: 'stream', river: { en: 'Shirokolashka reka', bg: 'Широколъшка река' }, place: { en: 'Shiroka Laka', bg: 'Широка лъка' }, sp: ['brown'], note: { en: 'Clear, fast water through the village of Shiroka Laka.', bg: 'Бистра и бърза вода през село Широка лъка.' } },
  { id: 'trigrad', n: '03', lat: 41.6167, lng: 24.3833, kind: 'stream', river: { en: 'Trigradska reka', bg: 'Триградска река' }, place: { en: 'Trigrad', bg: 'Триград' }, sp: ['brown'], note: { en: 'Cold water in the karst country around Trigrad.', bg: 'Студена вода в карстовия край около Триград.' } },
  { id: 'chepelare', n: '04', lat: 41.7333, lng: 24.6833, kind: 'stream', river: { en: 'Chepelarska reka', bg: 'Чепеларска река' }, place: { en: 'Chepelare', bg: 'Чепеларе' }, sp: ['brown'], note: { en: 'Runs north from Chepelare towards Asenovgrad.', bg: 'Тече на север от Чепеларе към Асеновград.' } },
  { id: 'arda', n: '05', lat: 41.4833, lng: 24.85, kind: 'stream', river: { en: 'Upper Arda', bg: 'Горна Арда' }, place: { en: 'Rudozem', bg: 'Рудозем' }, sp: ['brown'], note: { en: 'The upper Arda, close to the Greek border.', bg: 'Горното течение на Арда, близо до границата с Гърция.' } },
  { id: 'vacha', n: '06', lat: 42.05, lng: 24.4667, kind: 'champ', river: { en: 'Vacha', bg: 'Въча' }, place: { en: 'Krichim – Kurtovo Konare', bg: 'Кричим – Куртово Конаре' }, sp: ['brown', 'rainbow'], tags: ['cr'], note: { en: 'Venue of the national fly fishing championship in 2023 and 2025.', bg: 'Място на републиканския шампионат по риболов на муха през 2023 и 2025 г.' } },
];

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const find = (id: string) => B.find((b) => b.id === id)!;
const narrow = () => innerWidth < 720;

const map = L.map('map', { zoomControl: false, scrollWheelZoom: false, zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 7, maxZoom: 16 });
map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
map.attributionControl.setPosition(narrow() ? 'topleft' : 'bottomright');
map.createPane('relief'); map.getPane('relief')!.style.zIndex = '150';
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', { pane: 'relief', maxNativeZoom: 13, maxZoom: 16, attribution: 'Relief © Esri' }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/' + ({ night: 'dark_nolabels', paper: 'light_nolabels', skin: 'voyager_nolabels' })[theme] + '/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>' }).addTo(map);

const bounds = L.latLngBounds(B.map((b): L.LatLngTuple => [b.lat, b.lng]));
function pad(): L.FitBoundsOptions {
  return narrow() ? { paddingTopLeft: [40, 50], paddingBottomRight: [40, Math.round(innerHeight * 0.55)] } : { paddingTopLeft: [400, 70], paddingBottomRight: [110, 70] };
}
map.fitBounds(bounds, pad());

const markers: Record<string, L.Marker> = {};
let sel: string | null = null;
B.forEach((b, i) => {
  const html = '<div class="pin' + (b.kind === 'home' ? ' home' : '') + '" style="--d:' + (300 + i * 120) + 'ms"><i class="ring"></i><div class="dot">' + b.n + '</div></div>';
  const m = L.marker([b.lat, b.lng], { icon: L.divIcon({ className: 'beat', html, iconSize: [34, 34], iconAnchor: [17, 17] }), riseOnHover: true, keyboard: true });
  m.addTo(map);
  m.bindTooltip('', { permanent: true, direction: 'right', offset: [18, 0], className: 'tip' });
  m.on('click', () => select(b.id));
  m.on('mouseover', () => hover(b.id, true));
  m.on('mouseout', () => hover(b.id, false));
  markers[b.id] = m;
});

function pinEl(id: string) { const el = markers[id].getElement(); return el ? el.querySelector('.pin') : null; }
function hover(id: string, on: boolean) {
  const p = pinEl(id); if (p) p.classList.toggle('hov', on);
  const li = document.querySelector('#list button[data-id="' + id + '"]'); if (li) li.classList.toggle('hov', on);
}
function flyTo(b: Beat) {
  const z = 11.25, p = map.project([b.lat, b.lng], z);
  const off = narrow() ? L.point(0, Math.round(innerHeight * 0.22)) : L.point(-170, 0);
  map.flyTo(map.unproject(p.add(off), z), z, { duration: 1.2 });
}
function select(id: string) { sel = id; flyTo(find(id)); render(); }

function render() {
  document.documentElement.lang = lang;
  $('#t-beats').textContent = T.beats[lang] + ' · ' + B.length;
  $('#all').textContent = T.all[lang];
  $('#hint').textContent = T.hint[lang];
  $('#list').innerHTML = B.map((b) =>
    '<li><button type="button" data-id="' + b.id + '" aria-current="' + (sel === b.id) + '"><span class="n">' + b.n + '</span><span class="nm">' + b.river[lang] + '</span><span class="pl">' + b.place[lang] + ' · ' + T[b.kind][lang] + '</span></button></li>',
  ).join('');
  B.forEach((b) => { markers[b.id].setTooltipContent(b.river[lang]); const p = pinEl(b.id); if (p) p.classList.toggle('sel', sel === b.id); });
  const d = $('#detail');
  if (!sel) {
    d.innerHTML = '<p class="dnote">' + T.intro[lang] + '</p><p class="rule"><i></i><span>' + T.rule[lang] + '</span></p>';
  } else {
    const b = find(sel);
    d.innerHTML = '<div class="k">' + b.n + ' · ' + T[b.kind][lang] + '</div><h3 class="dn">' + b.river[lang] + '</h3><div class="dp">' + b.place[lang] + '</div><p class="dnote">' + b.note[lang] + '</p><div class="k">' + T.species[lang] + '</div><div class="chips">' +
      b.sp.map((s) => '<span class="chip">' + SP[s][lang] + '</span>').join('') +
      (b.tags || []).map((t) => '<span class="chip acc">' + T[t][lang] + '</span>').join('') +
      '</div><p class="rule"><i></i><span>' + T.rule[lang] + '</span></p>';
  }
}

const beatButton = (e: Event) => (e.target as Element).closest('button[data-id]');
$('#list').addEventListener('click', (e) => { const bt = beatButton(e); if (bt) select(bt.getAttribute('data-id')!); });
$('#list').addEventListener('mouseover', (e) => { const bt = beatButton(e); if (bt) hover(bt.getAttribute('data-id')!, true); });
$('#list').addEventListener('mouseout', (e) => { const bt = beatButton(e); if (bt) hover(bt.getAttribute('data-id')!, false); });
$('#all').addEventListener('click', () => { sel = null; map.flyToBounds(bounds, Object.assign({ duration: 1.1 }, pad())); render(); });
$('#ctrl').addEventListener('click', (e) => { const bt = (e.target as Element).closest('button'); if (bt) map.setZoom(map.getZoom() + Number(bt.getAttribute('data-z'))); });
map.on('click', () => { map.scrollWheelZoom.enable(); $('#hint').style.opacity = '0'; });
map.on('mouseout', () => { map.scrollWheelZoom.disable(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && sel) $('#all').click(); });
addEventListener('message', (e) => {
  if (e.origin !== location.origin) return;
  const d = e.data || {};
  if (d.type === 'fario-lang' && (d.lang === 'en' || d.lang === 'bg') && d.lang !== lang) { lang = d.lang; render(); }
});
addEventListener('resize', () => { map.attributionControl.setPosition(narrow() ? 'topleft' : 'bottomright'); if (!sel) map.fitBounds(bounds, pad()); });
render();
