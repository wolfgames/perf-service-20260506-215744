import { DIALOGUE_BOX_CHARACTER_DEFAULTS } from './defaults';

export const dialogueBoxCharacterTuning = {
  name: 'Dialogue Box Character',
  defaults: DIALOGUE_BOX_CHARACTER_DEFAULTS,
  schema: {
    characterScale: { type: 'number', min: 0.5, max: 2.0, step: 0.1 },
    characterOffsetX: { type: 'number', min: -100, max: 100, step: 5 },
    characterOffsetY: { type: 'number', min: -100, max: 100, step: 5 },
    showFadeDuration: { type: 'number', min: 0.05, max: 1, step: 0.05 },
    hideFadeDuration: { type: 'number', min: 0.05, max: 1, step: 0.05 },
  },
} as const;
