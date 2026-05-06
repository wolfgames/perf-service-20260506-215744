import { EVIDENCE_TRACKER_DEFAULTS } from './defaults';

export const evidenceTrackerTuning = {
  name: 'Evidence Tracker',
  defaults: EVIDENCE_TRACKER_DEFAULTS,
  schema: {
    maxActiveClues: { type: 'number', min: 1, max: 10, step: 1 },
  },
} as const;
