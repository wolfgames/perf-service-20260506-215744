# SceneRenderer

Hidden-object scene background with optional ambilight glow and a set of named, highlightable hotspot zones.

## Composes

- `ambilight` — optional dominant-color glow rendered behind the scene sprite
- `hotspot` — one per `HotspotDef`, supporting tap + highlight (for hint system)
- Pixi `Sprite` for the scene background; resized to fit viewport while preserving aspect ratio

## Usage

```ts
import { SceneRenderer } from '~/modules/prefabs/scene-renderer';

const scene = new SceneRenderer(gpuLoader, {
  atlasName: 'scene-library',
  sceneSpriteName: 'bg-library',
  hotspots: [
    { itemId: 'key',     hitArea: { x: 320, y: 480, width: 80, height: 60 } },
    { itemId: 'letter',  hitArea: { x: 540, y: 220, width: 70, height: 50 } },
  ],
  onHotspotTap: (id) => game.handleEvidenceTap(id),
});
stage.addChild(scene);
scene.resize(app.screen.width, app.screen.height);

scene.highlightHotspot('key'); // hint
scene.removeHotspot('letter'); // after found
```

## Public API

| Method | Description |
|--------|-------------|
| `removeHotspot(itemId)` | Detach and destroy the named hotspot. |
| `highlightHotspot(itemId)` | Toggle the highlight on the named hotspot (hint system). |
| `clearHighlights()` | Clear highlight on every hotspot. |
| `setAmbilightEnabled(bool)` | Show / hide the ambilight glow. |
| `resize(w, h)` | Center the scene and scale-to-fit the viewport. |
| `destroy()` | Clears the hotspot map and tears down children. |

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `atlasName` | `string` | — | Required. Atlas for the scene sprite (and ambilight source). |
| `sceneSpriteName` | `string` | — | Required. Frame name for the background. |
| `hotspots` | `HotspotDef[]` | — | Required. Each: `itemId`, `hitArea`, optional `onTap`. |
| `ambilightEnabled` | `boolean` | `true` | Render the glow behind the scene. |
| `onHotspotTap` | `(itemId: string) => void` | — | Fires alongside the per-hotspot `onTap`. |

## Tuning

| Parameter | Default | Range |
|-----------|---------|-------|
| `ambilightIntensity` | `0.6` | 0.1 – 1 |
| `ambilightBlurRadius` | `30` | 5 – 60 |
| `hotspotHighlightAlpha` | `0.3` | 0.1 – 0.6 |

## Use when

hidden object scenes, interactive environments.
