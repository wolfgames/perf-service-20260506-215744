import { TILE_GRID_DEFAULTS } from './defaults';

export const tileGridTuning = {
  name: 'Tile Grid',
  defaults: TILE_GRID_DEFAULTS,
  schema: {
    cellSize: { type: 'number', min: 16, max: 96, step: 4 },
    cellGap: { type: 'number', min: 0, max: 8, step: 1 },
    cellRadius: { type: 'number', min: 0, max: 16, step: 1 },
    borderWidth: { type: 'number', min: 0, max: 4, step: 0.5 },
    backgroundRadius: { type: 'number', min: 0, max: 24, step: 2 },
    backgroundPadding: { type: 'number', min: 0, max: 20, step: 2 },
  },
} as const;
