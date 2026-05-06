# AnnouncementOverlay

Full-screen overlay with backdrop, headline pill, action button, and optional staggered content slots.

## Composes

- `sprite-button` — the action button at the bottom of the overlay
- Pixi `Graphics` for the backdrop and headline background; `Text` for the headline
- Accepts arbitrary `PixiRenderable` children via `addContent()` (e.g. `companion-character`, `dialogue-box-character`) which are folded into the entrance stagger

## Usage

```ts
import { AnnouncementOverlay } from '~/modules/prefabs/announcement-overlay';

const overlay = new AnnouncementOverlay(gpuLoader, {
  screenWidth: app.screen.width,
  screenHeight: app.screen.height,
  fontFamily: 'Luckiest Guy',
  button: {
    gpuLoader,
    atlasName: 'ui',
    spriteName: 'btn-primary',
    label: 'Continue',
    onClick: () => overlay.hide(),
  },
});
stage.addChild(overlay);

overlay.show({ headline: 'Chapter 1' });
```

## Public API

| Method | Description |
|--------|-------------|
| `addContent(renderable)` | Add a child to the content area; included in the entrance stagger. Call before `show()`. |
| `show(data)` | Run the choreographed entrance: backdrop fade → headline pop → content stagger → button bounce. |
| `hide()` | Fade the overlay out and hide it. |
| `resize(width, height)` | Redraw the backdrop to new screen dimensions. |
| `destroy()` | Inherited from `PixiRenderable`; tears down children and listeners. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `screenWidth` | `number` | — | Required. Used for backdrop and centering. |
| `screenHeight` | `number` | — | Required. Used for backdrop and Y positioning. |
| `fontFamily` | `string` | `'sans-serif'` | Headline font. |
| `button` | `SpriteButtonConfig & { gpuLoader }` | — | Required. Forwarded to the internal `SpriteButton`. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `backdropColor` | `0x000000` | color |
| `backdropAlpha` | `0.6` | 0.1 – 1 |
| `backdropFadeDuration` | `0.3` | 0.1 – 1 |
| `headlineFontSize` | `28` | 16 – 48 |
| `headlineBgColor` | `0xfed800` | color |
| `headlineBgRadius` | `12` | 0 – 24 |
| `headlinePadX` | `30` | 10 – 60 |
| `headlinePadY` | `12` | 4 – 24 |
| `popInDuration` | `0.4` | 0.1 – 1 |
| `stagger` | `0.08` | 0 – 0.3 |
| `headlineYPercent` | `0.15` | 0.05 – 0.3 |
| `buttonYPercent` | `0.88` | 0.7 – 0.95 |

## Use when

chapter intros, chapter overlays, level complete screens, story beats, interstitials, any full-screen announcement.
