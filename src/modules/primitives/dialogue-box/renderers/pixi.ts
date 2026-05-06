import { NineSliceSprite, Text } from 'pixi.js';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';

/**
 * Positioning configuration for the dialogue box
 */
export interface DialogueBoxPositioning {
  /** Bottom padding for dialogue box */
  dialogueBottomPadding: number;
  /** Max dialogue box width */
  dialogueMaxWidth: number;
  /** Dialogue box screen width percentage */
  dialogueWidthPercent: number;
}

/**
 * Configuration for creating a DialogueBox
 */
export interface DialogueBoxConfig {
  /** Name of the texture atlas */
  atlasName: string;
  /** Name of the dialogue sprite within the atlas */
  spriteName: string;
  /** Font family for text */
  fontFamily?: string;
  /** Positioning constants — omit for inline mode (parent handles positioning) */
  positioning?: DialogueBoxPositioning;
  /** Explicit width for inline mode (used when positioning is omitted) */
  width?: number;
  /** Font size override */
  fontSize?: number;
  /** Text color override */
  textColor?: string;
  /** Line height override */
  lineHeight?: number;
  /** Horizontal text padding override */
  textPadding?: number;
}

/**
 * Dialogue box sprite container
 * Uses NineSliceSprite for proper corner scaling
 * Includes Pixi Text for dialogue content
 */
export class DialogueBox extends PixiRenderable {
  private boxSprite: NineSliceSprite;
  private textField: Text;
  private targetHeight: number;
  private positioning: DialogueBoxPositioning | null;

  constructor(
    gpuLoader: PixiLoader,
    config: DialogueBoxConfig,
    screenWidth?: number,
    screenHeight?: number,
    heightScale: number = 0.5 // Default to half height for peek effect
  ) {
    super('dialogue-box');

    this.positioning = config.positioning ?? null;

    const textPadding = config.textPadding ?? 40;
    const fontSize = config.fontSize ?? 18;
    const textColor = config.textColor ?? '#2c2c2c';
    const lineHeight = config.lineHeight ?? 26;

    // Get texture for 9-slice sprite
    const texture = gpuLoader.getTexture(config.atlasName, config.spriteName);

    // Create 9-slice sprite (borders won't stretch)
    this.boxSprite = new NineSliceSprite({
      texture,
      leftWidth: 20,
      topHeight: 20,
      rightWidth: 20,
      bottomHeight: 20,
    });

    // Calculate target width: positioned mode uses screen %, inline mode uses explicit width
    let targetWidth: number;
    if (this.positioning && screenWidth != null) {
      this.boxSprite.anchor.set(0.5, 0); // Top center anchor — box grows downward
      targetWidth = Math.min(
        screenWidth * this.positioning.dialogueWidthPercent,
        this.positioning.dialogueMaxWidth
      );
    } else {
      this.boxSprite.anchor.set(0, 0.5); // Left-center anchor for inline layout
      targetWidth = config.width ?? 280;
    }

    this.targetHeight = 90 * heightScale; // Base height 90px, scaled by parameter

    // Set dimensions (9-slice handles corners automatically)
    this.boxSprite.width = targetWidth;
    this.boxSprite.height = this.targetHeight;

    this.addChild(this.boxSprite);

    // Create text field (Pixi Text, not DOM)
    this.textField = new Text({
      text: '',
      style: {
        fontFamily: config.fontFamily ?? 'sans-serif',
        fontSize,
        fill: textColor,
        wordWrap: true,
        wordWrapWidth: targetWidth - textPadding * 2,
        align: 'left',
        lineHeight,
        padding: 4,
      },
    });

    if (this.positioning && screenWidth != null) {
      // Positioned mode: text anchored left-center inside centered box
      this.textField.anchor.set(0, 0.5);
      this.textField.x = -(targetWidth / 2) + textPadding;
      this.textField.y = this.targetHeight / 2;
    } else {
      // Inline mode: text anchored left-center inside left-anchored box
      this.textField.anchor.set(0, 0.5);
      this.textField.x = textPadding;
      this.textField.y = 0;
    }
    this.addChild(this.textField);

    // Position at bottom center (only in positioned mode)
    if (this.positioning && screenWidth != null && screenHeight != null) {
      this.updatePosition(screenWidth, screenHeight);
    }

    // Initially hidden (for animation)
    this.alpha = 0;
  }

  /**
   * Set dialogue text and auto-resize box to fit
   */
  setText(text: string): void {
    this.textField.text = text;

    // Auto-resize box height to fit text content
    const textHeight = this.textField.height;
    const minHeight = 90; // Minimum height
    const padding = 40; // Vertical padding (20px top + 20px bottom)
    const newHeight = Math.max(minHeight, textHeight + padding);

    this.targetHeight = newHeight;
    this.boxSprite.height = newHeight;

    // Re-center text vertically (box grows downward from top)
    this.textField.y = newHeight / 2;
  }

  /**
   * Update dialogue box dimensions based on screen width
   */
  private updateDimensions(screenWidth: number): void {
    if (!this.positioning) return;
    const targetWidth = Math.min(
      screenWidth * this.positioning.dialogueWidthPercent,
      this.positioning.dialogueMaxWidth
    );
    this.boxSprite.width = targetWidth;
    this.boxSprite.height = this.targetHeight;
  }

  /**
   * Update dialogue box position
   */
  private updatePosition(screenWidth: number, screenHeight: number): void {
    if (!this.positioning) return;
    this.x = screenWidth / 2;
    this.y = screenHeight - this.positioning.dialogueBottomPadding;
  }

  /**
   * Resize dialogue box (called on window resize)
   */
  resize(screenWidth: number, screenHeight: number): void {
    this.updateDimensions(screenWidth);
    this.updatePosition(screenWidth, screenHeight);
  }

  /**
   * Get current dialogue box width
   */
  getWidth(): number {
    return this.boxSprite.width;
  }

  /**
   * Get current dialogue box height
   */
  getHeight(): number {
    return this.boxSprite.height;
  }
}
