import { SCENE_THUMBNAIL_DEFAULTS } from './defaults';

export const sceneThumbnailTuning = {
  name: 'Scene Thumbnail',
  defaults: SCENE_THUMBNAIL_DEFAULTS,
  schema: {
    size: { type: 'number', min: 32, max: 128, step: 8 },
    borderWidth: { type: 'number', min: 1, max: 6, step: 1 },
    lockedOverlayAlpha: { type: 'number', min: 0.3, max: 1.0, step: 0.05 },
    revealDuration: { type: 'number', min: 0.1, max: 0.8, step: 0.05 },
    selectedScale: { type: 'number', min: 1.0, max: 1.3, step: 0.05 },
  },
} as const;
