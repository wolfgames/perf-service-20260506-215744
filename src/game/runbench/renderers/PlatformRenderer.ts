/**
 * PlatformRenderer — renders platforms as Pixi Graphics + Text labeled shapes.
 *
 * Uses labeled-shape fallback rendering until the scene-runbench atlas is available.
 * Each platform shape has a small Text label so the type is readable in playtesting.
 * Stable entity IDs for animation diffing.
 *
 * Supports:
 *   Normal    — solid grey rectangle + 'N' label
 *   Moving    — tinted blue-grey rectangle + 'M' label + GSAP Y oscillation
 *   Crumbling — grey rectangle + 'C' label + crack marker on contact + GSAP dissolve
 */

import { Container, Graphics, Text } from 'pixi.js';
import { gsap } from 'gsap';

export type PlatformKind = 'normal' | 'moving' | 'crumbling';

export interface PlatformData {
  id: number;
  kind: PlatformKind;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Moving platform: oscillation range in px */
  moveRange?: number;
  /** Moving platform: oscillation speed in px/s (40-80) */
  moveSpeed?: number;
}

export interface PlatformVisualState {
  crumbleContactTime: number; // performance.now() at first contact, 0 = not contacted
  isCrumbling: boolean;
}

const PLATFORM_COLOR = 0x888888;
const MOVING_TINT_COLOR = 0xaaddff;
const CRUMBLE_DURATION = 0.6; // seconds before dissolve fires

const PLATFORM_LABEL_STYLE = {
  fontSize: 11,
  fill: '#ffffff',
  fontFamily: 'monospace',
  fontWeight: 'bold',
} as const;

/** Short label per platform kind — makes type readable in playtesting without atlas. */
const PLATFORM_LABEL: Record<PlatformKind, string> = {
  normal: 'N',
  moving: 'M',
  crumbling: 'C',
};

export interface PlatformRendererOptions {
  layer: Container;
}

export const createPlatformRenderer = ({ layer }: PlatformRendererOptions) => {
  // Map from platform id → { gfx, label, state, tween? }
  const registry = new Map<number, { gfx: Graphics; label: Text; state: PlatformVisualState; tween?: ReturnType<typeof gsap.to> }>();

  const addPlatform = (data: PlatformData): void => {
    const gfx = new Graphics();
    gfx.rect(0, 0, data.width, data.height).fill(PLATFORM_COLOR);
    gfx.x = data.x;
    gfx.y = data.y;

    // Labeled-shape fallback: small label identifies platform type until atlas is available
    const label = new Text({ text: PLATFORM_LABEL[data.kind], style: PLATFORM_LABEL_STYLE });
    label.x = data.x + 4;
    label.y = data.y - 14; // just above the platform surface

    if (data.kind === 'moving') {
      // Tint shift to visually distinguish moving platforms
      (gfx as unknown as { tint: number }).tint = MOVING_TINT_COLOR;

      // GSAP oscillation — Y moves within moveRange
      const range = data.moveRange ?? 80;
      const speed = data.moveSpeed ?? 60;
      const duration = range / speed; // seconds for half-oscillation
      const tween = gsap.to(gfx, {
        y: data.y + range,
        duration,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      registry.set(data.id, {
        gfx,
        label,
        state: { crumbleContactTime: 0, isCrumbling: false },
        tween,
      });
    } else {
      registry.set(data.id, {
        gfx,
        label,
        state: { crumbleContactTime: 0, isCrumbling: false },
      });
    }

    layer.addChild(gfx);
    layer.addChild(label);
  };

  const removePlatform = (id: number): void => {
    const entry = registry.get(id);
    if (!entry) return;

    entry.tween?.kill();
    gsap.killTweensOf(entry.gfx);
    entry.gfx.parent?.removeChild(entry.gfx);
    entry.gfx.destroy();
    entry.label.parent?.removeChild(entry.label);
    entry.label.destroy();
    registry.delete(id);
  };

  /** Called when the runner lands on or contacts this platform */
  const onRunnerContact = (id: number): void => {
    const entry = registry.get(id);
    if (!entry) return;

    const state = entry.state;

    if (state.crumbleContactTime === 0) {
      state.crumbleContactTime = typeof performance !== 'undefined'
        ? performance.now()
        : Date.now();

      // Schedule GSAP dissolve after CRUMBLE_DURATION
      gsap.delayedCall(CRUMBLE_DURATION, () => {
        if (!entry.state.isCrumbling) {
          entry.state.isCrumbling = true;
          gsap.to(entry.gfx, { alpha: 0, duration: 0.3 });
        }
      });
    }
  };

  const getPlatformState = (id: number): PlatformVisualState | undefined =>
    registry.get(id)?.state;

  const getTrackedIds = (): number[] => [...registry.keys()];

  const destroy = (): void => {
    for (const [id] of registry) {
      removePlatform(id);
    }
    registry.clear();
  };

  return {
    addPlatform,
    removePlatform,
    onRunnerContact,
    getPlatformState,
    getTrackedIds,
    destroy,
  };
};
