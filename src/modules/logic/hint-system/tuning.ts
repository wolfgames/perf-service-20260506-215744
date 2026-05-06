import { HINT_SYSTEM_DEFAULTS } from './defaults';

export const hintSystemTuning = {
  name: 'Hint System',
  defaults: HINT_SYSTEM_DEFAULTS,
  schema: {
    baseCooldownMs: { type: 'number', min: 1000, max: 30000, step: 500 },
    growthFactor: { type: 'number', min: 1.0, max: 2.0, step: 0.05 },
  },
} as const;
