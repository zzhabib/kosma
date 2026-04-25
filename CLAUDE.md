# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

Kosma is a 3D physics playground toy (Garry's Mod-style) powered by AI. The core idea: AI generates individual "things" (props with physics properties and behaviors). You spawn them, stack them, watch physics and AI-generated ECS systems interact in silly/unexpected ways.

The LLM doesn't just produce data—it writes actual TypeScript/JavaScript system code that gets injected into the running ECS at runtime. Systems are where the magic happens. The engine (bitecs + Three.js) is deterministic; the behaviors are generated.


## Development Ideologies
KISS - Keep It Simple Stupid
- In general the most simple solutions will almost always be preferred.

SOLID - Always try to stick to SOLID principles within reason.
- **S**ingle Responsibility: one reason to change per class/module
- **O**pen/Closed: open for extension, closed for modification
- **L**iskov Substitution: subtypes must be substitutable for their base types
- **I**nterface Segregation: prefer small, focused interfaces over large ones
- **D**ependency Inversion: depend on abstractions, not concretions

YAGNI - You Aren't Gonna Need It
- Refrain from implementing speculative features. It is highly preferred to only implement features that deliver practical value.
- However, if there is a speculative feature that may be worth considering, feel free to mention it.

Direct Communication:
- Skip the pleasantries when giving technical opinions — be frank about what works and what doesn't.

## Key Design Decisions

- **AI generates system code.** LLM emits raw TypeScript/JavaScript system implementations, injected at runtime via eval.
- **Systems reuse encouraged.** AI reuses existing systems; only creates new ones when necessary.
- **No safety model.** Playground. AI can modify any entity, any component.
- **Live injection.** System code runs immediately; effects visible in real-time.
- **Deterministic engine.** bitecs + Three.js own runtime. LLM's code plugs into that system.
- **Descriptor + Runtime components.** Descriptors (SoA, serializable) vs. Runtime bindings (ephemeral). Only descriptors persisted.
- **Frontend-heavy.** Server is a CORS proxy only. User supplies API key. Zero token cost to host.

## Blueprints

See `/blueprints/` for full design spec. Covers: vision, data contracts, runtime injection, AI prompting, infrastructure, persistence, hierarchies, agent tools, interaction, and UI flow.

## Plan Mode

- Make plans extremely concise. Sacrifice grammar for concision.
- End with unresolved questions to answer.

## Commands

Never run pnpm commands. User starts dev servers themselves.

```bash
pnpm dev                          # all apps
pnpm --filter @kosma/web dev      # frontend only
pnpm --filter @kosma/server dev   # backend only
pnpm typecheck                    # type check
pnpm build                        # build
```

Backend: `node --watch --experimental-strip-types` (no transpile needed).
