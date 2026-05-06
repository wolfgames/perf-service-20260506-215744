# TutorialHand

Animated hand sprite that slides in from below a target and runs a repeating tap loop (press → hold → release → back off → return). Non-interactive — taps pass through.

## Usage

```ts
import { TutorialHand } from '~/modules/primitives/tutorial-hand';

const hand = new TutorialHand(gpuLoader, {
  atlasName: 'core-ui',
  spriteName: 'tutorial-hand',
  onTap: () => playTapSfx(),
});
stage.addChild(hand);
hand.show(targetX, targetY);
// later
hand.hide();
```

## Public API

| Method | Description |
|--------|-------------|
| `show(targetX, targetY)` | Fade in at target and start the tap loop. |
| `hide()` | Fade out, kill timelines, remove from parent, destroy. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | required | Texture atlas name. |
| `spriteName` | `string` | required | Frame for the hand sprite. |
| `onTap` | `() => void?` | — | Fires on each loop's tap moment. |
| `anchor` | `{ x, y }?` | `{ x: 0.5, y: 0.15 }` | Sprite anchor (fingertip near top by default). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `restScale` | 0.8 | 0.3 – 1.5 |
| `tapPressScale` | 0.65 | 0.3 – 1 |
| `startOffsetY` | 40 | 10 – 80 |
| `fadeInDuration` | 0.4 | 0.1 – 1 |
| `fadeOutDuration` | 0.3 | 0.1 – 1 |
| `waitBeforeTap` | 0.3 | 0 – 1 |
| `tapPressDuration` | 0.15 | 0.05 – 0.5 |
| `tapHoldDuration` | 0.1 | 0 – 0.5 |
| `tapReleaseDuration` | 0.15 | 0.05 – 0.5 |
| `backOffDistance` | 20 | 0 – 60 |
| `waitBetweenTaps` | 0.5 | 0 – 2 |

## Use when

FTUE, onboarding, "tap here" hints.
