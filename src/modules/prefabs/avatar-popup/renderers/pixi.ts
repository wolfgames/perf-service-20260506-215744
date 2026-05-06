import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { CharacterSprite, type CharacterSpriteConfig } from '~/modules/primitives/character-sprite';
import { DialogueBox, type DialogueBoxConfig } from '~/modules/primitives/dialogue-box';
import { PixiRenderable } from '../../../primitives/_base';

/**
 * Configuration for creating an AvatarPopup
 */
export interface AvatarPopupConfig {
  /** CharacterSprite config (type, spriteMap, atlasName, baseSize) */
  character: CharacterSpriteConfig;
  /** DialogueBox config (atlasName, spriteName for the bubble) */
  dialogue: Pick<DialogueBoxConfig, 'atlasName' | 'spriteName' | 'fontFamily'>;
  /** Circle avatar size (default: 64) */
  circleSize?: number;
  /** Border width around circle (default: 4) */
  borderWidth?: number;
  /** Border color (default: 0x4A3728) */
  borderColor?: number;
  /** Dialogue box width (default: 280) */
  dialogWidth?: number;
  /** Gap between circle and dialog (default: 8) */
  dialogGap?: number;
}

/**
 * AvatarPopup - Composes CharacterSprite + DialogueBox with circular avatar masking.
 * Positioned at top center of screen. Auto-dismisses after specified duration or on tap.
 */
export class AvatarPopup extends PixiRenderable {
  private circleContainer: Container;
  private characterSprite: CharacterSprite;
  private circleMask: Graphics;
  private circleBorder: Graphics;
  private dialogueBox: DialogueBox;
  private clickArea: Graphics;

  private dismissCallback: (() => void) | null = null;
  private dismissTimeout: number | null = null;
  private isAnimating = false;

  // Configurable sizes
  private readonly circleSize: number;
  private readonly borderWidth: number;
  private readonly borderColor: number;
  private readonly dialogWidth: number;
  private readonly dialogGap: number;

  constructor(gpuLoader: PixiLoader, config: AvatarPopupConfig) {
    super('avatar-popup');

    this.circleSize = config.circleSize ?? 64;
    this.borderWidth = config.borderWidth ?? 4;
    this.borderColor = config.borderColor ?? 0x4a3728;
    this.dialogWidth = config.dialogWidth ?? 280;
    this.dialogGap = config.dialogGap ?? 8;

    // Create circle container for character head
    this.circleContainer = new Container();
    this.circleContainer.label = 'circle-container';

    // Create character sprite via primitive, scaled to show head portion in circle
    const headScale =
      (this.circleSize * 2.2) / config.character.baseSize.height;
    this.characterSprite = new CharacterSprite(gpuLoader, config.character, headScale);

    // Offset sprite down so head is centered in circle
    const sprite = this.characterSprite.getSprite();
    sprite.y = this.circleSize * 0.35;

    this.circleContainer.addChild(this.characterSprite);

    // Create circular mask
    this.circleMask = new Graphics();
    this.circleMask.circle(0, 0, this.circleSize / 2);
    this.circleMask.fill({ color: 0xffffff });
    this.circleContainer.addChild(this.circleMask);
    this.characterSprite.mask = this.circleMask;

    // Create circle border
    this.circleBorder = new Graphics();
    this.circleBorder.circle(0, 0, this.circleSize / 2);
    this.circleBorder.stroke({
      width: this.borderWidth,
      color: this.borderColor,
    });
    this.circleContainer.addChild(this.circleBorder);

    this.addChild(this.circleContainer);

    // Create dialogue box via primitive in inline mode
    this.dialogueBox = new DialogueBox(gpuLoader, {
      atlasName: config.dialogue.atlasName,
      spriteName: config.dialogue.spriteName,
      fontFamily: config.dialogue.fontFamily,
      width: this.dialogWidth,
      fontSize: 16,
      textColor: '#2c2c2c',
      lineHeight: 22,
      textPadding: 20,
    });
    this.dialogueBox.alpha = 1; // Override default hidden state — popup controls visibility

    // Position dialogue box to right of circle with gap
    this.dialogueBox.x = this.circleSize / 2 + this.dialogGap;
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
  }

  /**
   * Update hit area to cover the entire popup
   */
  private updateHitArea(): void {
    const dialogWidth = this.dialogueBox.getWidth();
    const dialogHeight = this.dialogueBox.getHeight();
    const totalWidth = this.dialogueBox.x + dialogWidth + 20;
    const totalHeight = Math.max(this.circleSize, dialogHeight) + 20;

    this.clickArea.clear();
    this.clickArea.rect(
      -this.circleSize / 2 - 10,
      -totalHeight / 2,
      totalWidth,
      totalHeight
    );
    this.clickArea.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible but clickable
  }

  /**
   * Show the popup with text
   * @param gridTop - Y position of the top of the grid in screen coordinates
   */
  show(
    text: string,
    screenWidth: number,
    gridTop: number,
    displayDuration: number,
    onDismiss: () => void
  ): void {
    if (this.isAnimating) return;

    this.dismissCallback = onDismiss;
    this.dialogueBox.setText(text);
    this.updateHitArea();

    // Calculate total popup bounds for centering
    const leftEdge = -this.circleSize / 2;
    const rightEdge = this.circleSize / 2 + this.dialogGap + this.dialogWidth;

    // Set pivot to visual center so scale animates from center
    const visualCenterX = (leftEdge + rightEdge) / 2;
    this.pivot.set(visualCenterX, 0);

    // Position centered horizontally, above the grid with spacing
    const spacing = 16;
    this.x = screenWidth / 2;
    this.y =
      gridTop -
      spacing -
      Math.max(this.circleSize, this.dialogueBox.getHeight()) / 2;

    // Animate in with scale pop
    this.visible = true;
    this.isAnimating = true;
    this.scale.set(0);
    this.alpha = 0;

    gsap.to(this, {
      alpha: 1,
      duration: 0.15,
      ease: 'power2.out',
    });

    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.35,
      ease: 'back.out(1.7)',
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
   * Dismiss the popup
   */
  dismiss(): void {
    if (this.isAnimating || !this.visible) return;

    // Clear auto-dismiss timer
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }

    this.isAnimating = true;
    this.clickArea.eventMode = 'none';

    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      ease: 'power2.in',
    });

    gsap.to(this.scale, {
      x: 0.8,
      y: 0.8,
      duration: 0.2,
      ease: 'power2.in',
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
   * Clean up resources
   */
  override destroy(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    super.destroy();
  }
}
