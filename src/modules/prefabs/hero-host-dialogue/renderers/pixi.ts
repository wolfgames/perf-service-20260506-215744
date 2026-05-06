import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { CharacterSprite, type CharacterSpriteConfig } from '~/modules/primitives/character-sprite';
import { DialogueBox, type DialogueBoxConfig } from '~/modules/primitives/dialogue-box';
import { HERO_HOST_DIALOGUE_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a HeroHostDialogue
 */
export interface HeroHostDialogueConfig {
  /** CharacterSprite config (type, spriteMap, atlasName, baseSize) */
  character: CharacterSpriteConfig;
  /** DialogueBox config (atlasName, spriteName for the bubble) */
  dialogue: Pick<DialogueBoxConfig, 'atlasName' | 'spriteName' | 'fontFamily'>;
  /** Character scale (default: 1) */
  characterScale?: number;
  /** Gap between character and dialogue box (default: 12) */
  dialogGap?: number;
  /** Dialogue box width (default: 320) */
  dialogWidth?: number;
  /** Bottom padding from screen edge (default: 40) */
  bottomPadding?: number;
}

/**
 * HeroHostDialogue - Full-body character with adjacent speech bubble.
 * Composes CharacterSprite + DialogueBox primitives.
 * Used for tutorial hosts, narrative moments, and FTUE guidance.
 */
export class HeroHostDialogue extends Container {
  private characterSprite: CharacterSprite;
  private dialogueBox: DialogueBox;
  private clickArea: Graphics;

  private dismissCallback: (() => void) | null = null;
  private dismissTimeout: number | null = null;
  private isAnimating = false;

  private readonly characterScale: number;
  private readonly dialogGap: number;
  private readonly dialogWidth: number;
  private readonly bottomPadding: number;

  constructor(gpuLoader: PixiLoader, config: HeroHostDialogueConfig) {
    super();

    const defaults = HERO_HOST_DIALOGUE_DEFAULTS;
    this.characterScale = config.characterScale ?? defaults.characterScale;
    this.dialogGap = config.dialogGap ?? defaults.dialogGap;
    this.dialogWidth = config.dialogWidth ?? defaults.dialogWidth;
    this.bottomPadding = config.bottomPadding ?? defaults.bottomPadding;

    // Create full-body character sprite via primitive
    this.characterSprite = new CharacterSprite(
      gpuLoader,
      config.character,
      this.characterScale
    );

    this.addChild(this.characterSprite);

    // Create dialogue box via primitive in inline mode
    this.dialogueBox = new DialogueBox(gpuLoader, {
      atlasName: config.dialogue.atlasName,
      spriteName: config.dialogue.spriteName,
      fontFamily: config.dialogue.fontFamily,
      width: this.dialogWidth,
      fontSize: defaults.fontSize,
      textColor: defaults.textColor,
      lineHeight: defaults.lineHeight,
      textPadding: defaults.textPadding,
    });
    this.dialogueBox.alpha = 1; // Override default hidden state — prefab controls visibility

    // Position dialogue box to right of character
    const charWidth = config.character.baseSize.width * this.characterScale;
    this.dialogueBox.x = charWidth / 2 + this.dialogGap;
    this.dialogueBox.y = 0;

    this.addChild(this.dialogueBox);

    // Create invisible hit area for tap-to-dismiss
    this.clickArea = new Graphics();
    this.updateHitArea();
    this.clickArea.alpha = 0;
    this.clickArea.eventMode = 'static';
    this.clickArea.cursor = 'pointer';
    this.clickArea.on('pointertap', () => this.dismiss());
    this.addChild(this.clickArea);

    // Start hidden
    this.visible = false;
    this.alpha = 0;

    this.label = 'hero-host-dialogue';
  }

  /**
   * Update hit area to cover the entire prefab
   */
  private updateHitArea(): void {
    const charWidth =
      this.characterSprite.getSprite().width;
    const charHeight =
      this.characterSprite.getSprite().height;
    const dialogWidth = this.dialogueBox.getWidth();
    const dialogHeight = this.dialogueBox.getHeight();

    const totalWidth = charWidth / 2 + this.dialogGap + dialogWidth + 20;
    const totalHeight = Math.max(charHeight, dialogHeight) + 20;

    this.clickArea.clear();
    this.clickArea.rect(
      -charWidth / 2 - 10,
      -totalHeight / 2,
      totalWidth,
      totalHeight
    );
    this.clickArea.fill({ color: 0x000000, alpha: 0.01 });
  }

  /**
   * Show the dialogue with text
   */
  show(
    text: string,
    screenWidth: number,
    screenHeight: number,
    displayDuration: number,
    onDismiss: () => void
  ): void {
    if (this.isAnimating) return;

    this.dismissCallback = onDismiss;
    this.dialogueBox.setText(text);
    this.updateHitArea();

    const defaults = HERO_HOST_DIALOGUE_DEFAULTS;

    // Position at bottom center
    this.x = screenWidth / 2;
    this.y = screenHeight - this.bottomPadding;

    // Animate in: character slides up, dialogue pops in
    this.visible = true;
    this.isAnimating = true;
    this.alpha = 0;

    // Character slides up from below
    const targetCharY = this.characterSprite.y;
    this.characterSprite.y = targetCharY + defaults.showSlideOffset;

    gsap.to(this, {
      alpha: 1,
      duration: defaults.showFadeDuration,
      ease: 'power2.out',
    });

    gsap.to(this.characterSprite, {
      y: targetCharY,
      duration: defaults.showScaleDuration,
      ease: defaults.showEase,
    });

    // Dialogue box pops in slightly after character
    this.dialogueBox.scale.set(0);
    gsap.to(this.dialogueBox.scale, {
      x: 1,
      y: 1,
      duration: defaults.showScaleDuration,
      delay: 0.1,
      ease: defaults.showEase,
      onComplete: () => {
        this.isAnimating = false;
        this.clickArea.eventMode = 'static';
      },
    });

    // Schedule auto-dismiss
    this.dismissTimeout = window.setTimeout(() => {
      this.dismiss();
    }, displayDuration);
  }

  /**
   * Dismiss the dialogue
   */
  dismiss(): void {
    if (this.isAnimating || !this.visible) return;

    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }

    const defaults = HERO_HOST_DIALOGUE_DEFAULTS;
    this.isAnimating = true;
    this.clickArea.eventMode = 'none';

    gsap.to(this, {
      alpha: 0,
      duration: defaults.hideDuration,
      ease: defaults.hideEase,
      onComplete: () => {
        this.visible = false;
        this.isAnimating = false;

        if (this.dismissCallback) {
          this.dismissCallback();
          this.dismissCallback = null;
        }
      },
    });
  }

  /**
   * Clean up resources — tweens first, then children
   */
  destroy(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.characterSprite);
    gsap.killTweensOf(this.dialogueBox.scale);
    super.destroy({ children: true });
  }
}
