import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { SceneThumbnail } from '../../../primitives/scene-thumbnail';
import { EVIDENCE_LIST_DEFAULTS } from '../defaults';

/**
 * Definition for a single evidence item
 */
export interface EvidenceItemDef {
  itemId: string;
  label: string;
  atlasName: string;
  spriteName: string;
  isFound: boolean;
}

/**
 * Configuration for creating an EvidenceList
 */
export interface EvidenceListConfig {
  /** Evidence items to display */
  items: EvidenceItemDef[];
  /** Optional click callback when an item is tapped */
  onItemClick?: (itemId: string) => void;
  /** Max visible height before scrolling is enabled */
  maxHeight?: number;
  /** Size of each item thumbnail (square, pixels) */
  thumbnailSize?: number;
}

/**
 * Internal bookkeeping for a rendered evidence row
 */
interface EvidenceRow {
  def: EvidenceItemDef;
  container: Container;
  thumbnail: SceneThumbnail;
  label: Text;
}

/**
 * EvidenceList — scrollable list of evidence items with thumbnails and labels.
 *
 * Each row contains a SceneThumbnail + Text label arranged horizontally.
 * Rows are stacked vertically with a configurable gap. When the total height
 * exceeds `maxHeight`, a mask is applied and pointer-drag / mouse-wheel
 * scrolling is enabled.
 *
 * Found items render at full alpha with `foundTint`; unfound items render
 * at `unfoundAlpha` with `unfoundTint`. The `markFound` method transitions
 * an item's visual state via GSAP.
 */
export class EvidenceList extends PixiRenderable {
  private readonly gpuLoader: PixiLoader;
  private readonly config: EvidenceListConfig;

  private readonly scrollContainer: Container;
  private readonly scrollMask: Graphics;
  private rows: EvidenceRow[] = [];

  private readonly thumbnailSize: number;
  private readonly maxHeight: number;

  private scrollY = 0;
  private maxScrollY = 0;
  private isDragging = false;
  private dragStartY = 0;
  private dragScrollStart = 0;

  constructor(gpuLoader: PixiLoader, config: EvidenceListConfig) {
    super('evidence-list');

    this.gpuLoader = gpuLoader;
    this.config = config;
    this.thumbnailSize = config.thumbnailSize ?? EVIDENCE_LIST_DEFAULTS.thumbnailSize;
    this.maxHeight = config.maxHeight ?? EVIDENCE_LIST_DEFAULTS.maxHeight;

    // Scrollable inner container that holds all rows
    this.scrollContainer = new Container();
    this.scrollContainer.label = 'scroll-container';
    this.addChild(this.scrollContainer);

    // Mask applied when content exceeds maxHeight
    this.scrollMask = new Graphics();
    this.addChild(this.scrollMask);

    // Build rows from initial items
    this.buildRows(config.items);
    this.applyScrollMask();
    this.setupScrollInteraction();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Transition an item from unfound to found state with a GSAP animation.
   */
  markFound(itemId: string): void {
    const row = this.rows.find((r) => r.def.itemId === itemId);
    if (!row || row.def.isFound) return;

    row.def.isFound = true;

    gsap.to(row.thumbnail, {
      alpha: EVIDENCE_LIST_DEFAULTS.foundAlpha,
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.to(row.thumbnail, {
      pixi: { tint: EVIDENCE_LIST_DEFAULTS.foundTint },
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.to(row.label, {
      alpha: EVIDENCE_LIST_DEFAULTS.foundAlpha,
      duration: 0.35,
      ease: 'power2.out',
    });
  }

  /**
   * Retrieve the definition for a given item by id.
   */
  getItem(itemId: string): EvidenceItemDef | undefined {
    return this.rows.find((r) => r.def.itemId === itemId)?.def;
  }

  /**
   * Number of items currently marked as found.
   */
  get foundCount(): number {
    return this.rows.filter((r) => r.def.isFound).length;
  }

  /**
   * Total number of evidence items.
   */
  get totalCount(): number {
    return this.rows.length;
  }

  // ---------------------------------------------------------------------------
  // Row construction
  // ---------------------------------------------------------------------------

  private buildRows(items: EvidenceItemDef[]): void {
    const { gap, padding } = EVIDENCE_LIST_DEFAULTS;
    let yOffset = padding;

    for (const item of items) {
      const rowContainer = new Container();
      rowContainer.label = `row-${item.itemId}`;

      // Thumbnail via SceneThumbnail primitive
      const thumbnail = new SceneThumbnail(this.gpuLoader, {
        atlasName: item.atlasName,
        spriteName: item.spriteName,
        size: this.thumbnailSize,
        onTap: this.config.onItemClick
          ? () => this.config.onItemClick!(item.itemId)
          : undefined,
      });

      // Apply found / unfound visual state (no animation on initial build)
      if (item.isFound) {
        thumbnail.alpha = EVIDENCE_LIST_DEFAULTS.foundAlpha;
        thumbnail.tint = EVIDENCE_LIST_DEFAULTS.foundTint;
      } else {
        thumbnail.alpha = EVIDENCE_LIST_DEFAULTS.unfoundAlpha;
        thumbnail.tint = EVIDENCE_LIST_DEFAULTS.unfoundTint;
      }

      // SceneThumbnail is anchor-centered, so offset by half size
      thumbnail.x = padding + this.thumbnailSize / 2;
      thumbnail.y = this.thumbnailSize / 2;
      rowContainer.addChild(thumbnail);

      // Label text to the right of the thumbnail
      const label = new Text({
        text: item.label,
        style: {
          fontSize: EVIDENCE_LIST_DEFAULTS.labelFontSize,
          fill: EVIDENCE_LIST_DEFAULTS.labelColor,
          wordWrap: false,
        },
      });
      label.anchor.set(0, 0.5);
      label.x = padding + this.thumbnailSize + gap;
      label.y = this.thumbnailSize / 2;
      label.alpha = item.isFound
        ? EVIDENCE_LIST_DEFAULTS.foundAlpha
        : EVIDENCE_LIST_DEFAULTS.unfoundAlpha;
      rowContainer.addChild(label);

      // Position row
      rowContainer.y = yOffset;
      this.scrollContainer.addChild(rowContainer);

      this.rows.push({ def: item, container: rowContainer, thumbnail, label });

      yOffset += this.thumbnailSize + gap;
    }
  }

  // ---------------------------------------------------------------------------
  // Scroll mask & interaction
  // ---------------------------------------------------------------------------

  private applyScrollMask(): void {
    const contentHeight = this.getContentHeight();
    if (contentHeight <= this.maxHeight) {
      this.scrollContainer.mask = null;
      this.maxScrollY = 0;
      return;
    }

    const maskWidth = this.getContentWidth();
    this.scrollMask.clear();
    this.scrollMask.rect(0, 0, maskWidth, this.maxHeight);
    this.scrollMask.fill({ color: 0xffffff });
    this.scrollContainer.mask = this.scrollMask;

    this.maxScrollY = contentHeight - this.maxHeight;
  }

  private setupScrollInteraction(): void {
    // Hit area covering the full visible region for wheel / drag events
    const hitArea = new Graphics();
    hitArea.rect(0, 0, this.getContentWidth(), this.maxHeight);
    hitArea.fill({ color: 0x000000, alpha: 0.01 });
    hitArea.eventMode = 'static';
    this.addChild(hitArea);

    // Mouse wheel scrolling
    hitArea.on('wheel', (e: WheelEvent) => {
      this.scrollBy(e.deltaY > 0 ? EVIDENCE_LIST_DEFAULTS.scrollSpeed : -EVIDENCE_LIST_DEFAULTS.scrollSpeed);
    });

    // Pointer drag scrolling
    hitArea.on('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStartY = e.global.y;
      this.dragScrollStart = this.scrollY;
    });

    hitArea.on('pointermove', (e) => {
      if (!this.isDragging) return;
      const delta = this.dragStartY - e.global.y;
      this.setScroll(this.dragScrollStart + delta);
    });

    hitArea.on('pointerup', () => {
      this.isDragging = false;
    });

    hitArea.on('pointerupoutside', () => {
      this.isDragging = false;
    });
  }

  private scrollBy(delta: number): void {
    this.setScroll(this.scrollY + delta);
  }

  private setScroll(value: number): void {
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, value));
    this.scrollContainer.y = -this.scrollY;
  }

  // ---------------------------------------------------------------------------
  // Measurement helpers
  // ---------------------------------------------------------------------------

  private getContentHeight(): number {
    const { gap, padding } = EVIDENCE_LIST_DEFAULTS;
    return padding * 2 + this.rows.length * this.thumbnailSize + Math.max(0, this.rows.length - 1) * gap;
  }

  private getContentWidth(): number {
    const { gap, padding } = EVIDENCE_LIST_DEFAULTS;
    // Estimate: padding + thumbnail + gap + generous label width
    return padding * 2 + this.thumbnailSize + gap + 160;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override destroy(): void {
    this.isDragging = false;
    super.destroy();
  }
}
