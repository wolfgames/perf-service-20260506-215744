# === Glossary (aliases resolved) ============================================
# Glossary — `$`-aliases resolved for this run

Every `$`-alias referenced in a phase body is defined here. `executePhase()` renders this template with concrete values substituted from `$runContext.aliases` before prepending it to the dispatch prompt — the sub-agent sees a table of absolute paths and host commands, not placeholders. There is no "unsure, call pwd" case and no "fall back to scanning" case.

An alias whose owner phase has not yet run renders as `null — populated by <owner>`. Phases that need such an alias never run before its owner (enforced by filename ordering under `$phasesDir/`).

## Path aliases

| Alias | Resolves to | Populated by |
|------|-------------|--------------|
| `$repoRoot` | /var/lib/agent-worker/workspace/perf-service-20260506-215744 | `initRun()` |
| `$skillRoot` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/node_modules/@wolfgames/cortex/amino/skills/pipeline-build-game | `initRun()` |
| `$rules` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/.claude/rules | `initRun()` |
| `$pipelineRoot` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline | derived |
| `$gamePrompt` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/game-prompt.md | derived |
| `$gamePromptDraft` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/game-prompt-draft.md | derived |
| `$pipelineConfig` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/configs/pipeline-config.yml | derived |
| `$runsDir` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/runs | derived |
| `$runDir` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/runs/run-01 | `initRun()` |
| `$phaseSummary` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/runs/run-01/phase-summary.yml | derived |
| `$runContext` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/runs/run-01/pipeline-context.yml | derived |
| `$runLog` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/pipeline/runs/run-01/run-log.yml | derived |
| `$phasesDir` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/node_modules/@wolfgames/cortex/amino/skills/pipeline-build-game/phases/ | derived |
| `$refs` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/node_modules/@wolfgames/cortex/amino/skills/pipeline-build-game/references/ | derived |
| `$scaffold` | /var/lib/agent-worker/workspace/perf-service-20260506-215744/node_modules/@wolfgames/cortex/amino/skills/pipeline-build-game/references/scaffold/ | derived |

## Runtime-value aliases

| Alias | Resolves to | Populated by |
|------|-------------|--------------|
| `$pass` | core | `initRun()` |
| `$tsRunner` | bun | `initRun()` (detected from PATH) |
| `$previousRunLog` | null | `05-pass-gate` |
| `$buildCmd` | bun run build | `10-prime` |
| `$testCmd` | bun test | `10-prime` |

Resolution order for `$buildCmd` / `$testCmd`: (1) `$pipelineConfig.build-cmd` / `test-cmd` override if set, (2) detected from project (`package.json` scripts, `pyproject.toml`, `Makefile`), (3) abort with a clear error — do not guess.

## Skills (not paths)

Skill invocations use the `/skill-name` form (e.g. `/aidd-javascript`, `/aidd-tdd`). They are **not** file paths — invoke via the Skill tool. A phase's `Load before reasoning:` list marks these with `skill:` prefix.

# === Phase instructions ====================================================
Phase: analyze-gdd
Phase file: /var/lib/agent-worker/workspace/perf-service-20260506-215744/node_modules/@wolfgames/cortex/amino/skills/pipeline-build-game/phases/20-analyze-gdd.md

Read the phase file above — it is your complete instructions. Every $-alias it references is defined in the glossary above with a concrete value. The phase file will tell you which other artifacts to read (e.g. $phaseSummary, $runContext, gdd-analysis.yml); read them on demand via tool calls. Execute the phase. Do not wait for further instructions from me.
