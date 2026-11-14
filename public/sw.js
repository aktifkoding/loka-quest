/*
 * LokaQuest service worker — cache konten edukatif agar tetap bisa dibaca
 * saat koneksi sekolah lemah/pemutus (network-first untuk halaman konten,
 * cache-first untuk aset statis dan gambar Wikimedia/Supabase).
 *
 * Sengaja TIDAK menyentuh: /api/*, /auth/*, /player/*, /admin/*, /educator/*,
 * /editor/*, /kuis/* — halaman berbasis sesi agar tidak menyajikan data basi.
 */
const CONTENT_CACHE = "lokaquest-content-v1";
const ASSET_CACHE = "lokaquest-assets-v1";

const CONTENT_PREFIXES = [
  "/encyclopedia",
  "/bahasa",
  "/regions",
  "/asisten",
  "/tentang",
  "/sumber",
  "/komunitas",
  "/leaderboard",
];

const IMAGE_HOSTS = ["upload.wikimedia.org", "thumb.wikimedia.org"];

self.addEventListener("install", () => {
  // Tidak ada precache besar — konten di-cache saat pertama kali dibaca.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CONTENT_CACHE && name !== ASSET_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

function isContentPage(request) {
  const url = new URL(request.url);
  return (
    url.origin === self.location.origin &&
    CONTENT_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + "/"))
  );
}

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/_next/image"))
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CONTENT_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") cache.put(request, response.clone());
    return response;
  } catch (error) {
    const stale = await cache.match(request);
    if (stale) return stale;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Halaman berbasis sesi / API — biarkan jaringan apa adanya
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/auth") ||
      url.pathname.startsWith("/player") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/educator") ||
      url.pathname.startsWith("/editor") ||
      url.pathname.startsWith("/kuis"))
  ) {
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // Gambar Wikimedia & storage Supabase (cross-origin, opaque tetap boleh)
  if (IMAGE_HOSTS.includes(url.hostname) || url.hostname.endsWith(".supabase.co")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE).catch(() => fetch(request)));
    return;
  }

  if (isContentPage(request)) {
    event.respondWith(networkFirst(request));
  }
});
