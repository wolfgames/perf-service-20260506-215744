import { Sprite, Graphics } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { SCENE_THUMBNAIL_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a SceneThumbnail
 */
export interface SceneThumbnailConfig {
  /** Name of the texture atlas */
  atlasName: string;
  /** Frame name for the scene image */
  spriteName: string;
  /** Show lock overlay (default: false) */
  isLocked?: boolean;
  /** Show selected border highlight (default: false) */
  isSelected?: boolean;
  /** Thumbnail size in pixels (square) */
  size?: number;
  /** Default border color */
  borderColor?: number;
  /** Border color when selected */
  selectedBorderColor?: number;
  /** Darkness of the lock overlay (0-1) */
  lockedOverlayAlpha?: number;
  /** Callback when thumbnail is tapped */
  onTap?: () => void;
  /** Frame name for the lock icon in the atlas */
  lockIconFrame?: string;
}

/**
 * Scene thumbnail component using Pixi sprites
 *
 * Features:
 * - Scene image from atlas, scaled to fit thumbnail size
 * - Stroked border rect with selected/default color states
 * - Optional lock overlay with semi-transparent darkening + lock icon
 * - GSAP reveal animation (scale from 0 + fade in)
 * - GSAP selection animation (scale tween + border color change)
 * - Enable/disable interactivity
 */
export class SceneThumbnail extends PixiRenderable {
  private sceneSprite: Sprite;
  private border: Graphics;
  private lockOverlay: Graphics | null = null;
  private lockIcon: Sprite | null = null;
  private _isLocked: boolean;
  private _isSelected: boolean;
  private config: SceneThumbnailConfig;
  private readonly size: number;
  private readonly borderWidth: number;

  /**
   * Creates a new SceneThumbnail instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Thumbnail configuration
   */
  constructor(gpuLoader: PixiLoader, config: SceneThumbnailConfig) {
    super('scene-thumbnail');

    this.config = config;
    this.size = config.size ?? SCENE_THUMBNAIL_DEFAULTS.size;
    this.borderWidth = SCENE_THUMBNAIL_DEFAULTS.borderWidth;
    this._isLocked = config.isLocked ?? false;
    this._isSelected = config.isSelected ?? false;

    // Create border graphics
    this.border = new Graphics();
    this.drawBorder(this._isSelected);
    this.addChild(this.border);

    // Create scene sprite from atlas, scaled to fit within the border
    this.sceneSprite = gpuLoader.createSprite(config.atlasName, config.spriteName)!;
    this.sceneSprite.anchor.set(0.5);
    this.fitSpriteToSize(this.sceneSprite);
    this.addChild(this.sceneSprite);

    // Create mask to clip sprite to border bounds
    const mask = new Graphics();
    const innerSize = this.size - this.borderWidth * 2;
    mask.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
    mask.fill(0xffffff);
    this.addChild(mask);
    this.sceneSprite.mask = mask;

    // Create lock overlay if needed
    if (config.lockIconFrame) {
      const icon = gpuLoader.createSprite(config.atlasName, config.lockIconFrame);
      if (icon) {
        this.lockIcon = icon;
        this.lockIcon.anchor.set(0.5);
        // Scale lock icon to ~40% of thumbnail size
        const iconTargetSize = this.size * 0.4;
        const iconScale = iconTargetSize / Math.max(this.lockIcon.width, this.lockIcon.height);
        this.lockIcon.scale.set(iconScale);
      }
    }

    this.buildLockOverlay();
    this.updateLockedState(false);

    // Make interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Bind pointer events
    if (config.onTap) {
      this.on('pointertap', config.onTap);
    }

    // If initially locked, disable pointer events
    if (this._isLocked) {
      this.eventMode = 'none';
      this.cursor = 'default';
    }
  }

  /**
   * Scale sprite to fit within the thumbnail size (minus border)
   */
  private fitSpriteToSize(sprite: Sprite): void {
    const innerSize = this.size - this.borderWidth * 2;
    const scale = innerSize / Math.max(sprite.texture.width, sprite.texture.height);
    sprite.scale.set(scale);
  }

  /**
   * Draw the border rect
   */
  private drawBorder(selected: boolean): void {
    const color = selected
      ? (this.config.selectedBorderColor ?? SCENE_THUMBNAIL_DEFAULTS.selectedBorderColor)
      : (this.config.borderColor ?? SCENE_THUMBNAIL_DEFAULTS.borderColor);
    const half = this.size / 2;

    this.border.clear();
    this.border.rect(-half, -half, this.size, this.size);
    this.border.stroke({ width: this.borderWidth, color });
  }

  /**
   * Build the lock overlay graphics (dark rect + optional icon)
   */
  private buildLockOverlay(): void {
    this.lockOverlay = new Graphics();
    const innerSize = this.size - this.borderWidth * 2;
    this.lockOverlay.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
    this.lockOverlay.fill({
      color: SCENE_THUMBNAIL_DEFAULTS.lockedOverlayColor,
      alpha: this.config.lockedOverlayAlpha ?? SCENE_THUMBNAIL_DEFAULTS.lockedOverlayAlpha,
    });
    this.addChild(this.lockOverlay);

    if (this.lockIcon) {
      this.addChild(this.lockIcon);
    }
  }

  /**
   * Update visibility of locked state elements
   */
  private updateLockedState(animate: boolean): void {
    const targetAlpha = this._isLocked ? 1 : 0;

    if (animate) {
      if (this.lockOverlay) {
        gsap.to(this.lockOverlay, { alpha: targetAlpha, duration: 0.2, ease: 'power2.out' });
      }
      if (this.lockIcon) {
        gsap.to(this.lockIcon, { alpha: targetAlpha, duration: 0.2, ease: 'power2.out' });
      }
    } else {
      if (this.lockOverlay) this.lockOverlay.alpha = targetAlpha;
      if (this.lockIcon) this.lockIcon.alpha = targetAlpha;
    }
  }

  /**
   * Show or hide the lock overlay with a fade animation
   *
   * @param locked - Whether the thumbnail should appear locked
   */
  setLocked(locked: boolean): void {
    this._isLocked = locked;
    this.updateLockedState(true);
    this.eventMode = locked ? 'none' : 'static';
    this.cursor = locked ? 'default' : 'pointer';
  }

  /**
   * Toggle the selected state with border color change and scale tween
   *
   * @param selected - Whether the thumbnail is selected
   */
  setSelected(selected: boolean): void {
    this._isSelected = selected;
    this.drawBorder(selected);

    const targetScale = selected ? SCENE_THUMBNAIL_DEFAULTS.selectedScale : 1;
    gsap.to(this.scale, {
      x: targetScale,
      y: targetScale,
      duration: SCENE_THUMBNAIL_DEFAULTS.selectDuration,
      ease: SCENE_THUMBNAIL_DEFAULTS.revealEase,
    });
  }

  /**
   * Play reveal animation — scale from 0 + fade in
   *
   * @returns Promise that resolves when the animation completes
   */
  playReveal(): Promise<void> {
    this.scale.set(0);
    this.alpha = 0;

    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 1,
        duration: SCENE_THUMBNAIL_DEFAULTS.revealDuration,
        ease: SCENE_THUMBNAIL_DEFAULTS.revealEase,
      });
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: SCENE_THUMBNAIL_DEFAULTS.revealDuration,
        ease: SCENE_THUMBNAIL_DEFAULTS.revealEase,
        onComplete: resolve,
      });
    });
  }

  /**
   * Enable or disable the thumbnail interactivity
   *
   * When disabled, the thumbnail becomes non-interactive and semi-transparent
   *
   * @param enabled - Whether the thumbnail should be interactive
   */
  setEnabled(enabled: boolean): void {
    this.eventMode = enabled ? 'static' : 'none';
    this.alpha = enabled ? 1 : SCENE_THUMBNAIL_DEFAULTS.disabledAlpha;
    this.cursor = enabled ? 'pointer' : 'default';
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
