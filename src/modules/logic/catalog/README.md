# createCatalogService

Generic ordered content catalog with cursor-based navigation. Fetches an index, falls back to a static list, and exposes current/next/findById helpers.

## Usage

```ts
import { createCatalogService } from '~/modules/logic/catalog';

interface ChapterEntry {
  id: string;
  url: string;
}

const catalog = createCatalogService<ChapterEntry>({
  fetchIndex: () => fetch('/api/chapters').then((r) => r.json()),
  fallbackEntries: [{ id: 'fallback', url: 'default.json' }],
});

await catalog.init();
const first = catalog.current();
const second = catalog.next();
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `init()` | Fetches the index. On failure, loads `fallbackEntries`. Resets cursor to 0. Returns `Promise<void>`. |
| `entries()` | All loaded entries. |
| `current()` | Entry at the current cursor, or `null` if empty. |
| `currentIndex()` | Cursor position. |
| `setIndex(i)` | Clamp-set the cursor to `[0, length-1]`. |
| `hasNext()` | `true` if cursor is not at the last entry. |
| `next()` | Advance cursor and return new entry, or `null` if already at end. |
| `findById(id)` | Index of entry with matching `id`, or `-1`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `fetchIndex` | `() => Promise<T[]>` | — | Fetches the entry list. |
| `fallbackEntries` | `T[]` | — | Used when `fetchIndex` rejects. |

## Use when

Chapter/level selection, content sequencing, ordered catalog navigation.
