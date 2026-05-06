# Game Production Framework

A production-ready template for building mobile web games — from prompt to polished, shippable product. Describe a game idea, and AI agents design and build it using the embedded skill pipeline.

**North star:** Games players can't put down. Multiple sessions per day. Instantly playable, deeply satisfying, compulsively replayable, and production ready from day one.

Built on a 3-tier architecture: **Core** (engine), **Modules** (reusable building blocks), and **Game** (your game logic). See [`vision.md`](vision.md) for the full product vision.

## Getting Started

### Prerequisites

- **Bun** — install from [bun.sh](https://bun.sh)
- **GitHub Personal Access Token** — required for `@wolfgames/*` packages on GitHub Packages
- **Windows only**: enable **Developer Mode** before the first `bun install` (Settings → Privacy & security → For developers). The `@wolfgames/cortex` postinstall uses symlinks to wire AI rules and skills into `.claude/` and `.cursor/`. Without Developer Mode, it falls back to junctions (fine) or copies (works but won't pick up cortex updates) and emits a `[cortex] ⚠` warning — see [cortex setup guide](https://github.com/wolfgames/cortex/blob/main/docs/setup.md#windows-enable-developer-mode-first) for details.

### 1. Configure GitHub Packages

`@wolfgames/*` packages live on GitHub Packages. The project's [`.npmrc`](.npmrc) reads `NODE_AUTH_TOKEN` from your shell — you need to set it once.

**Step 1 — get a token:**

1. Go to https://github.com/settings/tokens
2. **Generate new token → Generate new token (classic)**
3. Give it the `read:packages` scope (and `write:packages` if you'll publish)
4. Copy the `ghp_...` value

> Already use GitHub CLI? Shortcut: `gh auth token` prints a token with the right scopes, no web UI needed.

**Step 2 — export it:**

Add this line to `~/.zshrc` (or `~/.bashrc`):

```bash
export NODE_AUTH_TOKEN="ghp_your_token_here"
```

Then reload your shell:

```bash
source ~/.zshrc
```

**Step 3 — verify:**

```bash
echo $NODE_AUTH_TOKEN   # should print ghp_...
```

If it's empty, the export didn't take — open a new terminal tab and try again.

> **Cursor gotcha**: Cursor's integrated terminal sometimes launches a non-interactive shell that skips `~/.zshrc`. If `bun install` hangs after "Resolving dependencies…", run it from a regular Terminal/iTerm window (or reopen Cursor's terminal).

### 2. Clone & Install

```bash
git clone --recurse-submodules <repo-url>
bun install
bun run dev
```

> The `--recurse-submodules` flag pulls the `tools/game-builder/` submodule used by the AIDD framework. If you already cloned without it, run `git submodule update --init`.

**Updating cortex rules + skills later:**

```bash
bun update @wolfgames/cortex   # pull new cortex content
bun run cortex:setup           # re-link symlinks + regenerate inventory
```

`postinstall` runs `cortex:setup` automatically on every `bun install`, so usually you don't need to run it by hand. See [`docs/cortex-inventory.md`](docs/cortex-inventory.md) for the current list of rules and skills.

Open [http://localhost:3000](http://localhost:3000) to play.

### 3. IDE Setup (Claude Code / Cursor)

The project has three permission modes. Copy one to activate:

```bash
cp .claude/settings.design.json .claude/settings.local.json   # Design — game/ only
cp .claude/settings.dev.json .claude/settings.local.json       # Dev — game/ + modules/
cp .claude/settings.admin.json .claude/settings.local.json     # Admin — unrestricted
```

See [.claude/README.md](.claude/README.md) for details.

### Next Steps

- Read [`vision.md`](vision.md) to understand the project goals
- See the **[New Game Guide](docs/guides/getting-started/new-game.md)** to start building

## Architecture

```
src/
├── core/              # Framework shell — DO NOT EDIT
│   ├── systems/       # Assets, screens, tuning, audio, errors, pause, vfx
│   ├── ui/            # Button, Spinner, MobileViewport, ViewportToggle
│   └── dev/           # TuningPanel (Tweakpane)
│
├── modules/           # Reusable building blocks
│   ├── primitives/    # SpriteButton, DialogueBox, CharacterSprite, ProgressBar
│   ├── logic/         # LevelCompletion, Progress, Catalog, Loader
│   └── prefabs/       # AvatarPopup
│
└── game/              # Game-specific code
    ├── config.ts      # Identity, environment, manifest, types, screen wiring
    ├── state.ts       # Runtime signals (score, health, level)
    ├── screens/       # Solid.js screen shells (Loading, Start, Game, Results)
    ├── setup/         # AnalyticsContext, FeatureFlagContext
    ├── audio/         # GameAudioManager + sound definitions
    ├── tuning/        # Game tuning types + defaults
    └── mygame/        # Your game (Pixi engine, controllers, UI, etc.)
```

### Dependency Rules

```
core/    → no deps on modules/ or game/
modules/ → can import from core/
game/    → can import from core/ + modules/
```

## Where to Put New Code

| What you're building | Where it goes |
|---------------------|---------------|
| Single-purpose reusable component | `src/modules/primitives/<name>/` |
| Pure logic, no rendering | `src/modules/logic/<name>/` |
| Assembled from multiple primitives | `src/modules/prefabs/<name>/` |
| Game screen | `src/game/screens/` |
| Game mechanic / controller | `src/game/<game-name>/` |
| Game state signals | `src/game/state.ts` |
| Game tuning values | `src/game/tuning/` |
| Module configuration for a game | `src/game/setup/` |
| Framework system / provider | `src/core/systems/` (admin only) |

## Features

- **Engine Agnostic** — Swap between Pixi, Phaser, or Three.js
- **Asset Management** — Layered loading (DOM, GPU, audio)
- **Module System** — Configurable primitives, logic, and prefabs
- **Live Tuning** — Press backtick (`) to adjust parameters in real-time
- **Error Boundaries** — Layered error handling with Sentry + PostHog

## Factory Commands

See **[docs/factory/index.md](docs/factory/index.md)** for the full list.

| Command | Purpose |
|---------|---------|
| `/research` | Investigate without code changes |
| `/compare` | Compare solutions with trade-offs |
| `/report` | Generate documentation |
| `/audit` | Systematic codebase review |
| `/debug` | Find bug root cause |
| `/review` | Code quality review |
| `/naming` | Asset naming convention |
| `/commit` | Git commit |
| `/deploy` | Deploy to QA/staging/production |
| `/newgame` | Setup checklist for forking to a new game |
| `/newmodule` | Create a new module in modules/ |

## File Permissions

| Folder | Read | Edit |
|--------|:----:|:----:|
| `src/game/` | Yes | Yes |
| `src/modules/` | Yes | Yes |
| `src/core/` | Yes | **No** |
| `docs/` | Yes | Yes |
| `public/` | Yes | Yes |
| `ai/` | Yes | **No** |

See **IDE Setup** in Getting Started above to switch permission modes.

## MCP Servers

This project uses MCP servers for AI-assisted development. The `.mcp.json` file is gitignored — you need to create it yourself.

Create `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    },
    "wolfgames-asset-gen": {
      "type": "http",
      "url": "https://asset-gen-five.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer <your-token-here>"
      }
    }
  }
}
```

Ask a team member for the `wolfgames-asset-gen` bearer token, or see the [Asset Gen MCP Setup](https://www.notion.so/wolfgames/Asset-Gen-MCP-Setup-30d4a337719980248e1ed1c5419f11cc) docs on Notion.

## Tech Stack

| Category | Technology |
|----------|------------|
| UI | SolidJS |
| Graphics | PixiJS 8 |
| Audio | Howler.js |
| Animation | GSAP |
| Build | Vite |
| Styling | TailwindCSS |

## Common Tasks

```bash
bun run dev           # Development server
bun run typecheck     # Type check
bun run build         # Production build
bun run test          # Run tests
bun run cortex:setup  # Relink cortex rules + skills (also runs on bun install)
```

## AI Context (Rules + Skills)

All AI rules and skills come from [@wolfgames/cortex](https://github.com/wolfgames/cortex), plus anything you add in [`local/rules/`](local/rules/) or [`local/skills/`](local/skills/).

- **[How it works →](https://github.com/wolfgames/cortex/blob/main/docs/linking.md)** — visual explainer of what flows from cortex into a consumer project
- **[What's wired up right now →](docs/cortex-inventory.md)** — auto-generated inventory, regenerates on every `bun install` or `bun run cortex:setup`

## Documentation

See the **[docs folder](docs/README.md)** for full documentation, or use the **[flat index](docs/INDEX.md)** for fast lookup.

| Topic | Description |
|-------|-------------|
| [Architecture](docs/core/architecture.md) | System overview and diagrams |
| [Context Map](docs/core/context-map.md) | Node-edge relationship map (AI context) |
| [Module System](docs/modules/index.md) | Primitives, logic, prefabs |
| [Creating a New Game](docs/guides/getting-started/new-game.md) | Step-by-step guide |
| [Audio Setup](docs/guides/assets/audio-setup.md) | Howler.js audio sprites |
| [Debugging](docs/guides/development/debugging.md) | DevTools and troubleshooting |
| [Tuning System](docs/core/systems/tuning.md) | Live parameter adjustment |
| [Game Design Doc](docs/game/gdd.md) | Game design |
