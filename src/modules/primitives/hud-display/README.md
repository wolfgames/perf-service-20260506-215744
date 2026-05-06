# HudDisplay

Labeled text group for game stats — score, level, moves, target, etc. Vertical or horizontal layout, update individual entries by key.

## Usage

```ts
import { HudDisplay } from '~/modules/primitives/hud-display';

const hud = new HudDisplay({
  entries: [
    { key: 'score', label: 'Score: ', value: 0 },
    { key: 'moves', label: 'Moves: ', value: 30 },
  ],
});
stage.addChild(hud);
hud.setValue('score', 420);
```

## Public API

| Method | Description |
|--------|-------------|
| `setValue(key, value)` | Update one entry by key. |
| `setValues(values)` | Update multiple entries from a record. |
| `getField(key)` | Returns the underlying Pixi `Text` for custom styling. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `entries` | `HudEntry[]` | required | Array of `{ key, label, value?, alignRight?, fill? }`. |
| `fontSize` | `number?` | `20` | Font size. |
| `fontFamily` | `string?` | `'sans-serif'` | Font family. |
| `fill` | `string?` | `'#ffffff'` | Default text color. |
| `stroke` | `string?` | `'#000000'` | Stroke color. |
| `strokeWidth` | `number?` | `3` | Stroke width. |
| `direction` | `'vertical' \| 'horizontal'?` | `'vertical'` | Layout direction. |
| `width` | `number?` | `0` | Available width (used for `alignRight` entries in vertical mode). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `fontSize` | 20 | 10 – 36 |
| `strokeWidth` | 3 | 0 – 8 |
| `spacing` | 28 | 10 – 50 |
| `horizontalGap` | 120 | 40 – 200 |

## Use when

score, level, moves, timer, combo, any HUD values.
