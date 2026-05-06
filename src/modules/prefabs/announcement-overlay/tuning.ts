import { ANNOUNCEMENT_OVERLAY_DEFAULTS } from './defaults';

export const announcementOverlayTuning = {
  name: 'Announcement Overlay',
  defaults: ANNOUNCEMENT_OVERLAY_DEFAULTS,
  schema: {
    backdropColor: { type: 'color' },
    backdropAlpha: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    backdropFadeDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    headlineFontSize: { type: 'number', min: 16, max: 48, step: 1 },
    headlineBgColor: { type: 'color' },
    headlineBgRadius: { type: 'number', min: 0, max: 24, step: 2 },
    headlinePadX: { type: 'number', min: 10, max: 60, step: 5 },
    headlinePadY: { type: 'number', min: 4, max: 24, step: 2 },
    popInDuration: { type: 'number', min: 0.1, max: 1, step: 0.05 },
    stagger: { type: 'number', min: 0, max: 0.3, step: 0.02 },
    headlineYPercent: { type: 'number', min: 0.05, max: 0.3, step: 0.01 },
    buttonYPercent: { type: 'number', min: 0.7, max: 0.95, step: 0.01 },
  },
} as const;
