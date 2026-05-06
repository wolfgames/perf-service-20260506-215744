import { SCENE_NAVIGATION_DEFAULTS } from './defaults';

export const sceneNavigationTuning = {
  name: 'Scene Navigation',
  defaults: SCENE_NAVIGATION_DEFAULTS,
  schema: {
    transitionDurationMs: { type: 'number', min: 0, max: 1000, step: 50 },
  },
} as const;
