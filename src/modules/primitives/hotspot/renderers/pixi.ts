import { Graphics } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { HOTSPOT_DEFAULTS } from '../defaults';

/**
 * Position and dimensions of the interactive area
 */
export interface HitAreaDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configuration for creating a Hotspot
 */
export interface HotspotConfig {
  /** Position and dimensions of the interactive area */
  hitArea: HitAreaDef;
  /** Color of the highlight overlay */
  highlightColor?: number;
  /** Alpha when highlighted */
  highlightAlpha?: number;
  /** CSS cursor on hover */
  pointerCursor?: string;
  /** Callback on click/tap */
  onTap?: () => void;
  /** Callback on pointer over */
  onOver?: () => void;
  /** Callback on pointer out */
  onOut?: () => void;
  /** Identifier for this hotspot (used by game logic) */
  itemId?: string;
}

/**
 * Invisible interactive hotspot with highlight overlay
 *
 * Features:
 * - Invisible hit area for click/tap detection
 * - Highlight overlay with GSAP fade animations on hover
 * - Programmatic highlight control (for hint system)
 * - Enable/disable interactivity toggle
 * - Configurable callbacks for tap, over, and out events
 */
export class Hotspot extends PixiRenderable {
  private hitAreaGraphics: Graphics;
  private highlight: Graphics;
  private config: HotspotConfig;
  private readonly highlightAlpha: number;
  private readonly tweenDuration: number;
  private readonly tweenEase: string;

  /**
   * Creates a new Hotspot instance
   *
   * @param _gpuLoader - The GPU loader (unused but kept for consistent primitive constructor signature)
   * @param config - Hotspot configuration
   */
  constructor(_gpuLoader: PixiLoader, config: HotspotConfig) {
    super('hotspot');

    this.config = config;
    this.highlightAlpha = config.highlightAlpha ?? HOTSPOT_DEFAULTS.highlightAlpha;
    this.tweenDuration = HOTSPOT_DEFAULTS.tweenDuration;
    this.tweenEase = HOTSPOT_DEFAULTS.tweenEase;

    const { x, y, width, height } = config.hitArea;
    const padding = HOTSPOT_DEFAULTS.highlightPadding;

    // Create invisible hit area
    this.hitAreaGraphics = new Graphics();
    this.hitAreaGraphics.rect(x, y, width, height);
    this.hitAreaGraphics.fill({ color: 0x000000, alpha: 0 });
    this.addChild(this.hitAreaGraphics);

    // Create highlight overlay (initially hidden)
    const highlightColor = config.highlightColor ?? HOTSPOT_DEFAULTS.highlightColor;
    this.highlight = new Graphics();
    this.highlight.rect(x - padding, y - padding, width + padding * 2, height + padding * 2);
    this.highlight.fill({ color: highlightColor, alpha: 1 });
    this.highlight.alpha = 0;
    this.addChild(this.highlight);

    // Make interactive
    this.eventMode = 'static';
    this.cursor = config.pointerCursor ?? HOTSPOT_DEFAULTS.pointerCursor;

    // Bind event handlers
    this.on('pointerover', this.handlePointerOver.bind(this));
    this.on('pointerout', this.handlePointerOut.bind(this));
    this.on('pointertap', this.handlePointerTap.bind(this));
  }

  /**
   * Handle pointer over event — fade in highlight
   */
  private handlePointerOver(): void {
    gsap.to(this.highlight, {
      alpha: this.highlightAlpha,
      duration: this.tweenDuration,
      ease: this.tweenEase,
    });
    this.config.onOver?.();
  }

  /**
   * Handle pointer out event — fade out highlight
   */
  private handlePointerOut(): void {
    gsap.to(this.highlight, {
      alpha: 0,
      duration: this.tweenDuration,
      ease: this.tweenEase,
    });
    this.config.onOut?.();
  }

  /**
   * Handle pointer tap event
   */
  private handlePointerTap(): void {
    this.config.onTap?.();
  }

  /**
   * Programmatically show or hide the highlight (for hint system)
   *
   * @param visible - Whether the highlight should be visible
   */
  setHighlight(visible: boolean): void {
    gsap.to(this.highlight, {
      alpha: visible ? this.highlightAlpha : 0,
      duration: this.tweenDuration,
      ease: this.tweenEase,
    });
  }

  /**
   * Enable or disable interactivity
   *
   * When disabled, the hotspot becomes non-interactive and the highlight is hidden
   *
   * @param enabled - Whether the hotspot should be interactive
   */
  setEnabled(enabled: boolean): void {
    this.eventMode = enabled ? 'static' : 'none';
    this.cursor = enabled ? (this.config.pointerCursor ?? HOTSPOT_DEFAULTS.pointerCursor) : 'default';
    if (!enabled) {
      gsap.to(this.highlight, {
        alpha: 0,
        duration: this.tweenDuration,
        ease: this.tweenEase,
      });
    }
  }

  // destroy() inherited from PixiRenderable — handles GSAP cleanup, listener removal, child destruction
}
