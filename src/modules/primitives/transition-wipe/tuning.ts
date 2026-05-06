import { TRANSITION_WIPE_DEFAULTS } from './defaults';

export const transitionWipeTuning = {
  name: 'Transition Wipe',
  defaults: TRANSITION_WIPE_DEFAULTS,
  schema: {
    color: { type: 'color' },
    duration: { type: 'number', min: 0.1, max: 2, step: 0.05 },
    maxAlpha: { type: 'number', min: 0.1, max: 1, step: 0.05 },
  },
} as const;
