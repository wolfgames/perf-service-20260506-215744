import { SCREEN_SHAKE_DEFAULTS } from './defaults';

export const screenShakeTuning = {
  name: 'Screen Shake',
  defaults: SCREEN_SHAKE_DEFAULTS,
  schema: {
    lightIntensity: { type: 'number', min: 1, max: 6, step: 0.5 },
    mediumIntensity: { type: 'number', min: 2, max: 10, step: 0.5 },
    heavyIntensity: { type: 'number', min: 3, max: 16, step: 0.5 },
    stepDuration: { type: 'number', min: 0.01, max: 0.05, step: 0.005 },
    steps: { type: 'number', min: 3, max: 15, step: 2 },
    yRatio: { type: 'number', min: 0, max: 1, step: 0.1 },
  },
} as const;
