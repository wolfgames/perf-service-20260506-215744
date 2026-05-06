# TransitionWipe

Full-screen overlay for scene transitions. Supports `fade`, `iris-in` (open from closed), and `iris-out` (close from open) modes; blocks input while visible.

## Usage

```ts
import { TransitionWipe } from '~/modules/primitives/transition-wipe';

const wipe = new TransitionWipe({
  screenWidth: app.screen.width,
  screenHeight: app.screen.height,
});
stage.addChild(wipe);
await wipe.transitionIn('iris-out');
loadNextScene();
await wipe.transitionOut('iris-in');
```

## Public API

| Method | Description |
|--------|-------------|
| `transitionIn(mode?, duration?, ease?)` | Show the overlay. Returns `Promise<void>`. |
| `transitionOut(mode?, duration?, ease?)` | Hide the overlay. Returns `Promise<void>`. |
| `resize(width, height)` | Resize for new viewport. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

`mode` is `'fade' | 'iris-in' | 'iris-out'`.

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `screenWidth` | `number` | required | Overlay width. |
| `screenHeight` | `number` | required | Overlay height. |
| `color` | `number?` | `0x000000` | Overlay fill color (hex). |
| `maxAlpha` | `number?` | `0.6` | Peak alpha during fade. |
| `blockInput` | `boolean?` | `true` | Capture pointer events while visible. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `color` | 0x000000 | color |
| `duration` | 0.3 | 0.1 – 2 |
| `maxAlpha` | 0.6 | 0.1 – 1 |

## Use when

scene transitions, screen changes, dramatic reveals.
