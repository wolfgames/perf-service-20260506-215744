import { SEARCH_OBJECTS_PANEL_DEFAULTS } from './defaults';

export const searchObjectsPanelTuning = {
  name: 'Search Objects Panel',
  defaults: SEARCH_OBJECTS_PANEL_DEFAULTS,
  schema: {
    progressHeight: { type: 'number', min: 4, max: 16, step: 2 },
    panelPadding: { type: 'number', min: 4, max: 24, step: 4 },
    sectionGap: { type: 'number', min: 4, max: 24, step: 4 },
    hintButtonSize: { type: 'number', min: 32, max: 64, step: 4 },
  },
} as const;
