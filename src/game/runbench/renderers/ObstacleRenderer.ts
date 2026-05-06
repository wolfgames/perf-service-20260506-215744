/**
 * ObstacleRenderer — renders obstacles as Pixi Graphics primitives with Text labels.
 *
 * Uses labeled-shape fallback rendering until the scene-runbench atlas exists.
 * Each shape has a Text label so it reads as a gameplay element, not programmer art.
 * Stable entity IDs for diffing.
 *
 * Supports:
 *   low-wall      — 16x48px dark vertical block + '|' label
 *   overhead-beam — full-width (390px) horizontal bar at Y=80px + '-' label
 */

import { Container, Graphics, Text } from 'pixi.js';

export type ObstacleKind = 'low-wall' | 'overhead-beam';

export interface ObstacleData {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Visually distinct dark color for obstacles vs grey platforms. */
const LOW_WALL_COLOR = 0x333344;
const BEAM_COLOR = 0x442233;

export interface ObstacleRendererOptions {
  layer: Container;
}

const OBSTACLE_LABEL_STYLE = {
  fontSize: 14,
  fill: '#ffffff',
  fontFamily: 'monospace',
  fontWeight: 'bold',
} as const;

export const createObstacleRenderer = ({ layer }: ObstacleRendererOptions) => {
  // registry maps id → { shape, label } so both can be destroyed together
  const registry = new Map<number, { gfx: Graphics; label: Text }>();

  const addObstacle = (data: ObstacleData): void => {
    const gfx = new Graphics();
    const color = data.kind === 'overhead-beam' ? BEAM_COLOR : LOW_WALL_COLOR;
    gfx.rect(0, 0, data.width, data.height).fill(color);
    gfx.x = data.x;
    gfx.y = data.y;

    // Text label: '|' for low-wall (vertical obstacle), '-' for overhead-beam (horizontal)
    const labelChar = data.kind === 'overhead-beam' ? '-' : '|';
    const label = new Text({ text: labelChar, style: OBSTACLE_LABEL_STYLE });
    // Center label over shape
    label.x = data.x + data.width / 2;
    label.y = data.y + data.height / 2;
    (label as unknown as { anchor?: { set: (x: number, y: number) => void } }).anchor?.set(0.5, 0.5);

    registry.set(data.id, { gfx, label });
    layer.addChild(gfx);
    layer.addChild(label);
  };

  const removeObstacle = (id: number): void => {
    const entry = registry.get(id);
    if (!entry) return;
    entry.gfx.parent?.removeChild(entry.gfx);
    entry.gfx.destroy();
    entry.label.parent?.removeChild(entry.label);
    entry.label.destroy();
    registry.delete(id);
  };

  const getTrackedIds = (): number[] => [...registry.keys()];

  const destroy = (): void => {
    for (const [id] of registry) removeObstacle(id);
    registry.clear();
  };

  return { addObstacle, removeObstacle, getTrackedIds, destroy };
};
