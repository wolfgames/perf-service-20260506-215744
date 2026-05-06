# Vision — Prompt to Play

## What This Is

A production-ready template for building mobile web games. An engineer clones this repo, describes a game idea, and AI agents design and build a polished, shippable game using the embedded skill pipeline.

## North Star

**Games players can't put down.** Multiple sessions per day. The kind of game you open on the bus, at lunch, before bed — and keep coming back to.

Every game built from this scaffold should be:

- **Instantly playable** — no downloads, no sign-up, under 3 seconds to first interaction
- **Deeply satisfying** — the core verb feels good before any goals or scoring exist
- **Compulsively replayable** — "one more round" is the natural reaction, not a design trick
- **Production ready** — error tracking, analytics, asset management, and scalable infrastructure from day one

## Product Principles

### The Feel Test
If the core interaction isn't fun with no UI, no score, and no goals — it's not ready. Polish the verb before building the game around it.

### Respect the Player's Time
Short sessions that feel complete. Players should be able to pick up and put down in under a minute and still feel they accomplished something. But they should *want* to keep going.

### Progression Without Punishment
Players always move forward. Difficulty breathes — hard levels are followed by easier ones. Failure teaches, it doesn't block. The player never feels stuck, only challenged.

### Addictive Through Craft, Not Manipulation
Retention comes from satisfying mechanics, beautiful presentation, and well-paced progression — not dark patterns, artificial timers, or pay-to-win gates.

### Ship Quality
Every interaction feels intentional. Sounds, animations, transitions, and feedback are not nice-to-haves — they're what separate a game people play from a game people try once.

## What the Scaffold Provides

The shared foundation handles everything that isn't your game:

- **Asset pipeline** — layered loading (DOM, GPU, audio) with progress tracking
- **Screen flow** — loading, start, gameplay, results with automatic asset lifecycle
- **Audio system** — music, SFX, volume, mute — all managed
- **Live tuning** — real-time parameter adjustment for designers and QA
- **Analytics & errors** — PostHog events, Sentry tracking, feature flags
- **Mobile-first** — responsive viewport, touch-safe UI, pull-to-refresh disabled
- **Progress persistence** — players leave and return where they left off

## What Each Game Brings

- **Core mechanic** — the one verb that makes this game *this game*
- **Visual identity** — palette, typography, sprites, atmosphere
- **Level system** — generation, validation, difficulty curves
- **Progression** — what keeps players coming back across sessions
- **Sound & juice** — the feedback layer that makes every action feel 10x better

## Separation Principle

The scaffold never knows about any specific game. Games depend on the scaffold, never the other way around.

- A new game starts by implementing the game contract, not by forking the project
- Scaffold improvements benefit every game automatically
- Games can have completely different mechanics while sharing all infrastructure

## Success Metrics

A game built from this scaffold succeeds when:

1. **Day-1 retention > 40%** — players come back the next day
2. **Sessions per day > 2** — players open it more than once
3. **Session length > 3 min** — long enough to mean something
4. **Time to first "fun moment" < 10 seconds** — the game hooks immediately
5. **Zero crashes in first 1000 sessions** — production quality, not prototype quality
