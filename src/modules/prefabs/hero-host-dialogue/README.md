# HeroHostDialogue

Full-body host character with an adjacent speech bubble, anchored at bottom-center, with slide-up + pop-in entrance and tap-to-dismiss.

> **Note:** Currently NOT registered in `src/modules/INDEX.md` — orphan prefab on disk.

## Composes

- `character-sprite` — full-body host, scaled by `characterScale`
- `dialogue-box` — speech bubble positioned to the right of the character
- Pixi `Graphics` for the invisible click-area covering both children

## Usage

```ts
import { HeroHostDialogue } from '~/modules/prefabs/hero-host-dialogue';

const host = new HeroHostDialogue(gpuLoader, {
  character: {
    type: 'host',
    spriteMap: { host: 'char-host' },
    atlasName: 'characters',
    baseSize: { width: 200, height: 280 },
  },
  dialogue: {
    atlasName: 'ui',
    spriteName: 'bubble-9slice',
    fontFamily: 'Inter',
  },
});
stage.addChild(host);

host.show(
  'Tap any object you find!',
  app.screen.width,
  app.screen.height,
  4000,
  () => console.log('dismissed'),
);
```

## Public API

| Method | Description |
|--------|-------------|
| `show(text, screenWidth, screenHeight, displayDuration, onDismiss)` | Position at bottom-center, slide character up, pop dialogue in, auto-dismiss after `displayDuration` ms. |
| `dismiss()` | Fade out and fire the dismiss callback. |
| `destroy()` | Kills tweens on self, character, and dialogue scale; clears auto-dismiss timer; destroys children. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `character` | `CharacterSpriteConfig` | — | Required. Forwarded to `CharacterSprite`. |
| `dialogue` | `Pick<DialogueBoxConfig, 'atlasName' \| 'spriteName' \| 'fontFamily'>` | — | Required. |
| `characterScale` | `number` | `1` | Scale applied to the host sprite. |
| `dialogGap` | `number` | `12` | Gap between character and bubble. |
| `dialogWidth` | `number` | `320` | Bubble width. |
| `bottomPadding` | `number` | `40` | Distance from screen bottom. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `characterScale` | `1` | 0.3 – 2 |
| `dialogGap` | `12` | 0 – 32 |
| `dialogWidth` | `320` | 200 – 500 |
| `fontSize` | `18` | 12 – 28 |
| `lineHeight` | `26` | 16 – 40 |
| `textPadding` | `24` | 10 – 48 |
| `showScaleDuration` | `0.4` | 0.1 – 1 |
| `showFadeDuration` | `0.2` | 0.05 – 0.5 |
| `showSlideOffset` | `30` | 0 – 60 |
| `hideDuration` | `0.25` | 0.05 – 0.5 |
| `bottomPadding` | `40` | 10 – 80 |

## Use when

tutorial hosts, narrative moments, FTUE guidance.
