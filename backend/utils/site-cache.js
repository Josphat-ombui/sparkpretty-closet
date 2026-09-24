const CACHE_TTL = 30 * 1000;
const cache = new Map();
const cacheStamp = new Map();

export function cached(key, loader) {
  const now = Date.now();
  const stamp = cacheStamp.get(key);
  if (stamp && now - stamp < CACHE_TTL && cache.has(key)) {
    return Promise.resolve(cache.get(key));
  }
  return loader().then((value) => {
    cache.set(key, value);
    cacheStamp.set(key, now);
    return value;
  });
}

export function clearSiteCache() {
  cache.clear();
  cacheStamp.clear();
}

export const CACHE_CONTROL = 'public, max-age=30';