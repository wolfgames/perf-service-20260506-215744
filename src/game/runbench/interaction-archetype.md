# RunBench — Interaction Archetype

## Which Interaction Type

**Tap** (for jump) + **Tap-and-Hold** (for crouch).

The primary interaction is a tap: a brief pointer-down / pointer-up sequence that causes the runner to jump. A secondary variant — holding the pointer down for ≥ 200ms — causes the runner to crouch (lowered hitbox, minimum 300ms hold duration).

## Pointer Sequence

```
pointerdown  → Start tap timer (Date.now())
               If phase == 'playing': arm gesture

pointermove  → Ignored (no drag gestures in RunBench)

pointerup    → elapsed = Date.now() - tapStart
               If elapsed < 200ms  → dispatch JUMP action
               If elapsed >= 200ms → end CROUCH (was held)
```

When a `pointerup` is never received (pointer leaves viewport), the hold is cancelled after a 2000ms timeout.

## Hold Detection

```
pointerdown → start timer
200ms mark  → if pointer still down: transition to CROUCH state
               - runner hitbox height * 0.5
               - hold maintained until pointerup (min 300ms total)
pointerup   → end CROUCH; if total hold < 300ms, extend to 300ms then reset
```

## Jump Variants

| State | Condition | Result |
|-------|-----------|--------|
| On ground | tap < 200ms | Jump: vy = -900 px/s |
| Airborne (jumpCount=1) | tap < 200ms | Double jump: vy = -700 px/s; jumpCount=2 |
| Airborne (jumpCount=2) | tap < 200ms | Blocked — no action |
| Crouching | tap release | Cancel crouch; jump blocked while crouching |
| phase=dying | any | Blocked — all input disabled |

## Cancel Behavior

If the pointer leaves the canvas container or the browser loses focus:
- Any armed tap is cancelled (no jump fires)
- Any active crouch ends (normalizes hitbox)
- `pointercancel` event handled equivalently to `pointerup`

## Invalid Gesture Feedback

RunBench has no "invalid" tap in the traditional sense — the player cannot make a wrong input on the runner itself. The only blocked inputs are:
- **Triple-tap (jumpCount=2 airborne)**: silently ignored — no shake needed (runner is visually airborne and the no-more-jumps state is clear from context)
- **Input during Dying**: silently blocked — visual state (runner dissolving) makes the block self-evident

## Feel Description

**Immediate and direct.** The visual jump response starts within the same frame as the `pointerup` event (< 16ms). The jump arc follows real parabolic physics — the runner rises then falls, creating clear anticipation at peak height. Landing includes a squash/stretch settle via GSAP (25ms squash, 100ms spring back) to reinforce physical weight.

## Touch Target

Full canvas width and height (390 × 732 px play area). No aiming required. The entire screen is the tap target.

## Input Events

- `pointerdown` / `pointerup` / `pointercancel` — never `touchstart`/`mousedown` (pointer events per core-interaction CoS exit criterion)
- `touch-action: none` on canvas container (prevents browser swipe/zoom)
- No pointer capture needed (no drag tracking)
