const CACHE_VERSION = 'v2';
const CACHE_NAME = `tarot-cache-${CACHE_VERSION}`;

// Resolve an asset path relative to the service worker scope so it works in subfolders
function resolve(path) {
  return new URL(path, self.registration.scope).toString();
}

// Core assets (no leading slashes so they stay relative)
const CORE_ASSETS = [
  'index.htm',
  'manifest.json',
  'p5.js',
  'sketch.js',
  'style.css',
  'logo.png',
  'back.jpg',
  'descriptions.txt',
  'poppins.ttf'
];

// Card images (relative paths)
const IMAGE_ASSETS = [
  'data/major_0_the_fool.webp','data/major_1_the_magician.webp','data/major_2_the_high_priestess.webp','data/major_3_the_empress.webp','data/major_4_the_emperor.webp','data/major_5_the_hierophant.webp','data/major_6_the_lovers.webp','data/major_7_the_chariot.webp','data/major_8_strength.webp','data/major_9_the_hermit.webp','data/major_10_wheel_of_fortune.webp','data/major_11_justice.webp','data/major_12_the_hanged_man.webp','data/major_13_death.webp','data/major_14_temperance.webp','data/major_15_the_devil.webp','data/major_16_the_tower.webp','data/major_17_the_star.webp','data/major_18_the_moon.webp','data/major_19_the_sun.webp','data/major_20_judgement.webp','data/major_21_the_world.webp',
  'data/mind_ace.webp','data/mind_2.webp','data/mind_3.webp','data/mind_4.webp','data/mind_5.webp','data/mind_6.webp','data/mind_7.webp','data/mind_8.webp','data/mind_9.webp','data/mind_10.webp','data/mind_page.webp','data/mind_knight.webp','data/mind_queen.webp','data/mind_king.webp',
  'data/heart_ace.webp','data/heart_2.webp','data/heart_3.webp','data/heart_4.webp','data/heart_5.webp','data/heart_6.webp','data/heart_7.webp','data/heart_8.webp','data/heart_9.webp','data/heart_10.webp','data/heart_page.webp','data/heart_knight.webp','data/heart_queen.webp','data/heart_king.webp',
  'data/body_ace.webp','data/body_2.webp','data/body_3.webp','data/body_4.webp','data/body_5.webp','data/body_6.webp','data/body_7.webp','data/body_8.webp','data/body_9.webp','data/body_10.webp','data/body_page.webp','data/body_knight.webp','data/body_queen.webp','data/body_king.webp',
  'data/world_ace.webp','data/world_2.webp','data/world_3.webp','data/world_4.webp','data/world_5.webp','data/world_6.webp','data/world_7.webp','data/world_8.webp','data/world_9.webp','data/world_10.webp','data/world_page.webp','data/world_knight.webp','data/world_queen.webp','data/world_king.webp'
];

const PRECACHE = [...CORE_ASSETS, ...IMAGE_ASSETS].map(resolve);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    } catch (err) {
      console.error('[SW] Precache failed', err);
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(handleNavigation(req));
    return;
  }

  event.respondWith(cacheFirstThenNetwork(req));
});

async function handleNavigation(req) {
  try {
    const netRes = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, netRes.clone());
    return netRes;
  } catch (e) {
    const cachedIndex = await caches.match(resolve('index.htm'));
    if (cachedIndex) return cachedIndex;
    return new Response('<h1>Offline</h1><p>No cached content available.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheFirstThenNetwork(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    return cached || new Response('', { status: 504 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
