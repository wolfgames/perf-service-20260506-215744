## Agent Directives

### Skills, Rules, and Commands

AI context for this project is provided by [`@wolfgames/cortex`](https://github.com/wolfgames/cortex) — symlinked into `.cursor/rules/`, `.cursor/skills/`, `.claude/rules/`, and `.claude/skills/` on `bun install` by [`cortex/scripts/setup.mjs`](../cortex/scripts/setup.mjs). Do not look for `ai/` or `aidd-custom/` — those legacy folders have been removed; all content now lives in cortex.

Layout:

```
local/
  rules/<name>.mdc                 (project-only rules)
  skills/<skill-name>/SKILL.md     (project-only skills)
.cursor/
  rules/                           (FLAT — one symlink per .mdc file)
    amino-guardrails.mdc → cortex/amino/rules/amino-guardrails.mdc
    gpu-vs-dom.mdc       → cortex/guardrails/pixi/gpu-vs-dom.mdc
    …                    (cortex + local, merged flat)
  skills/                          (FLAT — one symlink per skill directory)
    aidd-fix       → cortex/aidd/skills/aidd-fix
    amino-posthog  → cortex/amino/skills/amino-posthog
    attract-mode   → cortex/aidd-custom/skills/attract-mode
    …              (cortex + local, merged flat)
.claude/   — mirrors .cursor/ with the same targets
```

**Project-only rules** go in `local/rules/<name>.mdc`. Setup flattens them into `.cursor/rules/` and `.claude/rules/`. Local wins on name collisions with cortex.

**Project-only skills** go in `local/skills/<skill-name>/SKILL.md`. Setup flattens them into `.cursor/skills/` and `.claude/skills/`. Cortex wins on name collisions — rename a local skill if it conflicts.

**Refreshing after cortex edits**: `bun run cortex:setup` re-links without a full `bun install`. `bun install` also re-links via `postinstall`.

Do not edit anything under the cortex-managed symlinks — changes would be lost on re-install or leak back into cortex.

Which packs are linked is controlled by the `cortex` field in [`package.json`](package.json).

### Progressive Discovery

Only drill into a skill when a task needs it. The `aidd/` pack covers framework-agnostic workflows; `amino/` covers this scaffold's conventions; `aidd-custom/` covers game design and build pipeline.

### Vision Document Requirement

**Before creating or running any task, agents must first read the vision document (`vision.md`) in the project root.**

### Conflict Resolution

If any conflicts are detected between a requested task and the vision document, agents must ask the user to clarify how to resolve the conflict before proceeding.

### Project Configuration Overrides

Optional: to override cortex defaults (e.g. `e2eBeforeCommit`), create `aidd-custom/config.yml` at the project root with the overrides. Skills check this file first, then fall back to cortex defaults.

---

# Wolf Games Critical References
## GameKit API

This project uses `@wolfgames/game-kit` for analytics, auth, assets, and error tracking. API reference lives in the game-kit repo — see `repos/game-kit/`.

## Documentation

All docs live in `docs/`. Read [`docs/INDEX.md`](docs/INDEX.md) for the full routing table.

## Best Practices

**Read [`docs/standards/best-practices.md`](docs/standards/best-practices.md) before writing any game code.**

Covers: GPU-only rendering (no DOM in gameplay), project structure (what to touch), asset conventions, module usage, and the game contract.

## Guardrails

**Read [`docs/standards/guardrails.md`](docs/standards/guardrails.md) before writing any game code.**

The companion to best practices — 18 rules covering what NOT to do. Silent failures (wrong bundle prefix, `eventMode = 'none'` on parents), memory leaks (orphaned tweens, per-frame allocations), and framework foot-guns (React imports in SolidJS, DOM in GPU code).

### Compliance Audit

Run `/audit-guardrails` to produce a pass/warn/fail report with file:line evidence, a drift map vs prior audits, and an optional Notion publish. Skill lives at `@wolfgames/cortex/guardrails/audit/SKILL.md` — one source of truth backing Codex CLI, Claude Code, and Cursor.

---
