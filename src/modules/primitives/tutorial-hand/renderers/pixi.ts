import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { TUTORIAL_HAND_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a TutorialHand
 */
export interface TutorialHandConfig {
  /** Name of the texture atlas */
  atlasName: string;
  /** Sprite frame name for the hand */
  spriteName: string;
  /** Callback fired on each tap in the loop */
  onTap?: () => void;
  /** Sprite anchor point (default: [0.5, 0.15] — fingertip near top) */
  anchor?: { x: number; y: number };
}

/**
 * TutorialHand — animated gesture hint with a repeating tap loop.
 *
 * Shows a hand sprite that fades in from below, then loops:
 * tap press → hold → release → back off → slide back → repeat.
 * Non-interactive — lets taps pass through to elements underneath.
 */
export class TutorialHand extends PixiRenderable {
  private handSprite: PixiRenderable;
  private timeline: gsap.core.Timeline | null = null;
  private introTween: gsap.core.Tween | null = null;
  private onTap?: () => void;

  constructor(gpuLoader: PixiLoader, config: TutorialHandConfig) {
    super('tutorial-hand');

    this.onTap = config.onTap;

    const d = TUTORIAL_HAND_DEFAULTS;
    const sprite = gpuLoader.createSprite(config.atlasName, config.spriteName)!;
    const anchor = config.anchor ?? { x: 0.5, y: 0.15 };
    sprite.anchor.set(anchor.x, anchor.y);

    this.handSprite = new PixiRenderable('hand-sprite');
    this.handSprite.addChild(sprite);
    this.handSprite.scale.set(d.restScale);

    this.addChild(this.handSprite);

    // Start invisible, non-interactive
    this.alpha = 0;
    this.visible = false;
    this.eventMode = 'none';
  }

  /** Start the tutorial animation targeting the given position */
  show(targetX: number, targetY: number): void {
    const d = TUTORIAL_HAND_DEFAULTS;
    this.visible = true;

    // Start below target
    this.x = targetX;
    this.y = targetY + d.startOffsetY;
    this.alpha = 0;
    this.handSprite.scale.set(d.restScale);

    // Intro: fade in + slide up
    this.introTween = gsap.to(this, {
      y: targetY,
      alpha: 1,
      duration: d.fadeInDuration,
      ease: 'power2.out',
      onComplete: () => {
        this.introTween = null;
        this.startTapLoop(targetY);
      },
    });
  }

  /** Build and start the repeating tap loop */
  private startTapLoop(targetY: number): void {
    const d = TUTORIAL_HAND_DEFAULTS;
    const restY = targetY + d.backOffDistance;

    this.timeline = gsap.timeline({ repeat: -1 });

    // 1. Wait
    this.timeline.to({}, { duration: d.waitBeforeTap });

    // 2. Tap press
    this.timeline.to(this.handSprite.scale, {
      x: d.tapPressScale,
      y: d.tapPressScale,
      duration: d.tapPressDuration,
      ease: 'power2.in',
    });

    // 3. Fire callback
    this.timeline.call(() => this.onTap?.());

    // 4. Hold
    this.timeline.to({}, { duration: d.tapHoldDuration });

    // 5. Release
    this.timeline.to(this.handSprite.scale, {
      x: d.restScale,
      y: d.restScale,
      duration: d.tapReleaseDuration,
      ease: 'power2.out',
    });

    // 6. Back off
    this.timeline.to(this, {
      y: restY,
      duration: d.backOffDuration,
      ease: 'power2.out',
    });

    // 7. Wait
    this.timeline.to({}, { duration: d.waitBetweenTaps });

    // 8. Slide back
    this.timeline.to(this, {
      y: targetY,
      duration: d.slideUpDuration,
      ease: 'power2.out',
    });
  }

  /** Fade out and clean up */
  hide(): void {
    this.killTimelines();

    gsap.to(this, {
      alpha: 0,
      duration: TUTORIAL_HAND_DEFAULTS.fadeOutDuration,
      ease: 'power2.in',
      onComplete: () => {
        this.visible = false;
        this.parent?.removeChild(this);
        this.destroy();
      },
    });
  }

  private killTimelines(): void {
    if (this.introTween) {
      this.introTween.kill();
      this.introTween = null;
    }
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
  }
}
