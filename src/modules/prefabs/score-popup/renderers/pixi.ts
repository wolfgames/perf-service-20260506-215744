import { Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { CommendationBadge } from '../../../primitives/commendation-badge';
import { StarRating } from '../../../primitives/star-rating';
import { SCORE_POPUP_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a ScorePopup
 */
export interface ScorePopupConfig {
  /** Badge tier (0-5) */
  tier: number;
  /** Star rating (0-5, supports fractional values) */
  stars: number;
  /** Score points to display */
  points: number;
  /** Name of the texture atlas */
  atlasName: string;
  /** Map tier number to frame name in atlas */
  badgeFrames: Record<number, string>;
  /** Frame name for star sprite in the atlas */
  starFrameName: string;
  /** Callback when full animation sequence ends */
  onComplete?: () => void;
}

/**
 * ScorePopup - Pixi-based celebration prefab combining a CommendationBadge,
 * StarRating, and points Text in a vertical layout.
 *
 * Layout (top to bottom): Badge → Stars → Points text
 *
 * All children start hidden (alpha 0) and reveal during the play() sequence:
 * 1. Badge entrance animation (drop-slam)
 * 2. Stars reveal one-by-one with configurable delay
 * 3. Points text fades in with count-up
 * 4. Fires onComplete when done
 */
export class ScorePopup extends PixiRenderable {
  private badge: CommendationBadge;
  private starRating: StarRating;
  private pointsText: Text;
  private config: ScorePopupConfig;

  constructor(gpuLoader: PixiLoader, config: ScorePopupConfig) {
    super('score-popup');

    this.config = config;

    // Create badge — disable its auto-animation; we orchestrate manually
    this.badge = new CommendationBadge(gpuLoader, {
      tier: config.tier,
      atlasName: config.atlasName,
      badgeFrames: config.badgeFrames,
      animated: false,
    });
    this.badge.alpha = 0;
    this.addChild(this.badge);

    // Create star rating — start at 0 so stars reveal incrementally
    this.starRating = new StarRating(gpuLoader, {
      atlasName: config.atlasName,
      starFrameName: config.starFrameName,
      currentStars: 0,
    });
    this.starRating.alpha = 0;

    // Position stars below the badge
    const badgeBounds = this.badge.getBounds();
    this.starRating.y = badgeBounds.height / 2 + 12;
    this.addChild(this.starRating);

    // Create points text
    this.pointsText = new Text({
      text: `+${config.points}`,
      style: {
        fontSize: SCORE_POPUP_DEFAULTS.pointsFontSize,
        fill: SCORE_POPUP_DEFAULTS.pointsColor,
        fontWeight: 'bold',
        align: 'center',
      },
    });
    this.pointsText.anchor.set(0.5);
    this.pointsText.alpha = 0;

    // Position points text above the badge
    this.pointsText.y = -(badgeBounds.height / 2) + SCORE_POPUP_DEFAULTS.pointsOffsetY;
    this.addChild(this.pointsText);
  }

  /**
   * Orchestrate the full celebration sequence.
   *
   * 1. Badge entrance (drop-slam with sparkles)
   * 2. Stars reveal one-by-one
   * 3. Points text fades in with count-up
   * 4. Fires onComplete callback
   *
   * @returns Promise that resolves when the full sequence completes
   */
  async play(): Promise<void> {
    const {
      badgeDelay,
      starDelay,
      sequenceEase,
    } = SCORE_POPUP_DEFAULTS;

    // --- Phase 1: Badge entrance ---
    if (badgeDelay > 0) {
      await this.delay(badgeDelay);
    }
    await this.badge.playEntrance();

    // --- Phase 2: Stars reveal one-by-one ---
    this.starRating.alpha = 1;
    const targetStars = this.config.stars;
    const wholeStars = Math.floor(targetStars);
    const hasFractional = targetStars % 1 !== 0;
    const totalSteps = hasFractional ? wholeStars + 1 : wholeStars;

    for (let i = 1; i <= totalSteps; i++) {
      await this.delay(starDelay);
      const rating = i <= wholeStars ? i : targetStars;
      this.starRating.setRating(rating);
    }

    // --- Phase 3: Points text fade-in with count-up ---
    const finalPoints = this.config.points;

    await new Promise<void>((resolve) => {
      const counter = { value: 0 };

      // Fade in
      gsap.to(this.pointsText, {
        alpha: 1,
        duration: 0.3,
        ease: sequenceEase,
      });

      // Count up
      gsap.to(counter, {
        value: finalPoints,
        duration: 0.6,
        ease: sequenceEase,
        onUpdate: () => {
          this.pointsText.text = `+${Math.round(counter.value)}`;
        },
        onComplete: resolve,
      });
    });

    // --- Fire completion callback ---
    this.config.onComplete?.();
  }

  /**
   * Utility: promise-based delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.delayedCall(ms / 1000, resolve);
    });
  }

  override destroy(options?: Parameters<PixiRenderable['destroy']>[0]): void {
    gsap.killTweensOf(this.pointsText);
    super.destroy(options);
  }
}
