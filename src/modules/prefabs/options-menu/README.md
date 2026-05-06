# OptionsMenu

Vertical settings panel rendered in Pixi: button, toggle, and slider rows inside a rounded-rect background, with a top-right close button.

## Composes

- `sprite-button` — used for `'button'`-type rows (one per row)
- Pixi `Graphics` + `Text` for the background panel, title, toggle switches, slider tracks/thumbs, and the close-X icon

## Usage

```ts
import { OptionsMenu } from '~/modules/prefabs/options-menu';

const menu = new OptionsMenu(gpuLoader, {
  atlasName: 'ui',
  buttonSpriteName: 'btn-row',
  title: 'Settings',
  onClose: () => menu.parent?.removeChild(menu),
  items: [
    { type: 'toggle', label: 'Music', value: true, onChange: (v) => audio.setMusic(v) },
    { type: 'slider', label: 'Volume', value: 0.8, min: 0, max: 1, step: 0.05, onChange: (v) => audio.setVolume(v) },
    { type: 'button', label: 'Reset Progress', onClick: () => progress.reset() },
  ],
});
menu.x = app.screen.width / 2;
menu.y = app.screen.height / 2;
stage.addChild(menu);
```

## Public API

| Method | Description |
|--------|-------------|
| `destroy()` | Inherited from `PixiRenderable`; tears down children, listeners, and tweens. |

(All interactive behavior is wired through the `onClick`, `onChange`, and `onClose` callbacks supplied at construction.)

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `MenuItemDef[]` | — | Required. Each item is `{ type: 'button' \| 'toggle' \| 'slider', label, ... }`. |
| `atlasName` | `string` | — | Required. Atlas containing the button background sprite. |
| `buttonSpriteName` | `string` | — | Required. 9-slice frame for `'button'`-type rows. |
| `onClose` | `() => void` | — | Fired when the X icon is tapped. |
| `width` | `number` | `280` | Panel width. |
| `title` | `string` | — | Optional bold title at the top of the panel. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `width` | `280` | 200 – 400 |
| `itemHeight` | `48` | 32 – 64 |
| `itemGap` | `8` | 0 – 16 |
| `padding` | `16` | 8 – 32 |

## Use when

settings menus, in-game options.
