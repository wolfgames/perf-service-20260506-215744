import { SCENE_RENDERER_DEFAULTS } from './defaults';

export const sceneRendererTuning = {
  name: 'Scene Renderer',
  defaults: SCENE_RENDERER_DEFAULTS,
  schema: {
    ambilightIntensity: { type: 'number', min: 0.1, max: 1.0, step: 0.05 },
    ambilightBlurRadius: { type: 'number', min: 5, max: 60, step: 5 },
    hotspotHighlightAlpha: { type: 'number', min: 0.1, max: 0.6, step: 0.05 },
  },
} as const;
