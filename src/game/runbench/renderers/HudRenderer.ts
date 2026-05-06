/**
 * HudRenderer — Pixi Text HUD overlay.
 *
 * Renders two text elements on the hud layer:
 *   - Distance: top-left corner (8, 8)
 *   - FPS:      top-right corner (screenWidth - 8, 8), right-anchored
 *
 * HUD height budget: <=48px (per viewport_budget.hud_top_px = 48).
 * Font size: >=16px (readability floor).
 * Color: white (#ffffff) — high contrast on dark game background.
 */

import { Text, Container } from 'pixi.js';

const HUD_FONT_SIZE = 18;
const HUD_COLOR = '#ffffff';
const HUD_Y = 8;
const HUD_MARGIN = 8;
export const HUD_HEIGHT = 48;

export interface HudRendererOptions {
  layer: Container;
  screenWidth: number;
  screenHeight: number;
}

export const createHudRenderer = ({ layer, screenWidth }: HudRendererOptions) => {
  const textStyle = {
    fontSize: HUD_FONT_SIZE,
    fill: HUD_COLOR,
    fontFamily: 'monospace',
  };

  const distanceText = new Text({ text: '0m', style: textStyle });
  distanceText.x = HUD_MARGIN;
  distanceText.y = HUD_Y;

  const fpsText = new Text({ text: '0fps', style: textStyle });
  fpsText.x = screenWidth - HUD_MARGIN;
  fpsText.y = HUD_Y;
  // Right-align FPS text: shift left by its own width
  fpsText.anchor?.set(1, 0);

  layer.addChild(distanceText);
  layer.addChild(fpsText);

  const update = ({ distanceM, fps }: { distanceM: number; fps: number }): void => {
    distanceText.text = `${Math.floor(distanceM)}m`;
    fpsText.text = `${Math.round(fps)}fps`;
  };

  const destroy = (): void => {
    distanceText.destroy();
    fpsText.destroy();
  };

  return {
    update,
    destroy,
    // Layout inspection (used by tests to verify constraints without DOM/render)
    get hudHeight() { return HUD_HEIGHT; },
    get distanceFontSize() { return HUD_FONT_SIZE; },
    get fpsFontSize() { return HUD_FONT_SIZE; },
    get distanceX() { return distanceText.x; },
    get fpsX() { return fpsText.x; },
    get screenWidth() { return screenWidth; },
  };
};
