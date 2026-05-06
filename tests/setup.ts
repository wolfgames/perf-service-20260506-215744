/**
 * Global test setup — runs before every test file.
 *
 * Polyfills browser APIs that @adobe/data uses at module-evaluation time
 * but are not available in the node test environment.
 */

// Polyfill globalThis.caches (used by @adobe/data/dist/cache/blob-store.js)
if (typeof globalThis.caches === 'undefined') {
  const noop = async () => undefined;
  const noopFalse = async () => false;
  const noopArr = async () => [];

  // @ts-expect-error -- CacheStorage polyfill for node test env
  globalThis.caches = {
    open: async (_name: string) => ({
      match: noop,
      put: noop,
      delete: noopFalse,
      keys: noopArr,
      add: noop,
      addAll: noop,
    }),
    has: noopFalse,
    delete: noopFalse,
    keys: noopArr,
    match: noop,
  };
}
