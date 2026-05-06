# Ambilight

Blurred-copy glow rendered behind a source sprite. Use it to add ambient color spill from a sprite's own colors, or mood lighting in scenes.

## Usage

```ts
import { Ambilight } from '~/modules/primitives/ambilight';

const glow = new Ambilight(gpuLoader, {
  atlasName: 'scene-forest',
  spriteName: 'lantern',
});
stage.addChild(glow);
```

## Public API

| Method | Description |
|--------|-------------|
| `setSource(atlasName, spriteName)` | Swap the source + glow textures at runtime. |
| `setGlowColor(color)` | Override the glow tint (hex number). |
| `setIntensity(value)` | Set the glow alpha (0-1). |
| `update(dt)` | Per-frame tick; drives the optional sinusoidal pulse. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Source texture atlas name. |
| `spriteName` | `string` | required | Frame name within the atlas. |
| `glowColor` | `number?` | source tint | Explicit hex color; falls back to source sprite tint. |
| `blurRadius` | `number?` | `30` | Blur filter strength. |
| `intensity` | `number?` | `0.6` | Glow alpha / brightness. |
| `glowScale` | `number?` | `1.15` | Scale multiplier for glow vs source. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `blurRadius` | 30 | 5 – 60 |
| `intensity` | 0.6 | 0.1 – 1.0 |
| `glowScale` | 1.15 | 1.0 – 1.5 |
| `pulseSpeed` | 0.8 | 0.2 – 3.0 |
| `pulseAmount` | 0.1 | 0.0 – 0.3 |

## Use when

ambient glow, scene mood lighting, image highlights.
