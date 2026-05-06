# Modules Index

Reusable building blocks + assembled prefabs. Can import from `core/`. Never imports from `game/`.

**Before creating a new visual component, check this catalog.** If something here matches your intent, use it — don't rebuild from raw Pixi objects.

Module names link to per-module READMEs with one-line purpose, copy-paste usage, public API, config, and tuning ranges. Rubric for evaluating modules: [`docs/standards/agent-friendly-modules.md`](../../docs/standards/agent-friendly-modules.md).

## Primitives

Single-purpose, configurable components. No deps on other modules. All extend `PixiRenderable`.

| Module | What it does | Use when you need… | Path |
|--------|-------------|-------------------|------|
| [sprite-button](primitives/sprite-button/README.md) | Pressable sprite with hover/press animations | a tappable button, menu item, CTA | primitives/sprite-button/ |
| [dialogue-box](primitives/dialogue-box/README.md) | 9-slice speech bubble with text rendering | speech bubbles, text boxes, NPC dialogue | primitives/dialogue-box/ |
| [character-sprite](primitives/character-sprite/README.md) | Character from texture atlas with scale/type mapping | any character on screen, NPCs, avatars | primitives/character-sprite/ |
| [progress-bar](primitives/progress-bar/README.md) | Segmented progress with milestone markers | level progress, HP bars, loading indicators | primitives/progress-bar/ |
| [star-rating](primitives/star-rating/README.md) | Sprite stars with fill masks, GSAP scale-punch | star ratings, review scores, achievement displays | primitives/star-rating/ |
| [commendation-badge](primitives/commendation-badge/README.md) | Tiered badge with drop-slam + sparkle animation | rank badges, achievement medals, tier rewards | primitives/commendation-badge/ |
| [toast-slide](primitives/toast-slide/README.md) | Slide-in/out notification with variant colors | toast notifications, status messages, alerts | primitives/toast-slide/ |
| [ambilight](primitives/ambilight/README.md) | Dominant color glow behind source texture | ambient glow, scene mood lighting, image highlights | primitives/ambilight/ |
| [hotspot](primitives/hotspot/README.md) | Interactive hit area with highlight tween | clickable zones, hidden objects, interactive areas | primitives/hotspot/ |
| [hint-box](primitives/hint-box/README.md) | Callout arrow + text, 9-slice bubble | tutorial hints, contextual tips, callout arrows | primitives/hint-box/ |
| [scene-thumbnail](primitives/scene-thumbnail/README.md) | Downscaled scene with border + lock overlay | scene selectors, level pickers, gallery views | primitives/scene-thumbnail/ |
| [fly-text](primitives/fly-text/README.md) | Floating text that drifts + fades, self-destructs | score popups, damage numbers, combo text, "+1" effects | primitives/fly-text/ |
| [countdown-timer](primitives/countdown-timer/README.md) | dt-based countdown with urgency color/pulse states | time limits, auto-start countdowns, turn timers | primitives/countdown-timer/ |
| [transition-wipe](primitives/transition-wipe/README.md) | Full-screen overlay with fade + iris modes | scene transitions, screen changes, dramatic reveals | primitives/transition-wipe/ |
| [rotatable-tile](primitives/rotatable-tile/README.md) | Dual-sprite tile with 90° rotation + jiggle feedback | puzzle tiles, grid-based games, rotating pieces | primitives/rotatable-tile/ |
| [tutorial-hand](primitives/tutorial-hand/README.md) | Animated gesture hint with repeating tap loop | FTUE, onboarding, "tap here" hints | primitives/tutorial-hand/ |
| [screen-shake](primitives/screen-shake/README.md) | Decaying oscillation on any Container | hit feedback, reject shake, impact, explosions | primitives/screen-shake/ |
| [screen-flash](primitives/screen-flash/README.md) | Full-screen flash-and-recover overlay | match clears, power-ups, hit flash, damage flash | primitives/screen-flash/ |
| [hud-display](primitives/hud-display/README.md) | Labeled text group for game stats | score, level, moves, timer, combo, any HUD values | primitives/hud-display/ |
| [tile-grid](primitives/tile-grid/README.md) | 2D grid of colored cells with labels | match-3 boards, puzzle grids, color grids, tile games | primitives/tile-grid/ |

## Logic

Pure logic, no rendering. Factory functions configured by game code.

| Module | What it does | Use when you need… | Path |
|--------|-------------|-------------------|------|
| [level-completion](logic/level-completion/README.md) | State machine: playing → completing → complete | tracking level/round lifecycle | logic/level-completion/ |
| [progress](logic/progress/README.md) | Save/load progress backed by localStorage | persisting player progression | logic/progress/ |
| [catalog](logic/catalog/README.md) | Ordered content catalog with navigation | chapter/level selection, content sequencing | logic/catalog/ |
| [loader](logic/loader/README.md) | Fetch + transform content pipeline | loading level data, configs, remote content | logic/loader/ |
| [evidence-tracker](logic/evidence-tracker/README.md) | Found/unfound tracking per scene with active clue rotation | hidden object found/unfound state, clue management | logic/evidence-tracker/ |
| [hint-system](logic/hint-system/README.md) | Cooldowns with exponential growth, count, targeting | hint cooldowns, progressive hints, targeting | logic/hint-system/ |
| [popup-queue](logic/popup-queue/README.md) | FIFO queue with timing, stacking limit, priority | sequential popups, toast queues, notification stacking | logic/popup-queue/ |
| [scene-navigation](logic/scene-navigation/README.md) | Unlocked scenes, current scene, transitions | multi-scene navigation, scene unlock progression | logic/scene-navigation/ |

## Prefabs

Assembled from primitives + logic. Higher-level building blocks.

| Module | What it composes | Use when you need… | Path |
|--------|-----------------|-------------------|------|
| [avatar-popup](prefabs/avatar-popup/README.md) | Circular avatar + dialogue + show/dismiss | character speech, notification popups, tooltips | prefabs/avatar-popup/ |
| [popup](prefabs/popup/README.md) | Toast-slide wrapper with auto-dismiss | toast notifications, timed alerts | prefabs/popup/ |
| [dialogue-box-character](prefabs/dialogue-box-character/README.md) | Dialogue box + character sprite composition | NPC dialogue, story beats with characters | prefabs/dialogue-box-character/ |
| [options-menu](prefabs/options-menu/README.md) | Sprite-button menu with toggles/sliders | settings menus, in-game options | prefabs/options-menu/ |
| [companion-character](prefabs/companion-character/README.md) | CharacterSprite + slideIn/popIn/exit/dance presets | tutorial hosts, narrative companions, celebration characters | prefabs/companion-character/ |
| [announcement-overlay](prefabs/announcement-overlay/README.md) | Backdrop + headline + content slots + action button | chapter intros, chapter overlays, level complete screens, story beats, interstitials, any full-screen announcement | prefabs/announcement-overlay/ |
| [evidence-list](prefabs/evidence-list/README.md) | Scrollable scene-thumbnail list with found/unfound states | hidden object evidence panels, collectible lists | prefabs/evidence-list/ |
| [score-popup](prefabs/score-popup/README.md) | Commendation badge + star rating celebratory reveal | end-of-level celebrations, score reveals | prefabs/score-popup/ |
| [scene-renderer](prefabs/scene-renderer/README.md) | Scene sprite + hotspots + ambilight composition | hidden object scenes, interactive environments | prefabs/scene-renderer/ |
| [search-objects-panel](prefabs/search-objects-panel/README.md) | Evidence list + progress bar + hint button | hidden object HUD, search game sidebars | prefabs/search-objects-panel/ |
| [hero-host-dialogue](prefabs/hero-host-dialogue/README.md) | Hero + sidekick speech bubble pair with show/dismiss | dual-character dialogue, host + companion banter | prefabs/hero-host-dialogue/ |

## Module Structure

Every module follows this shape:

```
modules/<category>/<module-name>/
  index.ts          ← public API (barrel export)
  defaults.ts       ← extracted magic numbers
  tuning.ts         ← panel schema for Tweakpane
  renderers/        ← renderer-specific implementations (visual modules only)
    pixi.ts           ← Pixi.js implementation
```

Logic modules use factory functions instead of renderers:

```
modules/logic/<module-name>/
  index.ts          ← factory function + types + public API
  defaults.ts       ← default config values
  tuning.ts         ← panel schema for Tweakpane
```

## Where to put new modules

- Single-purpose visual component → `primitives/`
- Pure logic, no rendering → `logic/`
- Assembles multiple primitives → `prefabs/`
- Reusable across games? It belongs here. Game-specific? It goes in `game/`.
