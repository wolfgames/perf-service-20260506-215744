# EvidenceList

Vertical scrollable list of evidence items, each rendered as a `SceneThumbnail` + label, with found/unfound visual states.

## Composes

- `scene-thumbnail` — one per evidence row; receives the row's tap handler
- Pixi `Graphics` for the scroll mask and the invisible drag/wheel hit area
- Pixi `Text` for each row label

## Usage

```ts
import { EvidenceList } from '~/modules/prefabs/evidence-list';

const list = new EvidenceList(gpuLoader, {
  items: [
    { itemId: 'key', label: 'Brass Key', atlasName: 'evidence', spriteName: 'item-key', isFound: false },
    { itemId: 'note', label: 'Torn Note', atlasName: 'evidence', spriteName: 'item-note', isFound: true },
  ],
  maxHeight: 240,
  thumbnailSize: 48,
  onItemClick: (id) => console.log('tapped', id),
});
stage.addChild(list);

list.markFound('key');
console.log(`${list.foundCount}/${list.totalCount}`);
```

## Public API

| Method | Description |
|--------|-------------|
| `markFound(itemId)` | Tween thumbnail + label to the found visual state. No-op if already found. |
| `getItem(itemId)` | Return the `EvidenceItemDef` for `itemId` or `undefined`. |
| `foundCount` | Getter. Number of items currently marked as found. |
| `totalCount` | Getter. Total number of items. |
| `destroy()` | Inherited from `PixiRenderable`. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `EvidenceItemDef[]` | — | Required. Each item: `itemId`, `label`, `atlasName`, `spriteName`, `isFound`. |
| `onItemClick` | `(itemId: string) => void` | — | Forwarded to each `SceneThumbnail`. |
| `maxHeight` | `number` | `300` | Scroll cutoff; mask + drag/wheel apply when content exceeds this. |
| `thumbnailSize` | `number` | `48` | Square pixel size of each row's thumbnail. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `thumbnailSize` | `48` | 32 – 80 |
| `gap` | `8` | 4 – 16 |
| `unfoundAlpha` | `0.4` | 0.1 – 0.8 |
| `maxHeight` | `300` | 100 – 600 |

## Use when

hidden object evidence panels, collectible lists.
