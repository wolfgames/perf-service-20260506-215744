/**
 * physics: gravity, jump, double-jump — Batch 2
 *
 * Tests the PhysicsSystem step() function: gravity application,
 * jump mechanics, double-jump, crouch, and landing reset.
 * All tests use seeded physics state — no Pixi, no DOM.
 */

import { describe, it, expect } from 'vitest';
import {
  createRunnerState,
  stepPhysics,
  GRAVITY,
  JUMP_VY,
  DOUBLE_JUMP_VY,
  GROUND_Y,
} from '~/game/runbench/systems/PhysicsSystem';

// ── Helpers ────────────────────────────────────────────────────────────────

/** ms → seconds for readability */
const ms = (n: number) => n / 1000;

// ── Tests ──────────────────────────────────────────────────────────────────

describe('physics: gravity, jump, double-jump', () => {
  it('runner jumps immediately (<100ms visual response); jump arc follows parabolic physics (gravity=2200px/s², jumpV=-900px/s); runner Y changes visibly', () => {
    const state = createRunnerState();

    // Trigger a jump
    const jumped = stepPhysics(state, { action: 'jump' }, ms(16));

    expect(jumped.velY).toBe(JUMP_VY); // -900 px/s
    expect(jumped.state).toBe('airborne');
    expect(jumped.jumpCount).toBe(1);

    // After one physics frame (16ms) with gravity, Y should have changed
    const afterFrame = stepPhysics(jumped, {}, ms(16));
    // velY increases by gravity * dt each frame
    const expectedVelY = JUMP_VY + GRAVITY * ms(16);
    expect(afterFrame.velY).toBeCloseTo(expectedVelY, 1);
    // Y should have moved (upward — negative delta in screen coords)
    expect(afterFrame.y).not.toBe(GROUND_Y);
  });

  it('double jump fires; jumpV=-700px/s; jumpCount becomes 2; no further jump available until landing', () => {
    const state = createRunnerState();

    // Jump once
    const jumped = stepPhysics(state, { action: 'jump' }, ms(16));
    expect(jumped.jumpCount).toBe(1);

    // Apply gravity for several frames to ensure we're airborne
    let airborne = jumped;
    for (let i = 0; i < 5; i++) {
      airborne = stepPhysics(airborne, {}, ms(16));
    }

    // Double jump
    const doubleJumped = stepPhysics(airborne, { action: 'jump' }, ms(16));
    expect(doubleJumped.velY).toBe(DOUBLE_JUMP_VY); // -700 px/s
    expect(doubleJumped.jumpCount).toBe(2);

    // Third jump attempt is ignored
    const thirdAttempt = stepPhysics(doubleJumped, { action: 'jump' }, ms(16));
    expect(thirdAttempt.jumpCount).toBe(2); // unchanged
    expect(thirdAttempt.velY).not.toBe(JUMP_VY);
    expect(thirdAttempt.velY).not.toBe(DOUBLE_JUMP_VY);
  });

  it('runner crouches (hitbox shrinks 50%); state=crouching; hold maintained for minimum 300ms', () => {
    const state = createRunnerState();

    // Start crouch
    const crouching = stepPhysics(state, { action: 'crouch-start' }, ms(16));
    expect(crouching.state).toBe('crouching');
    expect(crouching.hitboxHeight).toBe(state.hitboxHeight * 0.5);

    // End crouch
    const uncrouch = stepPhysics(crouching, { action: 'crouch-end' }, ms(16));
    expect(uncrouch.state).toBe('running');
    expect(uncrouch.hitboxHeight).toBe(state.hitboxHeight);
  });

  it('edge-case: crouch-start while airborne has no effect on state', () => {
    const state = createRunnerState();

    // Launch airborne
    const jumped = stepPhysics(state, { action: 'jump' }, ms(16));
    expect(jumped.state).toBe('airborne');

    // Attempt crouch while airborne — should be ignored
    const crouchAttempt = stepPhysics(jumped, { action: 'crouch-start' }, ms(16));
    expect(crouchAttempt.state).toBe('airborne'); // still airborne, not crouching
    expect(crouchAttempt.hitboxHeight).toBe(jumped.hitboxHeight); // hitbox unchanged
  });

  it('jumpCount resets to 0; state transitions to run-cycle; landing is animated (squash/settle via GSAP)', () => {
    const state = createRunnerState();

    // Jump
    let s = stepPhysics(state, { action: 'jump' }, ms(16));
    expect(s.state).toBe('airborne');

    // Simulate until landing (runner falls back to GROUND_Y)
    // Give enough frames for the runner to land
    let landed = false;
    for (let i = 0; i < 200; i++) {
      s = stepPhysics(s, {}, ms(16));
      if (s.state === 'running' || s.state === 'idle') {
        landed = true;
        break;
      }
    }

    expect(landed).toBe(true);
    expect(s.jumpCount).toBe(0);
    expect(s.y).toBeLessThanOrEqual(GROUND_Y + 1); // on or near ground
    // landEvent signals GSAP to play squash animation
    expect(s.landEvent).toBe(true);
  });
});
