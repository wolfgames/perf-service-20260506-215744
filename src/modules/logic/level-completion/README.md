# createLevelCompletionController

State machine for the level-end sequence: `playing` → `completing` (input blocked, audio + clue) → `complete` (continue allowed).

## Usage

```ts
import {
  createLevelCompletionController,
  playLevelCompleteSound,
} from '~/modules/logic/level-completion';

const completion = createLevelCompletionController({
  events: {
    onLevelComplete: ({ levelId, moves, durationMs }) =>
      analytics.track('level_complete', { levelId, moves, durationMs }),
    onCompletionStart: (clue, levelId) => showCluePopup(clue, levelId),
    onClueTimerEnd: () => showContinueButton(),
    onCompletionEnd: () => loadNextLevel(),
  },
  celebrationDuration: 500,
  clueDuration: 3000,
  onPlaySound: playLevelCompleteSound,
});

completion.startCompletion(level.id, moves, durationMs, level.clue);
// ...later, on continue button tap:
completion.continue();
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `state` | Current `CompletionState`: `'playing' \| 'completing' \| 'complete'`. |
| `isInputBlocked` | `true` while `state === 'completing'`. |
| `canContinue` | `true` once the clue timer expires (continue button can show). |
| `startCompletion(levelId, moves, durationMs, clue)` | Enter `completing`. Emits `onLevelComplete` once, then schedules `onCompletionStart` after `celebrationDuration`, then `onClueTimerEnd` after `clueDuration`. No-op if already past `playing`. |
| `continue()` | Transition to `complete` and fire `onCompletionEnd`. No-op unless `canContinue`. |
| `reset()` | Cancel timers, return to `playing`, allow another completion. |
| `destroy()` | Same as `reset`; releases the active timer. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `events` | `CompletionEvents` | — | The four lifecycle callbacks (`onLevelComplete`, `onCompletionStart`, `onClueTimerEnd`, `onCompletionEnd`). |
| `celebrationDuration` | `number` | `500` | Delay (ms) between `startCompletion` and `onCompletionStart`. |
| `clueDuration` | `number` | `3000` | Delay (ms) between `onCompletionStart` and `onClueTimerEnd`. |
| `onPlaySound` | `() => void` | — | Optional sound callback fired in `startCompletion`. Pass `playLevelCompleteSound` for the built-in chime. |

`playLevelCompleteSound` is also exported — a Web Audio C5/E5/G5 ascending chime, fails silently if AudioContext is unavailable.

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `celebrationDuration` | 500 | 0 – 2000 |
| `clueDuration` | 3000 | 1000 – 10000 |
| `chimeVolume` | 0.3 | 0 – 1 |
| `chimeDuration` | 0.5 | 0.1 – 2 |

## Use when

Tracking level/round lifecycle, end-of-level orchestration, gating input during completion.
