# ProgressBar

Bordered progress bar with milestone dots, animated fill, and a centered "current / total" label.

## Usage

```ts
import { ProgressBar } from '~/modules/primitives/progress-bar';

const bar = new ProgressBar({ width: 280, height: 36 });
stage.addChild(bar);
bar.setProgress(3, 10);
```

## Public API

| Method | Description |
|--------|-------------|
| `setProgress(current, total?, animate?)` | Set fill ratio; updates label and milestones. |
| `setTheme(fillColor?)` | Recolor fill. |
| `playFillAnimation()` | Replay fill from 0 to current. |
| `update(dt)` | Per-frame tick; drives the ease-out fill animation. |
| `resize(width, height)` | Resize the bar. |
| `destroy()` | Tear down listeners, kill GSAP tweens, free GPU resources. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | `number` | `280` | Bar width. |
| `height` | `number` | `36` | Bar height. |
| `fontFamily` | `string?` | `'sans-serif'` | Label font family. |
| `fillColor` | `number?` | `0x007eff` | Fill bar color (hex). |
| `milestoneColor` | `number?` | `0x6ffdf1` | Completed milestone dot color. |
| `showLabel` | `boolean?` | `true` | Whether to show the centered label. |

Constructor accepts `Partial<ProgressBarConfig>` — all fields are optional and defaulted.

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `width` | 280 | 100 – 600 |
| `height` | 36 | 20 – 80 |
| `fillColor` | 0x007eff | color |
| `milestoneColor` | 0x6ffdf1 | color |
| `backgroundColor` | 0x9a9a9a | color |
| `borderWidth` | 4 | 0 – 10 |
| `radius` | 10 | 0 – 20 |
| `dotRadius` | 5 | 2 – 12 |
| `animationDuration` | 0.5 | 0 – 2 |

## Use when

level progress, HP bars, loading indicators.
