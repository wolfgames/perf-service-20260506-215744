# TileGrid

2D grid of rounded-rect cells with optional labels and tap callbacks. Cells are managed by `(col, row)` coordinates.

## Usage

```ts
import { TileGrid } from '~/modules/primitives/tile-grid';

const grid = new TileGrid({
  cols: 6,
  rows: 8,
  interactive: true,
  onCellTap: (c, r) => console.log('tapped', c, r),
});
stage.addChild(grid);
grid.setCellColor(2, 3, 0xff0000);
grid.setCellLabel(2, 3, '5');
```

## Public API

| Method | Description |
|--------|-------------|
| `setCellColor(col, row, color)` | Recolor one cell. |
| `setCellLabel(col, row, text, color?)` | Set / update a cell text label. |
| `clearCell(col, row)` | Reset cell to default color and remove label. |
| `getCellCenter(col, row)` | Return `{x, y}` of a cell's center (in parent space). |
| `gridWidth` (get) | Total grid width including padding. |
| `gridHeight` (get) | Total grid height including padding. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `cols` | `number` | required | Column count. |
| `rows` | `number` | required | Row count. |
| `cellSize` | `number?` | `48` | Cell edge size in px. |
| `cellGap` | `number?` | `2` | Gap between cells. |
| `cellRadius` | `number?` | `6` | Cell corner radius. |
| `defaultColor` | `number?` | `0x333333` | Default cell fill (hex). |
| `showBackground` | `boolean?` | `true` | Render the rounded background panel. |
| `interactive` | `boolean?` | `false` | Make cells interactive. |
| `onCellTap` | `(col, row) => void?` | — | Cell tap callback. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `cellSize` | 48 | 16 – 96 |
| `cellGap` | 2 | 0 – 8 |
| `cellRadius` | 6 | 0 – 16 |
| `borderWidth` | 0 | 0 – 4 |
| `backgroundRadius` | 12 | 0 – 24 |
| `backgroundPadding` | 8 | 0 – 20 |

## Use when

match-3 boards, puzzle grids, color grids, tile games.
