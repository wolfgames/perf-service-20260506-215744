/**
 * Bun test preload — runs before any test module is evaluated.
 *
 * Polyfills browser APIs required by node_modules that use them at
 * module-evaluation time (before vi.mock can intercept them).
 */

// Polyfill globalThis.caches — used by @adobe/data/dist/cache/blob-store.js
// at module evaluation time. Without this, blob-store.js crashes in bun test.
if (typeof globalThis.caches === 'undefined') {
  const openCache = async () => ({
    match: async () => undefined as Response | undefined,
    put: async () => undefined,
    delete: async () => false,
    keys: async () => [] as Request[],
    add: async () => undefined,
    addAll: async () => undefined,
  });

  // @ts-expect-error -- CacheStorage polyfill for node/bun test env
  globalThis.caches = {
    open: openCache,
    has: async () => false,
    delete: async () => false,
    keys: async () => [] as string[],
    match: async () => undefined as Response | undefined,
  };
}
