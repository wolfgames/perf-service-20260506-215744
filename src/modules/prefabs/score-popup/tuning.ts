import { SCORE_POPUP_DEFAULTS } from './defaults';

export const scorePopupTuning = {
  name: 'Score Popup',
  defaults: SCORE_POPUP_DEFAULTS,
  schema: {
    celebrationDuration: { type: 'number', min: 500, max: 5000, step: 250 },
    starDelay: { type: 'number', min: 50, max: 500, step: 50 },
    badgeDelay: { type: 'number', min: 0, max: 1000, step: 100 },
    pointsFontSize: { type: 'number', min: 16, max: 48, step: 2 },
  },
} as const;
