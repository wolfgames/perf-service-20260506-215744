import { Graphics } from 'pixi.js';
import gsap from 'gsap';
import { PixiRenderable } from '../../_base';
import { SCREEN_FLASH_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a ScreenFlash
 */
export interface ScreenFlashConfig {
  /** Screen width */
  screenWidth: number;
  /** Screen height */
  screenHeight: number;
}

/**
 * ScreenFlash — full-screen flash overlay that ramps up then back down.
 *
 * Used for hit feedback, power-up activation, match clears, etc.
 * Reusable: call flash() multiple times with different colors/intensities.
 * Stays invisible between flashes — zero overhead when idle.
 */
export class ScreenFlash extends PixiRenderable {
  private overlay: Graphics;
  private screenWidth: number;
  private screenHeight: number;

  constructor(config: ScreenFlashConfig) {
    super('screen-flash');

    this.screenWidth = config.screenWidth;
    this.screenHeight = config.screenHeight;

    this.overlay = new Graphics();
    this.drawOverlay(SCREEN_FLASH_DEFAULTS.color);
    this.overlay.alpha = 0;
    this.overlay.visible = false;

    this.addChild(this.overlay);
  }

  /**
   * Fire a flash. Ramps to peakAlpha then back to 0.
   * @returns Promise that resolves when the flash is complete.
   */
  async flash(color?: number, peakAlpha?: number, duration?: number): Promise<void> {
    const d = SCREEN_FLASH_DEFAULTS;
    const c = color ?? d.color;
    const alpha = peakAlpha ?? d.peakAlpha;
    const dur = duration ?? d.duration;

    this.drawOverlay(c);
    this.overlay.alpha = 0;
    this.overlay.visible = true;

    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha,
        duration: dur / 2,
        yoyo: true,
        repeat: 1,
        ease: d.ease,
        onComplete: () => {
          this.overlay.visible = false;
          this.overlay.alpha = 0;
          resolve();
        },
      });
    });
  }

  override resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.drawOverlay(SCREEN_FLASH_DEFAULTS.color);
  }

  private drawOverlay(color: number): void {
    this.overlay.clear();
    this.overlay.rect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.fill({ color });
  }
}
