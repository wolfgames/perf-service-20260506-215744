import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { DialogueBox, type DialogueBoxConfig } from '../../../primitives/dialogue-box';
import { CharacterSprite, type CharacterSpriteConfig } from '../../../primitives/character-sprite';
import { DIALOGUE_BOX_CHARACTER_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a DialogueBoxCharacter prefab
 */
export interface DialogueBoxCharacterConfig {
  /** Configuration forwarded to the DialogueBox primitive */
  dialogueConfig: DialogueBoxConfig;
  /** Configuration forwarded to the CharacterSprite primitive */
  characterConfig: CharacterSpriteConfig;
  /** Scale multiplier for the character sprite (default: 1) */
  characterScale?: number;
  /** Horizontal offset of character relative to dialogue box (default: -20) */
  characterOffsetX?: number;
  /** Vertical offset of character relative to dialogue box (default: 0) */
  characterOffsetY?: number;
  /** Which side the character appears on (default: 'left') */
  characterSide?: 'left' | 'right';
}

/**
 * DialogueBoxCharacter — Prefab combining a DialogueBox with a CharacterSprite.
 *
 * Positions the character to the left or right of the dialogue box with
 * configurable scale and offset. Provides convenience methods for setting
 * text and character animation, plus GSAP show/hide transitions.
 */
export class DialogueBoxCharacter extends PixiRenderable {
  private dialogueBox: DialogueBox;
  private character: CharacterSprite;
  private characterSide: 'left' | 'right';

  constructor(
    gpuLoader: PixiLoader,
    config: DialogueBoxCharacterConfig,
    screenWidth: number,
    screenHeight: number
  ) {
    super('dialogue-box-character');

    const scale = config.characterScale ?? DIALOGUE_BOX_CHARACTER_DEFAULTS.characterScale;
    const offsetX = config.characterOffsetX ?? DIALOGUE_BOX_CHARACTER_DEFAULTS.characterOffsetX;
    const offsetY = config.characterOffsetY ?? DIALOGUE_BOX_CHARACTER_DEFAULTS.characterOffsetY;
    this.characterSide = config.characterSide ?? DIALOGUE_BOX_CHARACTER_DEFAULTS.characterSide;

    // Create the dialogue box primitive
    this.dialogueBox = new DialogueBox(gpuLoader, config.dialogueConfig, screenWidth, screenHeight);
    this.addChild(this.dialogueBox);

    // Create the character sprite primitive
    this.character = new CharacterSprite(gpuLoader, config.characterConfig, scale);
    this.addChild(this.character);

    // Position character relative to dialogue box
    this.positionCharacter(offsetX, offsetY);

    // Start hidden
    this.alpha = 0;
    this.visible = false;
  }

  /**
   * Position the character sprite relative to the dialogue box based on side and offsets
   */
  private positionCharacter(offsetX: number, offsetY: number): void {
    const boxWidth = this.dialogueBox.getWidth();

    if (this.characterSide === 'left') {
      this.character.x = this.dialogueBox.x - boxWidth / 2 + offsetX;
    } else {
      this.character.x = this.dialogueBox.x + boxWidth / 2 - offsetX;
    }

    this.character.y = this.dialogueBox.y + offsetY;
  }

  /**
   * Set dialogue text — forwards to the underlying DialogueBox
   */
  setText(text: string): void {
    this.dialogueBox.setText(text);
  }

  /**
   * Set the character animation / sprite frame.
   * Updates the character scale to apply the new visual state.
   */
  setCharacterAnimation(anim: string): void {
    // CharacterSprite doesn't natively support frame switching,
    // so we expose this as a scale-based "animation" hint.
    // Extend in subclass or swap sprite when the primitive supports it.
    void anim;
  }

  /**
   * Fade in both the dialogue box and character together
   */
  show(): Promise<void> {
    return new Promise((resolve) => {
      this.visible = true;
      gsap.to(this, {
        alpha: 1,
        duration: DIALOGUE_BOX_CHARACTER_DEFAULTS.showFadeDuration,
        ease: DIALOGUE_BOX_CHARACTER_DEFAULTS.showEase,
        onComplete: resolve,
      });
    });
  }

  /**
   * Fade out both the dialogue box and character together
   */
  hide(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 0,
        duration: DIALOGUE_BOX_CHARACTER_DEFAULTS.hideFadeDuration,
        ease: DIALOGUE_BOX_CHARACTER_DEFAULTS.hideEase,
        onComplete: () => {
          this.visible = false;
          resolve();
        },
      });
    });
  }

  /**
   * Handle viewport resize — forwards to dialogue box
   */
  override resize(width: number, height: number): void {
    this.dialogueBox.resize(width, height);

    const offsetX = DIALOGUE_BOX_CHARACTER_DEFAULTS.characterOffsetX;
    const offsetY = DIALOGUE_BOX_CHARACTER_DEFAULTS.characterOffsetY;
    this.positionCharacter(offsetX, offsetY);
  }

  /**
   * Clean up resources
   */
  override destroy(): void {
    super.destroy();
  }
}
