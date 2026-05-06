# RotatableTile

Dual-sprite grid tile with 90° animated rotation, default/active state swap, and a jiggle feedback gesture.

## Usage

```ts
import { RotatableTile } from '~/modules/primitives/rotatable-tile';

const tile = new RotatableTile(gpuLoader, {
  atlasName: 'scene-puzzle',
  defaultSpriteName: 'tile-default',
  activeSpriteName: 'tile-active',
  col: 2,
  row: 3,
});
stage.addChild(tile);
tile.on('pointertap', () => tile.rotate());
```

## Public API

| Method | Description |
|--------|-------------|
| `rotate(animated?)` | Rotate 90° clockwise. |
| `setRotation(rotation)` | Set rotation state directly (0–3). |
| `setActive(active)` | Swap between default and active sprite. |
| `jiggle()` | Play feedback wobble; returns the GSAP timeline. |
| `setTileSize(newSize)` | Resize tile (and reposition by `col`/`row`). |
| `rotationState` (get) | Current rotation state (0–3). |
| `isActive` (get) | Whether active sprite is shown. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Texture atlas name. |
| `defaultSpriteName` | `string` | required | Frame for default state. |
| `activeSpriteName` | `string` | required | Frame for active/completed state. |
| `tileSize` | `number?` | `64` | Tile size in px. |
| `col` | `number` | required | Grid column index. |
| `row` | `number` | required | Grid row index. |
| `initialRotation` | `number?` | `0` | Initial rotation state (0–3, each = 90°). |
| `interactive` | `boolean?` | `true` | Enable pointer interactivity. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `tileSize` | 64 | 24 – 128 |
| `overlapPx` | 1 | 0 – 4 |
| `rotationDurationMs` | 200 | 50 – 500 |
| `jiggleAngle` | 8 | 2 – 20 |
| `jiggleHalfDuration` | 0.06 | 0.02 – 0.2 |
| `jiggleCycles` | 2 | 1 – 5 |
| `jiggleFlashIntensity` | 0.3 | 0 – 1 |

## Use when

puzzle tiles, grid-based games, rotating pieces.
