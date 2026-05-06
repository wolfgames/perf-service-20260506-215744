import { COMMENDATION_BADGE_DEFAULTS } from './defaults';

export const commendationBadgeTuning = {
  name: 'Commendation Badge',
  defaults: COMMENDATION_BADGE_DEFAULTS,
  schema: {
    dropDuration: { type: 'number', min: 0.1, max: 1.0, step: 0.05 },
    sparkleCount: { type: 'number', min: 0, max: 20, step: 1 },
    sparkleDuration: { type: 'number', min: 0.2, max: 1.5, step: 0.1 },
    sparkleSpread: { type: 'number', min: 10, max: 100, step: 5 },
  },
} as const;
