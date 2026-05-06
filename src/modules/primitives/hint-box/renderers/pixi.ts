import { Graphics, NineSliceSprite, Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { HINT_BOX_DEFAULTS } from '../defaults';

/** Arrow direction — which edge the arrow points away from. */
export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Configuration for creating a HintBox
 */
export interface HintBoxConfig {
  /** Callout text content */
  text: string;
  /** Which way the arrow points */
  arrowDirection: ArrowDirection;
  /** Atlas for 9-slice bubble texture (optional — falls back to Graphics rounded rect) */
  atlasName?: string;
  /** Frame name for bubble texture */
  bubbleSpriteName?: string;
  /** Font family */
  fontFamily?: string;
  /** Font size */
  fontSize?: number;
  /** Max text width before wrapping */
  maxWidth?: number;
  /** Text color */
  textColor?: number;
}

/**
 * Hint callout box with directional arrow
 *
 * Features:
 * - Rounded-rect background drawn with Graphics, or a NineSliceSprite when atlas + frame are supplied
 * - Directional arrow triangle on any edge
 * - Word-wrapped Pixi Text
 * - GSAP fade-in / fade-out animations
 */
export class HintBox extends PixiRenderable {
  private background: Graphics | NineSliceSprite;
  private arrow: Graphics;
  private textField: Text;
  private config: HintBoxConfig;
  private gpuLoader: PixiLoader | null;

  /**
   * Creates a new HintBox instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Hint box configuration
   */
  constructor(gpuLoader: PixiLoader, config: HintBoxConfig) {
    super('hint-box');

    this.config = config;
    this.gpuLoader = gpuLoader;

    const fontFamily = config.fontFamily ?? HINT_BOX_DEFAULTS.fontFamily;
    const fontSize = config.fontSize ?? HINT_BOX_DEFAULTS.fontSize;
    const maxWidth = config.maxWidth ?? HINT_BOX_DEFAULTS.maxWidth;
    const textColor = config.textColor ?? HINT_BOX_DEFAULTS.textColor;

    // Create text field with word wrapping
    this.textField = new Text({
      text: config.text,
      style: {
        fontFamily,
        fontSize,
        fill: textColor,
        wordWrap: true,
        wordWrapWidth: maxWidth,
        align: 'left',
        padding: 4,
      },
    });

    // Create bubble background
    if (config.atlasName && config.bubbleSpriteName) {
      const texture = gpuLoader.getTexture(config.atlasName, config.bubbleSpriteName)!;
      const border = HINT_BOX_DEFAULTS.cornerRadius;
      this.background = new NineSliceSprite({
        texture,
        leftWidth: border,
        topHeight: border,
        rightWidth: border,
        bottomHeight: border,
      });
    } else {
      this.background = new Graphics();
    }

    this.arrow = new Graphics();

    this.addChild(this.background);
    this.addChild(this.arrow);
    this.addChild(this.textField);

    // Lay everything out
    this.layout();

    // Start invisible for show() animation
    this.alpha = 0;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Update the text content and re-layout
   */
  setText(text: string): void {
    this.config.text = text;
    this.textField.text = text;
    this.layout();
  }

  /**
   * Change the arrow direction and re-layout
   */
  setArrowDirection(dir: ArrowDirection): void {
    this.config.arrowDirection = dir;
    this.layout();
  }

  /**
   * Fade in from alpha 0
   * @returns Promise that resolves when animation completes
   */
  show(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 1,
        duration: HINT_BOX_DEFAULTS.fadeInDuration,
        ease: HINT_BOX_DEFAULTS.fadeInEase,
        onComplete: resolve,
      });
    });
  }

  /**
   * Fade out to alpha 0
   * @returns Promise that resolves when animation completes
   */
  hide(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 0,
        duration: HINT_BOX_DEFAULTS.fadeInDuration,
        ease: HINT_BOX_DEFAULTS.fadeInEase,
        onComplete: resolve,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Internal layout
  // ---------------------------------------------------------------------------

  /**
   * Recalculate background size, text position, and arrow position based on current config.
   */
  private layout(): void {
    const padding = HINT_BOX_DEFAULTS.padding;
    const arrowSize = HINT_BOX_DEFAULTS.arrowSize;
    const cornerRadius = HINT_BOX_DEFAULTS.cornerRadius;
    const arrowOffset = HINT_BOX_DEFAULTS.arrowOffset;
    const dir = this.config.arrowDirection;

    // Measure text
    const textW = this.textField.width;
    const textH = this.textField.height;

    const boxW = textW + padding * 2;
    const boxH = textH + padding * 2;

    // Draw / size background
    if (this.background instanceof Graphics) {
      this.background.clear();
      this.background
        .roundRect(0, 0, boxW, boxH, cornerRadius)
        .fill({ color: HINT_BOX_DEFAULTS.backgroundColor, alpha: HINT_BOX_DEFAULTS.backgroundAlpha });
    } else {
      // NineSliceSprite — just resize
      this.background.width = boxW;
      this.background.height = boxH;
    }

    // Position text inside the bubble
    this.textField.x = padding;
    this.textField.y = padding;

    // Draw arrow triangle
    this.drawArrow(dir, boxW, boxH, arrowSize, arrowOffset);
  }

  /**
   * Draw the directional arrow triangle on the correct edge of the bubble.
   */
  private drawArrow(
    dir: ArrowDirection,
    boxW: number,
    boxH: number,
    size: number,
    offset: number,
  ): void {
    this.arrow.clear();

    const color = HINT_BOX_DEFAULTS.backgroundColor;
    const alpha = HINT_BOX_DEFAULTS.backgroundAlpha;

    let x0: number, y0: number, x1: number, y1: number, x2: number, y2: number;

    switch (dir) {
      case 'down': {
        // Arrow on bottom edge pointing downward
        const cx = boxW / 2 + offset;
        x0 = cx - size;
        y0 = boxH;
        x1 = cx + size;
        y1 = boxH;
        x2 = cx;
        y2 = boxH + size;
        break;
      }
      case 'up': {
        // Arrow on top edge pointing upward
        const cx = boxW / 2 + offset;
        x0 = cx - size;
        y0 = 0;
        x1 = cx + size;
        y1 = 0;
        x2 = cx;
        y2 = -size;
        break;
      }
      case 'left': {
        // Arrow on left edge pointing left
        const cy = boxH / 2 + offset;
        x0 = 0;
        y0 = cy - size;
        x1 = 0;
        y1 = cy + size;
        x2 = -size;
        y2 = cy;
        break;
      }
      case 'right': {
        // Arrow on right edge pointing right
        const cy = boxH / 2 + offset;
        x0 = boxW;
        y0 = cy - size;
        x1 = boxW;
        y1 = cy + size;
        x2 = boxW + size;
        y2 = cy;
        break;
      }
    }

    this.arrow
      .moveTo(x0!, y0!)
      .lineTo(x1!, y1!)
      .lineTo(x2!, y2!)
      .closePath()
      .fill({ color, alpha });
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
