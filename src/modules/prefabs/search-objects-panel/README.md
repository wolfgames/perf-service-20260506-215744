# SearchObjectsPanel

Hidden-object HUD sidebar: progress bar on top, evidence list area in the middle, hint button with circular cooldown overlay at the bottom.

## Composes

- `sprite-button` — the hint button at the bottom
- Pixi `Graphics` for the progress bar track + fill and the radial cooldown sweep over the hint button
- An empty `PixiRenderable` slot for an external evidence list to be parented in (the panel forwards `markEvidenceFound` to any child exposing `markFound`)

## Usage

```ts
import { SearchObjectsPanel } from '~/modules/prefabs/search-objects-panel';

const panel = new SearchObjectsPanel(gpuLoader, {
  evidenceListConfig: {
    atlasName: 'evidence',
    items: [
      { id: 'key',  spriteName: 'item-key',  label: 'Key' },
      { id: 'note', spriteName: 'item-note', label: 'Note' },
    ],
  },
  atlasName: 'ui',
  hintButtonSpriteName: 'btn-hint',
  progress: 0.4,
  onHintClick: () => hintSystem.requestHint(),
});
stage.addChild(panel);
panel.resize(220, app.screen.height);

panel.setProgress(0.66);
panel.setHintCooldown(0.5);
panel.markEvidenceFound('key');
```

## Public API

| Method | Description |
|--------|-------------|
| `setProgress(value)` | Set the progress bar fill. Clamped to 0..1. |
| `setHintEnabled(bool)` | Enable / disable the hint button. |
| `setHintCooldown(progress)` | Draw the radial sweep overlay on the hint button. 0 = empty, 1 = full. |
| `markEvidenceFound(itemId)` | Forward to the first child of the evidence container exposing `markFound`. |
| `resize(width, _height)` | Recalculate progress bar width to fit the new panel width. |
| `destroy()` | Inherited from `PixiRenderable`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `evidenceListConfig` | `EvidenceListConfig` | — | Required. Forwarded shape for the evidence list slot. |
| `atlasName` | `string` | — | Required. Atlas for the hint button sprite. |
| `hintButtonSpriteName` | `string` | — | Required. Frame name for the hint button. |
| `progress` | `number` | — | Required. Initial progress value 0..1. |
| `hintEnabled` | `boolean` | `true` | Whether the hint button starts interactive. |
| `onHintClick` | `() => void` | — | Hint button tap handler. |
| `hintCooldownProgress` | `number` | — | Initial cooldown overlay value 0..1. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `progressHeight` | `8` | 4 – 16 |
| `panelPadding` | `12` | 4 – 24 |
| `sectionGap` | `12` | 4 – 24 |
| `hintButtonSize` | `44` | 32 – 64 |

## Use when

hidden object HUD, search game sidebars.
