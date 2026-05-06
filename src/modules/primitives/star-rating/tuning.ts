import { STAR_RATING_DEFAULTS } from './defaults';

export const starRatingTuning = {
  name: 'Star Rating',
  defaults: STAR_RATING_DEFAULTS,
  schema: {
    starSize: { type: 'number', min: 16, max: 64, step: 4 },
    gap: { type: 'number', min: 0, max: 16, step: 1 },
    punchScale: { type: 'number', min: 1.0, max: 2.0, step: 0.1 },
    punchDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
  },
} as const;
