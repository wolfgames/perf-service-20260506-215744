import { COUNTDOWN_TIMER_DEFAULTS } from './defaults';

export const countdownTimerTuning = {
  name: 'Countdown Timer',
  defaults: COUNTDOWN_TIMER_DEFAULTS,
  schema: {
    fontSize: { type: 'number', min: 12, max: 48, step: 1 },
    urgencyThreshold: { type: 'number', min: 1, max: 30, step: 1 },
    urgentPulseScale: { type: 'number', min: 1, max: 1.5, step: 0.05 },
    urgentPulseDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    strokeWidth: { type: 'number', min: 0, max: 8, step: 1 },
  },
} as const;
