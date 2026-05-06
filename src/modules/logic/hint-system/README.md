# createHintSystem

Hint cooldown manager. Cooldown grows exponentially per use (`baseCooldownMs * growthFactor^hintsUsed`); caller drives time via `tick(deltaMs)` and supplies the current target via `getTargetItem`.

## Usage

```ts
import { createHintSystem } from '~/modules/logic/hint-system';

const hints = createHintSystem({
  baseCooldownMs: 5000,
  growthFactor: 1.25,
  maxHints: 5,
  getTargetItem: () => evidence.getActiveClues()[0] ?? null,
  onHintActivated: (itemId) => highlightItem(itemId),
});

// each frame
hints.tick(deltaMs);

// on hint button press
hints.useHint();
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `useHint()` | Returns `false` if on cooldown, out of hints, or `getTargetItem()` returned `null`. Otherwise increments `hintsUsed`, sets cooldown, fires `onHintActivated`, returns `true`. |
| `tick(deltaMs)` | Advance the cooldown timer. Call each frame. |
| `cooldownRemaining` | Milliseconds left on cooldown. |
| `isOnCooldown` | `true` while `cooldownRemaining > 0`. |
| `hintsUsed` | Total hints fired so far. |
| `hintsRemaining` | `maxHints - hintsUsed` (`Infinity` if unlimited). |
| `reset()` | Reset counters and cooldown. |
| `destroy()` | Same as `reset`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `baseCooldownMs` | `number` | `5000` | Cooldown for the first hint. |
| `growthFactor` | `number` | `1.25` | Exponential growth per use. |
| `maxHints` | `number` | `Infinity` | Total hint cap. |
| `onHintActivated` | `(targetItemId: string) => void` | — | Fired when a hint successfully fires. |
| `getTargetItem` | `() => string \| null` | — | Caller-side resolver for the current best target. Returning `null` blocks `useHint`. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `baseCooldownMs` | 5000 | 1000 – 30000 |
| `growthFactor` | 1.25 | 1.0 – 2.0 |

## Use when

Hint cooldowns, progressive hints, hint targeting, anti-spam gating.
