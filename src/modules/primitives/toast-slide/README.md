# ToastSlide

Rounded notification panel with variant colors that slides in from the top or bottom edge and auto-dismisses.

## Usage

```ts
import { ToastSlide } from '~/modules/primitives/toast-slide';

const toast = new ToastSlide(gpuLoader, {
  message: 'Saved!',
  variant: 'success',
});
stage.addChild(toast);
await toast.slideIn();
```

Constructor takes `gpuLoader` as first positional arg (reserved for future texture use; currently unused).

## Public API

| Method | Description |
|--------|-------------|
| `slideIn()` | Slide in and schedule auto-dismiss. Returns `Promise<void>`. |
| `slideOut()` | Slide out and fire `onDismiss`. Returns `Promise<void>`. |
| `dismiss()` | Trigger slide-out without awaiting. |
| `destroy()` | Clears the dismiss timer and tears down listeners + GSAP tweens. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `message` | `string` | required | Text content. |
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'?` | `'info'` | Background variant color. |
| `durationMs` | `number?` | `3000` | Auto-dismiss after slide-in (0 = manual). |
| `position` | `'top' \| 'bottom'?` | `'top'` | Slide-in edge. |
| `onDismiss` | `() => void?` | — | Fires after slide-out completes. |
| `width` | `number?` | `300` | Toast panel width. |
| `fontFamily` | `string?` | `'Arial'` | Font family. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `slideDistance` | 64 | 16 – 128 |
| `slideDuration` | 0.3 | 0.1 – 0.8 |
| `width` | 300 | 150 – 500 |
| `padding` | 12 | 4 – 24 |
| `fontSize` | 14 | 10 – 24 |

## Use when

toast notifications, status messages, alerts.
