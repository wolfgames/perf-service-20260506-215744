# DialogueBox

9-slice speech bubble with auto-resizing Pixi text. Supports a positioned mode (anchored to screen) or inline mode (parent positions it).

## Usage

```ts
import { DialogueBox } from '~/modules/primitives/dialogue-box';

const box = new DialogueBox(gpuLoader, {
  atlasName: 'core-ui',
  spriteName: 'dialogue-bubble',
  positioning: {
    dialogueBottomPadding: 40,
    dialogueMaxWidth: 600,
    dialogueWidthPercent: 0.9,
  },
}, app.screen.width, app.screen.height);
box.setText('Hello, detective.');
stage.addChild(box);
```

## Public API

| Method | Description |
|--------|-------------|
| `setText(text)` | Update text and auto-resize the box height. |
| `resize(screenW, screenH)` | Reposition for new viewport (positioned mode only). |
| `getWidth()` | Current box width. |
| `getHeight()` | Current box height. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

Constructor takes positional args: `gpuLoader, config, screenWidth?, screenHeight?, heightScale?`.

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Texture atlas name. |
| `spriteName` | `string` | required | Frame name within the atlas. |
| `fontFamily` | `string?` | `'sans-serif'` | Font family. |
| `positioning` | `DialogueBoxPositioning?` | — | Anchored layout config; omit for inline mode. |
| `width` | `number?` | `280` | Explicit width (inline mode only). |
| `fontSize` | `number?` | `18` | Font size. |
| `textColor` | `string?` | `'#2c2c2c'` | Text fill color. |
| `lineHeight` | `number?` | `26` | Line height. |
| `textPadding` | `number?` | `40` | Horizontal text padding (each side). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `nineSliceBorder` | 20 | 5 – 50 |
| `fontSize` | 18 | 10 – 32 |
| `lineHeight` | 26 | 14 – 40 |
| `textPadding` | 40 | 10 – 80 |
| `baseHeight` | 90 | 40 – 200 |
| `minHeight` | 90 | 40 – 200 |
| `verticalPadding` | 40 | 10 – 80 |

## Use when

speech bubbles, text boxes, NPC dialogue.
