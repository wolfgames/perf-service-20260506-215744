/**
 * RunnerRenderer — renders the player-controlled runner as a labeled Pixi shape.
 *
 * Uses labeled-shape fallback (dark rectangle + 'R' label) until scene-runbench
 * atlas provides real character sprites. The runner stays at a fixed screen-space
 * X (30% of screen width) while the world scrolls behind it.
 *
 * Supported states (shape height shrinks to 50% when crouching):
 *   running / idle / airborne  — full hitbox height (48px)
 *   crouching                  — half hitbox height (24px)
 *   dying                      — death dissolve tween fires (alpha 1→0, scale shrink)
 *
 * Destruction order: kill tweens → removeChild → destroy.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { gsap } from 'gsap';
import { RUNNER_WIDTH, RUNNER_HEIGHT, CROUCH_HEIGHT_RATIO } from '../systems/PhysicsSystem';
import type { RunnerPhysicsState } from '../systems/PhysicsSystem';

const RUNNER_FILL_COLOR = 0xddddff;
const RUNNER_LABEL_STYLE = {
  fontSize: 12,
  fill: '#ffffff',
  fontFamily: 'monospace',
  fontWeight: 'bold',
} as const;

export interface RunnerRendererOptions {
  layer: Container;
  /** Fixed screen-space X for the runner (30% of screen width). */
  screenX: number;
}

export const createRunnerRenderer = ({ layer, screenX }: RunnerRendererOptions) => {
  const container = new Container();
  container.x = screenX;

  const gfx = new Graphics();
  const label = new Text({ text: 'R', style: RUNNER_LABEL_STYLE });
  label.anchor?.set(0.5, 0);

  // Draw initial full-height shape
  gfx.rect(-RUNNER_WIDTH / 2, -RUNNER_HEIGHT, RUNNER_WIDTH, RUNNER_HEIGHT).fill(RUNNER_FILL_COLOR);

  label.x = 0;
  label.y = -RUNNER_HEIGHT - 14;

  container.addChild(gfx);
  container.addChild(label);
  layer.addChild(container);

  let currentState: RunnerPhysicsState = 'running';

  /**
   * Sync runner Y position and state each frame.
   * @param y  Screen-space Y (ground is at GROUND_Y — runner bottom touches ground).
   * @param state  Current runner physics state.
   * @param landEvent  True for exactly one frame when the runner lands — triggers squash animation.
   */
  const update = (y: number, state: RunnerPhysicsState, landEvent?: boolean): void => {
    if (state === 'dying') return; // death tween owns the transform

    container.y = y;

    if (state !== currentState) {
      currentState = state;
      gfx.clear();
      const h = state === 'crouching'
        ? RUNNER_HEIGHT * CROUCH_HEIGHT_RATIO
        : RUNNER_HEIGHT;
      gfx.rect(-RUNNER_WIDTH / 2, -h, RUNNER_WIDTH, h).fill(RUNNER_FILL_COLOR);
      label.y = -h - 14;
    }

    // Squash-and-stretch on landing: brief vertical squash then spring back
    if (landEvent) {
      gsap.killTweensOf(container.scale);
      gsap.to(container.scale, {
        y: 0.75,
        duration: 0.025,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(container.scale, { y: 1, duration: 0.1, ease: 'elastic.out(1, 0.5)' });
        },
      });
    }
  };

  /**
   * Play death dissolve animation.
   * Kills tweens, then fades alpha and scales down.
   * Returns a Promise that resolves when the animation completes.
   */
  const playDeath = (): Promise<void> =>
    new Promise<void>((resolve) => {
      gsap.to(container, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: resolve,
      });
      gsap.to(container.scale, {
        x: 0.5,
        y: 0.5,
        duration: 0.3,
        ease: 'power2.in',
      });
    });

  const destroy = (): void => {
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.scale);
    container.parent?.removeChild(container);
    container.destroy({ children: true });
  };

  return { update, playDeath, destroy, container };
};
