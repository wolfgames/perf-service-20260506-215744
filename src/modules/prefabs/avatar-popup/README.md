# AvatarPopup

Circular masked character head + adjacent dialogue bubble, positioned above a grid with auto-dismiss and tap-to-dismiss.

## Composes

- `character-sprite` — the head, scaled and offset so it sits inside the circle
- `dialogue-box` — the speech bubble to the right of the avatar
- Pixi `Graphics` for the circular mask, border ring, and invisible click-area

## Usage

```ts
import { AvatarPopup } from '~/modules/prefabs/avatar-popup';

const popup = new AvatarPopup(gpuLoader, {
  character: {
    type: 'detective',
    spriteMap: { detective: 'char-detective' },
    atlasName: 'characters',
    baseSize: { width: 200, height: 280 },
  },
  dialogue: {
    atlasName: 'ui',
    spriteName: 'bubble-9slice',
    fontFamily: 'Inter',
  },
});
stage.addChild(popup);

popup.show('Look behind the bookshelf!', app.screen.width, gridTopY, 3000, () => {
  console.log('dismissed');
});
```

## Public API

| Method | Description |
|--------|-------------|
| `show(text, screenWidth, gridTop, displayDuration, onDismiss)` | Position above the grid, scale-pop in, auto-dismiss after `displayDuration` ms. |
| `dismiss()` | Fade + shrink out and fire the dismiss callback. Safe to tap-trigger. |
| `destroy()` | Clears the auto-dismiss timer and tears down children. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `character` | `CharacterSpriteConfig` | — | Required. Forwarded to `CharacterSprite`. |
| `dialogue` | `Pick<DialogueBoxConfig, 'atlasName' \| 'spriteName' \| 'fontFamily'>` | — | Required. Bubble sprite + font. |
| `circleSize` | `number` | `64` | Avatar circle diameter. |
| `borderWidth` | `number` | `4` | Ring stroke width. |
| `borderColor` | `number` | `0x4a3728` | Ring stroke color. |
| `dialogWidth` | `number` | `280` | Bubble width in pixels. |
| `dialogGap` | `number` | `8` | Gap between circle and bubble. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `circleSize` | `64` | 32 – 128 |
| `borderWidth` | `4` | 0 – 10 |
| `borderColor` | `0x4a3728` | color |
| `dialogWidth` | `280` | 150 – 400 |
| `dialogGap` | `8` | 0 – 24 |
| `dialogMinHeight` | `70` | 40 – 120 |
| `fontSize` | `16` | 10 – 24 |
| `lineHeight` | `22` | 14 – 36 |
| `showScaleDuration` | `0.35` | 0.1 – 1 |
| `showFadeDuration` | `0.15` | 0.05 – 0.5 |
| `hideDuration` | `0.2` | 0.05 – 0.5 |
| `hideScale` | `0.8` | 0.5 – 1 |
| `gridSpacing` | `16` | 0 – 40 |

## Use when

character speech, notification popups, tooltips.
