import { Text, TextStyle } from 'pixi.js';
import { PixiRenderable } from '../../_base';
import { HUD_DISPLAY_DEFAULTS } from '../defaults';

/**
 * A single HUD entry definition
 */
export interface HudEntry {
  /** Unique key for this entry (used to update values) */
  key: string;
  /** Label prefix (e.g. "Score: ", "Level ") */
  label: string;
  /** Initial value */
  value?: string | number;
  /** Right-aligned (only in vertical mode) */
  alignRight?: boolean;
  /** Custom fill color for this entry */
  fill?: string;
}

/**
 * Configuration for creating a HudDisplay
 */
export interface HudDisplayConfig {
  /** Entries to display */
  entries: HudEntry[];
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
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Available width (for right-aligned entries) */
  width?: number;
}

/**
 * HudDisplay — configurable text group for game HUD values.
 *
 * Displays labeled values (score, level, moves, target, combo, etc.)
 * in a vertical or horizontal layout. Update individual values by key.
 */
export class HudDisplay extends PixiRenderable {
  private fields = new Map<string, { text: Text; label: string }>();
  private direction: 'vertical' | 'horizontal';
  private layoutWidth: number;

  constructor(config: HudDisplayConfig) {
    super('hud-display');

    const d = HUD_DISPLAY_DEFAULTS;
    this.direction = config.direction ?? d.direction as 'vertical' | 'horizontal';
    this.layoutWidth = config.width ?? 0;

    const baseStyle = new TextStyle({
      fontFamily: config.fontFamily ?? d.fontFamily,
      fontSize: config.fontSize ?? d.fontSize,
      fill: config.fill ?? d.fill,
      stroke: (config.stroke ?? d.stroke)
        ? { color: config.stroke ?? d.stroke, width: config.strokeWidth ?? d.strokeWidth }
        : undefined,
      dropShadow: d.dropShadow ? { alpha: 0.5, blur: 2, distance: 1 } : undefined,
    });

    for (let i = 0; i < config.entries.length; i++) {
      const entry = config.entries[i];
      const style = entry.fill ? baseStyle.clone() : baseStyle;
      if (entry.fill) {
        style.fill = entry.fill;
      }

      const text = new Text({
        text: `${entry.label}${entry.value ?? ''}`,
        style,
      });

      if (this.direction === 'vertical') {
        text.y = i * (d.spacing);
        if (entry.alignRight && this.layoutWidth > 0) {
          text.anchor.set(1, 0);
          text.x = this.layoutWidth;
        }
      } else {
        text.x = i * d.horizontalGap;
      }

      this.addChild(text);
      this.fields.set(entry.key, { text, label: entry.label });
    }
  }

  /** Update a single entry's value by key */
  setValue(key: string, value: string | number): void {
    const field = this.fields.get(key);
    if (field) {
      field.text.text = `${field.label}${value}`;
    }
  }

  /** Update multiple entries at once */
  setValues(values: Record<string, string | number>): void {
    for (const [key, value] of Object.entries(values)) {
      this.setValue(key, value);
    }
  }

  /** Get a text field by key (for custom styling) */
  getField(key: string): Text | undefined {
    return this.fields.get(key)?.text;
  }
}
