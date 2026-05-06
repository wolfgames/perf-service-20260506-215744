# CommendationBadge

Tiered badge sprite with a drop-slam entrance and radial sparkle burst.

## Usage

```ts
import { CommendationBadge } from '~/modules/primitives/commendation-badge';

const badge = new CommendationBadge(gpuLoader, {
  tier: 3,
  atlasName: 'core-rewards',
  badgeFrames: { 1: 'badge-bronze', 2: 'badge-silver', 3: 'badge-gold' },
  animated: true,
  onComplete: () => console.log('badge landed'),
});
stage.addChild(badge);
```

## Public API

| Method | Description |
|--------|-------------|
| `playEntrance()` | Run drop-slam + sparkle burst. Returns `Promise<void>`. |
| `setTier(tier)` | Swap the displayed badge frame. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `tier` | `number` | required | Badge tier (key into `badgeFrames`). |
| `atlasName` | `string` | required | Texture atlas name. |
| `badgeFrames` | `Record<number, string>` | required | Tier → atlas frame name. |
| `animated` | `boolean?` | `true` | Auto-play entrance on construction. |
| `animationDelay` | `number?` | `0` | Seconds to wait before entrance fires. |
| `onComplete` | `() => void?` | — | Fires when entrance + sparkles finish. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `dropDuration` | 0.3 | 0.1 – 1.0 |
| `sparkleCount` | 8 | 0 – 20 |
| `sparkleDuration` | 0.6 | 0.2 – 1.5 |
| `sparkleSpread` | 40 | 10 – 100 |

## Use when

rank badges, achievement medals, tier rewards.
