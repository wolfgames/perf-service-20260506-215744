import { TOAST_SLIDE_DEFAULTS } from './defaults';

export const toastSlideTuning = {
  name: 'Toast Slide',
  defaults: TOAST_SLIDE_DEFAULTS,
  schema: {
    slideDistance: { type: 'number', min: 16, max: 128, step: 8 },
    slideDuration: { type: 'number', min: 0.1, max: 0.8, step: 0.05 },
    width: { type: 'number', min: 150, max: 500, step: 25 },
    padding: { type: 'number', min: 4, max: 24, step: 2 },
    fontSize: { type: 'number', min: 10, max: 24, step: 1 },
  },
} as const;
