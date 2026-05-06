# RunBench
**Tagline:** Every frame counts.
**Genre:** Platformer / Endless Runner (Performance Testing Variant)
**Platform:** Mobile first (portrait, touch), playable on web
**Target Audience:** Casual adults 30+

## Game Overview
RunBench is a minimal side-scrolling platformer designed to stress-test rendering performance across devices. The player guides a single character through procedurally generated platform sequences by tapping to jump, revealing how each device handles sustained 60 FPS gameplay under real conditions. Each run generates a reproducible performance snapshot the player can compare across sessions.

**Setting:** A clean, abstracted void — geometric platforms and a lone runner silhouetted against a gradient sky. No story, no clutter — only motion and measurement.

**Core Loop:** Player taps to jump over gaps and obstacles -> which keeps the runner alive and scores distance -> which unlocks the next difficulty tier and surfaces device performance data.

---

## Table of Contents

**The Game**
1. [Game Overview](#game-overview)
2. [At a Glance](#at-a-glance)

**How It Plays**
3. [Core Mechanics](#core-mechanics)
4. [Level Generation](#level-generation)

**How It Flows**
5. [Game Flow](#game-flow)

---

## At a Glance

| | |
|---|---|
| **Play Surface** | Portrait canvas, full screen, no fixed grid |
| **Input** | Tap (single touch or mouse click) |
| **Player Entity** | Runner (one character, no variants) |
| **Platform Types** | Normal, Moving, Crumbling |
| **Obstacle Types** | Low wall, Overhead beam |
| **Session Target** | 1–3 min per run |
| **Distance Range** | Unlimited; difficulty gates at 100 m, 300 m, 600 m, 1 000 m |
| **Failure** | Yes — fall off screen or collide with obstacle |
| **Continue System** | Tap to restart immediately; no currency |
| **Star Rating** | None |
| **Companion** | None |
| **Content Cadence** | Procedural; no scheduled content drops |

---

## Core Mechanics

### Primary Input
**Input type:** Single tap (touchstart on mobile; mousedown on web)
**Acts on:** The Runner character
**Produces:** A jump arc — the Runner launches upward with fixed initial vertical velocity and falls under constant gravity. A second tap while airborne triggers a single double-jump.

One-gesture rule: the only required player gesture is a single tap. No swipe, drag, hold, or multi-touch mechanic exists.

### Play Surface
- **Orientation:** Portrait (9:16). Canvas fills the full device screen with letterboxing on wider viewports.
- **Scroll direction:** Horizontal auto-scroll (camera moves right at a constant speed that increases with distance).
- **Visible width:** ~6 platform-widths at any moment.
- **Vertical range:** 3 platform rows (low, mid, high). The runner starts on mid-row.
- **Bounds:** Left edge = instant death (runner scrolled off screen). Top/bottom edges = death if runner exits vertically.
- **Resolution cap:** `devicePixelRatio` clamped to 2.

### Game Entities

#### Runner
- **Visual:** 32×48 px silhouette sprite, single animation strip (run cycle 8 frames, jump pose 1 frame, fall pose 1 frame).
- **Behavior:** Moves horizontally at camera scroll speed (appears stationary horizontally). Vertical movement only.
- **Edge cases:**
  - IF runner Y > bottom bound THEN trigger loss sequence.
  - IF runner X < left screen edge THEN trigger loss sequence.
  - IF runner overlaps obstacle hitbox THEN trigger loss sequence.

#### Normal Platform
- **Visual:** Solid rectangle, 96–256 px wide, 16 px tall. Color: mid-grey.
- **Behavior:** Stationary. Runner lands on top; standing on it resets jump count.
- **Edge cases:** IF runner approaches from below THEN no collision (one-way platform).

#### Moving Platform
- **Visual:** Same as Normal Platform with a subtle oscillation indicator (tint shift).
- **Behavior:** Moves vertically between two Y positions at constant speed (40–80 px/s). Runner inherits Y velocity while standing.
- **Edge cases:** IF platform reverses direction while runner is standing THEN runner velocity inherits new direction immediately.

#### Crumbling Platform
- **Visual:** Normal Platform with a crack overlay sprite.
- **Behavior:** Triggers a crumble timer (600 ms) on first contact. After timer expires, platform disappears. Runner falls immediately.
- **Edge cases:** IF runner lands again before crumble completes THEN timer resets.

#### Low Wall Obstacle
- **Visual:** 16×48 px solid rectangle anchored to platform top.
- **Behavior:** Stationary. Blocks runner horizontally — collision is instant loss.
- **Edge cases:** None; no partial collision.

#### Overhead Beam Obstacle
- **Visual:** Full-width horizontal bar at Y = 80 px from screen top.
- **Behavior:** Stationary. Runner must duck — implemented as: tap and hold longer than 200 ms triggers a crouch that lowers hitbox by 50 %. Tap shorter than 200 ms = jump.
- **Edge cases:** IF runner is already airborne and beam appears THEN no crouch available — player must have already cleared the beam gap.

### Movement & Physics Rules

All durations are in milliseconds.

| Rule | Condition | Outcome |
|---|---|---|
| Jump | Runner on ground AND tap < 200 ms | Vertical velocity = −900 px/s; jump count = 1 |
| Double jump | Runner airborne AND jump count = 1 AND tap < 200 ms | Vertical velocity = −700 px/s; jump count = 2 |
| Gravity | Always | Vertical acceleration = +2 200 px/s² per second |
| Land | Runner bottom touches platform top | Vertical velocity = 0; jump count = 0 |
| Crouch | Runner on ground AND tap hold ≥ 200 ms | Hitbox height = 50 %; duration = hold length, min 300 ms |
| Scroll speed | Time-based | Starts 240 px/s; increases +10 px/s per 100 m distance |
| Camera | Always | Follows runner's Y with 80 ms lag; X locked to 30 % of screen width |

> For invalid action feedback (visual, audio, duration), see [Feedback & Juice](#feedback--juice).

---

## Level Generation

### Method
**Procedural** — all platform sequences are generated at runtime. No hand-crafted levels. Tutorial sequence (first 10 seconds of first run) is a hardcoded safe corridor that is always placed first.

### Generation Algorithm

**Step 1: Chunk Factory**
- Inputs: current distance, difficulty tier, seed
- Outputs: one platform chunk (3–6 platforms + 0–2 obstacles)
- Constraints:
  - Every chunk must be traversable by a player using at most 1 double-jump.
  - Gap width never exceeds 180 px at current scroll speed (solvable within 300 ms air time).
  - Minimum platform width = 80 px (ensures 44 pt tap-and-land target at density).

**Step 2: Obstacle Placement**
- Inputs: chunk layout, difficulty tier
- Outputs: obstacle positions within chunk
- Constraints:
  - No obstacle within first 48 px of a new platform (landing grace zone).
  - Low wall and overhead beam never appear simultaneously in the same chunk (avoid compound reaction requirement).
  - Obstacle probability by tier: Tier 1 = 0 %, Tier 2 = 15 %, Tier 3 = 30 %, Tier 4 = 45 %.

**Step 3: Moving/Crumbling Platform Selection**
- Inputs: chunk layout, difficulty tier
- Outputs: platform type assignments
- Constraints:
  - Tier 1 (0–100 m): Normal platforms only.
  - Tier 2 (100–300 m): Up to 1 moving platform per chunk.
  - Tier 3 (300–600 m): Up to 1 crumbling platform per chunk.
  - Tier 4 (600 m+): Up to 1 moving + 1 crumbling per chunk.
  - Never assign crumbling type to the only landing platform after a long gap.

**Step 4: Solvability Check**
- Inputs: full chunk layout
- Outputs: pass/fail
- Constraints:
  - Simulate runner at minimum skill (single jump only) — if simulation reaches chunk end, pass.
  - If fail, retry chunk generation up to 10 times.
  - If 10 retries exhausted, use fallback chunk (see below).

### Seeding & Reproducibility
- Seed formula: `runSeed = runNumber * 48271 + deviceId_hash`
- Same seed always produces identical chunk sequence.
- Seed passed through a mulberry32 PRNG; each chunk consumes N draws from the sequence.
- Failed-seed handling: if PRNG produces an invalid chunk after 10 retries, log warning and insert fallback chunk at that position (seed sequence continues from the next draw — output stays deterministic).

### Solvability Validation

| Rejection Condition | Rule |
|---|---|
| Unreachable gap | Gap width > 180 px at current scroll speed |
| No landing zone | Chunk end has no platform within jump range |
| Compound hazard | Low wall + overhead beam in same chunk |
| Tiny platform after gap | Landing platform width < 80 px after gap ≥ 120 px |

- **Retry limit:** 10 attempts per chunk.
- **Fallback chunk:** A 3-platform staircase (all Normal, no obstacles, gaps = 80 px) guaranteed always passable. Hardcoded; not generated.
- **Last-resort guarantee:** Fallback chunk is always used after 10 failed retries. The fallback chunk itself has no generation logic and cannot fail.

### Hand-Crafted Levels
- **Tutorial corridor:** First 10 seconds of Run 1 only. Three wide Normal platforms, no obstacles, gaps = 48 px. Data: inline constant in `src/game/runbench/data/tutorialChunk.ts`. Owner: game team.
- All other levels: procedurally generated — no hand-crafted content.

---

## Game Flow

### Master Flow Diagram

```
[App Open]
    ↓ (boot, asset load)
[Loading Screen]  lifecycle_phase: BOOT
    ↓ (assets ready)
[Title / Start Screen]  lifecycle_phase: TITLE
    ↓ (player taps START)
[Gameplay Screen]  lifecycle_phase: PLAY
    ↓ (runner dies)
[Run Over Screen]  lifecycle_phase: OUTCOME
    ↓ (player taps RETRY)
[Gameplay Screen]  lifecycle_phase: PLAY
    ↓ (player taps HOME)
[Title / Start Screen]  lifecycle_phase: TITLE
```

### Screen Breakdown

#### Loading Screen
- **lifecycle_phase:** BOOT
- **Purpose:** Load GPU asset bundle (`scene-runbench`), initialize Pixi renderer.
- **Player sees:** Centered progress bar on dark background; no text beyond game name.
- **Player does:** Nothing (passive wait).
- **What happens next:** Auto-advance to Title Screen when assets are ready.
- **Expected duration:** < 3 seconds on 4G.

#### Title / Start Screen
- **lifecycle_phase:** TITLE
- **Purpose:** Entry point; surfaces high score and device perf tier.
- **Player sees:** Game name, best distance from previous runs, single large START button, performance tier badge (if run count > 0).
- **Player does:** Taps START.
- **What happens next:** Transition to Gameplay Screen; first run inserts tutorial corridor.
- **Expected duration:** < 10 seconds (player decides quickly).

#### Gameplay Screen
- **lifecycle_phase:** PLAY
- **Purpose:** Core game loop — runner auto-scrolls, player taps to survive.
- **Player sees:** Full-screen canvas; HUD overlay showing current distance (top-left) and current FPS (top-right); no pause button by design (performance test context).
- **Player does:** Tap to jump / double-jump; hold to crouch.
- **What happens next:** Runner dies → Run Over Screen.
- **Expected duration:** 1–3 minutes per run.

#### Run Over Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Show run result; encourage retry.
- **Player sees:** Distance reached, best distance, FPS average for run, two buttons: RETRY and HOME.
- **Player does:** Taps RETRY (new run, same difficulty curve) or HOME (return to Title).
- **What happens next:** RETRY → Gameplay Screen (new seed). HOME → Title Screen.
- **Expected duration:** < 15 seconds.

### Board States

| State | Description | Input Allowed |
|---|---|---|
| Idle | Runner on ground, no tap pending | Yes |
| Airborne | Runner in jump arc | Yes (double-jump only) |
| Crouching | Runner crouching, hold active | No jump allowed |
| Dying | Death animation playing (300 ms) | No |
| Won | N/A — endless run, no win state | N/A |
| Paused | N/A — no pause by design | N/A |

Any board-state transition that moves the runner or mutates platform positions is expressed as an animated GSAP tween — no instant state changes. Platform crumble, runner death arc, and moving-platform travel are all animated transitions with defined durations.

### Win Condition
N/A — RunBench has no win state. The run ends only on death.

### Lose Condition
- IF `runner.y > screen.height` THEN loss (fell below screen).
- IF `runner.x < 0` THEN loss (scrolled off left edge).
- IF `runner.bounds intersects obstacle.bounds` THEN loss (collision).

### Win Sequence (ordered)
N/A.

### Loss Sequence (ordered)
1. Set board state → Dying.
2. Disable all player input.
3. Play death animation: GSAP tween runner alpha 1→0, scale 1→0.5, duration 300 ms, ease `power2.in`.
4. Record final distance and FPS average to local storage.
5. After tween completes: transition to Run Over Screen (fade canvas out, 200 ms).
6. Run Over Screen renders with results from step 4.
7. Player taps RETRY or HOME.
