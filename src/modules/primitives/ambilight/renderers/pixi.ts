import { Sprite, BlurFilter } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { AMBILIGHT_DEFAULTS } from '../defaults';

/**
 * Configuration for creating an Ambilight
 */
export interface AmbilightConfig {
  /** Name of the texture atlas for the source sprite */
  atlasName: string;
  /** Frame name within the atlas */
  spriteName: string;
  /** Explicit glow color — if omitted, uses the source sprite's tint */
  glowColor?: number;
  /** Blur filter strength (default: 30) */
  blurRadius?: number;
  /** Glow alpha / brightness (default: 0.6) */
  intensity?: number;
  /** Scale multiplier for glow relative to source (default: 1.15) */
  glowScale?: number;
}

/**
 * Ambilight glow effect rendered behind a source sprite
 *
 * Features:
 * - Blurred copy of the source sprite placed behind at lower z-index
 * - Configurable blur radius, intensity, glow scale, and color
 * - Optional sinusoidal pulse animation for a breathing glow effect
 * - Runtime updates to source texture, color, and intensity
 * - GSAP-compatible lifecycle (cleanup handled by PixiRenderable base)
 */
export class Ambilight extends PixiRenderable {
  private gpuLoader: PixiLoader;
  private sourceSprite: Sprite;
  private glowSprite: Sprite;
  private blurFilter: BlurFilter;

  private baseIntensity: number;
  private pulseEnabled = AMBILIGHT_DEFAULTS.pulseEnabled;
  private pulseSpeed = AMBILIGHT_DEFAULTS.pulseSpeed;
  private pulseAmount = AMBILIGHT_DEFAULTS.pulseAmount;
  private elapsed = 0;

  /**
   * Creates a new Ambilight instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Ambilight configuration
   */
  constructor(gpuLoader: PixiLoader, config: AmbilightConfig) {
    super('ambilight');

    this.gpuLoader = gpuLoader;

    const blurRadius = config.blurRadius ?? AMBILIGHT_DEFAULTS.blurRadius;
    const intensity = config.intensity ?? AMBILIGHT_DEFAULTS.intensity;
    const glowScale = config.glowScale ?? AMBILIGHT_DEFAULTS.glowScale;

    this.baseIntensity = intensity;

    // Create the glow sprite (blurred copy placed behind)
    this.glowSprite = gpuLoader.createSprite(config.atlasName, config.spriteName)!;
    this.glowSprite.anchor.set(0.5);
    this.glowSprite.scale.set(glowScale);
    this.glowSprite.alpha = intensity;

    this.blurFilter = new BlurFilter({ strength: blurRadius });
    this.glowSprite.filters = [this.blurFilter];

    if (config.glowColor !== undefined) {
      this.glowSprite.tint = config.glowColor;
    }

    // Create the source sprite (rendered on top)
    this.sourceSprite = gpuLoader.createSprite(config.atlasName, config.spriteName)!;
    this.sourceSprite.anchor.set(0.5);

    // Add glow first (lower z-index), then source on top
    this.addChild(this.glowSprite);
    this.addChild(this.sourceSprite);
  }

  /**
   * Update the source texture for both the source and glow sprites
   *
   * @param atlasName - Name of the texture atlas
   * @param spriteName - Frame name within the atlas
   */
  setSource(atlasName: string, spriteName: string): void {
    const texture = this.gpuLoader.getTexture(atlasName, spriteName)!;
    this.sourceSprite.texture = texture;
    this.glowSprite.texture = texture;
  }

  /**
   * Override the glow sprite tint color
   *
   * @param color - Hex color value for the glow
   */
  setGlowColor(color: number): void {
    this.glowSprite.tint = color;
  }

  /**
   * Update the glow intensity (alpha)
   *
   * @param value - Intensity value between 0 and 1
   */
  setIntensity(value: number): void {
    this.baseIntensity = value;
    this.glowSprite.alpha = value;
  }

  /**
   * Per-frame update — drives the optional sinusoidal pulse animation
   *
   * @param dt - Delta time in seconds
   */
  override update(dt: number): void {
    if (!this.pulseEnabled) return;

    this.elapsed += dt;
    const oscillation = Math.sin((this.elapsed / this.pulseSpeed) * Math.PI * 2);
    this.glowSprite.alpha = this.baseIntensity + oscillation * this.pulseAmount;
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
