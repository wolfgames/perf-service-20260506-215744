import { ROTATABLE_TILE_DEFAULTS } from './defaults';

export const rotatableTileTuning = {
  name: 'Rotatable Tile',
  defaults: ROTATABLE_TILE_DEFAULTS,
  schema: {
    tileSize: { type: 'number', min: 24, max: 128, step: 4 },
    overlapPx: { type: 'number', min: 0, max: 4, step: 1 },
    rotationDurationMs: { type: 'number', min: 50, max: 500, step: 25 },
    jiggleAngle: { type: 'number', min: 2, max: 20, step: 1 },
    jiggleHalfDuration: { type: 'number', min: 0.02, max: 0.2, step: 0.01 },
    jiggleCycles: { type: 'number', min: 1, max: 5, step: 1 },
    jiggleFlashIntensity: { type: 'number', min: 0, max: 1, step: 0.05 },
  },
} as const;
