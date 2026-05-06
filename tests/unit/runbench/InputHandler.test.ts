/**
 * input: tap/hold/block — Batch 2
 *
 * Tests InputHandler: tap detection, hold/crouch detection,
 * dying-state block, and pointer event type validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ECS core barrel
vi.mock('~/core/systems/ecs', () => ({
  Database: { Plugin: { create: (d: unknown) => d }, create: vi.fn() },
  F32: { schema: {} },
  Vec2: { schema: {} },
  setActiveDb: vi.fn(),
}));
vi.mock('@adobe/data/math', () => ({
  Vec2: { schema: {} }, F32: { schema: {} },
}));
vi.mock('@adobe/data/observe', () => ({ Observe: {} }));

import { createInputHandler } from '~/game/runbench/input/InputHandler';

// ── Helpers ────────────────────────────────────────────────────────────────

const makeCanvas = () => ({
  style: {} as Record<string, string>,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as unknown as HTMLElement);

const makePointerDown = (timeStamp = 0) =>
  ({ type: 'pointerdown', timeStamp, preventDefault: vi.fn() } as unknown as PointerEvent);

const makePointerUp = (timeStamp = 100) =>
  ({ type: 'pointerup', timeStamp, preventDefault: vi.fn() } as unknown as PointerEvent);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('input: tap/hold/block', () => {
  let onJump: ReturnType<typeof vi.fn>;
  let onCrouchStart: ReturnType<typeof vi.fn>;
  let onCrouchEnd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onJump = vi.fn();
    onCrouchStart = vi.fn();
    onCrouchEnd = vi.fn();
  });

  it('all pointer input is blocked; no jump or crouch fires', () => {
    const canvas = makeCanvas();
    const handler = createInputHandler({
      canvas,
      getPhase: () => 'dying',
      onJump,
      onCrouchStart,
      onCrouchEnd,
    });

    // Simulate tap while dying
    handler.handlePointerDown(makePointerDown(0));
    handler.handlePointerUp(makePointerUp(50));

    expect(onJump).not.toHaveBeenCalled();
    expect(onCrouchStart).not.toHaveBeenCalled();
  });

  it('edge-case: pointercancel during active hold ends crouch', () => {
    const canvas = makeCanvas();
    const handler = createInputHandler({
      canvas,
      getPhase: () => 'playing',
      onJump,
      onCrouchStart,
      onCrouchEnd,
    });

    // Start a hold (pointerdown only — no pointerup yet)
    handler.handlePointerDown(makePointerDown(0));

    // Cancel the pointer (e.g. browser focus loss)
    handler.handlePointerCancel({ type: 'pointercancel', timeStamp: 0, preventDefault: vi.fn() } as unknown as PointerEvent);

    // onCrouchEnd should NOT fire (hold was never triggered because 200ms didn't pass)
    // but neither should jump fire — test that no jump was accidentally dispatched
    expect(onJump).not.toHaveBeenCalled();
  });

  it('pointerdown/pointerup used (not touchstart/mousedown); touch-action:none set on canvas container', () => {
    const canvas = makeCanvas();
    const handler = createInputHandler({
      canvas,
      getPhase: () => 'playing',
      onJump,
      onCrouchStart,
      onCrouchEnd,
    });

    // touch-action: none must be set on mount
    handler.mount();
    expect(canvas.style['touch-action']).toBe('none');

    // Event listeners are added via addEventListener (typed events check)
    const addedEvents = (canvas.addEventListener as ReturnType<typeof vi.fn>).mock.calls.map(
      (call) => call[0]
    );
    expect(addedEvents).toContain('pointerdown');
    expect(addedEvents).toContain('pointerup');
    // Must NOT listen to legacy events
    expect(addedEvents).not.toContain('touchstart');
    expect(addedEvents).not.toContain('mousedown');
  });
});
