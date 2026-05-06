import { HOTSPOT_DEFAULTS } from './defaults';

export const hotspotTuning = {
  name: 'Hotspot',
  defaults: HOTSPOT_DEFAULTS,
  schema: {
    highlightAlpha: { type: 'number', min: 0.0, max: 1.0, step: 0.05 },
    tweenDuration: { type: 'number', min: 0.05, max: 0.5, step: 0.05 },
    highlightPadding: { type: 'number', min: 0, max: 16, step: 1 },
  },
} as const;
