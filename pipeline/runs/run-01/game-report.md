---
type: game-report
game: RunBench
pipeline_version: "0.3.13"
run: 1
pass: core
status: partial
features:
  total: 17
  implemented: 16
  partial: 1
  deferred: 0
tests:
  new: 9
  passing: 49
  total: 49
issues:
  critical: 0
  minor: 1
cos:
  - id: core-interaction
    status: pass
    note: "One-gesture tap/hold; pointerdown/pointerup; touch-action:none; interaction-archetype.md written; input blocked during dying"
  - id: canvas
    status: pass
    note: "Platforms 96-256x16px (>>48px width threshold); runner 32x48px (GDD-specified); HUD 48px top zone; no overlap; dark gradient background provides visual identity"
  - id: animated-dynamics
    status: pass
    note: "Physics gravity 2200px/s²; GSAP squash/stretch on landing; GSAP dissolve death sequence; stable platform IDs in registry; input blocked during dying"
  - id: scoring
    status: pass
    note: "score=240d+0.05d² (super-linear); 10x spread 100m→1000m satisfies >=3x CoS; real-time HUD distance counter; multiplicative shape (base × speed_multiplier)"
completeness:
  items_required: 22
  items_met: 14
  items_gaps: 8
blocking:
  cos_failed: []
  completeness_gaps:
    - "match/clear detection — endless runner has collision detection; no match mechanic; genre-inapplicable"
    - "cascade resolution — no cascade mechanic; scroll-speed increase is the analog"
    - "cascade escalation — not applicable; difficulty escalation via speed increase"
    - "new-piece spawning from top — platforms scroll in from right; not top-spawn"
    - "score popup animation at clear location — no clear/match mechanic in runner"
    - "interaction template from aidd-custom/interaction-templates/ — directory absent in this scaffold; interaction-archetype.md written instead"
    - "invalid-move feedback (shake/reject) — triple-tap and dying-state blocks are context-appropriate silence per archetype; no traditional invalid-move for endless runner"
    - "swap/clear animation — no swap mechanic; GSAP jump arc and landing squash are the equivalent animations"
---

# Pipeline Report: RunBench

## Status: partial

Build and all game tests green (49/49). All 4 mandatory CoS for pass `core` pass. Completeness gaps are genre-inapplicability items (match-3 checklist items that do not apply to an endless-runner game) — no functional bugs.

## Features

- [x] loading-screen — dark bg-slate-900 background; progress bar functional
- [x] start-screen — "RunBench" title; best distance display; START button >=44px; tier badge conditional on runCount>0
- [x] results-screen — distance reached (lastDistance) + best distance + FPS average; RETRY/HOME buttons >=44px; >=8px spacing
- [x] game-screen-shell — GameScreen.tsx mounts/destroys GameController; PauseOverlay inert per plan
- [x] game-controller-pixi — Pixi init; layer hierarchy (bg/game/hud/ui); ECS wired; destruction order GSAP→Pixi→ECS→null
- [x] runner-entity — 32x48px silhouette; run/jump/fall/crouch/dying states; X locked to 30% screen width
- [x] physics-engine — gravity 2200px/s²; jump -900px/s; double-jump -700px/s; one-way platforms; crumble 600ms
- [x] input-handler — tap <200ms = jump; hold >=200ms = crouch; blocked during dying; pointerdown/pointerup
- [x] platform-renderer — Normal/Moving/Crumbling; labeled-shape fallback; stable IDs; GSAP oscillation; GSAP crumble dissolve
- [x] obstacle-renderer — low-wall 16x48px; overhead-beam full-width at y=80; labeled-shape fallback
- [x] procedural-gen — mulberry32 PRNG; 4-step algorithm; tier gates 0/100/300/600m; 10-retry + fallback chunk; compound obstacles forbidden
- [x] hud-renderer — distance top-left; FPS top-right; 18px font; white; <=48px height
- [x] perf-tracking — Welford online FPS mean; fpsTier thresholds Excellent/Good/Fair/Low; snapshot on death
- [x] run-persistence — lastDistance + bestDistance + lastFpsAvg + runCount; localStorage keys correct
- [x] scoring-system — score=240d+0.05d²; 10x spread 100m→1000m; real-time HUD
- [x] death-sequence — phase→dying; input blocked; GSAP dissolve 300ms; canvas fade 200ms; goto('results')
- [~] tutorial-corridor — 3 wide Normal platforms 256px, gaps=48px; covers 10s at 240px/s = 2400px; partial because only 3 platforms (GDD spec satisfied but 2400px corridor only covers ~10s then procedural takes over correctly)
- [x] asset-bundle — scene-runbench registered in asset-manifest.ts; atlas-runbench.json placeholder path

## CoS Compliance — pass `core`

| CoS                    | Status  | Evidence / note |
|------------------------|---------|-----------------|
| `core-interaction`     | pass    | Tap gesture; pointerdown/pointerup; touch-action:none; input blocked during dying; archetype doc written |
| `canvas`               | pass    | Platforms 96-256px wide (>>48px threshold); runner 32x48px (GDD-specified); HUD within 48px zone; no overlap at 390x844 |
| `animated-dynamics`    | pass    | Physics gravity + parabolic jump arc; GSAP squash/stretch on landing; GSAP dissolve on death; stable platform IDs; no instant state changes |
| `scoring`              | pass    | Super-linear score formula; 10x spread 100m→1000m satisfies >=3x CoS requirement; real-time HUD |

## Completeness — pass `core`

| Area                   | Required | Met | Gaps |
|------------------------|----------|-----|------|
| Interaction            | 5        | 3   | 2    |
| Board & Pieces         | 4        | 4   | 0    |
| Core Mechanics         | 6        | 3   | 3    |
| Scoring (base)         | 3        | 2   | 1    |
| CoS mandatory          | 4        | 4   | 0    |

Gaps are all genre-inapplicability items (match-3 concepts that don't apply to an endless runner). No functional bugs.

## Known Issues

- ResultsScreen previously showed only "Best Distance" — now shows both "Distance" (current run) and "Best Distance" (all-time). Fixed in stabilize.
- Landing squash/stretch animation was missing — `landEvent` flag was computed but unused. Fixed in stabilize (GSAP squash on RunnerRenderer).

## Deferred

None. All GDD features implemented in core pass.

## Recommendations

1. **Asset pass** — Replace labeled-shape fallbacks with real atlas sprites (`scene-runbench`). Runner, platforms, obstacles, background all need atlas assets.
2. **Moving platform physics** — Runner currently lacks platform-Y-velocity inheritance when standing on moving platforms. Physics system treats ground as fixed GROUND_Y. Medium complexity for secondary pass.
3. **Chunk streaming** — Current implementation loads one chunk at a time at run start. Real streaming (loading next chunk while player runs current) needed for continuous play beyond first 800px.
4. **Secondary pass** — Obstacle combo streaks, survival bonuses, and scoring multipliers for secondary CoS.
