import { OPTIONS_MENU_DEFAULTS } from './defaults';

export const optionsMenuTuning = {
  name: 'Options Menu',
  defaults: OPTIONS_MENU_DEFAULTS,
  schema: {
    width: { type: 'number', min: 200, max: 400, step: 20 },
    itemHeight: { type: 'number', min: 32, max: 64, step: 4 },
    itemGap: { type: 'number', min: 0, max: 16, step: 2 },
    padding: { type: 'number', min: 8, max: 32, step: 4 },
  },
} as const;
