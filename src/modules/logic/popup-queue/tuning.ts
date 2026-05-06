import { POPUP_QUEUE_DEFAULTS } from './defaults';

export const popupQueueTuning = {
  name: 'Popup Queue',
  defaults: POPUP_QUEUE_DEFAULTS,
  schema: {
    maxStacked: { type: 'number', min: 1, max: 10, step: 1 },
    defaultDurationMs: { type: 'number', min: 0, max: 10000, step: 500 },
  },
} as const;
