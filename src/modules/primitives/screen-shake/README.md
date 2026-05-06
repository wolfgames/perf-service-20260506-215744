# ScreenShake

Decaying oscillation applied to any Pixi `Container`. No visual of its own — call `shake(target, intensity)` and it tweens the target's position.

## Usage

```ts
import { ScreenShake } from '~/modules/primitives/screen-shake';

const shaker = new ScreenShake();
shaker.shake(gameStage, 'heavy');
shaker.reject(invalidPiece); // shorthand for 'light'
```

The `intensity` arg is either a preset (`'light' | 'medium' | 'heavy'`) or a raw pixel number. Calling `shake()` while one is already running kills the previous tween on that target.

## Public API

| Method | Description |
|--------|-------------|
| `shake(target, intensity?)` | Apply decaying X/Y oscillation; returns target to its original position. |
| `reject(target)` | Shorthand for a `'light'` shake (invalid-action feedback). |
| `destroy()` | Kill all active shake tweens. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `lightIntensity` | 2 | 1 – 6 |
| `mediumIntensity` | 4 | 2 – 10 |
| `heavyIntensity` | 6 | 3 – 16 |
| `stepDuration` | 0.017 | 0.01 – 0.05 |
| `steps` | 9 | 3 – 15 |
| `yRatio` | 0.5 | 0 – 1 |

## Use when

hit feedback, reject shake, impact, explosions.
