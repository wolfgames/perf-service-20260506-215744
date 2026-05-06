# CharacterSprite

Generic character container that renders a frame from an atlas via a type-to-frame map.

## Usage

```ts
import { CharacterSprite } from '~/modules/primitives/character-sprite';

const npc = new CharacterSprite(gpuLoader, {
  type: 'detective',
  spriteMap: { detective: 'char-detective', witness: 'char-witness' },
  atlasName: 'core-characters',
  baseSize: { width: 200, height: 320 },
}, 1);
stage.addChild(npc);
```

## Public API

| Method | Description |
|--------|-------------|
| `setScale(scale)` | Resize relative to `baseSize`. |
| `getScale()` | Current scale factor. |
| `getSprite()` | Return inner Pixi `Sprite` (for custom positioning, e.g. head crops). |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `T extends string` | required | Character type identifier (key into `spriteMap`). |
| `spriteMap` | `Record<T, string>` | required | Maps each type to its atlas frame name. |
| `atlasName` | `string` | required | Texture atlas name. |
| `baseSize` | `{ width, height }` | required | Reference dimensions used for scale math. |

Constructor takes a third positional arg: `scale: number = 1`.

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `anchor` | 0.5 | 0 – 1 |
| `scale` | 1 | 0.1 – 3 |

## Use when

any character on screen, NPCs, avatars.
