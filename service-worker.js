const CACHE_VERSION = 'v1';
const CACHE_NAME = `tarot-cache-${CACHE_VERSION}`;

// Core assets
const CORE_ASSETS = [
  '/',
  '/index.htm',
  '/manifest.json',
  '/p5.js',
  '/sketch.js',
  '/style.css',
  '/logo.png',
  '/back.jpg',
  '/descriptions.txt',
  '/poppins.ttf'
];

// All card image assets (manually listed for deterministic precache)
const IMAGE_ASSETS = [
  '/data/major_0_the_fool.webp','/data/major_1_the_magician.webp','/data/major_2_the_high_priestess.webp','/data/major_3_the_empress.webp','/data/major_4_the_emperor.webp','/data/major_5_the_hierophant.webp','/data/major_6_the_lovers.webp','/data/major_7_the_chariot.webp','/data/major_8_strength.webp','/data/major_9_the_hermit.webp','/data/major_10_wheel_of_fortune.webp','/data/major_11_justice.webp','/data/major_12_the_hanged_man.webp','/data/major_13_death.webp','/data/major_14_temperance.webp','/data/major_15_the_devil.webp','/data/major_16_the_tower.webp','/data/major_17_the_star.webp','/data/major_18_the_moon.webp','/data/major_19_the_sun.webp','/data/major_20_judgement.webp','/data/major_21_the_world.webp',
  '/data/mind_ace.webp','/data/mind_2.webp','/data/mind_3.webp','/data/mind_4.webp','/data/mind_5.webp','/data/mind_6.webp','/data/mind_7.webp','/data/mind_8.webp','/data/mind_9.webp','/data/mind_10.webp','/data/mind_page.webp','/data/mind_knight.webp','/data/mind_queen.webp','/data/mind_king.webp',
  '/data/heart_ace.webp','/data/heart_2.webp','/data/heart_3.webp','/data/heart_4.webp','/data/heart_5.webp','/data/heart_6.webp','/data/heart_7.webp','/data/heart_8.webp','/data/heart_9.webp','/data/heart_10.webp','/data/heart_page.webp','/data/heart_knight.webp','/data/heart_queen.webp','/data/heart_king.webp',
  '/data/body_ace.webp','/data/body_2.webp','/data/body_3.webp','/data/body_4.webp','/data/body_5.webp','/data/body_6.webp','/data/body_7.webp','/data/body_8.webp','/data/body_9.webp','/data/body_10.webp','/data/body_page.webp','/data/body_knight.webp','/data/body_queen.webp','/data/body_king.webp',
  '/data/world_ace.webp','/data/world_2.webp','/data/world_3.webp','/data/world_4.webp','/data/world_5.webp','/data/world_6.webp','/data/world_7.webp','/data/world_8.webp','/data/world_9.webp','/data/world_10.webp','/data/world_page.webp','/data/world_knight.webp','/data/world_queen.webp','/data/world_king.webp'
];

const PRECACHE = [...CORE_ASSETS, ...IMAGE_ASSETS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Runtime cache new GET requests (e.g., future assets)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      }).catch(() => cached);
    })
  );
});
