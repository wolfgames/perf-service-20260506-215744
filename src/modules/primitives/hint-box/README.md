# HintBox

Callout bubble with directional arrow and word-wrapped text. Falls back to a Graphics rounded rect when no atlas/sprite is supplied.

## Usage

```ts
import { HintBox } from '~/modules/primitives/hint-box';

const hint = new HintBox(gpuLoader, {
  text: 'Tap the lantern to light it.',
  arrowDirection: 'down',
});
stage.addChild(hint);
hint.show();
```

## Public API

| Method | Description |
|--------|-------------|
| `setText(text)` | Update text content and re-layout. |
| `setArrowDirection(dir)` | Move the arrow to a different edge. |
| `show()` | Fade in. Returns `Promise<void>`. |
| `hide()` | Fade out. Returns `Promise<void>`. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | `string` | required | Callout text. |
| `arrowDirection` | `'up' \| 'down' \| 'left' \| 'right'` | required | Edge the arrow sits on / points away from. |
| `atlasName` | `string?` | — | Atlas for the 9-slice bubble; omit to use Graphics fallback. |
| `bubbleSpriteName` | `string?` | — | Frame name for the 9-slice bubble. |
| `fontFamily` | `string?` | `'Arial'` | Font family. |
| `fontSize` | `number?` | `14` | Font size. |
| `maxWidth` | `number?` | `200` | Word-wrap width in px. |
| `textColor` | `number?` | `0xffffff` | Text fill (hex). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `maxWidth` | 200 | 100 – 400 |
| `padding` | 16 | 4 – 32 |
| `arrowSize` | 12 | 6 – 24 |
| `fontSize` | 14 | 10 – 24 |
| `cornerRadius` | 8 | 0 – 16 |

## Use when

tutorial hints, contextual tips, callout arrows.
