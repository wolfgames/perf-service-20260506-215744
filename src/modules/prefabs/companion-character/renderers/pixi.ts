import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { CharacterSprite, type CharacterSpriteConfig } from '~/modules/primitives/character-sprite';
import { PixiRenderable } from '~/modules/primitives/_base';
import { COMPANION_CHARACTER_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a CompanionCharacter
 */
export interface CompanionCharacterConfig {
  /** CharacterSprite config (type, spriteMap, atlasName, baseSize) */
  character: CharacterSpriteConfig;
  /** Display scale */
  scale?: number;
}

/**
 * CompanionCharacter — composes CharacterSprite with entrance/exit animations.
 *
 * Used for tutorial hosts, narrative companions, and celebration screens.
 * Provides slideIn, popIn, exit, and dance animation presets.
 */
export class CompanionCharacter extends PixiRenderable {
  private characterSprite: CharacterSprite;
  private danceTl: gsap.core.Timeline | null = null;

  constructor(gpuLoader: PixiLoader, config: CompanionCharacterConfig) {
    super('companion-character');

    const scale = config.scale ?? COMPANION_CHARACTER_DEFAULTS.scale;
    this.characterSprite = new CharacterSprite(gpuLoader, config.character, scale);
    this.addChild(this.characterSprite);

    // Start off-screen
    this.visible = false;
    this.alpha = 0;
  }

  /** Get the underlying CharacterSprite for direct access */
  getCharacterSprite(): CharacterSprite {
    return this.characterSprite;
  }

  /** Slide in from a direction */
  async slideIn(
    fromX: number,
    toX: number,
    y: number,
  ): Promise<void> {
    const d = COMPANION_CHARACTER_DEFAULTS;
    this.x = fromX;
    this.y = y;
    this.visible = true;
    this.alpha = 1;

    return new Promise((resolve) => {
      gsap.to(this, {
        x: toX,
        duration: d.slideInDuration,
        ease: d.slideInEase,
        onComplete: resolve,
      });
    });
  }

  /** Pop in with scale animation */
  async popIn(x: number, y: number): Promise<void> {
    const d = COMPANION_CHARACTER_DEFAULTS;
    this.x = x;
    this.y = y;
    this.visible = true;
    this.alpha = 1;
    this.scale.set(0);

    return new Promise((resolve) => {
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: d.popInDuration,
        ease: d.popInEase,
        onComplete: resolve,
      });
    });
  }

  /** Animate exit (fade + shrink) */
  async exit(): Promise<void> {
    const d = COMPANION_CHARACTER_DEFAULTS;
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 0,
        duration: d.exitDuration,
        ease: d.exitEase,
        onComplete: () => {
          this.visible = false;
          resolve();
        },
      });
    });
  }

  /** Start a looping pendulum sway + bounce dance */
  startDance(): void {
    if (this.danceTl) return;

    const d = COMPANION_CHARACTER_DEFAULTS;
    const baseY = this.y;

    this.danceTl = gsap.timeline({ repeat: -1 });
    this.danceTl
      .to(this, { rotation: d.danceTilt, y: baseY - d.danceBounceHeight, duration: d.danceSwayDuration, ease: 'sine.inOut' })
      .to(this, { rotation: 0, y: baseY, duration: d.danceSwayDuration, ease: 'sine.inOut' })
      .to(this, { rotation: -d.danceTilt, y: baseY - d.danceBounceHeight, duration: d.danceSwayDuration, ease: 'sine.inOut' })
      .to(this, { rotation: 0, y: baseY, duration: d.danceSwayDuration, ease: 'sine.inOut' });
  }

  /** Stop the dance animation */
  stopDance(): void {
    if (this.danceTl) {
      this.danceTl.kill();
      this.danceTl = null;
      this.rotation = 0;
    }
  }
}
