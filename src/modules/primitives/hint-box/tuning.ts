import { HINT_BOX_DEFAULTS } from './defaults';

export const hintBoxTuning = {
  name: 'Hint Box',
  defaults: HINT_BOX_DEFAULTS,
  schema: {
    maxWidth: { type: 'number', min: 100, max: 400, step: 25 },
    padding: { type: 'number', min: 4, max: 32, step: 2 },
    arrowSize: { type: 'number', min: 6, max: 24, step: 2 },
    fontSize: { type: 'number', min: 10, max: 24, step: 1 },
    cornerRadius: { type: 'number', min: 0, max: 16, step: 2 },
  },
} as const;
