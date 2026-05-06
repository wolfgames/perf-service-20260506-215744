import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { SpriteButton } from '../../../primitives/sprite-button';
import { OPTIONS_MENU_DEFAULTS } from '../defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MenuItemDef =
  | { type: 'button'; label: string; onClick: () => void }
  | { type: 'toggle'; label: string; value: boolean; onChange: (value: boolean) => void }
  | {
      type: 'slider';
      label: string;
      value: number;
      min: number;
      max: number;
      step: number;
      onChange: (value: number) => void;
    };

/**
 * Configuration for creating an OptionsMenu
 */
export interface OptionsMenuConfig {
  /** Menu items to render */
  items: MenuItemDef[];
  /** Name of the texture atlas */
  atlasName: string;
  /** Frame name for button sprite backgrounds */
  buttonSpriteName: string;
  /** Close callback */
  onClose?: () => void;
  /** Panel width override */
  width?: number;
  /** Optional title displayed at the top of the menu */
  title?: string;
}

// ---------------------------------------------------------------------------
// OptionsMenu
// ---------------------------------------------------------------------------

/**
 * OptionsMenu — Pixi-based settings panel with buttons, toggles, and sliders.
 *
 * Items are laid out vertically inside a rounded-rect background panel.
 * A close button (X) sits in the top-right corner.
 */
export class OptionsMenu extends PixiRenderable {
  private bg: Graphics;
  private itemContainer: Container;
  private closeBtn: SpriteButton | Graphics;
  private config: OptionsMenuConfig;

  private readonly menuWidth: number;
  private readonly itemHeight: number;
  private readonly itemGap: number;
  private readonly padding: number;

  constructor(gpuLoader: PixiLoader, config: OptionsMenuConfig) {
    super('options-menu');

    this.config = config;

    this.menuWidth = config.width ?? OPTIONS_MENU_DEFAULTS.width;
    this.itemHeight = OPTIONS_MENU_DEFAULTS.itemHeight;
    this.itemGap = OPTIONS_MENU_DEFAULTS.itemGap;
    this.padding = OPTIONS_MENU_DEFAULTS.padding;

    // ---- Background panel ----
    this.bg = new Graphics();
    this.addChild(this.bg);

    // ---- Title (optional) ----
    let titleHeight = 0;
    if (config.title) {
      const titleText = new Text({
        text: config.title,
        style: {
          fontSize: OPTIONS_MENU_DEFAULTS.titleFontSize,
          fontWeight: 'bold',
          fill: 0xffffff,
          align: 'center',
        },
      });
      titleText.anchor.set(0.5, 0);
      titleText.x = this.menuWidth / 2;
      titleText.y = this.padding;
      this.addChild(titleText);
      titleHeight = titleText.height + this.padding;
    }

    // ---- Item container ----
    this.itemContainer = new Container();
    this.itemContainer.label = 'items';
    this.itemContainer.x = this.padding;
    this.itemContainer.y = this.padding + titleHeight;
    this.addChild(this.itemContainer);

    const contentWidth = this.menuWidth - this.padding * 2;
    let yOffset = 0;

    for (const item of config.items) {
      const row = new Container();
      row.label = `item-${item.label}`;
      row.y = yOffset;

      switch (item.type) {
        case 'button':
          this.buildButtonRow(gpuLoader, row, item, contentWidth);
          break;
        case 'toggle':
          this.buildToggleRow(row, item, contentWidth);
          break;
        case 'slider':
          this.buildSliderRow(row, item, contentWidth);
          break;
      }

      this.itemContainer.addChild(row);
      yOffset += this.itemHeight + this.itemGap;
    }

    // ---- Draw background ----
    const totalHeight = this.padding * 2 + titleHeight + yOffset - this.itemGap;
    this.bg.roundRect(0, 0, this.menuWidth, totalHeight, OPTIONS_MENU_DEFAULTS.cornerRadius);
    this.bg.fill({
      color: OPTIONS_MENU_DEFAULTS.backgroundColor,
      alpha: OPTIONS_MENU_DEFAULTS.backgroundAlpha,
    });

    // ---- Close button (X) in top-right ----
    this.closeBtn = this.buildCloseButton();
    this.closeBtn.x = this.menuWidth - this.padding - 8;
    this.closeBtn.y = this.padding + 8;
    this.addChild(this.closeBtn);

    // Center pivot for scale animations
    this.pivot.set(this.menuWidth / 2, totalHeight / 2);
  }

  // -----------------------------------------------------------------------
  // Row builders
  // -----------------------------------------------------------------------

  private buildButtonRow(
    gpuLoader: PixiLoader,
    row: Container,
    item: Extract<MenuItemDef, { type: 'button' }>,
    contentWidth: number,
  ): void {
    const btn = new SpriteButton(gpuLoader, {
      atlasName: this.config.atlasName,
      spriteName: this.config.buttonSpriteName,
      label: item.label,
      width: contentWidth,
      height: this.itemHeight,
      use9Slice: true,
      nineSliceBorders: { leftWidth: 12, topHeight: 12, rightWidth: 12, bottomHeight: 12 },
      onClick: item.onClick,
    });
    btn.x = contentWidth / 2;
    btn.y = this.itemHeight / 2;
    row.addChild(btn);
  }

  private buildToggleRow(
    row: Container,
    item: Extract<MenuItemDef, { type: 'toggle' }>,
    contentWidth: number,
  ): void {
    // Label
    const label = new Text({
      text: item.label,
      style: {
        fontSize: OPTIONS_MENU_DEFAULTS.labelFontSize,
        fill: 0xffffff,
      },
    });
    label.anchor.set(0, 0.5);
    label.y = this.itemHeight / 2;
    row.addChild(label);

    // Toggle switch
    const tw = OPTIONS_MENU_DEFAULTS.toggleWidth;
    const th = OPTIONS_MENU_DEFAULTS.toggleHeight;
    let isOn = item.value;

    const track = new Graphics();
    const thumb = new Graphics();

    const drawToggle = (on: boolean) => {
      track.clear();
      track.roundRect(0, 0, tw, th, th / 2);
      track.fill({
        color: on ? OPTIONS_MENU_DEFAULTS.toggleOnColor : OPTIONS_MENU_DEFAULTS.toggleOffColor,
      });

      thumb.clear();
      const thumbR = (th - 4) / 2;
      thumb.circle(0, 0, thumbR);
      thumb.fill({ color: 0xffffff });
      thumb.x = on ? tw - thumbR - 2 : thumbR + 2;
      thumb.y = th / 2;
    };

    drawToggle(isOn);

    const toggleGroup = new Container();
    toggleGroup.addChild(track, thumb);
    toggleGroup.x = contentWidth - tw;
    toggleGroup.y = (this.itemHeight - th) / 2;

    toggleGroup.eventMode = 'static';
    toggleGroup.cursor = 'pointer';
    toggleGroup.on('pointertap', () => {
      isOn = !isOn;
      drawToggle(isOn);
      item.onChange(isOn);
    });

    row.addChild(toggleGroup);
  }

  private buildSliderRow(
    row: Container,
    item: Extract<MenuItemDef, { type: 'slider' }>,
    contentWidth: number,
  ): void {
    // Label + value readout
    const label = new Text({
      text: item.label,
      style: {
        fontSize: OPTIONS_MENU_DEFAULTS.labelFontSize,
        fill: 0xffffff,
      },
    });
    label.anchor.set(0, 0.5);
    label.y = this.itemHeight * 0.25;
    row.addChild(label);

    // Track
    const trackHeight = 4;
    const trackY = this.itemHeight * 0.65;
    const thumbSize = OPTIONS_MENU_DEFAULTS.sliderThumbSize;

    const trackBg = new Graphics();
    trackBg.roundRect(0, trackY - trackHeight / 2, contentWidth, trackHeight, trackHeight / 2);
    trackBg.fill({ color: OPTIONS_MENU_DEFAULTS.sliderTrackColor });
    row.addChild(trackBg);

    // Fill
    const fill = new Graphics();
    row.addChild(fill);

    // Thumb
    const thumb = new Graphics();
    thumb.circle(0, 0, thumbSize / 2);
    thumb.fill({ color: 0xffffff });
    thumb.y = trackY;
    thumb.eventMode = 'static';
    thumb.cursor = 'pointer';
    row.addChild(thumb);

    // Helpers
    const normalize = (v: number) => (v - item.min) / (item.max - item.min);
    const denormalize = (n: number) => {
      const raw = item.min + n * (item.max - item.min);
      return Math.round(raw / item.step) * item.step;
    };

    let currentValue = item.value;

    const drawFill = (norm: number) => {
      const w = Math.max(0, norm * contentWidth);
      fill.clear();
      fill.roundRect(0, trackY - trackHeight / 2, w, trackHeight, trackHeight / 2);
      fill.fill({ color: OPTIONS_MENU_DEFAULTS.sliderFillColor });
      thumb.x = w;
    };

    drawFill(normalize(currentValue));

    // Drag interaction
    let dragging = false;

    const updateFromPointer = (globalX: number) => {
      const localX = row.toLocal({ x: globalX, y: 0 }).x;
      const norm = Math.max(0, Math.min(1, localX / contentWidth));
      currentValue = denormalize(norm);
      drawFill(normalize(currentValue));
      item.onChange(currentValue);
    };

    thumb.on('pointerdown', () => {
      dragging = true;
    });

    // Use the stage for global move/up so dragging works outside the thumb
    thumb.on('globalpointermove', (e) => {
      if (dragging) updateFromPointer(e.globalX);
    });

    thumb.on('pointerup', () => {
      dragging = false;
    });
    thumb.on('pointerupoutside', () => {
      dragging = false;
    });

    // Allow click-to-seek on track background
    trackBg.eventMode = 'static';
    trackBg.cursor = 'pointer';
    trackBg.on('pointertap', (e) => {
      updateFromPointer(e.globalX);
    });
  }

  // -----------------------------------------------------------------------
  // Close button
  // -----------------------------------------------------------------------

  private buildCloseButton(): Graphics {
    const size = 24;
    const btn = new Graphics();

    // X icon
    btn.moveTo(-size / 4, -size / 4);
    btn.lineTo(size / 4, size / 4);
    btn.moveTo(size / 4, -size / 4);
    btn.lineTo(-size / 4, size / 4);
    btn.stroke({ width: 2, color: 0xffffff });

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointertap', () => this.config.onClose?.());

    // Hover feedback
    btn.on('pointerover', () => {
      gsap.to(btn.scale, { x: 1.15, y: 1.15, duration: 0.15, ease: 'power2.out' });
    });
    btn.on('pointerout', () => {
      gsap.to(btn.scale, { x: 1, y: 1, duration: 0.15, ease: 'power2.out' });
    });

    return btn;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Clean up GSAP tweens, listeners, and children.
   */
  override destroy(): void {
    super.destroy();
  }
}
