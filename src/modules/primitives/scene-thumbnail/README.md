# SceneThumbnail

Square scene preview tile with masked image, border (default/selected), optional lock overlay, and reveal/select animations.

## Usage

```ts
import { SceneThumbnail } from '~/modules/primitives/scene-thumbnail';

const thumb = new SceneThumbnail(gpuLoader, {
  atlasName: 'scene-previews',
  spriteName: 'scene-01',
  isLocked: false,
  onTap: () => selectScene(1),
});
stage.addChild(thumb);
thumb.playReveal();
```

## Public API

| Method | Description |
|--------|-------------|
| `setLocked(locked)` | Fade lock overlay in/out and toggle interactivity. |
| `setSelected(selected)` | Recolor border and tween scale. |
| `playReveal()` | Scale-from-0 + fade-in. Returns `Promise<void>`. |
| `setEnabled(enabled)` | Toggle interactivity and disabled-alpha visual. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Texture atlas name. |
| `spriteName` | `string` | required | Frame name for the scene image. |
| `isLocked` | `boolean?` | `false` | Show lock overlay on construction. |
| `isSelected` | `boolean?` | `false` | Use selected border color initially. |
| `size` | `number?` | `48` | Square thumbnail edge size in px. |
| `borderColor` | `number?` | `0x666666` | Default border color (hex). |
| `selectedBorderColor` | `number?` | `0x00cccc` | Selected border color (hex). |
| `lockedOverlayAlpha` | `number?` | `0.7` | Lock overlay darkness. |
| `onTap` | `() => void?` | — | Tap callback. |
| `lockIconFrame` | `string?` | — | Frame for lock icon sprite (in same atlas). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `size` | 48 | 32 – 128 |
| `borderWidth` | 2 | 1 – 6 |
| `lockedOverlayAlpha` | 0.7 | 0.3 – 1.0 |
| `revealDuration` | 0.3 | 0.1 – 0.8 |
| `selectedScale` | 1.1 | 1.0 – 1.3 |

## Use when

scene selectors, level pickers, gallery views.
