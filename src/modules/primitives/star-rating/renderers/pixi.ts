import { Sprite } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { STAR_RATING_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a StarRating
 */
export interface StarRatingConfig {
  /** Name of the texture atlas */
  atlasName: string;
  /** Frame name for the star sprite in the atlas */
  starFrameName: string;
  /** Maximum number of stars to display */
  maxStars?: number;
  /** Current star rating (supports fractional values, e.g. 3.5) */
  currentStars: number;
  /** Size of each star in pixels */
  starSize?: number;
  /** Gap between stars in pixels */
  gap?: number;
  /** Tint color for filled stars */
  filledTint?: number;
  /** Tint color for empty stars */
  emptyTint?: number;
  /** Scale punch on value change */
  punchScale?: number;
  /** Punch animation duration (seconds) */
  punchDuration?: number;
  /** Punch animation easing */
  punchEase?: string;
}

/**
 * Star rating display component using Pixi sprites
 *
 * Features:
 * - Configurable number of stars from a texture atlas
 * - Fractional star support via alpha blending (e.g. 3.5 shows half-filled 4th star)
 * - GSAP scale-punch animation on rating changes
 * - Stars laid out left-to-right, centered on the container
 */
export class StarRating extends PixiRenderable {
  private stars: Sprite[] = [];
  private _rating: number;
  private config: Required<
    Pick<
      StarRatingConfig,
      | 'maxStars'
      | 'starSize'
      | 'gap'
      | 'filledTint'
      | 'emptyTint'
      | 'punchScale'
      | 'punchDuration'
      | 'punchEase'
    >
  > &
    StarRatingConfig;

  /** Current star rating */
  get rating(): number {
    return this._rating;
  }

  /**
   * Creates a new StarRating instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Star rating configuration
   */
  constructor(gpuLoader: PixiLoader, config: StarRatingConfig) {
    super('star-rating');

    this.config = {
      maxStars: STAR_RATING_DEFAULTS.maxStars,
      starSize: STAR_RATING_DEFAULTS.starSize,
      gap: STAR_RATING_DEFAULTS.gap,
      filledTint: STAR_RATING_DEFAULTS.filledTint,
      emptyTint: STAR_RATING_DEFAULTS.emptyTint,
      punchScale: STAR_RATING_DEFAULTS.punchScale,
      punchDuration: STAR_RATING_DEFAULTS.punchDuration,
      punchEase: STAR_RATING_DEFAULTS.punchEase,
      ...config,
    };

    this._rating = this.config.currentStars;

    const { maxStars, starSize, gap, atlasName, starFrameName } = this.config;
    const totalWidth = maxStars * starSize + (maxStars - 1) * gap;
    const startX = -totalWidth / 2 + starSize / 2;

    // Create star sprites
    for (let i = 0; i < maxStars; i++) {
      const star = gpuLoader.createSprite(atlasName, starFrameName);
      if (!star) continue;
      star.anchor.set(0.5);
      star.width = starSize;
      star.height = starSize;
      star.x = startX + i * (starSize + gap);
      star.y = 0;

      this.addChild(star);
      this.stars.push(star);
    }

    // Apply initial tints
    this.applyTints(this._rating);
  }

  /**
   * Update the star rating with a scale-punch animation on changed stars
   *
   * @param stars - New rating value (supports fractional, e.g. 3.5)
   */
  setRating(stars: number): void {
    const prev = this._rating;
    this._rating = Math.max(0, Math.min(stars, this.config.maxStars));

    this.applyTints(this._rating);

    // Animate stars that changed
    const { punchScale, punchDuration, punchEase } = this.config;
    const minChanged = Math.min(Math.floor(prev), Math.floor(this._rating));
    const maxChanged = Math.max(Math.ceil(prev), Math.ceil(this._rating));

    for (let i = minChanged; i < maxChanged && i < this.stars.length; i++) {
      const star = this.stars[i];
      gsap.fromTo(
        star.scale,
        { x: punchScale, y: punchScale },
        {
          x: 1,
          y: 1,
          duration: punchDuration,
          ease: punchEase,
        },
      );
    }
  }

  /**
   * Apply tints and alpha to stars based on the current rating.
   * Fully filled stars get filledTint, empty stars get emptyTint,
   * and fractional stars use alpha blending.
   */
  private applyTints(rating: number): void {
    const { filledTint, emptyTint } = this.config;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      const starIndex = i + 1;

      if (starIndex <= Math.floor(rating)) {
        // Fully filled
        star.tint = filledTint;
        star.alpha = 1;
      } else if (starIndex === Math.ceil(rating) && rating % 1 !== 0) {
        // Fractional star — blend via alpha
        const fraction = rating % 1;
        star.tint = filledTint;
        star.alpha = fraction;
      } else {
        // Empty
        star.tint = emptyTint;
        star.alpha = 1;
      }
    }
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
