# FlyText

Text that drifts along a velocity vector, scales between two values, and fades out before self-destructing.

## Usage

```ts
import { FlyText } from '~/modules/primitives/fly-text';

const popup = new FlyText({
  text: '+100',
  x: 200,
  y: 300,
});
stage.addChild(popup);
```

## Public API

| Method | Description |
|--------|-------------|
| `update(dt)` | Per-frame tick; advances motion, fade, scale; auto-destroys at lifetime end. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | `string` | required | Text content. |
| `x` | `number` | required | Starting X. |
| `y` | `number` | required | Starting Y. |
| `velocityY` | `number?` | `-80` | Vertical velocity in px/s (negative = up). |
| `velocityX` | `number?` | `0` | Horizontal velocity in px/s. |
| `lifetime` | `number?` | `1.0` | Total lifetime in seconds. |
| `fontSize` | `number?` | `24` | Font size. |
| `fontFamily` | `string?` | `'sans-serif'` | Font family. |
| `fill` | `string?` | `'#ffffff'` | Text color. |
| `stroke` | `string?` | `''` | Stroke color (empty = none). |
| `strokeWidth` | `number?` | `0` | Stroke width. |
| `startScale` | `number?` | `1` | Scale at spawn. |
| `endScale` | `number?` | `0.6` | Scale at end of lifetime. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `velocityY` | -80 | -200 – 0 |
| `velocityX` | 0 | -100 – 100 |
| `lifetime` | 1.0 | 0.2 – 3 |
| `fontSize` | 24 | 10 – 48 |
| `startScale` | 1 | 0.5 – 2 |
| `endScale` | 0.6 | 0 – 1 |

## Use when

score popups, damage numbers, combo text, "+1" effects.
