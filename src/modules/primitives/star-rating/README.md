# StarRating

Row of star sprites with fractional fill (alpha-blended), GSAP scale-punch on changes, and tinted filled/empty states.

## Usage

```ts
import { StarRating } from '~/modules/primitives/star-rating';

const stars = new StarRating(gpuLoader, {
  atlasName: 'core-ui',
  starFrameName: 'star',
  currentStars: 3.5,
});
stage.addChild(stars);
stars.setRating(5);
```

## Public API

| Method | Description |
|--------|-------------|
| `setRating(stars)` | Update rating (fractional supported); punch-animates changed stars. |
| `rating` (get) | Current rating value. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Texture atlas name. |
| `starFrameName` | `string` | required | Frame for the star sprite. |
| `currentStars` | `number` | required | Initial rating (fractional ok). |
| `maxStars` | `number?` | `5` | Total stars rendered. |
| `starSize` | `number?` | `32` | Size of each star in px. |
| `gap` | `number?` | `4` | Gap between stars. |
| `filledTint` | `number?` | `0xffd700` | Tint for filled stars. |
| `emptyTint` | `number?` | `0x555555` | Tint for empty stars. |
| `punchScale` | `number?` | `1.3` | Peak scale during punch. |
| `punchDuration` | `number?` | `0.2` | Punch animation duration. |
| `punchEase` | `string?` | `'back.out(2)'` | Punch easing. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `starSize` | 32 | 16 – 64 |
| `gap` | 4 | 0 – 16 |
| `punchScale` | 1.3 | 1.0 – 2.0 |
| `punchDuration` | 0.2 | 0.05 – 0.5 |

## Use when

star ratings, review scores, achievement displays.
