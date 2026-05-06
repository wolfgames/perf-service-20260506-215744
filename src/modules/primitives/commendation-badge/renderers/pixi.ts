import { Sprite, Graphics } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { COMMENDATION_BADGE_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a CommendationBadge
 */
export interface CommendationBadgeConfig {
  /** Badge tier (0-5) */
  tier: number;
  /** Name of the texture atlas */
  atlasName: string;
  /** Map tier number to frame name in atlas */
  badgeFrames: Record<number, string>;
  /** Whether to play entrance animation */
  animated?: boolean;
  /** Delay before animation starts (seconds) */
  animationDelay?: number;
  /** Callback when animation finishes */
  onComplete?: () => void;
}

/**
 * Commendation badge component using Pixi sprites
 *
 * Features:
 * - Displays a badge sprite from an atlas based on tier
 * - Drop-slam entrance animation with overshoot ease
 * - Sparkle particle burst on landing
 * - Dynamic tier switching
 * - GSAP animations for smooth transitions
 */
export class CommendationBadge extends PixiRenderable {
  private sprite: Sprite;
  private config: CommendationBadgeConfig;
  private gpuLoader: PixiLoader;

  /**
   * Creates a new CommendationBadge instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Badge configuration
   */
  constructor(gpuLoader: PixiLoader, config: CommendationBadgeConfig) {
    super('commendation-badge');

    this.gpuLoader = gpuLoader;
    this.config = config;

    // Create badge sprite from atlas using tier-to-frame mapping
    const frameName = config.badgeFrames[config.tier];
    this.sprite = gpuLoader.createSprite(config.atlasName, frameName)!;
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);

    // Optionally start entrance animation
    const animated = config.animated ?? COMMENDATION_BADGE_DEFAULTS.animated;
    if (animated) {
      const delay = config.animationDelay ?? COMMENDATION_BADGE_DEFAULTS.animationDelay;

      // Hide until animation starts
      this.alpha = 0;

      if (delay > 0) {
        gsap.delayedCall(delay, () => {
          this.playEntrance().then(() => config.onComplete?.());
        });
      } else {
        this.playEntrance().then(() => config.onComplete?.());
      }
    }
  }

  /**
   * Play the drop-slam entrance animation
   *
   * The badge starts scaled up and above its target position, then slams
   * down with an overshoot ease. On landing, sparkle particles radiate outward.
   *
   * @returns Promise that resolves when the full animation (including sparkles) completes
   */
  async playEntrance(): Promise<void> {
    const {
      dropDuration,
      dropEase,
      initialScale,
    } = COMMENDATION_BADGE_DEFAULTS;

    // Set initial state: scaled up and offset above
    this.scale.set(initialScale);
    this.sprite.y = -50;
    this.alpha = 1;

    // Drop-slam animation
    await new Promise<void>((resolve) => {
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: dropDuration,
        ease: dropEase,
      });
      gsap.to(this.sprite, {
        y: 0,
        duration: dropDuration,
        ease: dropEase,
        onComplete: resolve,
      });
    });

    // Spawn sparkle burst on landing
    await this.spawnSparkles();
  }

  /**
   * Change the badge tier, updating the displayed sprite frame
   *
   * @param tier - New badge tier (0-5)
   */
  setTier(tier: number): void {
    this.config.tier = tier;
    const frameName = this.config.badgeFrames[tier];
    const texture = this.gpuLoader.getTexture(this.config.atlasName, frameName)!;
    this.sprite.texture = texture;
  }

  /**
   * Spawn sparkle particles radiating outward from the badge centre
   *
   * Each sparkle is a small circle Graphics with GSAP scale, alpha,
   * and position tweens that animate outward then fade.
   *
   * @returns Promise that resolves when all sparkle animations complete
   */
  private spawnSparkles(): Promise<void> {
    const {
      sparkleCount,
      sparkleDuration,
      sparkleSpread,
    } = COMMENDATION_BADGE_DEFAULTS;

    if (sparkleCount === 0) return Promise.resolve();

    const promises: Promise<void>[] = [];
    const angleStep = (Math.PI * 2) / sparkleCount;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = new Graphics();
      sparkle.circle(0, 0, 3);
      sparkle.fill({ color: 0xffd700 });
      sparkle.alpha = 1;
      sparkle.scale.set(0);
      this.addChild(sparkle);

      const angle = angleStep * i;
      const targetX = Math.cos(angle) * sparkleSpread;
      const targetY = Math.sin(angle) * sparkleSpread;

      const p = new Promise<void>((resolve) => {
        gsap.to(sparkle, {
          x: targetX,
          y: targetY,
          alpha: 0,
          duration: sparkleDuration,
          ease: 'power2.out',
        });
        gsap.to(sparkle.scale, {
          x: 1,
          y: 1,
          duration: sparkleDuration * 0.5,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(sparkle.scale, {
              x: 0,
              y: 0,
              duration: sparkleDuration * 0.5,
              ease: 'power2.in',
              onComplete: () => {
                sparkle.destroy();
                resolve();
              },
            });
          },
        });
      });

      promises.push(p);
    }

    return Promise.all(promises).then(() => undefined);
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
