# CompanionCharacter

A `CharacterSprite` wrapped with entrance/exit animation presets (`slideIn`, `popIn`, `exit`) and a looping pendulum dance.

## Composes

- `character-sprite` — the underlying sprite, scaled at construction

## Usage

```ts
import { CompanionCharacter } from '~/modules/prefabs/companion-character';

const buddy = new CompanionCharacter(gpuLoader, {
  character: {
    type: 'fox',
    spriteMap: { fox: 'char-fox' },
    atlasName: 'characters',
    baseSize: { width: 200, height: 280 },
  },
  scale: 0.8,
});
stage.addChild(buddy);

await buddy.popIn(app.screen.width / 2, app.screen.height * 0.7);
buddy.startDance();
// ...
buddy.stopDance();
await buddy.exit();
```

## Public API

| Method | Description |
|--------|-------------|
| `getCharacterSprite()` | Return the underlying `CharacterSprite` for direct manipulation. |
| `slideIn(fromX, toX, y)` | Slide horizontally to `(toX, y)` from `fromX`. Returns `Promise<void>`. |
| `popIn(x, y)` | Scale from 0 to 1 at `(x, y)` with `back.out`. Returns `Promise<void>`. |
| `exit()` | Fade alpha to 0 and hide. Returns `Promise<void>`. |
| `startDance()` | Begin a looping rotation+bounce sway. No-op if already dancing. |
| `stopDance()` | Kill the dance timeline and reset rotation. |
| `destroy()` | Inherited from `PixiRenderable`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `character` | `CharacterSpriteConfig` | — | Required. Forwarded to `CharacterSprite`. |
| `scale` | `number` | `1` | Display scale multiplier. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `scale` | `1` | 0.2 – 2 |
| `slideInDuration` | `0.5` | 0.1 – 1.5 |
| `popInDuration` | `0.4` | 0.1 – 1 |
| `exitDuration` | `0.3` | 0.1 – 1 |
| `danceTilt` | `0.12` | 0 – 0.3 |
| `danceSwayDuration` | `0.5` | 0.2 – 1 |
| `danceBounceHeight` | `3` | 0 – 10 |

## Use when

tutorial hosts, narrative companions, celebration characters.
