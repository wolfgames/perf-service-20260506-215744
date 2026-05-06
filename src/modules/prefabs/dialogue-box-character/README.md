# DialogueBoxCharacter

Dialogue bubble with a character sprite anchored to its left or right side, with fade show/hide.

## Composes

- `dialogue-box` — the speech bubble (uses 9-slice background + text)
- `character-sprite` — the speaker, positioned relative to the bubble bounds

## Usage

```ts
import { DialogueBoxCharacter } from '~/modules/prefabs/dialogue-box-character';

const speech = new DialogueBoxCharacter(
  gpuLoader,
  {
    dialogueConfig: {
      atlasName: 'ui',
      spriteName: 'bubble-9slice',
      width: 320,
      fontFamily: 'Inter',
    },
    characterConfig: {
      type: 'host',
      spriteMap: { host: 'char-host' },
      atlasName: 'characters',
      baseSize: { width: 200, height: 280 },
    },
    characterSide: 'left',
  },
  app.screen.width,
  app.screen.height,
);
stage.addChild(speech);

speech.setText('Welcome to the case file!');
await speech.show();
```

## Public API

| Method | Description |
|--------|-------------|
| `setText(text)` | Forward to the underlying `DialogueBox`. |
| `setCharacterAnimation(anim)` | Hook for swapping the character animation (currently a no-op slot — extend in a subclass). |
| `show()` | Fade alpha to 1. Returns `Promise<void>`. |
| `hide()` | Fade alpha to 0 and set `visible = false`. Returns `Promise<void>`. |
| `resize(width, height)` | Forward to the dialogue box and reposition the character. |
| `destroy()` | Inherited from `PixiRenderable`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dialogueConfig` | `DialogueBoxConfig` | — | Required. Forwarded to `DialogueBox`. |
| `characterConfig` | `CharacterSpriteConfig` | — | Required. Forwarded to `CharacterSprite`. |
| `characterScale` | `number` | `1` | Scale applied to the sprite. |
| `characterOffsetX` | `number` | `-20` | X offset relative to the bubble edge. |
| `characterOffsetY` | `number` | `0` | Y offset relative to the bubble center. |
| `characterSide` | `'left' \| 'right'` | `'left'` | Which side the character anchors to. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `characterScale` | `1` | 0.5 – 2 |
| `characterOffsetX` | `-20` | -100 – 100 |
| `characterOffsetY` | `0` | -100 – 100 |
| `showFadeDuration` | `0.3` | 0.05 – 1 |
| `hideFadeDuration` | `0.25` | 0.05 – 1 |

## Use when

NPC dialogue, story beats with characters.
