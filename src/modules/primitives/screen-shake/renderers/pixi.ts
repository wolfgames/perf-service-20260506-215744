import { type Container } from 'pixi.js';
import gsap from 'gsap';
import { SCREEN_SHAKE_DEFAULTS } from '../defaults';

export type ShakeIntensity = 'light' | 'medium' | 'heavy';

/**
 * ScreenShake — applies decaying oscillation to any Container.
 *
 * Not a PixiRenderable (has no visual of its own). Call shake() on a
 * target container (game stage, grid, camera group) and it returns
 * to the original position after the oscillation decays.
 */
export class ScreenShake {
  private activeTweens = new Set<gsap.core.Tween>();

  /**
   * Shake a target container with decaying oscillation.
   * Safe to call while a shake is already running (kills previous).
   */
  shake(target: Container, intensity: ShakeIntensity | number = 'medium'): void {
    const d = SCREEN_SHAKE_DEFAULTS;
    const px = typeof intensity === 'number'
      ? intensity
      : intensity === 'light'
        ? d.lightIntensity
        : intensity === 'heavy'
          ? d.heavyIntensity
          : d.mediumIntensity;

    const origX = target.x;
    const origY = target.y;
    const yPx = px * d.yRatio;

    // Build decaying keyframes: ±intensity shrinking to 0
    const keyframes: gsap.TweenVars[] = [];
    for (let i = 0; i < d.steps; i++) {
      const progress = i / (d.steps - 1);
      const decay = 1 - progress;
      const sign = i % 2 === 0 ? 1 : -1;
      keyframes.push({
        x: origX + sign * px * decay,
        y: origY + sign * yPx * decay,
        duration: d.stepDuration,
      });
    }
    // Final frame: return to origin
    keyframes[keyframes.length - 1] = { x: origX, y: origY, duration: d.stepDuration };

    // Kill any active shake on this target
    gsap.killTweensOf(target);

    const tween = gsap.to(target, {
      keyframes,
      ease: 'none',
      onComplete: () => {
        target.x = origX;
        target.y = origY;
        this.activeTweens.delete(tween);
      },
    });
    this.activeTweens.add(tween);
  }

  /** Reject shake — quick horizontal jitter (for invalid actions) */
  reject(target: Container): void {
    this.shake(target, 'light');
  }

  destroy(): void {
    for (const t of this.activeTweens) {
      t.kill();
    }
    this.activeTweens.clear();
  }
}
