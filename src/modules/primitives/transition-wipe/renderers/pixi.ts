import { Graphics } from 'pixi.js';
import gsap from 'gsap';
import { PixiRenderable } from '../../_base';
import { TRANSITION_WIPE_DEFAULTS } from '../defaults';

export type TransitionMode = 'fade' | 'iris-in' | 'iris-out';

/**
 * Configuration for creating a TransitionWipe
 */
export interface TransitionWipeConfig {
  /** Screen width */
  screenWidth: number;
  /** Screen height */
  screenHeight: number;
  /** Overlay color */
  color?: number;
  /** Max alpha for the overlay */
  maxAlpha?: number;
  /** Block input while visible */
  blockInput?: boolean;
}

/**
 * TransitionWipe — full-screen overlay for scene transitions.
 *
 * Supports fade and iris (circular reveal/hide) modes.
 * Blocks input to the layer beneath when active.
 */
export class TransitionWipe extends PixiRenderable {
  private overlay: Graphics;
  private irisMask: Graphics | null = null;
  private screenWidth: number;
  private screenHeight: number;
  private color: number;
  private maxAlpha: number;

  constructor(config: TransitionWipeConfig) {
    super('transition-wipe');

    const d = TRANSITION_WIPE_DEFAULTS;
    this.screenWidth = config.screenWidth;
    this.screenHeight = config.screenHeight;
    this.color = config.color ?? d.color;
    this.maxAlpha = config.maxAlpha ?? d.maxAlpha;

    this.overlay = new Graphics();
    this.drawOverlay();
    this.overlay.alpha = 0;

    if (config.blockInput !== false) {
      this.overlay.eventMode = 'static';
    }

    this.addChild(this.overlay);
    this.visible = false;
  }

  /**
   * Play a transition in (overlay becomes visible)
   * @returns Promise that resolves when the transition completes
   */
  async transitionIn(
    mode: TransitionMode = 'fade',
    duration?: number,
    ease?: string,
  ): Promise<void> {
    const d = TRANSITION_WIPE_DEFAULTS;
    const dur = duration ?? d.duration;
    const easing = ease ?? d.ease;

    this.visible = true;

    if (mode === 'fade') {
      return new Promise((resolve) => {
        gsap.to(this.overlay, {
          alpha: this.maxAlpha,
          duration: dur,
          ease: easing,
          onComplete: resolve,
        });
      });
    }

    if (mode === 'iris-out') {
      return this.playIris(dur, easing, true);
    }

    // iris-in: start with full overlay, reveal circle
    this.overlay.alpha = this.maxAlpha;
    return this.playIris(dur, easing, false);
  }

  /**
   * Play a transition out (overlay becomes hidden)
   * @returns Promise that resolves when the transition completes
   */
  async transitionOut(
    mode: TransitionMode = 'fade',
    duration?: number,
    ease?: string,
  ): Promise<void> {
    const d = TRANSITION_WIPE_DEFAULTS;
    const dur = duration ?? d.duration;
    const easing = ease ?? d.ease;

    if (mode === 'fade') {
      return new Promise((resolve) => {
        gsap.to(this.overlay, {
          alpha: 0,
          duration: dur,
          ease: easing,
          onComplete: () => {
            this.visible = false;
            resolve();
          },
        });
      });
    }

    if (mode === 'iris-in') {
      return this.playIris(dur, easing, false).then(() => {
        this.visible = false;
      });
    }

    // iris-out for transition out
    return this.playIris(dur, easing, true).then(() => {
      this.visible = false;
    });
  }

  /** Resize the overlay (call on viewport change) */
  override resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.drawOverlay();
  }

  private drawOverlay(): void {
    this.overlay.clear();
    this.overlay.rect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.fill({ color: this.color });
  }

  private playIris(
    duration: number,
    ease: string,
    closing: boolean,
  ): Promise<void> {
    // Create circular mask centered on screen
    const cx = this.screenWidth / 2;
    const cy = this.screenHeight / 2;
    const maxRadius = Math.hypot(cx, cy);

    if (this.irisMask) {
      this.removeChild(this.irisMask);
      this.irisMask.destroy();
    }

    this.irisMask = new Graphics();
    this.addChild(this.irisMask);
    this.overlay.mask = this.irisMask;

    const radiusObj = { r: closing ? 0 : maxRadius };
    const targetR = closing ? maxRadius : 0;

    // Draw initial state
    this.drawIris(cx, cy, radiusObj.r);

    return new Promise((resolve) => {
      gsap.to(radiusObj, {
        r: targetR,
        duration,
        ease,
        onUpdate: () => this.drawIris(cx, cy, radiusObj.r),
        onComplete: () => {
          this.overlay.mask = null;
          if (this.irisMask) {
            this.removeChild(this.irisMask);
            this.irisMask.destroy();
            this.irisMask = null;
          }
          resolve();
        },
      });
    });
  }

  private drawIris(cx: number, cy: number, radius: number): void {
    if (!this.irisMask) return;
    this.irisMask.clear();
    this.irisMask.circle(cx, cy, radius);
    this.irisMask.fill({ color: 0xffffff });
  }
}
