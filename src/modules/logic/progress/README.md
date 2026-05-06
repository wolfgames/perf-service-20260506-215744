# createProgressService

Generic typed progress store backed by `localStorage` via `createVersionedStore`. Bumping `version` resets stored data.

## Usage

```ts
import { createProgressService, type BaseProgress } from '~/modules/logic/progress';

interface MyProgress extends BaseProgress {
  score: number;
  level: number;
}

const progress = createProgressService<MyProgress>({
  key: 'mygame_progress',
  version: 1,
  defaults: { version: 1, score: 0, level: 1 },
});

const data = progress.load();
progress.save({ ...data, score: data.score + 100 });
progress.clear();
```

The progress shape must extend `BaseProgress` (the `version: number` field).

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `load()` | Read from `localStorage`. Returns `defaults` if missing, version mismatched, or `validate` rejects it. |
| `save(data)` | Persist `data` under `key`. |
| `clear()` | Remove the entry from `localStorage`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | — | `localStorage` key. |
| `version` | `number` | — | Schema version. Bumping invalidates older saves. |
| `defaults` | `T` | — | Returned by `load()` when no valid data exists. |
| `validate` | `(data: unknown) => boolean` | `undefined` | Optional shape check; failure causes `load()` to return `defaults`. |

## Use when

Persisting player progression, save/load against `localStorage` with version-gated migrations.
