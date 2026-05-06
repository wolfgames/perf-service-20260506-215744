import { HERO_HOST_DIALOGUE_DEFAULTS } from './defaults';

export const heroHostDialogueTuning = {
  name: 'Hero Host Dialogue',
  defaults: HERO_HOST_DIALOGUE_DEFAULTS,
  schema: {
    characterScale: { type: 'number', min: 0.3, max: 2, step: 0.1 },
    dialogGap: { type: 'number', min: 0, max: 32, step: 2 },
    dialogWidth: { type: 'number', min: 200, max: 500, step: 10 },
    fontSize: { type: 'number', min: 12, max: 28, step: 1 },
    lineHeight: { type: 'number', min: 16, max: 40, step: 1 },
    textPadding: { type: 'number', min: 10, max: 48, step: 2 },
    showScaleDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    showFadeDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
    showSlideOffset: { type: 'number', min: 0, max: 60, step: 5 },
    hideDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
    bottomPadding: { type: 'number', min: 10, max: 80, step: 5 },
  },
} as const;
