import { type Sprite } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { ROTATABLE_TILE_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a RotatableTile
 */
export interface RotatableTileConfig {
  /** Name of the texture atlas */
  atlasName: string;
  /** Default state sprite frame name */
  defaultSpriteName: string;
  /** Active/completed state sprite frame name */
  activeSpriteName: string;
  /** Tile size in pixels */
  tileSize?: number;
  /** Grid column */
  col: number;
  /** Grid row */
  row: number;
  /** Initial rotation state (0-3, each = 90 degrees) */
  initialRotation?: number;
  /** Whether the tile is interactive */
  interactive?: boolean;
}

/**
 * RotatableTile — dual-sprite tile with 90-degree rotation and state toggle.
 *
 * Generalized from RoadTile: supports default/active sprite swap, animated
 * rotation in 90° increments, jiggle feedback, and grid positioning.
 * Game-specific logic (connection edges, solution checking) lives outside.
 */
export class RotatableTile extends PixiRenderable {
  readonly col: number;
  readonly row: number;

  private defaultSprite: Sprite;
  private activeSprite: Sprite;
  private _rotState: number;
  private _visualRotation: number;
  private _isActive = false;
  private tileSize: number;

  constructor(gpuLoader: PixiLoader, config: RotatableTileConfig) {
    super('rotatable-tile');

    const d = ROTATABLE_TILE_DEFAULTS;
    this.col = config.col;
    this.row = config.row;
    this.tileSize = config.tileSize ?? d.tileSize;
    this._rotState = config.initialRotation ?? 0;
    this._visualRotation = this._rotState * 90;

    const spriteSize = this.tileSize + d.overlapPx;

    // Default state sprite
    this.defaultSprite = gpuLoader.createSprite(config.atlasName, config.defaultSpriteName)!;
    this.defaultSprite.anchor.set(0.5);
    this.defaultSprite.width = spriteSize;
    this.defaultSprite.height = spriteSize;

    // Active state sprite (hidden initially)
    this.activeSprite = gpuLoader.createSprite(config.atlasName, config.activeSpriteName)!;
    this.activeSprite.anchor.set(0.5);
    this.activeSprite.width = spriteSize;
    this.activeSprite.height = spriteSize;
    this.activeSprite.visible = false;

    this.addChild(this.defaultSprite);
    this.addChild(this.activeSprite);

    // Apply initial rotation
    this.applyRotation();

    // Grid positioning
    this.x = this.col * this.tileSize + this.tileSize / 2;
    this.y = this.row * this.tileSize + this.tileSize / 2;

    // Interactivity
    if (config.interactive !== false) {
      this.eventMode = 'static';
      this.cursor = 'pointer';
    }
  }

  /** Current rotation state (0-3) */
  get rotationState(): number {
    return this._rotState;
  }

  /** Whether the tile is in active state */
  get isActive(): boolean {
    return this._isActive;
  }

  /** Rotate 90 degrees clockwise with optional animation */
  rotate(animated = true): void {
    const d = ROTATABLE_TILE_DEFAULTS;
    this._rotState = (this._rotState + 1) % 4;
    this._visualRotation += 90;

    if (animated && d.rotationDurationMs > 0) {
      const targetRadians = (this._visualRotation * Math.PI) / 180;
      gsap.killTweensOf(this.defaultSprite, 'rotation');
      gsap.killTweensOf(this.activeSprite, 'rotation');
      const dur = d.rotationDurationMs / 1000;
      gsap.to(this.defaultSprite, { rotation: targetRadians, duration: dur, ease: d.rotationEase });
      gsap.to(this.activeSprite, { rotation: targetRadians, duration: dur, ease: d.rotationEase });
    } else {
      this.applyRotation();
    }
  }

  /** Set rotation state directly (for loading saved state) */
  setRotation(rotation: number): void {
    this._rotState = rotation % 4;
    this._visualRotation = this._rotState * 90;
    this.applyRotation();
  }

  /** Toggle between default and active sprite */
  setActive(active: boolean): void {
    this._isActive = active;
    this.defaultSprite.visible = !active;
    this.activeSprite.visible = active;
  }

  /** Jiggle the tile visually without changing rotation state */
  jiggle(): gsap.core.Timeline {
    const d = ROTATABLE_TILE_DEFAULTS;
    const baseRad = (this._visualRotation * Math.PI) / 180;
    const offsetRad = (d.jiggleAngle * Math.PI) / 180;
    const tl = gsap.timeline();

    // Flash
    if (d.jiggleFlashIntensity > 0) {
      const target = this._isActive ? this.activeSprite : this.defaultSprite;
      tl.fromTo(target, { tint: 0xffffff }, { tint: 0xffffff, duration: 0.05, ease: 'none' }, 0);
      tl.to(target, { tint: 0xffffff, duration: 0.4, ease: 'power2.out' }, 0.05);
    }

    // Rotation jiggle
    const sprites = [this.defaultSprite, this.activeSprite];
    for (let i = 0; i < d.jiggleCycles; i++) {
      const cycleStart = i * d.jiggleHalfDuration * 2;
      tl.to(sprites, { rotation: baseRad + offsetRad, duration: d.jiggleHalfDuration, ease: d.jiggleEase }, cycleStart);
      tl.to(sprites, { rotation: baseRad - offsetRad, duration: d.jiggleHalfDuration, ease: d.jiggleEase }, cycleStart + d.jiggleHalfDuration);
    }
    tl.to(sprites, { rotation: baseRad, duration: d.jiggleHalfDuration, ease: d.jiggleEase }, d.jiggleCycles * d.jiggleHalfDuration * 2);

    return tl;
  }

  /** Update tile size (for live tuning) */
  setTileSize(newSize: number): void {
    this.tileSize = newSize;
    const spriteSize = newSize + ROTATABLE_TILE_DEFAULTS.overlapPx;
    this.x = this.col * newSize + newSize / 2;
    this.y = this.row * newSize + newSize / 2;
    this.defaultSprite.width = spriteSize;
    this.defaultSprite.height = spriteSize;
    this.activeSprite.width = spriteSize;
    this.activeSprite.height = spriteSize;
  }

  private applyRotation(): void {
    const radians = (this._visualRotation * Math.PI) / 180;
    this.defaultSprite.rotation = radians;
    this.activeSprite.rotation = radians;
  }
}
