# createContentLoader

Generic fetch + transform pipeline. Loads a URL, optionally maps the raw payload to a target type.

## Usage

```ts
import { createContentLoader } from '~/modules/logic/loader';

interface ChapterRef {
  levels: Array<{ id: string; data: unknown }>;
}
interface LevelManifest {
  levelId: string;
  payload: unknown;
}

const loader = createContentLoader<ChapterRef, LevelManifest[]>({
  fetch: (url) => fetch(url).then((r) => r.json()),
  transform: (raw) =>
    raw.levels.map((l) => ({ levelId: l.id, payload: l.data })),
});

const levels = await loader.load('/api/chapters/1');
```

If `transform` is omitted, the loader returns the raw payload typed as `TTarget` (defaults to `TSource`).

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `load(url)` | Fetch from `url`, run `transform` if provided, return `Promise<TTarget>`. Errors propagate from `fetch`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `fetch` | `(url: string) => Promise<TSource>` | — | Caller-supplied fetcher. |
| `transform` | `(source: TSource) => TTarget` | `undefined` | Optional mapper. When omitted, the loader casts `TSource` to `TTarget`. |

## Use when

Loading level data, configs, remote content, or any URL → typed-object pipeline.
