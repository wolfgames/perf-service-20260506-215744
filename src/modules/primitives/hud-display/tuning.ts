import { HUD_DISPLAY_DEFAULTS } from './defaults';

export const hudDisplayTuning = {
  name: 'HUD Display',
  defaults: HUD_DISPLAY_DEFAULTS,
  schema: {
    fontSize: { type: 'number', min: 10, max: 36, step: 1 },
    strokeWidth: { type: 'number', min: 0, max: 8, step: 1 },
    spacing: { type: 'number', min: 10, max: 50, step: 2 },
    horizontalGap: { type: 'number', min: 40, max: 200, step: 10 },
  },
} as const;
