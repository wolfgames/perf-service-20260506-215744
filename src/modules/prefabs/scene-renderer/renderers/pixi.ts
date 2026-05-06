import { Sprite } from 'pixi.js';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { Ambilight } from '../../../primitives/ambilight';
import { Hotspot, type HitAreaDef } from '../../../primitives/hotspot';
import { SCENE_RENDERER_DEFAULTS } from '../defaults';

/**
 * Hotspot definition for scene configuration
 */
export interface HotspotDef {
  itemId: string;
  hitArea: { x: number; y: number; width: number; height: number };
  onTap?: () => void;
}

/**
 * Configuration for creating a SceneRenderer
 */
export interface SceneRendererConfig {
  /** Name of the texture atlas for the scene */
  atlasName: string;
  /** Frame name for the scene background sprite */
  sceneSpriteName: string;
  /** Array of hotspot definitions */
  hotspots: HotspotDef[];
  /** Enable ambilight effect behind scene (default: true) */
  ambilightEnabled?: boolean;
  /** Callback when any hotspot is tapped */
  onHotspotTap?: (itemId: string) => void;
}

/**
 * SceneRenderer - Pixi-based scene background with ambilight glow and interactive hotspots.
 *
 * Composes the Ambilight and Hotspot primitives into a single prefab:
 * - Background scene sprite from a texture atlas
 * - Optional ambilight glow rendered behind the scene
 * - Interactive hotspot overlays with highlight support (for hint system)
 * - Aspect-ratio-preserving resize to fit viewport
 */
export class SceneRenderer extends PixiRenderable {
  private gpuLoader: PixiLoader;
  private sceneSprite: Sprite;
  private ambilight: Ambilight | null = null;
  private hotspots: Map<string, Hotspot> = new Map();
  private config: SceneRendererConfig;

  /**
   * Creates a new SceneRenderer instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Scene renderer configuration
   */
  constructor(gpuLoader: PixiLoader, config: SceneRendererConfig) {
    super('scene-renderer');

    this.gpuLoader = gpuLoader;
    this.config = config;

    const ambilightEnabled = config.ambilightEnabled ?? SCENE_RENDERER_DEFAULTS.ambilightEnabled;

    // Create ambilight glow behind the scene sprite
    if (ambilightEnabled) {
      this.ambilight = new Ambilight(gpuLoader, {
        atlasName: config.atlasName,
        spriteName: config.sceneSpriteName,
        blurRadius: SCENE_RENDERER_DEFAULTS.ambilightBlurRadius,
        intensity: SCENE_RENDERER_DEFAULTS.ambilightIntensity,
        glowScale: SCENE_RENDERER_DEFAULTS.ambilightGlowScale,
      });
      this.addChild(this.ambilight);
    }

    // Create scene background sprite
    this.sceneSprite = gpuLoader.createSprite(config.atlasName, config.sceneSpriteName)!;
    this.sceneSprite.anchor.set(0.5);
    this.addChild(this.sceneSprite);

    // Create hotspot instances
    for (const def of config.hotspots) {
      this.createHotspot(def);
    }
  }

  /**
   * Create a single hotspot from a definition and add it to the scene
   */
  private createHotspot(def: HotspotDef): void {
    const hotspot = new Hotspot(this.gpuLoader, {
      hitArea: def.hitArea as HitAreaDef,
      highlightColor: SCENE_RENDERER_DEFAULTS.hotspotHighlightColor,
      highlightAlpha: SCENE_RENDERER_DEFAULTS.hotspotHighlightAlpha,
      itemId: def.itemId,
      onTap: () => {
        def.onTap?.();
        this.config.onHotspotTap?.(def.itemId);
      },
    });

    this.hotspots.set(def.itemId, hotspot);
    this.addChild(hotspot);
  }

  /**
   * Remove a hotspot by item ID
   *
   * @param itemId - The identifier of the hotspot to remove
   */
  removeHotspot(itemId: string): void {
    const hotspot = this.hotspots.get(itemId);
    if (!hotspot) return;

    this.hotspots.delete(itemId);
    this.removeChild(hotspot);
    hotspot.destroy();
  }

  /**
   * Highlight a specific hotspot (for hint system)
   *
   * @param itemId - The identifier of the hotspot to highlight
   */
  highlightHotspot(itemId: string): void {
    const hotspot = this.hotspots.get(itemId);
    if (hotspot) {
      hotspot.setHighlight(true);
    }
  }

  /**
   * Clear all hotspot highlights
   */
  clearHighlights(): void {
    for (const hotspot of this.hotspots.values()) {
      hotspot.setHighlight(false);
    }
  }

  /**
   * Toggle the ambilight glow effect
   *
   * @param enabled - Whether the ambilight should be visible
   */
  setAmbilightEnabled(enabled: boolean): void {
    if (this.ambilight) {
      this.ambilight.visible = enabled;
    }
  }

  /**
   * Scale the scene to fit the viewport while maintaining aspect ratio
   *
   * @param w - Viewport width
   * @param h - Viewport height
   */
  override resize(w: number, h: number): void {
    // Position at viewport center
    this.x = w / 2;
    this.y = h / 2;

    // Scale scene to fit viewport while maintaining aspect ratio (contain)
    const textureWidth = this.sceneSprite.texture.width;
    const textureHeight = this.sceneSprite.texture.height;

    if (textureWidth === 0 || textureHeight === 0) return;

    const scaleX = w / textureWidth;
    const scaleY = h / textureHeight;
    const fitScale = Math.min(scaleX, scaleY);

    this.sceneSprite.scale.set(fitScale);

    // Match ambilight to scene scale (its own glowScale is applied internally)
    if (this.ambilight) {
      this.ambilight.scale.set(fitScale);
    }
  }

  /**
   * Clean up resources
   */
  override destroy(): void {
    this.hotspots.clear();
    super.destroy();
  }
}
