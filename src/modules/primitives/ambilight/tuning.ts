import { AMBILIGHT_DEFAULTS } from './defaults';

export const ambilightTuning = {
  name: 'Ambilight',
  defaults: AMBILIGHT_DEFAULTS,
  schema: {
    blurRadius: { type: 'number', min: 5, max: 60, step: 5 },
    intensity: { type: 'number', min: 0.1, max: 1.0, step: 0.05 },
    glowScale: { type: 'number', min: 1.0, max: 1.5, step: 0.05 },
    pulseSpeed: { type: 'number', min: 0.2, max: 3.0, step: 0.1 },
    pulseAmount: { type: 'number', min: 0.0, max: 0.3, step: 0.02 },
  },
} as const;
