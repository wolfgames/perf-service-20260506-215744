import { Text, type TextStyleOptions } from 'pixi.js';
import { PixiRenderable } from '../../_base';
import { FLY_TEXT_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a FlyText
 */
export interface FlyTextConfig {
  /** Text to display */
  text: string;
  /** Starting X position */
  x: number;
  /** Starting Y position */
  y: number;
  /** Upward velocity in px/s (negative = up) */
  velocityY?: number;
  /** Horizontal velocity in px/s */
  velocityX?: number;
  /** Lifetime in seconds */
  lifetime?: number;
  /** Font size */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Text color */
  fill?: string;
  /** Stroke color */
  stroke?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Starting scale */
  startScale?: number;
  /** End scale */
  endScale?: number;
}

/**
 * FlyText — text that floats upward and fades out over its lifetime.
 *
 * Used for score popups, damage numbers, combo text, etc.
 * Self-destructs when lifetime expires. Driven by the PixiRenderable tick loop.
 */
export class FlyText extends PixiRenderable {
  private textField: Text;
  private velocityX: number;
  private velocityY: number;
  private lifetime: number;
  private elapsed = 0;
  private startScale: number;
  private endScale: number;

  constructor(config: FlyTextConfig) {
    super('fly-text');

    const d = FLY_TEXT_DEFAULTS;
    this.velocityX = config.velocityX ?? d.velocityX;
    this.velocityY = config.velocityY ?? d.velocityY;
    this.lifetime = config.lifetime ?? d.lifetime;
    this.startScale = config.startScale ?? d.startScale;
    this.endScale = config.endScale ?? d.endScale;

    const style: TextStyleOptions = {
      fontFamily: config.fontFamily ?? d.fontFamily,
      fontSize: config.fontSize ?? d.fontSize,
      fill: config.fill ?? d.fill,
    };
    const strokeColor = config.stroke ?? d.stroke;
    if (strokeColor) {
      style.stroke = { color: strokeColor, width: config.strokeWidth ?? d.strokeWidth };
    }

    this.textField = new Text({ text: config.text, style });
    this.textField.anchor.set(0.5);
    this.addChild(this.textField);

    this.x = config.x;
    this.y = config.y;
    this.scale.set(this.startScale);
  }

  override update(dt: number): void {
    this.elapsed += dt;
    const progress = Math.min(this.elapsed / this.lifetime, 1);

    // Move
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Fade + scale
    this.alpha = 1 - progress;
    const s = this.startScale + (this.endScale - this.startScale) * progress;
    this.scale.set(s);

    // Self-destruct
    if (progress >= 1) {
      this.active = false;
      this.parent?.removeChild(this);
      this.destroy();
    }
  }
}
