# Agent-Friendliness Audit

**Rubric version:** 1.0 ([`docs/standards/agent-friendly-modules.md`](../docs/standards/agent-friendly-modules.md))
**Audited:** 2026-05-04
**Linear:** [ENG-2023](https://linear.app/wolfgames/issue/ENG-2023/b1-agent-friendliness-audit-of-existing-modules)

Every module in [`src/modules/INDEX.md`](../src/modules/INDEX.md) plus the orphan found on disk, scored against the eight rubric criteria.

## Legend

- ✅ pass · ❌ fail · — n/a
- **R1** README + one-line purpose · **R2** Copy-paste usage example · **R3** Config size within budget · **R4** No `src/game/` imports · **R5** INDEX `Use when…` hint · **R6** `defaults.ts` contract · **R7** `tuning.ts` contract · **R8** Listed in INDEX
- Cfg = top-level fields on the exported `*Config` interface

## Headline numbers

| Bucket            | Count | Notes |
|-------------------|------:|-------|
| Healthy (8/8)     | 0     | — |
| Minor drift (6–7) | 27    | All blocked on R1/R2 (missing README) |
| Needs work (≤ 5)  | 12    | R3 budget breaches + 3 logic modules missing defaults/tuning + 1 orphan |
| **Total scored**  | **39** | 20 primitives + 11 prefabs (incl. orphan) + 8 logic |

**Single biggest finding:** 38 of 39 modules ship with no README. Only `sprite-button` has one — and it's the gold standard the others should mirror.

## Primitives — budget ≤ 7 config fields

| Module               | R1 | R2 | R3 (cfg) | R4 | R5 | R6 | R7 | R8 | Score | Fix ticket |
|----------------------|----|----|----------|----|----|----|----|----|-------|------------|
| ambilight            | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| character-sprite     | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| commendation-badge   | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| countdown-timer      | ❌ | ❌ | ❌ (13)  | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| dialogue-box         | ❌ | ❌ | ❌ (9)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| fly-text             | ❌ | ❌ | ❌ (13)  | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| hint-box             | ❌ | ❌ | ❌ (8)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| hotspot              | ❌ | ❌ | ❌ (8)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| hud-display          | ❌ | ❌ | ❌ (8)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| progress-bar         | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| rotatable-tile       | ❌ | ❌ | ❌ (8)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| scene-thumbnail      | ❌ | ❌ | ❌ (10)  | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| screen-flash         | ❌ | ❌ | ✅ (2)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| screen-shake         | ❌ | ❌ | ✅ (1)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| sprite-button        | ✅ | ✅ | ❌ (13)  | ✅ | ✅ | ✅ | ✅ | ✅ | 7/8   | B1.2 |
| star-rating          | ❌ | ❌ | ❌ (11)  | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| tile-grid            | ❌ | ❌ | ❌ (9)   | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |
| toast-slide          | ❌ | ❌ | ✅ (7)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| transition-wipe      | ❌ | ❌ | ✅ (5)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| tutorial-hand        | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |

## Prefabs — budget ≤ 9 config fields

| Module                  | R1 | R2 | R3 (cfg) | R4 | R5 | R6 | R7 | R8 | Score | Fix ticket |
|-------------------------|----|----|----------|----|----|----|----|----|-------|------------|
| announcement-overlay    | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| avatar-popup            | ❌ | ❌ | ✅ (7)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| companion-character     | ❌ | ❌ | ✅ (2)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| dialogue-box-character  | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| evidence-list           | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| hero-host-dialogue ⚠    | ❌ | ❌ | ✅ (6)   | ✅ | ❌ | ✅ | ✅ | ❌ | 4/8   | B1.4 |
| options-menu            | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| popup                   | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| scene-renderer          | ❌ | ❌ | ✅ (5)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| score-popup             | ❌ | ❌ | ✅ (7)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| search-objects-panel    | ❌ | ❌ | ❌ (11)  | ✅ | ✅ | ✅ | ✅ | ✅ | 5/8   | B1.1 + B1.2 |

⚠ `hero-host-dialogue` exists at `src/modules/prefabs/hero-host-dialogue/` but isn't listed in INDEX.md — orphan.

## Logic — budget ≤ 7 config fields

| Module             | R1 | R2 | R3 (cfg) | R4 | R5 | R6 | R7 | R8 | Score | Fix ticket |
|--------------------|----|----|----------|----|----|----|----|----|-------|------------|
| catalog            | ❌ | ❌ | ✅ (2)   | ✅ | ✅ | ❌ | ❌ | ✅ | 4/8   | B1.1 + B1.3 |
| evidence-tracker   | ❌ | ❌ | ✅ (7)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| hint-system        | ❌ | ❌ | ✅ (5)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| level-completion   | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| loader             | ❌ | ❌ | ✅ (2)   | ✅ | ✅ | ❌ | ❌ | ✅ | 4/8   | B1.1 + B1.3 |
| popup-queue        | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |
| progress           | ❌ | ❌ | ✅ (4)   | ✅ | ✅ | ❌ | ❌ | ✅ | 4/8   | B1.1 + B1.3 |
| scene-navigation   | ❌ | ❌ | ✅ (6)   | ✅ | ✅ | ✅ | ✅ | ✅ | 6/8   | B1.1 |

## Failure clusters (drives the fix tickets)

### Cluster 1 — Missing READMEs (R1 + R2): 38 modules

Every module except `sprite-button` lacks a README. Use `sprite-button/README.md` as the template — one-line purpose at top, copy-paste usage block, public API table, tuning table.

→ **Fix ticket B1.1: Add READMEs to all modules** (1 pt per module, batchable)

### Cluster 2 — Config size over budget (R3): 12 modules

Primitives over 7 fields: `countdown-timer (13)`, `dialogue-box (9)`, `fly-text (13)`, `hint-box (8)`, `hotspot (8)`, `hud-display (8)`, `rotatable-tile (8)`, `scene-thumbnail (10)`, `sprite-button (13)`, `star-rating (11)`, `tile-grid (9)`.

Prefabs over 9 fields: `search-objects-panel (11)`.

Common shape of the bloat: animation timing constants, color overrides, and label/font fields exposed individually instead of grouped. Most can be remediated by either nesting (e.g. `style: { fontSize, fill, weight }`) or pushing rarely-tuned values into `defaults.ts`-only.

→ **Fix ticket B1.2: Trim oversized config surfaces** (2 pt per module)

### Cluster 3 — Logic modules missing `defaults.ts`/`tuning.ts` (R6 + R7): 3 modules

`catalog`, `loader`, `progress` ship with `index.ts` only. The writing-a-module guide requires both files.

→ **Fix ticket B1.3: Add defaults.ts + tuning.ts to logic modules** (1 pt per module)

### Cluster 4 — Orphan module (R8): 1 module

`hero-host-dialogue` is on disk but not in INDEX.md. Either register it or delete it.

→ **Fix ticket B1.4: Resolve hero-host-dialogue orphan** (1 pt)

## Re-scoring

When a fix ticket lands, the implementer updates the affected rows in this file in the same PR. Bump the **Audited** date in the header. Bump the **Rubric version** only if `agent-friendly-modules.md` changes.

A reviewer disagreement of more than ±1 on a single criterion is a rubric-tightening signal — log it in the PR description and open a follow-up against the rubric, not the module.
