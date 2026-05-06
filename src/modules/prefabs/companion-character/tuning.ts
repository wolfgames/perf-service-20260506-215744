import { COMPANION_CHARACTER_DEFAULTS } from './defaults';

export const companionCharacterTuning = {
  name: 'Companion Character',
  defaults: COMPANION_CHARACTER_DEFAULTS,
  schema: {
    scale: { type: 'number', min: 0.2, max: 2, step: 0.1 },
    slideInDuration: { type: 'number', min: 0.1, max: 1.5, step: 0.05 },
    popInDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    exitDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    danceTilt: { type: 'number', min: 0, max: 0.3, step: 0.02 },
    danceSwayDuration: { type: 'number', min: 0.2, max: 1, step: 0.05 },
    danceBounceHeight: { type: 'number', min: 0, max: 10, step: 1 },
  },
} as const;
