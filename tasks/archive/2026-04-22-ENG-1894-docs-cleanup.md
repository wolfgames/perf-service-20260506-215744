# Amino: Documentation Cleanup & Organization Epic

**Status**: ✅ COMPLETED (2026-04-22)
**Linear**: ENG-1894
**Goal**: Bring docs back in sync with the current codebase so agents and developers can trust what they read

## Overview

Documentation has drifted from reality — 20+ files reference retired games (CityLines/DailyDispatch), index files have dead links, and module docs may not match the current PixiRenderable API. Cleaning this up prevents incorrect AI-generated code and reduces developer onboarding friction.

---

## Generalize stale game references in core docs

Replace CityLines/DailyDispatch references with generic `MyGame`/`mygame` equivalents in high-priority core architecture docs.

**Requirements**:

- Given a doc file under `docs/core/` referencing `CityLinesGame` or `DailyDispatchGame`, should replace with `MyGame` and update paths to `src/game/mygame/`
- Given game-specific asset names like `atlas-tiles-daily-dispatch` or `sfx-citylines`, should replace with generic equivalents like `atlas-tiles-mygame` or `sfx-mygame`

---

## Generalize stale game references in guide docs

Same generalization pass for medium-priority guide and system docs.

**Requirements**:

- Given guide docs referencing CityLines/DailyDispatch code examples, should update to use `MyGame` patterns
- Given `docs/game/analytics-requirements.md` hardcoding `"game_name": "city_lines"`, should generalize to `"game_name": "mygame"`

---

## Archive retired game-specific docs

Move docs that describe retired game engines to `docs/archive/`.

**Requirements**:

- Given game-specific docs like `daily-dispatch-engine.md`, `chapter-generation.md`, `fallback-patrol-chapters.md`, `cdn-chapter-loading-plan.md`, should move to `docs/archive/` with an archive notice header
- Given `docs/game/gdd.md` referencing retired prototypes, should flag mismatched sections with inline comments

---

## Update docs/INDEX.md

Sync the master routing table with actual doc files.

**Requirements**:

- Given dead links in `docs/INDEX.md` pointing to removed files, should remove those entries
- Given doc files that exist but are missing from the index, should add them with accurate descriptions

---

## Update src/modules/INDEX.md

Sync the module catalog with the actual module implementations.

**Requirements**:

- Given modules present in `src/modules/primitives/`, `src/modules/logic/`, or `src/modules/prefabs/` but missing from `INDEX.md`, should add entries with use-case descriptions
- Given modules listed in `INDEX.md` that no longer exist in code, should remove those entries

---

## Verify writing-a-module.md against current API

Cross-check the module authoring guide against the actual PixiRenderable base class.

**Requirements**:

- Given code examples in `docs/modules/writing-a-module.md`, should verify they match the current base class API in `src/modules/primitives/_base/`
- Given outdated method signatures or patterns, should update examples to reflect reality

---

## Task and ticket hygiene

Archive completed tasks and update the stale-docs-audit status.

**Requirements**:

- Given `tasks/stale-docs-audit.md` whose work is now complete, should move to `tasks/archive/` with a completed date
- Given `tasks/renderable-primitive-epic.md`, should verify its status reflects reality
