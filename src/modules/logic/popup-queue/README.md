# createPopupQueue

Priority-based FIFO queue for sequential popups. Generic over the popup data type, supports per-popup or default auto-dismiss timers, capacity-limited with priority eviction.

## Usage

```ts
import { createPopupQueue } from '~/modules/logic/popup-queue';

interface ToastData {
  text: string;
  variant: 'info' | 'success' | 'error';
}

const queue = createPopupQueue<ToastData>({
  maxStacked: 3,
  defaultDurationMs: 3000,
  onShow: (popup) => renderToast(popup.id, popup.data),
  onDismiss: (popup) => unmountToast(popup.id),
});

queue.enqueue({ text: 'Saved!', variant: 'success' });
queue.enqueue({ text: 'Critical!', variant: 'error' }, { priority: 'high', durationMs: 0 });

// each frame
queue.tick(deltaMs);
```

## Returns

| Method/Property | Description |
|-----------------|-------------|
| `enqueue(data, options?)` | Push a popup with optional `priority` (`'low' \| 'normal' \| 'high'`) and `durationMs` (0 = manual). Shows immediately if nothing is current; otherwise queued. If queue is at capacity, the lowest-priority pending popup is evicted (or the new one is rejected if it has equal/lower priority). Returns the auto-generated id. |
| `processNext()` | Dismiss current and immediately show the next. |
| `dismissCurrent()` | Dismiss current without auto-advancing. |
| `dismiss(id)` | Dismiss a specific popup (current or pending). |
| `clear()` | Dismiss everything. |
| `current` | The active popup, or `null`. |
| `pending` | Read-only view of queued (not-yet-shown) popups. |
| `size` | Total count (current + pending). |
| `tick(deltaMs)` | Advance the auto-dismiss timer for the active popup. |
| `destroy()` | Tear down; subsequent calls are no-ops. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `maxStacked` | `number` | `3` | Max pending (not counting the active popup). |
| `defaultDurationMs` | `number` | `3000` | Fallback auto-dismiss; `0` = manual only. |
| `onShow` | `(popup: QueuedPopup<T>) => void` | — | Fired when a popup becomes active. |
| `onDismiss` | `(popup: QueuedPopup<T>) => void` | — | Fired on any dismissal (including eviction). |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `maxStacked` | 3 | 1 – 10 |
| `defaultDurationMs` | 3000 | 0 – 10000 |

## Use when

Sequential popups, toast queues, notification stacking, priority-driven popup display.
