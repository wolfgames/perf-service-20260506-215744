# ScorePopup

Vertically stacked celebration: badge drop-slam, then star reveal, then count-up points text. Awaitable as a single `play()` sequence.

## Composes

- `commendation-badge` — driven manually (`animated: false`) so the prefab orchestrates its `playEntrance()`
- `star-rating` — starts at 0 and steps up one tick at a time during phase 2
- Pixi `Text` for the gold "+points" count-up

## Usage

```ts
import { ScorePopup } from '~/modules/prefabs/score-popup';

const popup = new ScorePopup(gpuLoader, {
  tier: 3,
  stars: 2.5,
  points: 1200,
  atlasName: 'ui',
  badgeFrames: { 1: 'badge-bronze', 2: 'badge-silver', 3: 'badge-gold' },
  starFrameName: 'star',
  onComplete: () => results.show(),
});
popup.x = app.screen.width / 2;
popup.y = app.screen.height / 2;
stage.addChild(popup);

await popup.play();
```

## Public API

| Method | Description |
|--------|-------------|
| `play()` | Run the full sequence: badge entrance → star-by-star reveal → points fade-in + count-up. Returns `Promise<void>`; fires `onComplete` at the end. |
| `destroy()` | Kills tweens on the points text and tears down children. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `tier` | `number` | — | Required. Badge tier 0-5. |
| `stars` | `number` | — | Required. Final star rating; supports fractional values. |
| `points` | `number` | — | Required. Final points value for the count-up. |
| `atlasName` | `string` | — | Required. Atlas containing badge frames and the star sprite. |
| `badgeFrames` | `Record<number, string>` | — | Required. Map tier → frame name. |
| `starFrameName` | `string` | — | Required. Frame name of the star sprite. |
| `onComplete` | `() => void` | — | Fired after the count-up resolves. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `celebrationDuration` | `1500` | 500 – 5000 |
| `starDelay` | `200` | 50 – 500 |
| `badgeDelay` | `0` | 0 – 1000 |
| `pointsFontSize` | `28` | 16 – 48 |

## Use when

end-of-level celebrations, score reveals.
