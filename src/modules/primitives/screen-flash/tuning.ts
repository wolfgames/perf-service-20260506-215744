import { SCREEN_FLASH_DEFAULTS } from './defaults';

export const screenFlashTuning = {
  name: 'Screen Flash',
  defaults: SCREEN_FLASH_DEFAULTS,
  schema: {
    color: { type: 'color' },
    peakAlpha: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    duration: { type: 'number', min: 0.05, max: 0.5, step: 0.025 },
  },
} as const;
