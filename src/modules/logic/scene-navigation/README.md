# createSceneNavigation

Ordered scene navigator with unlock state, optional sequential gating, and timed transitions. Tracks current scene and emits change/unlock callbacks.

## Usage

```ts
import { createSceneNavigation } from '~/modules/logic/scene-navigation';

const nav = createSceneNavigation({
  scenes: [
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'study', label: 'Study', unlockRequiredItemId: 'key' },
    { id: 'attic', label: 'Attic', unlockRequiredItemId: 'letter' },
  ],
  initialUnlocked: ['kitchen'],
  sequentialMode: false,
  transitionDurationMs: 300,
  onSceneChange: (fromId, toId) => fadeBetween(fromId, toId),
  onSceneUnlocked: (sceneId) => playUnlockSfx(sceneId),
});

nav.goToScene('kitchen');
nav.unlockScene('study');
nav.goToNext();
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `goToScene(sceneId)` | Navigate. Returns `false` if the scene is unknown, locked, or a transition is in progress. Switches `currentSceneId` immediately and fires `onSceneChange`; `isTransitioning` stays `true` for `transitionDurationMs`. |
| `goToNext()` | Advance to the next scene in `scenes`. Returns `false` if at the last scene or it's locked. If `currentSceneId` is `null`, navigates to the first unlocked scene. |
| `goToPrevious()` | Step back. Returns `false` at index 0 or if `currentSceneId` is `null`. |
| `unlockScene(sceneId)` | Add to unlocked set and fire `onSceneUnlocked`. In `sequentialMode`, only the next-in-order scene can be unlocked. |
| `isUnlocked(sceneId)` | Whether a scene has been unlocked. |
| `currentSceneId` | Active scene ID or `null`. |
| `currentSceneIndex` | Index in `scenes`, or `-1`. |
| `unlockedSceneIds` | Read-only array of unlocked IDs. |
| `scenes` | The configured scene list (read-only). |
| `isTransitioning` | `true` during the `transitionDurationMs` window. |
| `reset()` | Cancel transition, clear current, restore initial unlocked set. |
| `destroy()` | Cancel pending transition timer. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scenes` | `SceneDef[]` | — | Ordered scene list. Each `SceneDef` is `{ id, label, unlockRequiredItemId? }`. |
| `initialUnlocked` | `string[]` | `[scenes[0].id]` | Scene IDs unlocked at start. Unknown IDs are warned and ignored. |
| `sequentialMode` | `boolean` | `false` | When `true`, `unlockScene` only accepts the next-in-order scene. |
| `transitionDurationMs` | `number` | `300` | Window during which `isTransitioning` is `true` and further `goToScene` calls are rejected. |
| `onSceneChange` | `(fromId: string \| null, toId: string) => void` | — | Fired on every successful scene change. |
| `onSceneUnlocked` | `(sceneId: string) => void` | — | Fired when a previously locked scene unlocks. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `transitionDurationMs` | 300 | 0 – 1000 |

## Use when

Multi-scene navigation, scene unlock progression, ordered chapter rooms, gated location transitions.
