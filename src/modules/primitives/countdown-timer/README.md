# CountdownTimer

Frame-driven countdown text that swaps to an urgent color and pulses below a threshold.

## Usage

```ts
import { CountdownTimer } from '~/modules/primitives/countdown-timer';

const timer = new CountdownTimer({
  duration: 30,
  format: 'mm:ss',
  onComplete: () => endRound(),
  onTick: (s) => console.log('remaining', s),
});
stage.addChild(timer);
```

## Public API

| Method | Description |
|--------|-------------|
| `update(dt)` | Per-frame tick; advances the countdown. |
| `pause()` | Halt countdown. |
| `resume()` | Resume countdown. |
| `reset(duration)` | Restart with a new duration. |
| `getRemaining()` | Seconds remaining (float). |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `duration` | `number` | required | Total countdown in seconds. |
| `onComplete` | `() => void?` | — | Fires when countdown hits zero. |
| `onTick` | `(remaining: number) => void?` | — | Fires once per displayed-second change. |
| `fontSize` | `number?` | `22` | Text font size. |
| `fontFamily` | `string?` | `'sans-serif'` | Text font family. |
| `normalColor` | `string?` | `'#ffffff'` | Color when above urgency threshold. |
| `urgentColor` | `string?` | `'#e74c3c'` | Color when at/below threshold. |
| `urgencyThreshold` | `number?` | `5` | Seconds at which urgency mode engages. |
| `urgentPulseScale` | `number?` | `1.15` | Peak pulse scale during urgency. |
| `urgentPulseDuration` | `number?` | `0.4` | Full pulse cycle in seconds. |
| `stroke` | `string?` | `'#000000'` | Stroke color. |
| `strokeWidth` | `number?` | `3` | Stroke width in px. |
| `format` | `'seconds' \| 'mm:ss'?` | `'seconds'` | Display format. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `fontSize` | 22 | 12 – 48 |
| `urgencyThreshold` | 5 | 1 – 30 |
| `urgentPulseScale` | 1.15 | 1 – 1.5 |
| `urgentPulseDuration` | 0.4 | 0.1 – 1 |
| `strokeWidth` | 3 | 0 – 8 |

## Use when

time limits, auto-start countdowns, turn timers.
