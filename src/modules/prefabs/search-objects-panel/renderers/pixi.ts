import { Graphics } from 'pixi.js';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { SpriteButton } from '../../../primitives/sprite-button';
import { SEARCH_OBJECTS_PANEL_DEFAULTS } from '../defaults';

/**
 * Configuration forwarded to the EvidenceList sub-component.
 * Mirrors the evidence-list prefab's expected config shape.
 */
export interface EvidenceListConfig {
  atlasName: string;
  items: Array<{ id: string; spriteName: string; label?: string }>;
  columns?: number;
  width?: number;
}

/**
 * Configuration for creating a SearchObjectsPanel
 */
export interface SearchObjectsPanelConfig {
  /** Config forwarded to the EvidenceList sub-component */
  evidenceListConfig: EvidenceListConfig;
  /** Name of the texture atlas for button sprites */
  atlasName: string;
  /** Sprite frame name for the hint button */
  hintButtonSpriteName: string;
  /** Current progress value 0-1 */
  progress: number;
  /** Whether the hint button is interactive (default: true) */
  hintEnabled?: boolean;
  /** Callback when hint button is clicked */
  onHintClick?: () => void;
  /** Cooldown progress 0-1 for the hint button visual overlay */
  hintCooldownProgress?: number;
}

/**
 * SearchObjectsPanel — Pixi prefab composing a progress bar, evidence list,
 * and hint button into a vertical panel layout.
 *
 * Sections are stacked top-to-bottom:
 *  1. Progress bar (Graphics track + fill)
 *  2. Evidence list placeholder area
 *  3. Hint button with optional cooldown overlay
 */
export class SearchObjectsPanel extends PixiRenderable {
  private progressTrack: Graphics;
  private progressFill: Graphics;
  private evidenceContainer: PixiRenderable;
  private hintButton: SpriteButton;
  private hintCooldownOverlay: Graphics;

  private currentProgress: number;
  private panelWidth = 0;

  private readonly defaults = SEARCH_OBJECTS_PANEL_DEFAULTS;

  constructor(gpuLoader: PixiLoader, config: SearchObjectsPanelConfig) {
    super('search-objects-panel');

    this.currentProgress = Math.max(0, Math.min(config.progress, 1));

    const {
      panelPadding,
      sectionGap,
      progressHeight,
      progressTrackColor,
      progressCornerRadius,
      hintButtonSize,
    } = this.defaults;

    let yOffset = panelPadding;

    // --- Section 1: Progress bar ---
    this.progressTrack = new Graphics();
    this.progressTrack.y = yOffset;
    this.progressTrack.x = panelPadding;
    this.addChild(this.progressTrack);

    this.progressFill = new Graphics();
    this.progressFill.y = yOffset;
    this.progressFill.x = panelPadding;
    this.addChild(this.progressFill);

    yOffset += progressHeight + sectionGap;

    // --- Section 2: Evidence list container ---
    // Placeholder container — the EvidenceList renderer can be added here
    // when its pixi renderer is implemented.
    this.evidenceContainer = new PixiRenderable('evidence-list-container');
    this.evidenceContainer.x = panelPadding;
    this.evidenceContainer.y = yOffset;
    this.addChild(this.evidenceContainer);

    // Reserve space — the actual height will be dictated by evidence list content
    yOffset += sectionGap;

    // --- Section 3: Hint button ---
    this.hintButton = new SpriteButton(gpuLoader, {
      atlasName: config.atlasName,
      spriteName: config.hintButtonSpriteName,
      width: hintButtonSize,
      height: hintButtonSize,
      onClick: config.onHintClick ?? (() => {}),
    });
    this.hintButton.x = panelPadding + hintButtonSize / 2;
    this.hintButton.y = yOffset + hintButtonSize / 2;
    this.addChild(this.hintButton);

    // Cooldown overlay drawn on top of the hint button
    this.hintCooldownOverlay = new Graphics();
    this.hintCooldownOverlay.x = this.hintButton.x;
    this.hintCooldownOverlay.y = this.hintButton.y;
    this.hintCooldownOverlay.alpha = 0.5;
    this.addChild(this.hintCooldownOverlay);

    // Apply initial state
    if (config.hintEnabled === false) {
      this.hintButton.setEnabled(false);
    }

    if (config.hintCooldownProgress !== undefined) {
      this.drawCooldownOverlay(config.hintCooldownProgress);
    }

    // Initial draw of progress bar is deferred until panelWidth is set via resize
    this.drawProgressTrack(progressTrackColor, progressCornerRadius, progressHeight);
    this.drawProgressFill();
  }

  /**
   * Update the progress bar fill (0-1).
   */
  setProgress(value: number): void {
    this.currentProgress = Math.max(0, Math.min(value, 1));
    this.drawProgressFill();
  }

  /**
   * Enable or disable the hint button.
   */
  setHintEnabled(enabled: boolean): void {
    this.hintButton.setEnabled(enabled);
  }

  /**
   * Update the cooldown overlay on the hint button (0-1).
   * 0 = no cooldown visible, 1 = fully covered.
   */
  setHintCooldown(progress: number): void {
    this.drawCooldownOverlay(Math.max(0, Math.min(progress, 1)));
  }

  /**
   * Forward an evidence-found event to the evidence list.
   * This delegates to the evidence container's child if present.
   */
  markEvidenceFound(itemId: string): void {
    // Walk children of the evidence container looking for a markFound method
    for (const child of this.evidenceContainer.children) {
      if ('markFound' in child && typeof (child as any).markFound === 'function') {
        (child as any).markFound(itemId);
        return;
      }
    }
  }

  /**
   * Respond to viewport resize — recalculates progress bar width.
   */
  override resize(width: number, _height: number): void {
    this.panelWidth = width;
    this.drawProgressTrack(
      this.defaults.progressTrackColor,
      this.defaults.progressCornerRadius,
      this.defaults.progressHeight,
    );
    this.drawProgressFill();
  }

  // ─── Private drawing helpers ──────────────────────────────────

  private drawProgressTrack(trackColor: number, cornerRadius: number, height: number): void {
    const barWidth = Math.max(0, this.panelWidth - this.defaults.panelPadding * 2);
    this.progressTrack.clear();
    this.progressTrack.roundRect(0, 0, barWidth, height, cornerRadius);
    this.progressTrack.fill(trackColor);
  }

  private drawProgressFill(): void {
    const { progressHeight, progressCornerRadius, progressFillColor, panelPadding } = this.defaults;
    const barWidth = Math.max(0, this.panelWidth - panelPadding * 2);
    const fillWidth = barWidth * this.currentProgress;

    this.progressFill.clear();
    if (fillWidth > 0) {
      this.progressFill.roundRect(0, 0, fillWidth, progressHeight, progressCornerRadius);
      this.progressFill.fill(progressFillColor);
    }
  }

  /**
   * Draw a circular sweep overlay on the hint button to indicate cooldown.
   * Uses a pie-slice approach: 0 = empty, 1 = full circle.
   */
  private drawCooldownOverlay(progress: number): void {
    this.hintCooldownOverlay.clear();
    if (progress <= 0) return;

    const radius = this.defaults.hintButtonSize / 2;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * progress;

    this.hintCooldownOverlay.moveTo(0, 0);
    this.hintCooldownOverlay.arc(0, 0, radius, startAngle, endAngle);
    this.hintCooldownOverlay.lineTo(0, 0);
    this.hintCooldownOverlay.fill({ color: 0x000000, alpha: 0.6 });
  }
}
