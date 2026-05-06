import { TUTORIAL_HAND_DEFAULTS } from './defaults';

export const tutorialHandTuning = {
  name: 'Tutorial Hand',
  defaults: TUTORIAL_HAND_DEFAULTS,
  schema: {
    restScale: { type: 'number', min: 0.3, max: 1.5, step: 0.05 },
    tapPressScale: { type: 'number', min: 0.3, max: 1, step: 0.05 },
    startOffsetY: { type: 'number', min: 10, max: 80, step: 5 },
    fadeInDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    fadeOutDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    waitBeforeTap: { type: 'number', min: 0, max: 1, step: 0.05 },
    tapPressDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
    tapHoldDuration: { type: 'number', min: 0, max: 0.5, step: 0.05 },
    tapReleaseDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
    backOffDistance: { type: 'number', min: 0, max: 60, step: 5 },
    waitBetweenTaps: { type: 'number', min: 0, max: 2, step: 0.1 },
  },
} as const;
