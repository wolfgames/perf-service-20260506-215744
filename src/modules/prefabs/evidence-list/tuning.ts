import { EVIDENCE_LIST_DEFAULTS } from './defaults';

export const evidenceListTuning = {
  name: 'Evidence List',
  defaults: EVIDENCE_LIST_DEFAULTS,
  schema: {
    thumbnailSize: { type: 'number', min: 32, max: 80, step: 4 },
    gap: { type: 'number', min: 4, max: 16, step: 2 },
    unfoundAlpha: { type: 'number', min: 0.1, max: 0.8, step: 0.05 },
    maxHeight: { type: 'number', min: 100, max: 600, step: 50 },
  },
} as const;
