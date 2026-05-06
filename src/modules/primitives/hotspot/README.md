# Hotspot

Invisible interactive rectangle with a fade-in highlight overlay. Used for hidden-object hits, clickable zones, and hint targeting.

## Usage

```ts
import { Hotspot } from '~/modules/primitives/hotspot';

const hot = new Hotspot(gpuLoader, {
  hitArea: { x: 100, y: 200, width: 80, height: 80 },
  itemId: 'lantern',
  onTap: () => found('lantern'),
});
stage.addChild(hot);
```

## Public API

| Method | Description |
|--------|-------------|
| `setHighlight(visible)` | Fade highlight in/out programmatically (e.g. from a hint). |
| `setEnabled(enabled)` | Toggle interactivity; hides highlight when disabled. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

Constructor takes `gpuLoader` as first positional arg even though it is unused — kept for primitive-constructor consistency.

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `hitArea` | `{ x, y, width, height }` | required | Position and size of the interactive rect. |
| `highlightColor` | `number?` | `0xffffff` | Highlight overlay color (hex). |
| `highlightAlpha` | `number?` | `0.3` | Highlight alpha when active. |
| `pointerCursor` | `string?` | `'pointer'` | CSS cursor on hover. |
| `onTap` | `() => void?` | — | Tap/click callback. |
| `onOver` | `() => void?` | — | Pointer-over callback. |
| `onOut` | `() => void?` | — | Pointer-out callback. |
| `itemId` | `string?` | — | Identifier for game logic to read. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `highlightAlpha` | 0.3 | 0.0 – 1.0 |
| `tweenDuration` | 0.2 | 0.05 – 0.5 |
| `highlightPadding` | 4 | 0 – 16 |

## Use when

clickable zones, hidden objects, interactive areas.
