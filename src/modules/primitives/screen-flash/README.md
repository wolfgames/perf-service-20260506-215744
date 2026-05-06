# ScreenFlash

Full-screen color overlay that ramps to a peak alpha and back to zero. Reusable — call `flash()` repeatedly, stays invisible between fires.

## Usage

```ts
import { ScreenFlash } from '~/modules/primitives/screen-flash';

const flash = new ScreenFlash({
  screenWidth: app.screen.width,
  screenHeight: app.screen.height,
});
stage.addChild(flash);
await flash.flash(0xff0000, 0.6, 0.15);
```

## Public API

| Method | Description |
|--------|-------------|
| `flash(color?, peakAlpha?, duration?)` | Run a flash. Returns `Promise<void>` that resolves on completion. |
| `resize(width, height)` | Resize to a new viewport. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `screenWidth` | `number` | required | Overlay width. |
| `screenHeight` | `number` | required | Overlay height. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `color` | 0xffffff | color |
| `peakAlpha` | 0.6 | 0.1 – 1 |
| `duration` | 0.15 | 0.05 – 0.5 |

## Use when

match clears, power-ups, hit flash, damage flash.
