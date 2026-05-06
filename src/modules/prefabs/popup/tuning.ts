import { POPUP_DEFAULTS } from './defaults';

export const popupTuning = {
  name: 'Popup',
  defaults: POPUP_DEFAULTS,
  schema: {
    autoDismissMs: { type: 'number', min: 0, max: 15000, step: 500 },
    showDelay: { type: 'number', min: 0, max: 2, step: 0.1 },
  },
} as const;
