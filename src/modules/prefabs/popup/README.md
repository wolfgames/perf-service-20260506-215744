# Popup

Thin wrapper around `ToastSlide` that adds an optional show delay, configurable auto-dismiss, and `onShow` / `onDismiss` lifecycle hooks.

## Composes

- `toast-slide` — owns all visual rendering and the slide-in / slide-out animation

## Usage

```ts
import { Popup } from '~/modules/prefabs/popup';

const popup = new Popup(gpuLoader, {
  toastConfig: {
    atlasName: 'ui',
    spriteName: 'toast-9slice',
    text: 'Saved!',
    variant: 'success',
  },
  autoDismissMs: 3000,
  onShow: () => console.log('visible'),
  onDismiss: () => popup.parent?.removeChild(popup),
});
stage.addChild(popup);

await popup.show();
```

## Public API

| Method | Description |
|--------|-------------|
| `show()` | Wait for `showDelay`, slide in via the underlying toast, fire `onShow`, schedule auto-dismiss. Returns `Promise<void>`. |
| `dismiss()` | Cancel the auto-dismiss timer and slide the toast out. |
| `destroy()` | Clear the auto-dismiss timer and tear down children. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `toastConfig` | `Omit<ToastSlideConfig, 'onDismiss'>` | — | Required. Forwarded to `ToastSlide`; the prefab manages its `onDismiss` internally. |
| `autoDismissMs` | `number` | `5000` | Auto-dismiss delay in ms; `0` disables. |
| `onDismiss` | `() => void` | — | Fired after the toast finishes sliding out. |
| `onShow` | `() => void` | — | Fired after the toast finishes sliding in. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `autoDismissMs` | `5000` | 0 – 15000 |
| `showDelay` | `0` | 0 – 2 |

## Use when

toast notifications, timed alerts.
