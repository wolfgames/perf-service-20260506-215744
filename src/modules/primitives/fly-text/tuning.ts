import { FLY_TEXT_DEFAULTS } from './defaults';

export const flyTextTuning = {
  name: 'Fly Text',
  defaults: FLY_TEXT_DEFAULTS,
  schema: {
    velocityY: { type: 'number', min: -200, max: 0, step: 10 },
    velocityX: { type: 'number', min: -100, max: 100, step: 5 },
    lifetime: { type: 'number', min: 0.2, max: 3, step: 0.1 },
    fontSize: { type: 'number', min: 10, max: 48, step: 1 },
    startScale: { type: 'number', min: 0.5, max: 2, step: 0.1 },
    endScale: { type: 'number', min: 0, max: 1, step: 0.1 },
  },
} as const;
