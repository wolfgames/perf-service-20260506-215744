# createEvidenceTracker

Tracks found/unfound items across multiple scenes, rotates a fixed-size active clue list, and emits per-find / scene-complete / all-complete callbacks.

## Usage

```ts
import { createEvidenceTracker } from '~/modules/logic/evidence-tracker';

const tracker = createEvidenceTracker({
  scenes: [
    { sceneId: 'kitchen', items: ['knife', 'note', 'glass'] },
    { sceneId: 'study', items: ['letter', 'key'] },
  ],
  maxActiveClues: 3,
  onFind: (itemId, sceneId) => console.log('found', itemId, 'in', sceneId),
  onSceneComplete: (sceneId) => console.log('scene done:', sceneId),
  onAllComplete: () => console.log('case closed'),
});

tracker.markFound('knife');
tracker.getActiveClues();
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `markFound(itemId)` | Mark item found, fire `onFind`, rotate the clue list, fire `onSceneComplete`/`onAllComplete` if applicable. Returns `false` if itemId is unknown or already found. |
| `getActiveClues()` | Current visible clue item IDs (length ≤ `maxActiveClues`). |
| `getFoundItems()` | All found item IDs. |
| `getUnfoundItems(sceneId)` | Unfound items in a specific scene. |
| `isSceneComplete(sceneId)` | `true` if every item in `sceneId` is found. |
| `isAllComplete` | `true` once every item across all scenes is found. |
| `reset()` | Clear found set, re-seed active clues. |
| `destroy()` | Tear down (same as `reset` — no listeners to remove). |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scenes` | `EvidenceTrackerSceneConfig[]` | — | Scenes with their item lists. Must be non-empty; each scene must have ≥1 item (else throws). |
| `maxActiveClues` | `number` | `3` | Cap on simultaneously visible clues. |
| `onFind` | `(itemId, sceneId) => void` | — | Fired per successful `markFound`. |
| `onSceneComplete` | `(sceneId) => void` | — | Fired when the last item of a scene is found. |
| `onAllComplete` | `() => void` | — | Fired when every item across every scene is found. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `maxActiveClues` | 3 | 1 – 10 |

## Use when

Hidden object found/unfound state, clue management, multi-scene evidence panels.
